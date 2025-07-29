
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
import pandas as pd  # For type hinting
import numpy as np
import math

def clean_metrics(metrics):
    return {k: (None if (isinstance(v, float) and (math.isnan(v) or math.isinf(v))) else v) for k, v in metrics.items()}
def train_decision_tree_model(
    X_train: pd.DataFrame,
    X_test: pd.DataFrame,
    y_train: pd.Series,
    y_test: pd.Series,
    problem_type: str,
    max_depth: int = None,
    random_state: int = 42
) -> tuple[DecisionTreeClassifier, np.ndarray, dict]:
    """
    Trains a Decision Tree Classifier and evaluates its performance with classification metrics.
    Adjusts metrics for binary or multi-class problems.

    Args:
        X_train (pd.DataFrame): Training features.
        X_test (pd.DataFrame): Test features.
        y_train (pd.Series): Training target variable.
        y_test (pd.Series): Test target variable.
        problem_type (str): Type of problem ('binary_classification' or 'multi_class_classification').
        max_depth (int): Maximum depth of the tree (default None).
        random_state (int): Random state for reproducibility (default 42).

    Returns:
        tuple: (model, y_pred, metrics)
    """
    model = DecisionTreeClassifier(max_depth=max_depth, random_state=random_state)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    # Determine the 'average' strategy for multi-class metrics
    average_strategy = None
    if problem_type == 'binary_classification':
        average_strategy = 'binary'
    elif problem_type == 'multi_class_classification':
        average_strategy = 'weighted'
    else:
        raise ValueError(f"Unknown problem_type: {problem_type}")

    roc_auc = float('nan')
    if problem_type == 'binary_classification':
        if len(model.classes_) == 2:
            try:
                y_prob = model.predict_proba(X_test)[:, 1]
                roc_auc = roc_auc_score(y_test, y_prob)
            except ValueError:
                roc_auc = float('nan')
        else:
            roc_auc = float('nan')
    elif problem_type == 'multi_class_classification':
        if len(model.classes_) > 1:
            try:
                y_prob = model.predict_proba(X_test)
                roc_auc = roc_auc_score(y_test, y_prob, multi_class='ovr', average='weighted')
            except ValueError:
                roc_auc = float('nan')
        else:
            roc_auc = float('nan')

    metrics = {
        "accuracy": accuracy_score(y_test, y_pred),
        "precision": precision_score(y_test, y_pred, average=average_strategy, zero_division=0),
        "recall": recall_score(y_test, y_pred, average=average_strategy, zero_division=0),
        "f1_score": f1_score(y_test, y_pred, average=average_strategy, zero_division=0),
        "roc_auc": roc_auc
    }

    return model, y_pred, metrics


