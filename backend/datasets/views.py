

# views.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import pandas as pd
import numpy as np
import io
import re
from django.core.cache import cache
import uuid
import json # Import json for parsing sensitive_attrs

# Import your preprocessing functions
from .preprocessing import preprocess_data, detect_problem_type # Import detect_problem_type

@api_view(['POST'])
def upload_clean_csv(request):
    file = request.FILES.get("csv_file")
    strategy = request.POST.get("missing_strategy", "drop")

    if not file:
        return Response({"error": "No file provided."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        df = pd.read_csv(file)
        # Store the original filename in cache for later use in report
        cache.set(f'{file.name}_session_id', None, timeout=300)  # Placeholder for reverse lookup if needed
        cache.set(f'{file.name}_original_filename', file.name, timeout=300)
        # Also store filename by session_id after it's generated (see below)
        initial_shape = df.shape

        cleaning_summary = {
            "strategy": strategy,
            "initial_shape": initial_shape,
            "dropped_rows": 0,
            "imputed_columns": [],
            "duplicates_removed": 0,
            "outliers_removed": 0,
            "normalized_columns": [],
            "type_converted_columns": []
        }

        # Step 1: Normalize inconsistent categorical values
        for col in df.select_dtypes(include=['object']).columns:
            original_values = df[col].dropna().unique().tolist()
            df[col] = df[col].astype(str).str.lower().str.strip()
            df[col] = df[col].replace(
                to_replace=r'^(m|male)$', value='male', regex=True)
            df[col] = df[col].replace(
                to_replace=r'^(f|female)$', value='female', regex=True)
            df[col] = df[col].replace(
                to_replace=r'^(yes|y|1|true)$', value='yes', regex=True)
            df[col] = df[col].replace(
                to_replace=r'^(no|n|0|false)$', value='no', regex=True)
            if df[col].nunique() < len(original_values):
                cleaning_summary["normalized_columns"].append(col)

        # Step 2: Convert types (This section might need refinement for edge cases,
        # but for now, we'll keep it as is from your original code)
        for col in df.columns:
            if df[col].dtype == object:
                try:
                    df[col] = pd.to_numeric(df[col])
                    cleaning_summary["type_converted_columns"].append(col)
                except:  # noqa: E722
                    continue

        # Step 3: Remove outliers using IQR
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            outlier_condition = (df[col] < (Q1 - 1.5 * IQR)) | (df[col] > (Q3 + 1.5 * IQR))
            outliers = outlier_condition.sum()
            # Ensure df is not empty after dropping outliers
            if outliers > 0:
                df_temp = df[~outlier_condition]
                if not df_temp.empty:
                    df = df_temp
                    cleaning_summary["outliers_removed"] += outliers
                else:
                    # If dropping outliers makes df empty, maybe log and don't drop for this col
                    print(f"Warning: Dropping outliers in column '{col}' would result in an empty DataFrame. Skipping outlier removal for this column.")
                    pass # Or handle differently, e.g., keep outliers if dataset becomes too small


        # Step 4: Handle missing values
        if strategy == "drop":
            # Count rows with NaNs BEFORE dropping
            cleaning_summary["dropped_rows"] = df.isna().any(axis=1).sum()
            df = df.dropna()
        elif strategy == "mean":
            cols = df.columns[df.isna().any()].tolist()
            df = df.fillna(df.mean(numeric_only=True))
            cleaning_summary["imputed_columns"] = cols
        elif strategy == "median":
            cols = df.columns[df.isna().any()].tolist()
            df = df.fillna(df.median(numeric_only=True))
            cleaning_summary["imputed_columns"] = cols
        elif strategy == "mode":
            cols = df.columns[df.isna().any()].tolist()
            for col in cols:
                df[col] = df[col].fillna(df[col].mode()[0])
            cleaning_summary["imputed_columns"] = cols
        else:
            return Response({"error": f"Unknown strategy: {strategy}"}, status=status.HTTP_400_BAD_REQUEST)

        # Step 5: Remove duplicate rows
        before = df.shape[0]
        df = df.drop_duplicates()
        after = df.shape[0]
        cleaning_summary["duplicates_removed"] = before - after
        
        if df.empty:
            return Response({"error": "DataFrame became empty after cleaning steps. Please check your data or cleaning strategy."}, status=status.HTTP_400_BAD_REQUEST)

        # Generate a unique session ID and store cleaned data
        session_id = str(uuid.uuid4())
        cache.set(f'{session_id}_cleaned_df', df.to_json(), timeout=300) # Store as JSON string
        # Store the original filename by session_id for later report use
        cache.set(f'{session_id}_original_filename', file.name, timeout=300)
        cleaned_csv_io = io.StringIO()
        df.to_csv(cleaned_csv_io, index=False)

        return Response({
            "session_id": session_id, # Return session_id for subsequent requests
            "columns": list(df.columns),
            "auto_target_column": df.columns[-1] if len(df.columns) > 0 else "",
            "cleaning_summary": cleaning_summary,
            "cleaned_csv": cleaned_csv_io.getvalue()
        })

    except Exception as e:
        return Response(
            {"error": f"Failed to process CSV: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
# --- New/Modified preprocess_csv endpoint ---
@api_view(['POST'])
def preprocess_csv(request):
    session_id = request.POST.get("session_id")
    target_col = request.POST.get("target_col")
    sensitive_attrs_str = request.POST.get("sensitive_attrs")

    if not session_id or not target_col or not sensitive_attrs_str:
        return Response({"error": "Missing session ID, target column, or sensitive attributes."}, status=status.HTTP_400_BAD_REQUEST)

    df_json = cache.get(f'{session_id}_cleaned_df')
    if not df_json:
        return Response({"error": "Cleaned CSV not found in cache. Please upload and clean first."}, status=status.HTTP_400_BAD_REQUEST)


    df = pd.read_json(io.StringIO(df_json))
    sensitive_attrs = json.loads(sensitive_attrs_str) # Parse JSON string to list

    # Prevent user from selecting target column as a sensitive attribute (fail fast, before any processing)
    if target_col in sensitive_attrs:
        return Response({"error": "Sensitive attribute and target column cannot be the same. Please select different columns."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Step 1: Detect problem type
        # Call detect_problem_type BEFORE preprocessing the target column
        problem_type = detect_problem_type(df.copy(), target_col) # Pass a copy to avoid modifying df before preprocessing

        # Step 2: Preprocess data based on detected problem type
        # Pass the detected problem_type to preprocess_data
        preprocessed_df, encoded_feature_map, target_mapping = preprocess_data(df, sensitive_attrs, target_col, problem_type)

        # Store preprocessed data and metadata in cache
        cache.set(f'{session_id}_preprocessed_df', preprocessed_df.to_json(orient='split'), timeout=300) # Use 'split' for DataFrame
        cache.set(f'{session_id}_encoded_feature_map', encoded_feature_map, timeout=300)
        cache.set(f'{session_id}_target_col', target_col, timeout=300)
        cache.set(f'{session_id}_problem_type', problem_type, timeout=300) # Store problem type
        if target_mapping: # Only store if classification and mapping exists
            cache.set(f'{session_id}_target_mapping', target_mapping, timeout=300)

        response_data = {
            "message": "Data preprocessed successfully.",
            "preprocessed_shape": preprocessed_df.shape,
            "encoded_feature_map": convert_keys_to_str(encoded_feature_map),
            "problem_type": problem_type, # Return problem type to frontend
            "target_mapping": convert_keys_to_str(target_mapping) if target_mapping else None
        }
        return Response(response_data)

    except ValueError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": f"An unexpected error occurred during preprocessing: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- New/Modified train_selected_model endpoint ---
@api_view(['POST'])
def train_selected_model(request):

    session_id = request.POST.get("session_id") or request.data.get("session_id")
    selected_model = request.POST.get("selected_model") or request.data.get("selected_model")

    if not session_id or not selected_model:
        return Response({"error": "Missing session ID or selected model."}, status=status.HTTP_400_BAD_REQUEST)

    import traceback
    # Retrieve preprocessed data and metadata from cache, with error handling
    try:
        preprocessed_df_json = cache.get(f'{session_id}_preprocessed_df')
        encoded_feature_map = cache.get(f'{session_id}_encoded_feature_map')
        target_col = cache.get(f'{session_id}_target_col')
        problem_type = cache.get(f'{session_id}_problem_type') # Retrieve problem type
        if not all([preprocessed_df_json, encoded_feature_map, target_col, problem_type]):
            return Response({"error": "Preprocessed data expired or missing. Please preprocess first."}, status=status.HTTP_400_BAD_REQUEST)
        # Reconstruct DataFrame from JSON
        df = pd.read_json(io.StringIO(preprocessed_df_json), orient='split')
    except Exception as e:
        tb = traceback.format_exc()
        print("[ERROR] Failed to load cached data or reconstruct DataFrame:", tb)
        return Response({"error": f"Failed to load cached data or reconstruct DataFrame: {e}", "traceback": tb}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    try:
        from .model_selector import main as model_selector_main
        # Pass problem_type to model_selector_main
        model, y_pred, metrics = model_selector_main(df, encoded_feature_map, target_col, selected_model, problem_type)

        # --- Fairness backend integration: create MongoDB report ---
        # Import AnalysisReport from fairness.models
        from fairness.models import AnalysisReport
        # Get user_id if available (from request.user if authenticated, else None)
        user_id = str(getattr(request.user, 'id', None)) if hasattr(request, 'user') and request.user and request.user.is_authenticated else None
        # Try to get dataset name from cache (from upload_clean_csv step)
        dataset_name = cache.get(f'{session_id}_original_filename')
        if not dataset_name:
            dataset_name = request.data.get('dataset_name') or request.data.get('filename') or session_id
        from datetime import datetime
        upload_date = datetime.utcnow().strftime('%Y-%m-%d')
        import math

        def sanitize_metrics(obj):
            if isinstance(obj, dict):
                return {str(k): sanitize_metrics(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [sanitize_metrics(v) for v in obj]
            elif isinstance(obj, float):
                if math.isnan(obj) or math.isinf(obj):
                    return None
                return obj
            else:
                return obj

        metrics = sanitize_metrics(metrics)

        # --- Compute overall_fairness_score ---
        def mean_of_metric(val):
            # Accepts a float or dict of floats, returns mean of all numeric values (ignores None)
            import numbers
            if isinstance(val, numbers.Number):
                return float(val)
            elif isinstance(val, dict):
                vals = [v for v in val.values() if isinstance(v, numbers.Number) and v is not None]
                if vals:
                    return float(sum(vals)) / len(vals)
            return None

        if problem_type == "regression":
            def compute_regression_fairness_score(fairness_results):
                all_maes = []
                # fairness_results: metrics["regression_fairness"]
                for attr, group_metrics in fairness_results.items():
                    group_mae = group_metrics.get("group_mae", {})
                    maes = [v for v in group_mae.values() if isinstance(v, (int, float)) and v is not None and not math.isnan(v)]
                    all_maes.extend(maes)
                if len(all_maes) <= 1:
                    return 1.0  # Only one group, perfectly fair
                max_mae = max(all_maes)
                min_mae = min(all_maes)
                if max_mae == 0:
                    return 1.0
                fairness_score = 1 - (max_mae - min_mae) / max_mae
                return round(max(0, fairness_score), 4)

            regression_fairness = metrics.get("regression_fairness", {})
            overall_fairness_score = compute_regression_fairness_score(regression_fairness)
            overall_fairness_score_10 = round(overall_fairness_score * 10, 2)
        else:
            fairness_keys = ["demographic_parity", "equalized_odds", "calibration", "individual_fairness"]
            fairness_scores = []
            for key in fairness_keys:
                v = metrics.get(key)
                m = mean_of_metric(v)
                if m is not None and not math.isnan(m):
                    # Clamp to [0, 1] if needed
                    m = max(0.0, min(1.0, m))
                    fairness_scores.append(m)
            if fairness_scores:
                overall_fairness_score = sum(fairness_scores) / len(fairness_scores)
                overall_fairness_score_10 = round(overall_fairness_score * 10, 2)
            else:
                overall_fairness_score_10 = 0.0

        # --- Compute bias_detected list ---
        # We'll use demographic_parity as the bias score per attribute (can be changed if needed)
        bias_detected = []
        dp = metrics.get("demographic_parity")
        if isinstance(dp, dict):
            for attr, score in dp.items():
                if score is None or (isinstance(score, float) and math.isnan(score)):
                    continue
                if score < 0.5:
                    severity = "high"
                elif score < 0.75:
                    severity = "medium"
                else:
                    severity = "low"
                bias_detected.append({
                    "attribute": attr,
                    "score": score,
                    "severity": severity
                })

        # --- Generate suggestions array based on metrics ---
        suggestions = []
        # Helper to assign priority based on severity
        def get_priority(severity):
            if severity == "high":
                return "high"
            elif severity == "medium":
                return "medium"
            else:
                return "low"

        # Suggestion templates
        suggestion_templates = [
            {
                "type": "data_augmentation",
                "description": "Increase representation of underrepresented groups in training data"
            },
            {
                "type": "algorithmic_adjustment",
                "description": "Apply post-processing fairness constraints to model predictions"
            },
            {
                "type": "feature_engineering",
                "description": "Remove or transform features highly correlated with sensitive attributes"
            }
        ]

        # For each sensitive attribute, check metrics and add suggestions
        sensitive_attrs = set()
        for key in ["demographic_parity", "equalized_odds", "calibration"]:
            val = metrics.get(key)
            if isinstance(val, dict):
                sensitive_attrs.update(val.keys())

        def get_numeric_score(val):
            import numbers
            if isinstance(val, numbers.Number):
                return float(val)
            elif isinstance(val, dict):
                vals = [v for v in val.values() if isinstance(v, numbers.Number) and v is not None]
                if vals:
                    return float(sum(vals)) / len(vals)
            return None

        for attr in sensitive_attrs:
            # Demographic parity
            dp_score = metrics.get("demographic_parity", {}).get(attr)
            dp_val = get_numeric_score(dp_score)
            if dp_val is not None and not (isinstance(dp_val, float) and math.isnan(dp_val)):
                if dp_val < 0.5:
                    suggestions.append({
                        "type": "data_augmentation",
                        "priority": "high",
                        "description": "Increase representation of underrepresented groups in training data",
                        "attribute": attr
                    })
            # Equalized odds
            eo_score = metrics.get("equalized_odds", {}).get(attr)
            eo_val = get_numeric_score(eo_score)
            if eo_val is not None and not (isinstance(eo_val, float) and math.isnan(eo_val)):
                if 0.5 <= eo_val < 0.75:
                    suggestions.append({
                        "type": "algorithmic_adjustment",
                        "priority": "medium",
                        "description": "Apply post-processing fairness constraints to model predictions",
                        "attribute": attr
                    })
            # Calibration
            cal_score = metrics.get("calibration", {}).get(attr)
            cal_val = get_numeric_score(cal_score)
            if cal_val is not None and not (isinstance(cal_val, float) and math.isnan(cal_val)):
                if cal_val < 0.6:
                    suggestions.append({
                        "type": "feature_engineering",
                        "priority": "low",
                        "description": "Remove or transform features highly correlated with sensitive attributes",
                        "attribute": attr
                    })

        report_data = {
            "selected_model": selected_model,
            "problem_type": problem_type,
            "metrics": metrics,
            "session_id": session_id,
            "target_col": target_col,
            "dataset_name": dataset_name,
            "upload_date": upload_date,
            "overall_fairness_score": overall_fairness_score_10,
            "bias_detected": bias_detected,
            "suggestions": suggestions,
            # Add more fields as needed
        }
        # Create report in MongoDB (returns string report_id)
        report_id = AnalysisReport.create_report(user_id, report_data)
        return Response({
            "message": f"{selected_model} trained successfully for {problem_type} problem.",
            "metrics": metrics,
            "overall_fairness_score": overall_fairness_score_10,
            "bias_detected": bias_detected,
            "suggestions": suggestions,
            "report_id": report_id
        })
    except ValueError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        tb = traceback.format_exc()
        print("[ERROR] Exception during model training:", tb)
        return Response({"error": f"An unexpected error occurred during model training: {e}", "traceback": tb}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
def convert_keys_to_str(d):
    if isinstance(d, dict):
        return {str(k): convert_keys_to_str(v) for k, v in d.items()}
    elif isinstance(d, list):
        return [convert_keys_to_str(i) for i in d]
    else:
        return d