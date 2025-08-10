from django.urls import path
from . import views

urlpatterns = [
    path('<str:report_id>/export-pdf/', views.export_fairness_report_pdf, name='export_fairness_report_pdf'),
]
