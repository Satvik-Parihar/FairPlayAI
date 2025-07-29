
# model_selector.py

import pandas as pd
from sklearn.model_selection import train_test_split
from .models.linear_model import train_linear_model
from .models.polynomial_model import train_best_polynomial
from .models.knn_model import train_knn_model
from .models.decision_tree_model import train_decision_tree_model
from .models.logistic_model import train_logistic_model
from .models.random_forest_model import train_random_forest_model

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
    elif problem_type in ['binary_classification', 'multi_class_classification']:
        valid_models = {"knn", "decision_tree", "logistic_regression", "random_forest"}
    else: # 'unknown' problem type, or other cases you want to handle
        raise ValueError(f"Unsupported problem type '{problem_type}'. Cannot select a model.")

    choice = selected_model.lower().strip()
    if choice not in valid_models:
        raise ValueError(f"Invalid model '{choice}' for a {problem_type} problem. Valid models are: {', '.join(valid_models)}")

    # Pass problem_type to train_test_split_sensitive_only
    X_train, X_test, y_train, y_test = train_test_split_sensitive_only(df, mapping, target_col, problem_type)

    # Call the appropriate training function
    if choice == "linear_regression":
        model, y_pred, metrics = train_linear_model(X_train, X_test, y_train, y_test)
    elif choice == "polynomial_regression":
        model, y_pred, metrics, degree = train_best_polynomial(X_train, X_test, y_train, y_test)
        # Add degree to metrics if it needs to be returned
        if metrics is None:
            metrics = {}
        metrics['polynomial_degree'] = degree
        return model, y_pred, metrics
    elif choice == "knn":
        model, y_pred, metrics = train_knn_model(X_train, X_test, y_train, y_test, problem_type)
    elif choice == "decision_tree":
        model, y_pred, metrics = train_decision_tree_model(X_train, X_test, y_train, y_test, problem_type)
    elif choice == "logistic_regression":
        model, y_pred, metrics = train_logistic_model(X_train, X_test, y_train, y_test, problem_type)
    elif choice == "random_forest":
        model, y_pred, metrics = train_random_forest_model(X_train, X_test, y_train, y_test, problem_type)
    
    return model, y_pred, metrics # Default return for models not returning 'degree'