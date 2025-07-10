from django.urls import path
from .views import (
    PasswordResetRequestView,
    PasswordResetConfirmView,
    ResetPasswordView,  # for token validation
)

urlpatterns = [
    path('password-reset-request/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('auth/reset-password/<uidb64>/<token>/', ResetPasswordView.as_view(), name='password-reset-token-check'),
]
