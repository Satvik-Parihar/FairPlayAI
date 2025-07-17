import numpy as np
from sklearn.metrics import accuracy_score, f1_score
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt
import seaborn as sns
import io
import base64
from sklearn.metrics import confusion_matrix
from aif360.datasets import BinaryLabelDataset
from aif360.metrics import BinaryLabelDatasetMetric, ClassificationMetric
from aif360.algorithms.preprocessing import Reweighing

import numpy as np
# def evaluate_model(model, X_train, X_test, y_train, y_test, sensitive_attributes, model_name):
#     model.fit(X_train, y_train)
#     y_pred = model.predict(X_test)

#     # Fairness metrics dummy structure
#     detailed_fairness = {}
#     for attr in sensitive_attributes:
#         detailed_fairness[attr] = {
#             'overall_score': 10,  # Random score for demo
#             'details': f"Bias analysis for {attr}"
#         }

#     return {
#         "model_name": model_name,
#         "accuracy": accuracy_score(y_test, y_pred),
#         "f1_score": f1_score(y_test, y_pred, average="weighted"),
#         "fairness_metrics": {
#             "demographic_parity": 1,
#             "equalized_odds": 2,
#             "calibration": 3,
#             "individual_fairness": 4,
#             "overall_score": 5
#         },
#         "detailed_fairness": detailed_fairness
#     }


def evaluate_model(model, X_train, X_test, y_train, y_test, sensitive_attributes, model_name):
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    results = {
        "model_name": model_name,
        "accuracy": accuracy_score(y_test, y_pred),
        "f1_score": f1_score(y_test, y_pred, average="weighted"),
        "fairness_metrics": {},
        "detailed_fairness": {}
    }

    for attr in sensitive_attributes:
        try:
            # Combine the sensitive attribute into the dataset for AIF360
            aif_df = X_test.copy()
            aif_df[attr] = X_test[attr] if attr in X_test.columns else 'Unknown'
            aif_df['label'] = y_test.values
            aif_df['pred'] = y_pred

            dataset = BinaryLabelDataset(
                favorable_label=1,
                unfavorable_label=0,
                df=aif_df,
                label_names=['label'],
                protected_attribute_names=[attr]
            )
            pred_dataset = dataset.copy()
            pred_dataset.labels = y_pred.reshape(-1, 1)

            metric = ClassificationMetric(dataset, pred_dataset, unprivileged_groups=[{attr: '0'}], privileged_groups=[{attr: '1'}])

            dp_diff = metric.statistical_parity_difference()
            eo_diff = metric.equal_opportunity_difference()
            if_diff = metric.consistency()
            cal_error = abs(metric.generalized_entropy_index())

            # Normalize to 0-10 scale (higher is fairer)
            dp_score = max(0, 10 - abs(dp_diff * 10))
            eo_score = max(0, 10 - abs(eo_diff * 10))
            if_score = max(0, 10 - abs((1 - if_diff) * 10))
            cal_score = max(0, 10 - cal_error * 10)

            overall_score = np.mean([dp_score, eo_score, cal_score, if_score])

            results["detailed_fairness"][attr] = {
                "overall_score": round(overall_score, 2),
                "details": {
                    "demographic_parity": round(dp_diff, 4),
                    "equalized_odds": round(eo_diff, 4),
                    "calibration": round(cal_error, 4),
                    "individual_fairness": round(if_diff, 4)
                }
            }

        except Exception as e:
            results["detailed_fairness"][attr] = {
                "overall_score": 0,
                "details": f"Error computing fairness for {attr}: {str(e)}"
            }

    # Aggregate overall fairness
    dp = np.mean([results['detailed_fairness'][a]['details']['demographic_parity'] if isinstance(results['detailed_fairness'][a]['details'], dict) else 0 for a in sensitive_attributes])
    eo = np.mean([results['detailed_fairness'][a]['details']['equalized_odds'] if isinstance(results['detailed_fairness'][a]['details'], dict) else 0 for a in sensitive_attributes])
    cal = np.mean([results['detailed_fairness'][a]['details']['calibration'] if isinstance(results['detailed_fairness'][a]['details'], dict) else 0 for a in sensitive_attributes])
    ind = np.mean([results['detailed_fairness'][a]['details']['individual_fairness'] if isinstance(results['detailed_fairness'][a]['details'], dict) else 0 for a in sensitive_attributes])
    overall = np.mean([results['detailed_fairness'][a]['overall_score'] for a in sensitive_attributes])

    results["fairness_metrics"] = {
        "demographic_parity": round(dp, 4),
        "equalized_odds": round(eo, 4),
        "calibration": round(cal, 4),
        "individual_fairness": round(ind, 4),
        "overall_score": round(overall, 2)
    }

    return results

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

"""
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


# utils.py """
import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.preprocessing import LabelEncoder
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
import numpy as np
import pandas as pd
import io
import base64
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.metrics import accuracy_score, f1_score
from aif360.datasets import BinaryLabelDataset
from aif360.metrics import ClassificationMetric


def evaluate_model(model, X_train, X_test, y_train, y_test, sensitive_attributes, model_name):
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    results = {
        "model_name": model_name,
        "accuracy": accuracy_score(y_test, y_pred),
        "f1_score": f1_score(y_test, y_pred, average="weighted"),
        "fairness_metrics": {},
        "detailed_fairness": {}
    }

    for attr in sensitive_attributes:
        try:
            aif_df = X_test.copy()
            # aif_df[attr] = X_test[attr] if attr in X_test.columns else 'Unknown'
            # Force to binary strings 0/1
            if attr not in X_test.columns:
                raise ValueError(f"Sensitive attribute '{attr}' not found in features")

            unique_vals = X_test[attr].unique()
            if len(unique_vals) != 2:
                raise ValueError(f"Sensitive attribute '{attr}' must be binary (found: {unique_vals})")

            aif_df[attr] = X_test[attr].astype(str)

            aif_df['label'] = y_test.values
            aif_df['pred'] = y_pred
            print(f"[DEBUG] {attr} values: {X_test[attr].unique()}")
            dataset = BinaryLabelDataset(
                favorable_label=1,
                unfavorable_label=0,
                df=aif_df,
                label_names=['label'],
                protected_attribute_names=[attr]
            )
            pred_dataset = dataset.copy()
            pred_dataset.labels = y_pred.reshape(-1, 1)
            unique_vals = sorted(aif_df[attr].unique())
            unprivileged = [{attr: unique_vals[0]}]
            privileged = [{attr: unique_vals[1]}]

            metric = ClassificationMetric(
                dataset, pred_dataset,
                unprivileged_groups=unprivileged,
                privileged_groups=privileged
        )
            # metric = ClassificationMetric(
            #     dataset, pred_dataset,
            #     unprivileged_groups=[{attr: '0'}],
            #     privileged_groups=[{attr: '1'}]
            # )

            dp_diff = metric.statistical_parity_difference()
            eo_diff = metric.equal_opportunity_difference()
            if_diff = metric.consistency()
            cal_error = abs(metric.generalized_entropy_index())

            dp_score = max(0, 10 - abs(dp_diff * 10))
            eo_score = max(0, 10 - abs(eo_diff * 10))
            if_score = max(0, 10 - abs((1 - if_diff) * 10))
            cal_score = max(0, 10 - cal_error * 10)

            overall_score = np.mean([dp_score, eo_score, cal_score, if_score])

            results["detailed_fairness"][attr] = {
                "overall_score": round(overall_score, 2),
                "details": {
                    "demographic_parity": round(dp_diff, 4),
                    "equalized_odds": round(eo_diff, 4),
                    "calibration": round(cal_error, 4),
                    "individual_fairness": round(if_diff, 4)
                }
            }

        except Exception as e:
            results["detailed_fairness"][attr] = {
                "overall_score": 0,
                "details": f"Error computing fairness for {attr}: {str(e)}"
            }

    dp = np.mean([
        results['detailed_fairness'][a]['details']['demographic_parity']
        if isinstance(results['detailed_fairness'][a]['details'], dict) else 0
        for a in sensitive_attributes
    ])
    eo = np.mean([
        results['detailed_fairness'][a]['details']['equalized_odds']
        if isinstance(results['detailed_fairness'][a]['details'], dict) else 0
        for a in sensitive_attributes
    ])
    cal = np.mean([
        results['detailed_fairness'][a]['details']['calibration']
        if isinstance(results['detailed_fairness'][a]['details'], dict) else 0
        for a in sensitive_attributes
    ])
    ind = np.mean([
        results['detailed_fairness'][a]['details']['individual_fairness']
        if isinstance(results['detailed_fairness'][a]['details'], dict) else 0
        for a in sensitive_attributes
    ])
    overall = np.mean([
        results['detailed_fairness'][a]['overall_score']
        for a in sensitive_attributes
    ])

    results["fairness_metrics"] = {
        "demographic_parity": round(dp, 4),
        "equalized_odds": round(eo, 4),
        "calibration": round(cal, 4),
        "individual_fairness": round(ind, 4),
        "overall_score": round(overall, 2)
    }

    return results


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
