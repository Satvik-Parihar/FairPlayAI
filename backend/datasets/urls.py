from django.urls import path
from . import views

urlpatterns = [
    path("clean_csv/", views.upload_clean_csv, name="upload_clean_csv"),
    path("preprocess/", views.preprocess_csv, name="preprocess_csv"), 
    path("train-selected-model/", views.train_selected_model, name="train_selected_model"),

]