from rest_framework.decorators import api_view, permission_classes
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



# --- GET /api/fairness/reports/<report_id>/ ---
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_report(request, report_id):
    """Return the full MongoDB report document as JSON, or 404 if not found."""
    report = AnalysisReport.get_report(report_id)
    # print(report.get("bias_detected", []))
    if not report:
        return Response({"error": "Report not found."}, status=status.HTTP_404_NOT_FOUND)
    # Convert ObjectId to string for JSON serialization
    if "_id" in report:
        report["_id"] = str(report["_id"])
    # Ensure problem_type is present in the report
    if "problem_type" not in report:
        # Try to infer from metrics if possible
        metrics = report.get("metrics", {})
        # Heuristic: if regression_fairness in metrics, it's regression
        if "regression_fairness" in metrics:
            report["problem_type"] = "regression"
        else:
            # Default to classification if unsure
            report["problem_type"] = "classification"
    return Response(report, status=status.HTTP_200_OK)

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
       
            csv_file_content_bytes = csv_file.read()
            csv_io_stream = io.BytesIO(csv_file_content_bytes)

            # 1. Read CSV into Pandas DataFrame
            df = pd.read_csv(csv_io_stream)

           
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
            
           
            AnalysisReport.update_report(mongo_report_id, {
                "original_csv_gridfs_id": original_csv_file_id
            })

            
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
    
    permission_classes = [IsAuthenticated] 

    def get(self, request, report_id, *args, **kwargs):
        # Retrieve the report from MongoDB using the mongo_id passed from frontend
        report = AnalysisReport.get_report(report_id) # report_id here should be the mongo_id
        print(report.get("bias_detected", []))
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