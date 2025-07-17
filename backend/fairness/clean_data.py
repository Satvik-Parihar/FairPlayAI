# # import pandas as pd
# # import numpy as np
# # from sklearn.preprocessing import LabelEncoder
# # from sklearn.utils import resample

# # def clean_and_preprocess_data(df, sensitive_attributes, target_column):
# #     """
# #     Comprehensive data cleaning and preprocessing pipeline
    
# #     Args:
# #         df: Raw pandas DataFrame
# #         sensitive_attributes: List of sensitive attribute column names
# #         target_column: Name of the target column
        
# #     Returns:
# #         Cleaned and preprocessed DataFrame
# #     """
# #     try:
# #         # 1. Initial cleaning
# #         df = df.copy()
        
# #         # Drop completely empty columns and rows
# #         df.dropna(axis=1, how='all', inplace=True)
# #         df.dropna(axis=0, how='all', inplace=True)
        
# #         # Remove any index columns that might have been added
# #         df = df.loc[:, ~df.columns.str.contains('^Unnamed')]
        
# #         # 2. Validate required columns exist
# #         missing_columns = [col for col in sensitive_attributes + [target_column] 
# #                           if col not in df.columns]
# #         if missing_columns:
# #             raise ValueError(f"Missing required columns: {missing_columns}")
            
# #         # 3. Handle missing values
# #         # For sensitive attributes, create 'Unknown' category
# #         for col in sensitive_attributes:
# #             if df[col].isna().any():
# #                 df[col] = df[col].fillna('Unknown')
                
# #         # For other columns, use median for numeric, mode for categorical
# #         for col in df.columns:
# #             if col not in sensitive_attributes + [target_column]:
# #                 if pd.api.types.is_numeric_dtype(df[col]):
# #                     df[col] = df[col].fillna(df[col].median())
# #                 else:
# #                     df[col] = df[col].fillna(df[col].mode()[0])
        
# #         # 4. Convert sensitive attributes to string type
# #         for col in sensitive_attributes:
# #             df[col] = df[col].astype(str)
            
# #         # 5. Handle target column
# #         # Convert to numeric if categorical
# #         if not pd.api.types.is_numeric_dtype(df[target_column]):
# #             le = LabelEncoder()
# #             df[target_column] = le.fit_transform(df[target_column])
            
# #         # 6. Balance classes if needed (prevent empty splits)
# #         class_counts = df[target_column].value_counts()
# #         if len(class_counts) < 2:
# #             raise ValueError("Target column has only one class")
            
# #         min_samples = class_counts.min()
# #         if min_samples < 10:  # Threshold for too few samples
# #             dfs = []
# #             for class_val in class_counts.index:
# #                 class_df = df[df[target_column] == class_val]
# #                 if len(class_df) > min_samples * 2:  # Only downsample if significantly larger
# #                     class_df = resample(class_df, 
# #                                       replace=False,
# #                                       n_samples=max(min_samples, 10),  # Ensure at least 10 samples
# #                                       random_state=42)
# #                 dfs.append(class_df)
# #             df = pd.concat(dfs)
            
# #         # 7. Convert other categorical columns to numeric
# #         for col in df.select_dtypes(include=['object', 'category']).columns:
# #             if col not in sensitive_attributes:
# #                 df[col] = LabelEncoder().fit_transform(df[col].astype(str))
                
# #         # 8. Final validation
# #         if len(df) < 20:
# #             raise ValueError(f"After preprocessing, only {len(df)} samples remain - insufficient for analysis")
            
# #         return df
        
# #     except Exception as e:
# #         raise ValueError(f"Data preprocessing failed: {str(e)}")


# # # Example usage:
# # if __name__ == "__main__":
# #     # Test with sample data
# #     data = {
# #         'age': [25, 30, None, 40, 25, 30, 40, 25],
# #         'gender': ['M', 'F', 'M', 'F', 'M', 'F', None, 'M'],
# #         'income': ['high', 'medium', 'low', 'high', 'medium', 'low', 'high', 'medium'],
# #         'target': [1, 0, 1, 0, 1, 0, 1, 0]
# #     }
# #     df = pd.DataFrame(data)
    
# #     try:
# #         cleaned_df = clean_and_preprocess_data(
# #             df, 
# #             sensitive_attributes=['age', 'gender'], 
# #             target_column='target'
# #         )
# #         print("Cleaned data:")
# #         print(cleaned_df)
# #     except Exception as e:
# #         print(f"Error: {e}")
# import pandas as pd
# import numpy as np
# from sklearn.preprocessing import LabelEncoder
# from sklearn.utils import resample

# def clean_and_preprocess_data(df, sensitive_attributes, target_column):
#     """
#     Comprehensive data cleaning and preprocessing pipeline for user-uploaded CSV data
    
#     Args:
#         df: Raw pandas DataFrame from user upload
#         sensitive_attributes: List of sensitive attribute column names
#         target_column: Name of the target column
        
#     Returns:
#         Cleaned and preprocessed DataFrame ready for analysis
        
#     Raises:
#         ValueError: If data cannot be processed or requirements aren't met
#     """
#     # 1. Initial cleaning
#     df = df.copy()
    
#     # Drop completely empty columns and rows
#     df.dropna(axis=1, how='all', inplace=True)
#     df.dropna(axis=0, how='all', inplace=True)
    
#     # Remove any index columns that might have been added
#     df = df.loc[:, ~df.columns.str.contains('^Unnamed')]
    
#     # 2. Validate required columns exist
#     missing_columns = [col for col in sensitive_attributes + [target_column] 
#                       if col not in df.columns]
#     if missing_columns:
#         raise ValueError(f"Missing required columns: {missing_columns}")
        
#     # 3. Handle missing values
#     # For sensitive attributes, create 'Unknown' category
#     for col in sensitive_attributes:
#         if df[col].isna().any():
#             df[col] = df[col].fillna('Unknown')
            
#     # For other columns, use median for numeric, mode for categorical
#     for col in df.columns:
#         if col not in sensitive_attributes + [target_column]:
#             if pd.api.types.is_numeric_dtype(df[col]):
#                 df[col] = df[col].fillna(df[col].median())
#             else:
#                 df[col] = df[col].fillna(df[col].mode()[0])
    
#     # 4. Convert sensitive attributes to string type
#     for col in sensitive_attributes:
#         df[col] = df[col].astype(str)
#     # # 4. Convert sensitive attributes to binary categorical strings if needed
#     # for col in sensitive_attributes:
#     #     if pd.api.types.is_numeric_dtype(df[col]):
#     #         # Binarize using median
#     #         median_val = df[col].median()
#     #         df[col] = (df[col] > median_val).astype(int).astype(str)  # Convert to 0/1 string
#     #     else:
#     #         df[col] = df[col].astype(str)  # Ensure categorical ones are string

        
#     # 5. Handle target column
#     # Convert to numeric if categorical
#     if not pd.api.types.is_numeric_dtype(df[target_column]):
#         le = LabelEncoder()
#         df[target_column] = le.fit_transform(df[target_column])
        
#     # 6. Balance classes if needed (prevent empty splits)
#     class_counts = df[target_column].value_counts()
#     if len(class_counts) < 2:
#         raise ValueError("Target column has only one class")
        
#     min_samples = class_counts.min()
#     if min_samples < 10:  # Threshold for too few samples
#         dfs = []
#         for class_val in class_counts.index:
#             class_df = df[df[target_column] == class_val]
#             if len(class_df) > min_samples * 2:  # Only downsample if significantly larger
#                 class_df = resample(class_df, 
#                                   replace=False,
#                                   n_samples=max(min_samples, 10),  # Ensure at least 10 samples
#                                   random_state=42)
#             dfs.append(class_df)
#         df = pd.concat(dfs)
        
#     # 7. Convert other categorical columns to numeric
#     for col in df.select_dtypes(include=['object', 'category']).columns:
#         if col not in sensitive_attributes:
#             df[col] = LabelEncoder().fit_transform(df[col].astype(str))
            
#     # 8. Final validation
#     if len(df) < 20:
#         raise ValueError(f"After preprocessing, only {len(df)} samples remain - insufficient for analysis")
        
#     return df
# fairness/clean_data.py
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from collections import defaultdict

def perform_initial_data_scan(df):
    """
    Performs an initial scan of the DataFrame to identify cleaning needs.
    Returns a dictionary of statistics and recommendations.
    """
    initial_stats = {
        "null_values": {},
        "duplicate_rows": 0,
        "inconsistent_data_summary": {},
        "numeric_objects": []
    }

    # 1. Null Values
    null_counts = df.isnull().sum()
    null_percentage = (df.isnull().sum() / len(df)) * 100
    for col in df.columns:
        if null_counts[col] > 0:
            initial_stats["null_values"][col] = {
                "count": int(null_counts[col]),
                "percentage": round(float(null_percentage[col]), 2),
                "has_nulls": True
            }
        else:
            initial_stats["null_values"][col] = {
                "count": 0,
                "percentage": 0.0,
                "has_nulls": False
            }

    # 2. Duplicate Rows
    initial_stats["duplicate_rows"] = int(df.duplicated().sum())

    # 3. Inconsistent Data (Typos, casing, weird entries like '?', 'NaN')
    # This is a heuristic and can be expanded.
    for col in df.select_dtypes(include='object').columns:
        unique_values = df[col].astype(str).unique()
        # Check for casing inconsistencies
        lower_case_unique = [str(x).lower() for x in unique_values]
        if len(set(lower_case_unique)) < len(unique_values):
            initial_stats["inconsistent_data_summary"][col] = {
                "has_inconsistencies": True,
                "type": "casing",
                "unique_values": list(unique_values) # Show unique values for user review
            }
        
        # Check for common "missing" representations
        missing_representations = ['?', 'nan', 'missing', 'n/a', 'na', '-']
        if any(val.lower() in missing_representations for val in lower_case_unique):
             if col not in initial_stats["inconsistent_data_summary"]:
                 initial_stats["inconsistent_data_summary"][col] = {"has_inconsistencies": True}
             initial_stats["inconsistent_data_summary"][col]["type"] = "missing_strings"
             initial_stats["inconsistent_data_summary"][col]["unique_values"] = list(unique_values)

        # Check for Yes/No, True/False patterns
        yes_no_patterns = ["yes", "no", "true", "false", "y", "n", "t", "f"]
        if any(str(val).lower() in yes_no_patterns for val in unique_values):
            if col not in initial_stats["inconsistent_data_summary"]:
                initial_stats["inconsistent_data_summary"][col] = {"has_inconsistencies": True}
            initial_stats["inconsistent_data_summary"][col]["type"] = "boolean_strings"
            initial_stats["inconsistent_data_summary"][col]["unique_values"] = list(unique_values)


    # 4. Numeric values stored as objects (e.g., '100', '25.5')
    for col in df.columns:
        # Try to convert to numeric, if it fails, it might be a numeric_object
        if df[col].dtype == 'object':
            try:
                pd.to_numeric(df[col], errors='raise')
            except ValueError:
                # Still check if a significant portion *could* be numeric
                numeric_count = df[col].apply(lambda x: pd.is_numeric(x)).sum()
                if numeric_count / len(df) > 0.5: # Heuristic: if more than 50% are numeric-like
                    initial_stats["numeric_objects"].append(col)

    # 5. Date format detection (basic)
    # This is complex and might require a dedicated date parsing step.
    # For now, just identify columns that *could* be dates
    initial_stats["potential_date_columns"] = []
    for col in df.columns:
        if df[col].dtype == 'object':
            try:
                # Try to parse a small sample to see if it's a date
                df[col].head(5).apply(lambda x: pd.to_datetime(x, errors='coerce'))
                if df[col].head(5).isnull().sum() < 5: # If at least one conversion was successful
                    initial_stats["potential_date_columns"].append(col)
            except Exception:
                pass


    return initial_stats

def apply_cleaning_steps(df, cleaning_choices):
    """
    Applies cleaning steps to the DataFrame based on user choices.
    Returns the cleaned DataFrame and a summary of actions taken.
    """
    cleaned_df = df.copy()
    cleaning_summary = defaultdict(dict)

    # 1. Handle Null Values
    handle_nulls_option = cleaning_choices.get('handle_nulls')
    columns_to_fill = cleaning_choices.get('columns_to_fill', {}) # {col_name: "median"|"mode"}

    if handle_nulls_option == 'drop_rows':
        rows_before = len(cleaned_df)
        cleaned_df.dropna(axis=0, inplace=True)
        rows_after = len(cleaned_df)
        cleaning_summary["null_values"]["action"] = "dropped_rows"
        cleaning_summary["null_values"]["rows_dropped"] = rows_before - rows_after
    elif handle_nulls_option == 'drop_columns':
        cols_before = cleaned_df.shape[1]
        cleaned_df.dropna(axis=1, inplace=True)
        cols_after = cleaned_df.shape[1]
        cleaning_summary["null_values"]["action"] = "dropped_columns"
        cleaning_summary["null_values"]["columns_dropped"] = cols_before - cols_after
    elif handle_nulls_option == 'fill_value':
        for col, method in columns_to_fill.items():
            if col in cleaned_df.columns and cleaned_df[col].isnull().any():
                if method == 'median' and pd.api.types.is_numeric_dtype(cleaned_df[col]):
                    fill_val = cleaned_df[col].median()
                    cleaned_df[col].fillna(fill_val, inplace=True)
                    cleaning_summary["null_values"][col] = f"filled_with_median ({fill_val})"
                elif method == 'mode':
                    fill_val = cleaned_df[col].mode()[0] # mode can return multiple, take first
                    cleaned_df[col].fillna(fill_val, inplace=True)
                    cleaning_summary["null_values"][col] = f"filled_with_mode ({fill_val})"
                else:
                    cleaning_summary["null_values"][col] = "skipped_fill_due_to_type_mismatch_or_invalid_method"
    else:
        cleaning_summary["null_values"]["action"] = "no_action_taken"


    # 2. Drop Duplicates
    if cleaning_choices.get('handle_duplicates', False):
        rows_before = len(cleaned_df)
        cleaned_df.drop_duplicates(inplace=True)
        rows_after = len(cleaned_df)
        duplicates_dropped = rows_before - rows_after
        cleaning_summary["duplicates"] = {"action": "dropped", "count": duplicates_dropped}
    else:
        cleaning_summary["duplicates"] = {"action": "no_action_taken"}


    # 3. Inconsistent Data
    # Normalize casing
    inconsistent_casing_cols = cleaning_choices.get('handle_inconsistent_casing', [])
    for col in inconsistent_casing_cols:
        if col in cleaned_df.columns and cleaned_df[col].dtype == 'object':
            cleaned_df[col] = cleaned_df[col].astype(str).str.lower().str.strip()
            cleaning_summary["inconsistent_data"][col] = "casing_normalized"
            
    # Convert common 'missing' strings to NaN
    missing_strings_mapping = cleaning_choices.get('handle_missing_strings', {}) # {col: ["?", "N/A"]}
    for col, values_to_replace in missing_strings_mapping.items():
        if col in cleaned_df.columns and cleaned_df[col].dtype == 'object':
            for val_str in values_to_replace:
                cleaned_df[col].replace(val_str, np.nan, inplace=True)
            cleaning_summary["inconsistent_data"][col]["missing_strings_converted_to_nan"] = values_to_replace

    # Map Yes/No, True/False to 1/0
    yes_no_mapping = cleaning_choices.get('handle_yes_no_mapping', {}) # {col: {"yes_val": "Yes", "no_val": "No", "target_type": "int"}}
    for col, mapping_info in yes_no_mapping.items():
        if col in cleaned_df.columns and cleaned_df[col].dtype == 'object':
            yes_val_str = mapping_info.get('yes_val', 'yes').lower()
            no_val_str = mapping_info.get('no_val', 'no').lower()
            
            cleaned_df[col] = cleaned_df[col].astype(str).str.lower()
            cleaned_df[col] = cleaned_df[col].map({yes_val_str: 1, no_val_str: 0}).fillna(cleaned_df[col]) # Keep original if no match
            
            # Convert to appropriate type if specified (e.g., int or bool)
            if mapping_info.get('target_type') == 'int':
                # Convert only successfully mapped values to int, leave others as they are for now
                cleaned_df[col] = pd.to_numeric(cleaned_df[col], errors='coerce').fillna(cleaned_df[col])

            cleaning_summary["inconsistent_data"][col]["boolean_mapped_to_numeric"] = mapping_info


    # 4. Numeric values stored as objects (e.g., '100', '25.5')
    numeric_objects_to_convert = cleaning_choices.get('handle_numeric_objects', [])
    for col in numeric_objects_to_convert:
        if col in cleaned_df.columns and cleaned_df[col].dtype == 'object':
            original_type = str(cleaned_df[col].dtype)
            cleaned_df[col] = pd.to_numeric(cleaned_df[col], errors='coerce') # Coerce errors to NaN
            if cleaned_df[col].dtype != original_type:
                cleaning_summary["data_type_conversion"][col] = f"converted_from_{original_type}_to_{cleaned_df[col].dtype}"
            else:
                cleaning_summary["data_type_conversion"][col] = f"attempted_conversion_to_numeric_but_failed_for_some_values"


    # 5. Date format conversion (basic attempt based on initial scan)
    date_columns_to_convert = cleaning_choices.get('convert_date_columns', [])
    for col in date_columns_to_convert:
        if col in cleaned_df.columns:
            original_type = str(cleaned_df[col].dtype)
            cleaned_df[col] = pd.to_datetime(cleaned_df[col], errors='coerce')
            if cleaned_df[col].dtype != original_type:
                cleaning_summary["data_type_conversion"][col] = f"converted_from_{original_type}_to_{cleaned_df[col].dtype}_date"
            else:
                 cleaning_summary["data_type_conversion"][col] = f"attempted_conversion_to_date_but_failed_for_some_values"


    return cleaned_df, dict(cleaning_summary)