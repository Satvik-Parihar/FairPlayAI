

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

    print("[DEBUG] request.POST:", dict(request.POST))
    print("[DEBUG] request.data:", getattr(request, 'data', None))
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
        return Response({
            "message": f"{selected_model} trained successfully for {problem_type} problem.",
            "metrics": metrics
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
