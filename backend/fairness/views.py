# # # from rest_framework.decorators import api_view, permission_classes
# # # from rest_framework.response import Response
# # # from rest_framework.permissions import IsAuthenticated
# # # from .models import AnalysisResult
# # # from .serializers import AnalysisResultSerializer
# # # import pandas as pd
# # # import uuid
# # # import os

# # # @api_view(['POST'])
# # # @permission_classes([IsAuthenticated])
# # # def upload_dataset(request):
# # #     csv_file = request.FILES.get('csv_file')
# # #     model_file = request.FILES.get('model_file')
# # #     sensitive_attributes = request.POST.get('sensitive_attributes', '[]')

# # #     df = pd.read_csv(csv_file)
# # #     # TODO: Plug in your ML logic here
# # #     analysis_id = str(uuid.uuid4())
    
# # #     dummy_metrics = {
# # #         "gender_bias": 0.78,
# # #         "age_bias": 0.61,
# # #         "caste_bias": 0.84
# # #     }

# # #     suggestions = [
# # #         "Consider removing gender feature for neutrality.",
# # #         "Use re-sampling to rebalance age groups."
# # #     ]

# # #     result = AnalysisResult.objects.create(
# # #         analysis_id=analysis_id,
# # #         username=request.user.username,
# # #         sensitive_attributes=sensitive_attributes,
# # #         metrics=dummy_metrics,
# # #         suggestions=suggestions,
# # #         graph_urls=["/media/graph1.png"]
# # #     )
    
# # #     return Response({"analysis_id": result.analysis_id}, status=201)

# # # @api_view(['GET'])
# # # @permission_classes([IsAuthenticated])
# # # def get_analysis(request, analysis_id):
# # #     try:
# # #         result = AnalysisResult.objects.get(analysis_id=analysis_id)
# # #         serializer = AnalysisResultSerializer(result)
# # #         return Response(serializer.data)
# # #     except AnalysisResult.DoesNotExist:
# # #         return Response({"error": "Analysis not found"}, status=404)

# # # @api_view(['GET'])
# # # @permission_classes([IsAuthenticated])
# # # def analysis_history(request):
# # #     results = AnalysisResult.objects.filter(username=request.user.username).order_by('-created_at')
# # #     serializer = AnalysisResultSerializer(results, many=True)
# # #     return Response(serializer.data)
# # from rest_framework.decorators import api_view, permission_classes
# # from rest_framework.response import Response
# # from rest_framework import status
# # from .models import AnalysisReport
# # from .serializers import ReportSerializer
# # import pandas as pd
# # import numpy as np
# # from sklearn.model_selection import train_test_split
# # from sklearn.metrics import accuracy_score, recall_score, f1_score
# # from sklearn.calibration import calibration_curve
# # from sklearn.linear_model import LogisticRegression
# # from sklearn.tree import DecisionTreeClassifier
# # from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
# # from sklearn.svm import SVC
# # from sklearn.neural_network import MLPClassifier
# # from sklearn.neighbors import KNeighborsClassifier
# # from aif360.metrics import BinaryLabelDatasetMetric
# # from aif360.datasets import BinaryLabelDataset
# # import json
# # import base64
# # import io
# # import matplotlib.pyplot as plt
# # import seaborn as sns
# # import joblib
# # from django.core.files.base import ContentFile
# # import matplotlib.pyplot as plt
# # import io
# # import base64
# # from .utils import generate_bias_plot, generate_mitigation_suggestions
# # from .clean_data import clean_and_preprocess_data as preprocess_data


# # def generate_fairness_plot(results):
# #     fig, ax = plt.subplots()
# #     model_names = [r['model_name'] for r in results]
# #     fairness_scores = [r['fairness_metrics']['overall_score'] for r in results]

# #     ax.bar(model_names, fairness_scores, color='skyblue')
# #     ax.set_title('Fairness Score by Model')
# #     ax.set_ylabel('Score')
# #     ax.set_ylim(0, 10)

# #     buf = io.BytesIO()
# #     plt.savefig(buf, format='png')
# #     plt.close(fig)

# #     buf.seek(0)
# #     image_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
# #     return image_base64

# # @api_view(['POST'])
# # def upload_and_analyze(request):
# #     try:
# #         # Get data from request
# #         csv_file = request.FILES.get('csv_file')
# #         model_file = request.FILES.get('model_file')
# #         sensitive_attributes = json.loads(request.data.get('sensitive_attributes', '[]'))
        
# #         # Read dataset
# #         df = pd.read_csv(csv_file)
        
# #         # Preprocess data
# #         # processed_df = preprocess_data(df, sensitive_attributes)
        
# #         # # Split data
# #         # X = processed_df.drop(columns=['target'])
# #         # y = processed_df['target']
# #         target_column = request.data.get('target_column')
# #         # processed_df = preprocess_data(df, sensitive_attributes, target_column)
# #         if not target_column:
# #             return Response({"error": "Target column is required."}, status=400)

# #         processed_df = preprocess_data(df, sensitive_attributes, target_column)

# #         if target_column not in processed_df.columns:
# #             return Response({"error": f"Target column '{target_column}' not found in dataset."}, status=400)

# #         X = processed_df.drop(columns=[target_column])
# #         y = processed_df[target_column]    
# #         X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)
        
# #         # Load model if provided, otherwise train default models
# #         models = []
# #         if model_file:
# #             model = joblib.load(model_file)
# #             models.append({
# #                 'model': model,
# #                 'name': 'UserModel'
# #             })
# #         else:
# #             models.extend([
# #                 {'model': LogisticRegression(max_iter=1000), 'name': 'LogisticRegression'},
# #                 {'model': DecisionTreeClassifier(), 'name': 'DecisionTree'},
# #                 {'model': RandomForestClassifier(), 'name': 'RandomForest'},
# #                 {'model': GradientBoostingClassifier(), 'name': 'GradientBoosting'},
# #                 {'model': SVC(probability=True), 'name': 'SVC'},
# #                 {'model': MLPClassifier(max_iter=1000), 'name': 'MLP'},
# #                 {'model': KNeighborsClassifier(), 'name': 'KNeighbors'}
# #             ])
# #         from .utils import evaluate_model

# #         # Evaluate each model
# #         results = []
# #         for model_info in models:
# #             try:
# #                 result = evaluate_model(
# #                     model_info['model'], 
# #                     X_train, X_test, y_train, y_test, 
# #                     sensitive_attributes,
# #                     model_info['name']
# #                 )
# #                 results.append(result)
# #             except Exception as e:
# #                 print(f"Error evaluating {model_info['name']}: {str(e)}")
        
# #         # Generate visualizations
# #         fairness_plot = generate_fairness_plot(results)
# #         bias_plot = generate_bias_plot(results[0]['detailed_fairness'])
        
# #         # Prepare response data
# #         response_data = {
# #             'dataset_name': csv_file.name,
# #             'model_name': model_file.name if model_file else 'Multiple Models',
# #             'upload_date': pd.Timestamp.now().strftime('%Y-%m-%d'),
# #             'status': 'completed',
# #             'overall_fairness_score': results[0]['fairness_metrics']['overall_score'],
# #             'sensitive_attributes': sensitive_attributes,
# #             'metrics': {
# #                 'demographic_parity': results[0]['fairness_metrics']['demographic_parity'],
# #                 'equalized_odds': results[0]['fairness_metrics']['equalized_odds'],
# #                 'calibration': results[0]['fairness_metrics']['calibration'],
# #                 'individual_fairness': results[0]['fairness_metrics']['individual_fairness']
# #             },
# #             'bias_detected': [{
# #                 'attribute': attr,
# #                 'severity': 'high' if (metrics['overall_score'] / 10) <= 0.5 else 
# #                            'medium' if (metrics['overall_score'] / 10) <= 0.7 else 'low',
# #                 'score': metrics['overall_score'] / 10
# #             } for attr, metrics in results[0]['detailed_fairness'].items()],
# #             'suggestions': generate_mitigation_suggestions(results[0]['detailed_fairness']),
# #             'models_comparison': [{
# #                 'name': r['model_name'],
# #                 'accuracy': r['accuracy'],
# #                 'f1_score': r['f1_score'],
# #                 'demographic_parity': r['fairness_metrics']['demographic_parity'],
# #                 'equalized_odds': r['fairness_metrics']['equalized_odds'],
# #                 'calibration': r['fairness_metrics']['calibration'],
# #                 'individual_fairness': r['fairness_metrics']['individual_fairness'],
# #                 'overall_score': r['fairness_metrics']['overall_score']
# #             } for r in results],
# #             'visualizations': {
# #                 'fairness_plot': fairness_plot,
# #                 'bias_plot': bias_plot
# #             }
# #         }
        
# #         # Store in MongoDB and create report
# #         report = AnalysisReport.create_report(
# #             user_id=request.user.id if request.user.is_authenticated else 'anonymous',
# #             data=response_data,
# #             files={'dataset': csv_file, 'model': model_file} if model_file else {'dataset': csv_file}
# #         )
        
# #         return Response({
# #             'analysis_id': str(report["mongo_id"]),
# #             'status': 'success'
# #         }, status=status.HTTP_201_CREATED)
    
# #     except Exception as e:
# #         return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
# # from bson import ObjectId

# # @api_view(['GET'])
# # def get_report(request, report_id):
# #     try:
# #         # Get report from MongoDB
# #         report = AnalysisReport.db.reports.find_one({'_id': ObjectId(report_id)})
        
# #         if not report:
# #             return Response({'error': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)
        
# #         # Convert ObjectId to string
# #         report['_id'] = str(report['_id'])
        
# #         return Response(report, status=status.HTTP_200_OK)
# #     except Exception as e:
# #         return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
# # # def preprocess_data(df, sensitive_attributes):
# # #     # Simple placeholder logic (customize as needed)
# # #     df = df.dropna()  # Drop missing rows
# # #     for col in sensitive_attributes:
# # #         if col in df.columns:
# # #             df[col] = df[col].astype(str)
# # #     if 'target' not in df.columns:
# # #         raise ValueError("Missing 'target' column in dataset")
# # #     return df
# # # def preprocess_data(df, sensitive_attributes, target_column):
# # #     df = df.dropna()
    
# # #     # Ensure sensitive columns are strings (for grouping)
# # #     for col in sensitive_attributes:
# # #         if col in df.columns:
# # #             df[col] = df[col].astype(str)

# # #     # Ensure target column is numeric (for classification)
# # #     if target_column not in df.columns:
# # #         raise ValueError(f"Target column '{target_column}' not found in dataset")
    
# # #     # Optional: Convert binary categorical target to 0/1
# # #     if df[target_column].dtype == object:
# # #         df[target_column] = df[target_column].astype('category').cat.codes

# # #     return df


# # # Get CSV column names (for frontend UI)
# # from rest_framework.decorators import api_view, parser_classes
# # from rest_framework.parsers import MultiPartParser
# # from rest_framework.response import Response
# # import pandas as pd

# # import traceback
# # @api_view(['POST'])
# # @parser_classes([MultiPartParser])
# # def get_csv_columns(request):
# #     csv_file = request.FILES.get('csv_file')
# #     if not csv_file:
# #         return Response({"error": "CSV file is missing"}, status=400)

# #     try:
# #         print(f"[DEBUG] File received: {csv_file.name}")
# #         df = pd.read_csv(csv_file)
# #         # Drop completely empty columns like Unnamed: 32
# #         df.dropna(axis=1, how='all', inplace=True)

# #         # Drop completely empty rows
# #         df.dropna(axis=0, how='all', inplace=True)

# #         # Optional: remove unnecessary index columns
# #         df = df.loc[:, ~df.columns.str.contains('^Unnamed')]

# #         # Debug again
# #         print("[DEBUG] Cleaned shape:", df.shape)
# #         print(f"[DEBUG] Columns: {df.columns.tolist()}")
# #         return Response({"columns": df.columns.tolist()})
# #     except Exception as e:
# #         tb = traceback.format_exc()
# #         print("[ERROR] Failed to read CSV:", tb)
# #         return Response({"error": str(e), "trace": tb}, status=400)


# # # sensitive_attributes = json.loads(request.data.get('sensitive_attributes', '[]'))
# # # target_column = request.data.get('target_column')
# # fairness/views.py
# import pandas as pd
# import io
# import json
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from django.conf import settings # If you need to access settings like MEDIA_ROOT
# from .models import AnalysisReport, AnalysisReportRecord # Import both
# from .serializers import ReportSerializer
# from .clean_data import perform_initial_data_scan, apply_cleaning_steps
# from django.forms.models import model_to_dict
# from rest_framework.permissions import IsAuthenticated 
# from rest_framework.parsers import MultiPartParser, FormParser

# class CsvUploadView(APIView):
#     parser_classes = (MultiPartParser, FormParser)
#     permission_classes = [IsAuthenticated] # Ensure only authenticated users can upload

#     def post(self, request, *args, **kwargs):
#         # user_id = request.user.id if request.user.is_authenticated else "anonymous" # Or get from session/token
#         csv_file = request.FILES.get('csv_file')
#         # model_file = request.FILES.get('model_file') # If model is optional
#         user_id = str(request.user.id)
#         if not csv_file:
#             return Response({"error": "CSV file is required."}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             # 1. Read CSV into Pandas DataFrame
#             df = pd.read_csv(io.BytesIO(csv_file.read()))

#             # 2. Store original CSV in GridFS
#             original_csv_content = csv_file.read() # Re-read as it's consumed by pd.read_csv
#             csv_file.seek(0) # Reset pointer for re-reading if needed
            
#             # Create a new report record in SQL first to get a mongo_id placeholder
#             # The mongo_id will be filled after the actual Mongo document is created
#             initial_report_data = {
#                 "user_id": user_id,
#                 "status": "uploaded",
#                 "mongo_id": "temp_id" # Placeholder
#             }
#             report_record_serializer = ReportSerializer(data=initial_report_data)
#             report_record_serializer.is_valid(raise_exception=True)
#             report_record_instance = report_record_serializer.save()
            
#             # Now create the MongoDB report
#             report_data = {
#                 "user_id": user_id,
#                 "original_filename": csv_file.name,
#                 "status": "uploaded",
#                 "cleaning_info": {}, # Initialize empty
#                 "initial_data_stats": {} # To store stats before cleaning
#             }
#             mongo_report_id = AnalysisReport.create_report(user_id, report_data)
            
#             # Update the SQL record with the actual mongo_id
#             report_record_instance.mongo_id = mongo_report_id
#             report_record_instance.save()

#             # Store the original CSV in GridFS, linking to the mongo_report_id
#             original_csv_file_id = AnalysisReport.upload_file_to_gridfs(original_csv_content, f"{csv_file.name}_original", mongo_report_id)
            
#             # Store initial data stats and cleaning recommendations
#             initial_scan_results = perform_initial_data_scan(df, user_id)
#             mongo_id = AnalysisReport.create_report(user_id, report_data)
#             # Update MongoDB report with initial scan results and the GridFS file ID
#             AnalysisReport.update_report(mongo_report_id, {
#                 "status": "cleaning_pending",
#                 "initial_data_stats": initial_scan_results,
#                 "original_csv_gridfs_id": original_csv_file_id
#             })

#             return Response({
#                 "message": "CSV uploaded successfully and ready for cleaning.",
#                 "report_id": mongo_report_id, # Return MongoDB ID for subsequent calls
#                 "initial_data_stats": initial_scan_results
#             }, status=status.HTTP_202_ACCEPTED) # Accepted for processing

#         except Exception as e:
#             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# class CleaningOptionsView(APIView):
#     def get(self, request, report_id, *args, **kwargs):
#         # Retrieve the report to display current cleaning stats
#         report = AnalysisReport.get_report(report_id)
#         if not report:
#             return Response({"error": "Report not found."}, status=status.HTTP_404_NOT_FOUND)
        
#         # We need to send initial_data_stats which contains information about nulls, duplicates etc.
#         # The frontend will use this to render the cleaning dashboard.
#         return Response({
#             "report_id": report_id,
#             "status": report.get("status"),
#             "initial_data_stats": report.get("initial_data_stats", {})
#         }, status=status.HTTP_200_OK)

#     def post(self, request, report_id, *args, **kwargs):
#         # This endpoint receives user's cleaning choices
#         cleaning_choices = request.data.get('cleaning_choices')
#         # Example cleaning_choices structure:
#         # {
#         #   "handle_nulls": "drop_rows" | "drop_columns" | "fill_median" | "fill_mode",
#         #   "columns_to_fill": {"col1": "median", "col2": "mode"}, # If fill option chosen
#         #   "handle_duplicates": True,
#         #   "handle_inconsistent_casing": ["gender"], # list of columns
#         #   "handle_typos": {"col3": {"old_val": "new_val"}}, # this might be too complex for a single endpoint, better handled on frontend or in stages
#         #   "handle_yes_no": {"col4": {"yes_val": "Yes", "no_val": "No"}}, # mapping
#         #   "handle_numeric_objects": ["col5"] # list of columns
#         # }

#         if not cleaning_choices:
#             return Response({"error": "Cleaning choices are required."}, status=status.HTTP_400_BAD_REQUEST)
        
#         report = AnalysisReport.get_report(report_id)
#         if not report:
#             return Response({"error": "Report not found."}, status=status.HTTP_404_NOT_FOUND)

#         try:
#             # 1. Retrieve the original CSV from GridFS
#             original_csv_file_id = report.get("original_csv_gridfs_id")
#             if not original_csv_file_id:
#                 return Response({"error": "Original CSV file not found in GridFS."}, status=status.HTTP_400_BAD_REQUEST)
            
#             csv_content = AnalysisReport.get_file_from_gridfs(original_csv_file_id)
#             df = pd.read_csv(io.BytesIO(csv_content))
            
#             # 2. Apply cleaning steps based on user choices
#             cleaned_df, cleaning_summary = apply_cleaning_steps(df, cleaning_choices)

#             # 3. Store the cleaned CSV back into GridFS
#             cleaned_csv_buffer = io.StringIO()
#             cleaned_df.to_csv(cleaned_csv_buffer, index=False)
#             cleaned_csv_content = cleaned_csv_buffer.getvalue().encode('utf-8')
            
#             cleaned_csv_file_id = AnalysisReport.upload_file_to_gridfs(cleaned_csv_content, f"{report['original_filename']}_cleaned", report_id)

#             # 4. Update the MongoDB report with cleaning summary and cleaned CSV GridFS ID
#             AnalysisReport.update_report(report_id, {
#                 "status": "cleaned",
#                 "cleaning_info": {
#                     "choices": cleaning_choices,
#                     "summary": cleaning_summary
#                 },
#                 "cleaned_csv_gridfs_id": cleaned_csv_file_id
#             })

#             return Response({
#                 "message": "Data cleaned successfully based on your choices.",
#                 "report_id": report_id,
#                 "cleaning_summary": cleaning_summary,
#                 "status": "cleaned"
#             }, status=status.HTTP_200_OK)

#         except Exception as e:
#             # If an error occurs, perhaps revert status or log it
#             AnalysisReport.update_report(report_id, {"status": "cleaning_failed", "error_message": str(e)})
#             return Response({"error": f"Error applying cleaning choices: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
import pandas as pd
import io
import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings # If you need to access settings like MEDIA_ROOT
from .models import AnalysisReport, AnalysisReportRecord # Import both
from .serializers import ReportSerializer
from .clean_data import perform_initial_data_scan, apply_cleaning_steps
from django.forms.models import model_to_dict # Not strictly needed if using serializers directly
from rest_framework.permissions import IsAuthenticated 
from rest_framework.parsers import MultiPartParser, FormParser

class CsvUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        csv_file = request.FILES.get('csv_file')
        # model_file = request.FILES.get('model_file') # Uncomment if you're handling model files
        user_id = str(request.user.id) # Ensure user is authenticated by permission_classes

        if not csv_file:
            return Response({"error": "CSV file is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # IMPORTANT: Read the file content once and store it
            # File content needs to be read from BytesIO for pandas, then potentially reused.
            # However, csv_file.read() consumes the stream.
            # Best practice: Read into BytesIO object once.
            csv_file_content_bytes = csv_file.read()
            csv_io_stream = io.BytesIO(csv_file_content_bytes)

            # 1. Read CSV into Pandas DataFrame
            df = pd.read_csv(csv_io_stream)

            # 2. Create the MongoDB report FIRST to get the mongo_id
            # This avoids creating a placeholder and updating later in SQL
            mongo_report_data = {
                "user_id": user_id,
                "original_filename": csv_file.name,
                "status": "uploaded",
                "cleaning_info": {}, # Initialize empty
                "initial_data_stats": {}, # To store stats before cleaning
                "original_csv_gridfs_id": None, # Will be filled after GridFS upload
                "cleaned_csv_gridfs_id": None, # Will be filled after cleaning
                # Add any other initial fields for the MongoDB document
            }
            mongo_report_id = AnalysisReport.create_report(user_id, mongo_report_data) # This returns an ObjectId

            # 3. Store original CSV in GridFS, linking to the actual mongo_report_id
            original_csv_file_id = AnalysisReport.upload_file_to_gridfs(
                csv_io_stream.getvalue(), # Get the content from the BytesIO stream
                f"{csv_file.name}_original",
                mongo_report_id # Link to the newly created MongoDB report
            )
            
            # 4. Update the MongoDB report with the GridFS file ID
            # This is crucial: the report was created with None, now update with actual ID
            AnalysisReport.update_report(mongo_report_id, {
                "original_csv_gridfs_id": original_csv_file_id
            })

            # 5. Create the SQL ReportRecord with the actual mongo_id
            report_record_data = {
                "user_id": user_id,
                "mongo_id": str(mongo_report_id), # Store ObjectId as string
                "status": "uploaded" # Initial status
            }
            report_record_serializer = ReportSerializer(data=report_record_data)
            report_record_serializer.is_valid(raise_exception=True)
            report_record_instance = report_record_serializer.save()

            # 6. Perform initial data scan
            # Make sure perform_initial_data_scan correctly accepts `df` and `user_id`
            initial_scan_results = perform_initial_data_scan(df, user_id) 
            
            # 7. Update MongoDB report with initial scan results and new status
            AnalysisReport.update_report(mongo_report_id, {
                "status": "cleaning_pending", # Ready for cleaning
                "initial_data_stats": initial_scan_results
            })

            return Response({
                "message": "CSV uploaded successfully and ready for cleaning.",
                "report_id": str(mongo_report_id), # Return MongoDB ID for frontend's cleaning dashboard
                "initial_data_stats": initial_scan_results
            }, status=status.HTTP_202_ACCEPTED) # Accepted for processing

        except pd.errors.EmptyDataError:
            return Response({"error": "Uploaded CSV file is empty."}, status=status.HTTP_400_BAD_REQUEST)
        except pd.errors.ParserError as e:
            return Response({"error": f"Could not parse CSV file. Check format: {e}"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # Log the full exception for debugging on the server side
            print(f"An unexpected error occurred during CsvUploadView: {e}", exc_info=True)
            return Response({"error": f"Internal server error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CleaningOptionsView(APIView):
    # Ensure authentication for this view too if desired
    permission_classes = [IsAuthenticated] 

    def get(self, request, report_id, *args, **kwargs):
        # Retrieve the report from MongoDB using the mongo_id passed from frontend
        report = AnalysisReport.get_report(report_id) # report_id here should be the mongo_id
        if not report:
            return Response({"error": "Report not found."}, status=status.HTTP_404_NOT_FOUND)
        
        return Response({
            "report_id": report_id,
            "status": report.get("status"),
            "initial_data_stats": report.get("initial_data_stats", {})
        }, status=status.HTTP_200_OK)

    def post(self, request, report_id, *args, **kwargs):
        cleaning_choices = request.data.get('cleaning_choices')
        
        if not cleaning_choices:
            return Response({"error": "Cleaning choices are required."}, status=status.HTTP_400_BAD_REQUEST)
        
        report = AnalysisReport.get_report(report_id) # report_id here should be the mongo_id
        if not report:
            return Response({"error": "Report not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            # 1. Retrieve the original CSV from GridFS using the stored ID
            original_csv_file_id = report.get("original_csv_gridfs_id")
            if not original_csv_file_id:
                return Response({"error": "Original CSV file ID not found in report."}, status=status.HTTP_400_BAD_REQUEST)
            
            csv_content_bytes = AnalysisReport.get_file_from_gridfs(original_csv_file_id)
            if not csv_content_bytes:
                return Response({"error": "Original CSV file content not found in GridFS."}, status=status.HTTP_400_BAD_REQUEST)

            df = pd.read_csv(io.BytesIO(csv_content_bytes))
            
            # 2. Apply cleaning steps based on user choices
            cleaned_df, cleaning_summary = apply_cleaning_steps(df, cleaning_choices)

            # 3. Store the cleaned CSV back into GridFS
            cleaned_csv_buffer = io.StringIO()
            cleaned_df.to_csv(cleaned_csv_buffer, index=False)
            cleaned_csv_content = cleaned_csv_buffer.getvalue().encode('utf-8') # Ensure bytes for GridFS
            
            cleaned_csv_file_id = AnalysisReport.upload_file_to_gridfs(
                cleaned_csv_content, 
                f"{report['original_filename'].replace('.csv', '')}_cleaned.csv", # Ensure a proper name
                report_id # Link to the same MongoDB report
            )

            # 4. Update the MongoDB report with cleaning summary and cleaned CSV GridFS ID
            AnalysisReport.update_report(report_id, {
                "status": "cleaned",
                "cleaning_info": {
                    "choices": cleaning_choices,
                    "summary": cleaning_summary
                },
                "cleaned_csv_gridfs_id": cleaned_csv_file_id
            })

            return Response({
                "message": "Data cleaned successfully based on your choices.",
                "report_id": report_id,
                "cleaning_summary": cleaning_summary,
                "status": "cleaned"
            }, status=status.HTTP_200_OK)

        except Exception as e:
            # If an error occurs, update status to failed and include error message
            AnalysisReport.update_report(report_id, {"status": "cleaning_failed", "error_message": str(e)})
            print(f"Error applying cleaning choices for report {report_id}: {e}", exc_info=True)
            return Response({"error": f"Error applying cleaning choices: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)