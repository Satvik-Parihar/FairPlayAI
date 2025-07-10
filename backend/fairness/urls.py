# # from django.urls import path
# # from . import views

# # urlpatterns = [
# #     path('upload/', views.upload_dataset, name='upload'),
# #     path('<str:analysis_id>/', views.get_analysis, name='get-analysis'),
# #     path('history/', views.analysis_history, name='history'),
# # ]
# # # from django.urls import path
# # # from . import views

# # # urlpatterns = [
# # #     path('upload/', views.upload_dataset),
# # #     path('<str:analysis_id>/', views.get_analysis),
# # #     path('history/', views.analysis_history),
# # # ]
# from django.urls import path
# from . import views
# from .views import get_csv_columns

# urlpatterns = [
#     path('analyze/', views.upload_and_analyze, name='upload_and_analyze'),
#     path('reports/<str:report_id>/', views.get_report, name='get_report'),
#     path('upload_and_analyze/', views.upload_and_analyze),
#     path('get_report/<str:report_id>/', views.get_report),
#     path('get_csv_columns/', get_csv_columns),
# ]
from django.urls import path
from . import views
from django.urls import include

urlpatterns = [
    # path('analyze/', views.upload_and_analyze, name='upload_and_analyze'),
    path('reports/<str:report_id>/', views.get_report, name='get_report'),
    # path('get_csv_columns/', views.get_csv_columns, name='get_csv_columns'),
    path('get_csv_columns/', views.get_csv_columns, name='get_csv_columns'),
    # path('upload_and_analyze/', views.upload_and_analyze),  
    path('upload_and_analyze/', views.upload_and_analyze)

    # path("preprocess_data", views.preprocess_data, name="preprocess_data"),


    # path('get_csv_columns/', include('fairness.urls')),
]

