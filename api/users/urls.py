from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    ConfirmRegistrationView,
    LoginView,
    LogoutView,
    MeView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    RegisterView,
    ResendRegistrationOTPView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("register/resend/", ResendRegistrationOTPView.as_view(), name="register-resend"),
    path("register/confirm/", ConfirmRegistrationView.as_view(), name="register-confirm"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("me/", MeView.as_view(), name="me"),
    path("password/reset/", PasswordResetRequestView.as_view(), name="password-reset"),
    path(
        "password/reset/confirm/",
        PasswordResetConfirmView.as_view(),
        name="password-reset-confirm",
    ),
]
