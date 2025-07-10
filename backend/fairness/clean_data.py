# import pandas as pd
# import numpy as np
# from sklearn.preprocessing import LabelEncoder
# from sklearn.utils import resample

# def clean_and_preprocess_data(df, sensitive_attributes, target_column):
#     """
#     Comprehensive data cleaning and preprocessing pipeline
    
#     Args:
#         df: Raw pandas DataFrame
#         sensitive_attributes: List of sensitive attribute column names
#         target_column: Name of the target column
        
#     Returns:
#         Cleaned and preprocessed DataFrame
#     """
#     try:
#         # 1. Initial cleaning
#         df = df.copy()
        
#         # Drop completely empty columns and rows
#         df.dropna(axis=1, how='all', inplace=True)
#         df.dropna(axis=0, how='all', inplace=True)
        
#         # Remove any index columns that might have been added
#         df = df.loc[:, ~df.columns.str.contains('^Unnamed')]
        
#         # 2. Validate required columns exist
#         missing_columns = [col for col in sensitive_attributes + [target_column] 
#                           if col not in df.columns]
#         if missing_columns:
#             raise ValueError(f"Missing required columns: {missing_columns}")
            
#         # 3. Handle missing values
#         # For sensitive attributes, create 'Unknown' category
#         for col in sensitive_attributes:
#             if df[col].isna().any():
#                 df[col] = df[col].fillna('Unknown')
                
#         # For other columns, use median for numeric, mode for categorical
#         for col in df.columns:
#             if col not in sensitive_attributes + [target_column]:
#                 if pd.api.types.is_numeric_dtype(df[col]):
#                     df[col] = df[col].fillna(df[col].median())
#                 else:
#                     df[col] = df[col].fillna(df[col].mode()[0])
        
#         # 4. Convert sensitive attributes to string type
#         for col in sensitive_attributes:
#             df[col] = df[col].astype(str)
            
#         # 5. Handle target column
#         # Convert to numeric if categorical
#         if not pd.api.types.is_numeric_dtype(df[target_column]):
#             le = LabelEncoder()
#             df[target_column] = le.fit_transform(df[target_column])
            
#         # 6. Balance classes if needed (prevent empty splits)
#         class_counts = df[target_column].value_counts()
#         if len(class_counts) < 2:
#             raise ValueError("Target column has only one class")
            
#         min_samples = class_counts.min()
#         if min_samples < 10:  # Threshold for too few samples
#             dfs = []
#             for class_val in class_counts.index:
#                 class_df = df[df[target_column] == class_val]
#                 if len(class_df) > min_samples * 2:  # Only downsample if significantly larger
#                     class_df = resample(class_df, 
#                                       replace=False,
#                                       n_samples=max(min_samples, 10),  # Ensure at least 10 samples
#                                       random_state=42)
#                 dfs.append(class_df)
#             df = pd.concat(dfs)
            
#         # 7. Convert other categorical columns to numeric
#         for col in df.select_dtypes(include=['object', 'category']).columns:
#             if col not in sensitive_attributes:
#                 df[col] = LabelEncoder().fit_transform(df[col].astype(str))
                
#         # 8. Final validation
#         if len(df) < 20:
#             raise ValueError(f"After preprocessing, only {len(df)} samples remain - insufficient for analysis")
            
#         return df
        
#     except Exception as e:
#         raise ValueError(f"Data preprocessing failed: {str(e)}")


# # Example usage:
# if __name__ == "__main__":
#     # Test with sample data
#     data = {
#         'age': [25, 30, None, 40, 25, 30, 40, 25],
#         'gender': ['M', 'F', 'M', 'F', 'M', 'F', None, 'M'],
#         'income': ['high', 'medium', 'low', 'high', 'medium', 'low', 'high', 'medium'],
#         'target': [1, 0, 1, 0, 1, 0, 1, 0]
#     }
#     df = pd.DataFrame(data)
    
#     try:
#         cleaned_df = clean_and_preprocess_data(
#             df, 
#             sensitive_attributes=['age', 'gender'], 
#             target_column='target'
#         )
#         print("Cleaned data:")
#         print(cleaned_df)
#     except Exception as e:
#         print(f"Error: {e}")
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.utils import resample

def clean_and_preprocess_data(df, sensitive_attributes, target_column):
    """
    Comprehensive data cleaning and preprocessing pipeline for user-uploaded CSV data
    
    Args:
        df: Raw pandas DataFrame from user upload
        sensitive_attributes: List of sensitive attribute column names
        target_column: Name of the target column
        
    Returns:
        Cleaned and preprocessed DataFrame ready for analysis
        
    Raises:
        ValueError: If data cannot be processed or requirements aren't met
    """
    # 1. Initial cleaning
    df = df.copy()
    
    # Drop completely empty columns and rows
    df.dropna(axis=1, how='all', inplace=True)
    df.dropna(axis=0, how='all', inplace=True)
    
    # Remove any index columns that might have been added
    df = df.loc[:, ~df.columns.str.contains('^Unnamed')]
    
    # 2. Validate required columns exist
    missing_columns = [col for col in sensitive_attributes + [target_column] 
                      if col not in df.columns]
    if missing_columns:
        raise ValueError(f"Missing required columns: {missing_columns}")
        
    # 3. Handle missing values
    # For sensitive attributes, create 'Unknown' category
    for col in sensitive_attributes:
        if df[col].isna().any():
            df[col] = df[col].fillna('Unknown')
            
    # For other columns, use median for numeric, mode for categorical
    for col in df.columns:
        if col not in sensitive_attributes + [target_column]:
            if pd.api.types.is_numeric_dtype(df[col]):
                df[col] = df[col].fillna(df[col].median())
            else:
                df[col] = df[col].fillna(df[col].mode()[0])
    
    # 4. Convert sensitive attributes to string type
    for col in sensitive_attributes:
        df[col] = df[col].astype(str)
        
    # 5. Handle target column
    # Convert to numeric if categorical
    if not pd.api.types.is_numeric_dtype(df[target_column]):
        le = LabelEncoder()
        df[target_column] = le.fit_transform(df[target_column])
        
    # 6. Balance classes if needed (prevent empty splits)
    class_counts = df[target_column].value_counts()
    if len(class_counts) < 2:
        raise ValueError("Target column has only one class")
        
    min_samples = class_counts.min()
    if min_samples < 10:  # Threshold for too few samples
        dfs = []
        for class_val in class_counts.index:
            class_df = df[df[target_column] == class_val]
            if len(class_df) > min_samples * 2:  # Only downsample if significantly larger
                class_df = resample(class_df, 
                                  replace=False,
                                  n_samples=max(min_samples, 10),  # Ensure at least 10 samples
                                  random_state=42)
            dfs.append(class_df)
        df = pd.concat(dfs)
        
    # 7. Convert other categorical columns to numeric
    for col in df.select_dtypes(include=['object', 'category']).columns:
        if col not in sensitive_attributes:
            df[col] = LabelEncoder().fit_transform(df[col].astype(str))
            
    # 8. Final validation
    if len(df) < 20:
        raise ValueError(f"After preprocessing, only {len(df)} samples remain - insufficient for analysis")
        
    return df