
# preprocessing.py

import pandas as pd
from sklearn.preprocessing import OneHotEncoder, StandardScaler, LabelEncoder

# Add the detect_problem_type function here
def detect_problem_type(df, target_col, unique_threshold=20):
    """
    Detects if the problem is classification or regression based on the target column.
    """
    if target_col not in df.columns:
        raise ValueError(f"Target column '{target_col}' not found in DataFrame.")

    target_series = df[target_col].dropna()

    if pd.api.types.is_numeric_dtype(target_series):
        if target_series.nunique() > unique_threshold:
            return 'regression'
        elif target_series.nunique() <= unique_threshold and set(target_series.unique()).issubset({0, 1}):
            return 'binary_classification'
        else:
            return 'multi_class_classification'
    elif pd.api.types.is_object_dtype(target_series) or pd.api.types.is_string_dtype(target_series):
        if target_series.nunique() == 2:
            return 'binary_classification'
        else:
            return 'multi_class_classification'
    else:
        return 'unknown' # Handle or raise error as appropriate

def preprocess_data(df, sensitive_attrs, target_col, problem_type): # Add problem_type as an argument
    """
    Preprocess the dataset dynamically based on problem_type.
    """

    df = df.copy()
    # --- Impute missing values before any encoding ---
    for col in df.columns:
        if pd.api.types.is_numeric_dtype(df[col]):
            mean_val = df[col].mean()
            df[col] = df[col].fillna(mean_val)
        else:
            mode_val = df[col].mode().iloc[0] if not df[col].mode().empty else None
            if mode_val is not None:
                df[col] = df[col].fillna(mode_val)
    encoded_feature_map = {}
    onehot_encoder = OneHotEncoder(sparse_output=False, handle_unknown='ignore') # Added handle_unknown for robustness
    scaler = StandardScaler()

    # Feature preprocessing (sensitive attributes) - remains largely the same
    for col in sensitive_attrs:
        if pd.api.types.is_numeric_dtype(df[col]):
            scaled = scaler.fit_transform(df[[col]])
            scaled_col = f"{col}_scaled"
            df[scaled_col] = scaled
            df.drop(columns=[col], inplace=True)
            encoded_feature_map[col] = [scaled_col]
        else:
            encoded = onehot_encoder.fit_transform(df[[col]])
            feature_names = [f"{col}_{cat}" for cat in onehot_encoder.categories_[0]]
            df_encoded = pd.DataFrame(encoded, columns=feature_names, index=df.index)
            df.drop(columns=[col], inplace=True)
            df = pd.concat([df, df_encoded], axis=1)
            encoded_feature_map[col] = feature_names

    # Conditional target encoding based on problem_type
    if problem_type == 'regression':
        # Ensure target column is numeric
        df[target_col] = pd.to_numeric(df[target_col], errors='coerce')
        df.dropna(subset=[target_col], inplace=True) # Drop rows where target became NaN
        target_mapping = None # No mapping for regression
    else: # Classification
        label_encoder = LabelEncoder()
        df[target_col] = label_encoder.fit_transform(df[target_col])
        target_mapping = dict(zip(label_encoder.classes_, label_encoder.transform(label_encoder.classes_)))

    return df, encoded_feature_map, target_mapping # Return target_mapping (can be None)