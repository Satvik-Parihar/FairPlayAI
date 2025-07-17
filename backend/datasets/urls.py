from django.urls import path
from . import views

urlpatterns = [
    path("clean_csv/", views.upload_clean_csv, name="upload_clean_csv"),
]
