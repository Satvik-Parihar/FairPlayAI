import numpy as np
import pandas as pd


def calibration(y_pred, sensitive_features, y_true):
    """
    Calculate calibration error for each group.
    Returns the mean absolute difference between predicted and actual outcomes for each group.
    """
    import numpy as np
    import pandas as pd
    if isinstance(sensitive_features, pd.Series):
        sensitive_features = sensitive_features.values
    if isinstance(y_pred, pd.Series):
        y_pred = y_pred.values
    if isinstance(y_true, pd.Series):
        y_true = y_true.values
    groups = np.unique(sensitive_features)
    errors = {}
    for group in groups:
        mask = (sensitive_features == group)
        if np.sum(mask) == 0:
            errors[group] = np.nan
        else:
            errors[group] = np.abs(y_pred[mask] - y_true[mask]).mean()
    return errors
def equalized_odds(y_pred, sensitive_features, y_true):
    """
    Calculate Equalized Odds Difference for binary or multiclass classification.
    Returns the difference between the highest and lowest true positive rate and false positive rate across groups.
    """
    if isinstance(sensitive_features, pd.Series):
        sensitive_features = sensitive_features.values
    if isinstance(y_pred, pd.Series):
        y_pred = y_pred.values
    if isinstance(y_true, pd.Series):
        y_true = y_true.values
    groups = np.unique(sensitive_features)
    tpr = {}
    fpr = {}
    for group in groups:
        mask = (sensitive_features == group)
        if np.sum(mask) == 0:
            tpr[group] = np.nan
            fpr[group] = np.nan
        else:
            # True Positive Rate: P(pred=1 | true=1, group)
            true_pos = (y_true[mask] == 1)
            if np.sum(true_pos) == 0:
                tpr[group] = np.nan
            else:
                tpr[group] = (y_pred[mask][true_pos] == 1).mean()
            # False Positive Rate: P(pred=1 | true=0, group)
            true_neg = (y_true[mask] == 0)
            if np.sum(true_neg) == 0:
                fpr[group] = np.nan
            else:
                fpr[group] = (y_pred[mask][true_neg] == 1).mean()
    # Remove nan groups
    valid_tpr = [v for v in tpr.values() if not np.isnan(v)]
    valid_fpr = [v for v in fpr.values() if not np.isnan(v)]
    # Return the max difference between groups for TPR and FPR
    tpr_diff = float(np.max(valid_tpr) - np.min(valid_tpr)) if len(valid_tpr) >= 2 else np.nan
    fpr_diff = float(np.max(valid_fpr) - np.min(valid_fpr)) if len(valid_fpr) >= 2 else np.nan
    # Optionally, return both diffs as a tuple, or their mean
    if np.isnan(tpr_diff) and np.isnan(fpr_diff):
        return np.nan
    elif np.isnan(tpr_diff):
        return fpr_diff
    elif np.isnan(fpr_diff):
        return tpr_diff
    else:
        return (tpr_diff + fpr_diff) / 2

def demographic_parity(y_pred, sensitive_features):
    """
    Calculate Demographic Parity Difference for binary or multiclass classification.
    Returns the difference between the highest and lowest positive prediction rates across groups.
    """
    if isinstance(sensitive_features, pd.Series):
        sensitive_features = sensitive_features.values
    if isinstance(y_pred, pd.Series):
        y_pred = y_pred.values
    groups = np.unique(sensitive_features)
    rates = {}
    for group in groups:
        mask = (sensitive_features == group)
        if np.sum(mask) == 0:
            rates[group] = np.nan
        else:
            # For multiclass, treat positive as predicted class == 1 (or majority class)
            if len(np.unique(y_pred)) > 2:
                # Use the most frequent class as 'positive'
                positive_class = pd.Series(y_pred).mode()[0]
                rates[group] = (y_pred[mask] == positive_class).mean()
            else:
                rates[group] = (y_pred[mask] == 1).mean()
    # Remove nan groups
    valid_rates = [v for v in rates.values() if not np.isnan(v)]
    if len(valid_rates) < 2:
        return np.nan
    return float(np.max(valid_rates) - np.min(valid_rates))
