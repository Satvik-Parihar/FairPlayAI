import numpy as np
from sklearn.metrics import accuracy_score, f1_score
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt
import seaborn as sns
import io
import base64
def evaluate_model(model, X_train, X_test, y_train, y_test, sensitive_attributes, model_name):
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    # Fairness metrics dummy structure
    detailed_fairness = {}
    for attr in sensitive_attributes:
        detailed_fairness[attr] = {
            'overall_score': np.random.uniform(4, 9),  # Random score for demo
            'details': f"Bias analysis for {attr}"
        }

    return {
        "model_name": model_name,
        "accuracy": accuracy_score(y_test, y_pred),
        "f1_score": f1_score(y_test, y_pred, average="weighted"),
        "fairness_metrics": {
            "demographic_parity": np.random.uniform(0, 1),
            "equalized_odds": np.random.uniform(0, 1),
            "calibration": np.random.uniform(0, 1),
            "individual_fairness": np.random.uniform(0, 1),
            "overall_score": np.random.uniform(0, 10)
        },
        "detailed_fairness": detailed_fairness
    }
def generate_bias_plot(detailed_fairness):
    fig, ax = plt.subplots()

    attributes = list(detailed_fairness.keys())
    scores = [detailed_fairness[attr]['overall_score'] / 10 for attr in attributes]

    sns.barplot(x=scores, y=attributes, palette="coolwarm", ax=ax)
    ax.set_title('Bias Severity by Attribute')
    ax.set_xlabel('Bias Score (0 = High Bias, 1 = Low Bias)')
    ax.set_xlim(0, 1)

    buf = io.BytesIO()
    plt.tight_layout()
    plt.savefig(buf, format='png')
    plt.close(fig)

    buf.seek(0)
    image_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
    return image_base64

# import pandas as pd
# from sklearn.preprocessing import LabelEncoder

# def preprocess_data(df, sensitive_attributes, target_column):
#     df = df.dropna().copy()  # Drop missing rows

#     # Ensure sensitive columns are string
#     for col in sensitive_attributes:
#         if col in df.columns:
#             df.loc[:, col] = df[col].astype(str)

#     # Ensure target column exists
#     if target_column not in df.columns:
#         raise ValueError(f"Target column '{target_column}' not found in dataset")

#     # Convert categorical target to numerical (label encoding)
#     if df[target_column].dtype == object or df[target_column].dtype.name == "category":
#         le = LabelEncoder()
#         df.loc[:, target_column] = le.fit_transform(df[target_column])

#     # Encode all other non-numeric features (excluding sensitive + target)
#     exclude_cols = set(sensitive_attributes + [target_column])
#     for col in df.columns:
#         if df[col].dtype == object and col not in exclude_cols:
#             df = pd.get_dummies(df, columns=[col], drop_first=True)

#     return df
# def preprocess_data(df, sensitive_attributes, target_column):
#     df = df.dropna().copy()  # Drop missing rows

#     # Ensure sensitive columns are string
#     for col in sensitive_attributes:
#         if col in df.columns:
#             df.loc[:, col] = df[col].astype(str)

#     # Ensure target column exists
#     if target_column not in df.columns:
#         raise ValueError(f"Target column '{target_column}' not found in dataset")

#     # Convert categorical target to numeric
#     if df[target_column].dtype == object or df[target_column].dtype.name == "category":
#         le = LabelEncoder()
#         df.loc[:, target_column] = le.fit_transform(df[target_column])

#     # Auto-drop clearly unusable columns
#     for col in df.columns:
#         if col.lower() in ['name', 'ticket', 'cabin']:  # 💀 too specific
#             df.drop(columns=[col], inplace=True)

#     # Encode remaining non-numeric (excluding sensitive + target)
#     exclude_cols = set(sensitive_attributes + [target_column])
#     non_numeric_cols = [col for col in df.columns if df[col].dtype == object and col not in exclude_cols]
#     df = pd.get_dummies(df, columns=non_numeric_cols, drop_first=True)

#     return df
import pandas as pd
from sklearn.preprocessing import LabelEncoder
# def preprocess_data(df, sensitive_attributes, target_column):
#     df = df.dropna().copy()  # Avoid SettingWithCopyWarning

#     # Drop columns that are clearly non-numeric + irrelevant for modeling
#     drop_cols = ['Name', 'Ticket', 'Cabin']  # ← this caused the crash!
#     df = df.drop(columns=[col for col in drop_cols if col in df.columns])

#     # Ensure sensitive columns are strings (for AIF360)
#     for col in sensitive_attributes:
#         if col in df.columns:
#             df.loc[:, col] = df[col].astype(str)

#     # Make sure target column exists
#     if target_column not in df.columns:
#         raise ValueError(f"Target column '{target_column}' not found in dataset")

#     # Label encode target if categorical
#     if df[target_column].dtype == object or df[target_column].dtype.name == "category":
#         from sklearn.preprocessing import LabelEncoder
#         le = LabelEncoder()
#         df.loc[:, target_column] = le.fit_transform(df[target_column])

#     # Auto-encode other non-numeric columns (excluding target + sensitive)
#     exclude_cols = set(sensitive_attributes + [target_column])
#     non_numeric_cols = [col for col in df.columns if df[col].dtype == object and col not in exclude_cols]
#     df = pd.get_dummies(df, columns=non_numeric_cols, drop_first=True)

#     return df
# def preprocess_data(df, sensitive_attributes, target_column):
#     df = df.dropna().copy()

#     # 🧼 Drop non-numeric, non-encodeable garbage columns
#     drop_cols = ['Name', 'Ticket', 'Cabin', 'PassengerId']
#     df = df.drop(columns=[col for col in drop_cols if col in df.columns])
#     # 🧠 Encode all object columns
#     for col in df.columns:
#         if df[col].dtype == object:
#             df = pd.get_dummies(df, columns=[col], drop_first=True)

#     # ✅ Ensure sensitive columns are strings
#     for col in sensitive_attributes:
#         if col in df.columns:
#             df.loc[:, col] = df[col].astype(str)
    
#     # 🎯 Label encode target
#     if target_column not in df.columns:
#         raise ValueError(f"Target column '{target_column}' not found in dataset")

#     if df[target_column].dtype == object or df[target_column].dtype.name == "category":
#         from sklearn.preprocessing import LabelEncoder
#         le = LabelEncoder()
#         df.loc[:, target_column] = le.fit_transform(df[target_column])

#     # 🧠 Encode all other object columns (excluding target + sensitive)
#     exclude_cols = set(sensitive_attributes + [target_column])
#     for col in df.columns:
#         if df[col].dtype == object and col not in exclude_cols:
#             df = pd.get_dummies(df, columns=[col], drop_first=True)

#     return df
# def preprocess_data(df, sensitive_attributes, target_column):
#     df = df.dropna().copy()

#     # 🧼 Drop junk columns
#     drop_cols = ['Name', 'Ticket', 'Cabin', 'PassengerId']
#     df = df.drop(columns=[col for col in drop_cols if col in df.columns])

#     # ✅ Ensure sensitive columns are string (AIF360 needs this)
#     for col in sensitive_attributes:
#         if col in df.columns:
#             df[col] = df[col].astype(str)

#     # 🎯 Label encode target if needed
#     if target_column not in df.columns:
#         raise ValueError(f"Target column '{target_column}' not found in dataset")

#     if df[target_column].dtype == object or df[target_column].dtype.name == "category":
#         from sklearn.preprocessing import LabelEncoder
#         le = LabelEncoder()
#         df[target_column] = le.fit_transform(df[target_column])

#     # 🧠 Encode all other object columns (excluding target + sensitive)
#     exclude_cols = set(sensitive_attributes + [target_column])
#     for col in df.columns:
#         if df[col].dtype == object and col not in exclude_cols:
#             df = pd.get_dummies(df, columns=[col], drop_first=True)

#     return df
# def preprocess_data(df, sensitive_attributes, target_column):
#     df = df.dropna().copy()

#     # 🧼 Drop garbage columns
#     drop_cols = ['Name', 'Ticket', 'Cabin', 'PassengerId']
#     df.drop(columns=[col for col in drop_cols if col in df.columns], inplace=True)

#     # 🎯 Encode target column
#     if target_column not in df.columns:
#         raise ValueError(f"Target column '{target_column}' not found in dataset")

#     if df[target_column].dtype == object or df[target_column].dtype.name == "category":
#         from sklearn.preprocessing import LabelEncoder
#         le = LabelEncoder()
#         df[target_column] = le.fit_transform(df[target_column])

#     # ✅ Ensure sensitive attributes remain as string
#     for col in sensitive_attributes:
#         if col in df.columns:
#             df[col] = df[col].astype(str)

#     # 🧠 Encode non-numeric object columns (excluding target + sensitive ones)
#     exclude_cols = set([target_column] + sensitive_attributes)
#     for col in df.columns:
#         if df[col].dtype == object and col not in exclude_cols:
#             df = pd.get_dummies(df, columns=[col], drop_first=True)

#     return df

from sklearn.preprocessing import LabelEncoder
# from clean_data import clean_and_preprocess_data as preprocess_data
# def preprocess_data(df, sensitive_attributes, target_column):
#     df = df.dropna()

#     # Convert categorical columns to numeric (label encoding)
#     for col in df.columns:
#         if df[col].dtype == 'object' or df[col].dtype.name == 'category':
#             df[col] = LabelEncoder().fit_transform(df[col].astype(str))

#     # Convert sensitive attributes to string (for fairness metrics)
#     for col in sensitive_attributes:
#         if col in df.columns:
#             df[col] = df[col].astype(str)

#     # Encode target column if it's categorical
#     if df[target_column].dtype == 'object':
#         df[target_column] = LabelEncoder().fit_transform(df[target_column])

#     return df


# utils.py
def generate_mitigation_suggestions(detailed_fairness):
    suggestions = []
    for attr, metrics in detailed_fairness.items():
        score = metrics.get('overall_score', 0)
        if score < 5:
            suggestions.append(f"Mitigate bias in '{attr}' — try re-sampling or feature removal.")
        elif score < 7:
            suggestions.append(f"Fairness for '{attr}' is moderate — consider using fairness-aware algorithms.")
        else:
            suggestions.append(f"No strong mitigation needed for '{attr}'.")
    return suggestions
