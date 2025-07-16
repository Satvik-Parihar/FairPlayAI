

# from django.contrib import admin
# from django.urls import path, include

# urlpatterns = [
#     path("admin/", admin.site.urls),
#     path('api/fairness/columns', include('fairness.urls')),
#     path('api/analysis/', include('fairness.urls')),
#     path('api/auth/', include('users.urls')),
#     path('api/fairness/get_csv_columns/', include('fairness.urls')),
#     path('api/', include('fairness.urls')),

# ]
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/fairness/", include("fairness.urls")),  # ✅ Single route for fairness
    path("api/auth/", include("users.urls")),
    # path('analyze/', views.upload_and_analyze, name='upload_and_analyze'),  # ✅
    path('api/accounts/', include('accounts.urls')),
    path('api/datasets/', include('datasets.urls')),
    # path("api/accounts/password-reset-request/", views.password_reset_request),

]
