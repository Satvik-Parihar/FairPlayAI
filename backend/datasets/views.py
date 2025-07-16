from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import pandas as pd
import numpy as np
import io
import re  # noqa: F401

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

        # Step 2: Convert types
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
            df = df[~outlier_condition]
            cleaning_summary["outliers_removed"] += outliers

        # Step 4: Handle missing values
        if strategy == "drop":
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
            return Response({"error": f"Unknown strategy: {strategy}"}, status=400)

        # Step 5: Remove duplicate rows
        before = df.shape[0]
        df = df.drop_duplicates()
        after = df.shape[0]
        cleaning_summary["duplicates_removed"] = before - after

        # Final CSV and summary
        cleaned_csv_io = io.StringIO()
        df.to_csv(cleaned_csv_io, index=False)

        return Response({
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
