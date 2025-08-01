
# model_selector.py


import pandas as pd
from sklearn.model_selection import train_test_split
from .models.linear_model import train_linear_model
from .models.polynomial_model import train_best_polynomial
from .models.knn_model import train_knn_model
from .models.decision_tree_model import train_decision_tree_model
from .models.logistic_model import train_logistic_model
from .models.random_forest_model import train_random_forest_model
from .fairness_metrics import demographic_parity
from .fairness_metrics import calibration

def get_sensitive_columns(mapping):
    """
    Flattens encoded feature map into a list of column names
    """
    sensitive_columns = []
    for encoded_cols in mapping.values():
        sensitive_columns.extend(encoded_cols)
    return sensitive_columns

def train_test_split_sensitive_only(df, mapping, target_col, problem_type, test_size=0.2):
    """
    Splits the dataset using only sensitive features and target,
    applying stratification only for classification problems.

    Args:
        df (pd.DataFrame): Preprocessed dataframe
        mapping (dict): Encoded feature map from preprocessing
        target_col (str): Encoded target column
        problem_type (str): Type of problem ('regression', 'binary_classification', 'multi_class_classification')
        test_size (float): Proportion for test data

    Returns:
        X_train, X_test, y_train, y_test
    """
    sensitive_cols = get_sensitive_columns(mapping)
    X = df[sensitive_cols]
    y = df[target_col]

    if problem_type in ['binary_classification', 'multi_class_classification']:
        # Stratify only for classification tasks
        return train_test_split(X, y, test_size=test_size, stratify=y, random_state=42)
    else: # 'regression' or 'unknown' - do not stratify
        return train_test_split(X, y, test_size=test_size, random_state=42)


def main(df, mapping, target_col, selected_model=None, problem_type=None):
    """
    Selects and trains a model based on the detected problem type.

    Args:
        df (pd.DataFrame): Preprocessed dataframe
        mapping (dict): Encoded feature map from preprocessing
        target_col (str): Encoded target column
        selected_model (str): Name of the model to train (e.g., 'linear_regression', 'knn')
        problem_type (str): Type of problem ('regression', 'binary_classification', 'multi_class_classification')

    Returns:
        tuple: (model, y_pred, metrics, [degree])
    """
    if problem_type is None:
        raise ValueError("Problem type must be provided to model_selector.main.")

    # Dynamically define valid models based on problem type
    if problem_type == 'regression':
        valid_models = {"linear_regression", "polynomial_regression"}
        # For regression, set Demographic Parity and Equalized Odds to None
        metrics = {"demographic_parity": None, "equalized_odds": None, "calibration": None}
    elif problem_type in ['binary_classification', 'multi_class_classification']:
        valid_models = {"knn", "decision_tree", "logistic_regression", "random_forest"}
    else: # 'unknown' problem type, or other cases you want to handle
        raise ValueError(f"Unsupported problem type '{problem_type}'. Cannot select a model.")

    # Always split data before model selection
    X_train, X_test, y_train, y_test = train_test_split_sensitive_only(df, mapping, target_col, problem_type)

    choice = selected_model.lower().strip()
    if choice not in valid_models:
        raise ValueError(f"Invalid model '{choice}' for a {problem_type} problem. Valid models are: {', '.join(valid_models)}")

    if problem_type == 'regression':
        metrics = {"demographic_parity": None, "equalized_odds": None, "calibration": None}
        if choice == "linear_regression":
            model, y_pred, metrics = train_linear_model(X_train, X_test, y_train, y_test)
            return model, y_pred, metrics
        elif choice == "polynomial_regression":
            model, y_pred, metrics, degree = train_best_polynomial(X_train, X_test, y_train, y_test)
            if metrics is None:
                metrics = {}
            metrics['polynomial_degree'] = degree
            return model, y_pred, metrics

    # For classification models
    model, y_pred, metrics = None, None, None
    if choice == "knn":
        model, y_pred, metrics = train_knn_model(X_train, X_test, y_train, y_test, problem_type)
    elif choice == "decision_tree":
        model, y_pred, metrics = train_decision_tree_model(X_train, X_test, y_train, y_test, problem_type)
    elif choice == "logistic_regression":
        model, y_pred, metrics = train_logistic_model(X_train, X_test, y_train, y_test, problem_type)
    elif choice == "random_forest":
        model, y_pred, metrics = train_random_forest_model(X_train, X_test, y_train, y_test, problem_type)

    # Only compute fairness metrics for classification
    if problem_type in ["binary_classification", "multi_class_classification"]:
        metrics["demographic_parity"] = {}
        metrics["equalized_odds"] = {}
        metrics["calibration"] = {}
        metrics["individual_fairness"] = {}
        if mapping:
            from .fairness_metrics import equalized_odds, calibration, individual_fairness
            for sensitive_col in mapping.keys():
                # Try to recover the original (pre-encoded) sensitive attribute from df
                if sensitive_col in df.columns:
                    sensitive_attr = df[sensitive_col]
                else:
                    encoded_cols = mapping[sensitive_col]
                    if len(encoded_cols) > 1:
                        sensitive_attr = df[encoded_cols].idxmax(axis=1).apply(lambda x: x.replace(f"{sensitive_col}_", ""))
                    else:
                        sensitive_attr = df[encoded_cols[0]]
                # Get sensitive attribute for test set only
                if sensitive_col in X_test.columns:
                    sensitive_attr_test = X_test[sensitive_col]
                else:
                    encoded_cols = mapping[sensitive_col]
                    if len(encoded_cols) > 1:
                        sensitive_attr_test = X_test[encoded_cols].idxmax(axis=1).apply(lambda x: x.replace(f"{sensitive_col}_", ""))
                    else:
                        sensitive_attr_test = X_test[encoded_cols[0]]
                
                # Calculate rates by group for debug
                from collections import defaultdict
                rates = defaultdict(float)
                groups = sensitive_attr_test.unique()
                for group in groups:
                    mask = (sensitive_attr_test == group)
                    if sum(mask) == 0:
                        rates[group] = float('nan')
                    else:
                        if len(pd.Series(y_pred).unique()) > 2:
                            positive_class = pd.Series(y_pred).mode()[0]
                            rates[group] = (y_pred[mask] == positive_class).mean()
                        else:
                            rates[group] = (y_pred[mask] == 1).mean()
                # print(f"[DEBUG] Demographic parity rates by group for {sensitive_col}:", dict(rates))
                metrics["demographic_parity"][sensitive_col] = demographic_parity(y_pred, sensitive_attr_test)
                metrics["equalized_odds"][sensitive_col] = equalized_odds(y_pred, sensitive_attr_test, y_test)
                metrics["calibration"][sensitive_col] = calibration(y_pred, sensitive_attr_test, y_test)
                # Calculate Individual Fairness for this sensitive attribute
                metrics["individual_fairness"][sensitive_col] = individual_fairness(X_test, y_pred, sensitive_attr_test)
        else:
            metrics["demographic_parity"] = None
            metrics["equalized_odds"] = None
            metrics["calibration"] = None
            metrics["individual_fairness"] = None
    return model, y_pred, metrics