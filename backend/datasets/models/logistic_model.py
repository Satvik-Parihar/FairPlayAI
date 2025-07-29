
# logistic_model.py

from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
import numpy as np
import pandas as pd # For type hinting

def train_logistic_model(
    X_train: pd.DataFrame,
    X_test: pd.DataFrame,
    y_train: pd.Series,
    y_test: pd.Series,
    problem_type: str # Add problem_type as an argument
) -> tuple[LogisticRegression, np.ndarray, dict]:
    """
    Trains a Logistic Regression model and evaluates its performance with classification metrics.
    Adjusts metrics for binary or multi-class problems.

    Args:
        X_train (pd.DataFrame): Training features.
        X_test (pd.DataFrame): Test features.
        y_train (pd.Series): Training target variable.
        y_test (pd.Series): Test target variable.
        problem_type (str): Type of problem ('binary_classification' or 'multi_class_classification').

    Returns:
        tuple: A tuple containing:
            - model (LogisticRegression): The trained Logistic Regression model.
            - y_pred (np.ndarray): Predicted values on the test set.
            - metrics (dict): A dictionary of classification metrics.
    """
    # max_iter is important for convergence, especially with more complex datasets.
    # A higher max_iter ensures the algorithm has enough iterations to converge.
    model = LogisticRegression(max_iter=1000, random_state=42) # Added random_state for reproducibility
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    # Determine the 'average' strategy for multi-class metrics
    average_strategy = None
    if problem_type == 'binary_classification':
        average_strategy = 'binary'
    elif problem_type == 'multi_class_classification':
        average_strategy = 'weighted' # 'weighted' is a common default for multi-class
    else:
        raise ValueError(f"Unknown problem_type: {problem_type}")

    roc_auc = float('nan') # Initialize roc_auc

    # ROC AUC computation: specific for binary, or multi-class OvR/OvO if specified
    if problem_type == 'binary_classification':
        # Ensure there are two classes in the model's understanding
        if len(model.classes_) == 2:
            try:
                y_prob = model.predict_proba(X_test)[:, 1]
                roc_auc = roc_auc_score(y_test, y_prob)
            except ValueError: # Catch specific ValueError if only one class is present in y_test
                roc_auc = float('nan')
        else:
            roc_auc = float('nan') # Not a binary classification, or only one class present
    elif problem_type == 'multi_class_classification':
        if len(model.classes_) > 1: # Ensure there's more than one class for AUC
            try:
                y_prob = model.predict_proba(X_test)
              
                roc_auc = roc_auc_score(y_test, y_prob, multi_class='ovr', average='weighted')
            except ValueError:
                roc_auc = float('nan')
        else:
            roc_auc = float('nan') # Only one class in actual values

    metrics = {
        "accuracy": accuracy_score(y_test, y_pred),
        "precision": precision_score(y_test, y_pred, average=average_strategy, zero_division=0),
        "recall": recall_score(y_test, y_pred, average=average_strategy, zero_division=0),
        "f1_score": f1_score(y_test, y_pred, average=average_strategy, zero_division=0),
        "roc_auc": roc_auc
    }

    return model, y_pred, metrics