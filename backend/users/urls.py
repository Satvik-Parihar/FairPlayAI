
from django.urls import path
from .views import (
    register_user,
    login_user,
    google_login,
    google_callback,
    github_login,
    github_callback,
)

urlpatterns = [
    path('register/', register_user, name='register'),
    path('login/', login_user, name='login'),

    # ✅ Google OAuth
    path('google/', google_login, name='google-login'),
    path('google/login/', google_login, name='google-login-alias'),  # ✅ alias
    path('google/callback/', google_callback, name='google-callback'),

    # ✅ GitHub OAuth
    path('github/', github_login, name='github-login'),
    path('github/login/', github_login, name='github-login-alias'),  # ✅ alias
    path('github/callback/', github_callback, name='github-callback'),
]
