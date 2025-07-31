
# fairness/urls.py
from django.urls import path
from .views import CsvUploadView, CleaningOptionsView, get_report

urlpatterns = [
    path('upload-csv/', CsvUploadView.as_view(), name='csv_upload'),
    path('clean-data/<str:report_id>/', CleaningOptionsView.as_view(), name='clean_data_options'),
    path('reports/<str:report_id>/', get_report, name='get_report'),  # <-- Add this line
]