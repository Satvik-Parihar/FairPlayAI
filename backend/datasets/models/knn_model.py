from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

def train_knn_model(X_train, X_test, y_train, y_test, problem_type, k=5):
    model = KNeighborsClassifier(n_neighbors=k)
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
