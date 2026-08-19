import logging

from rest_framework import status
from rest_framework.exceptions import Throttled
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .models import OTP, User
from .serializers import (
    LoginSerializer,
    PasswordResetConfirmSerializer,
    PhoneNumberSerializer,
    RegisterSerializer,
    UserSerializer,
    VerifyOTPSerializer,
)
from .services import OTPError, consume_otp, issue_otp, revoke_all_tokens
from .throttling import (
    LoginAttemptThrottle,
    LoginIPThrottle,
    PasswordResetIPThrottle,
    PasswordResetOTPThrottle,
    RegisterIPThrottle,
    RegisterOTPThrottle,
)

logger = logging.getLogger(__name__)


def _tokens_for(user):
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": UserSerializer(user).data,
    }


def _enforce_throttle(throttle_classes, request, view):
    """
    Manually applied (as opposed to `throttle_classes`) so the budget is only
    spent when we're actually about to send an SMS — not on requests that
    get rejected before that point (e.g. registering an already-taken number).
    Takes a list so both the per-phone-number and per-IP dimensions can be
    checked together.
    """
    for throttle_class in throttle_classes:
        throttle = throttle_class()
        if not throttle.allow_request(request, view):
            raise Throttled(throttle.wait())


class RegisterView(APIView):
    """
    Collects phone_number + full_name + password and texts an OTP. The User
    row is created here (inactive, unverified) so a second registration
    attempt on the same number can be rejected outright instead of silently
    re-issuing an account.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone_number = serializer.validated_data["phone_number"]
        full_name = serializer.validated_data["full_name"]
        password = serializer.validated_data["password"]

        existing = User.objects.filter(phone_number=phone_number).first()
        if existing and existing.is_phone_verified:
            return Response(
                {"detail": "This phone number is already registered."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        _enforce_throttle([RegisterOTPThrottle, RegisterIPThrottle], request, self)

        if existing:
            # Started registration before but never confirmed it — update
            # their details and let them retry rather than getting stuck.
            existing.full_name = full_name
            existing.set_password(password)
            existing.save(update_fields=["full_name", "password"])
        else:
            User.objects.create_user(
                phone_number=phone_number,
                full_name=full_name,
                password=password,
                is_active=False,
            )

        try:
            issue_otp(phone_number, OTP.Purpose.REGISTER)
        except Exception:
            logger.exception("Failed to send OTP SMS to %s", phone_number)
            return Response(
                {"detail": "Could not send the verification code. Try again shortly."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response({"detail": "Verification code sent."}, status=status.HTTP_200_OK)


class ResendRegistrationOTPView(APIView):
    """Re-sends a registration OTP without requiring full_name/password again."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PhoneNumberSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone_number = serializer.validated_data["phone_number"]

        pending = User.objects.filter(phone_number=phone_number, is_phone_verified=False).first()
        if pending is None:
            return Response(
                {"detail": "No pending registration for this number."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        _enforce_throttle([RegisterOTPThrottle, RegisterIPThrottle], request, self)

        try:
            issue_otp(phone_number, OTP.Purpose.REGISTER)
        except Exception:
            logger.exception("Failed to send OTP SMS to %s", phone_number)
            return Response(
                {"detail": "Could not send the verification code. Try again shortly."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response({"detail": "Verification code sent."}, status=status.HTTP_200_OK)


class ConfirmRegistrationView(APIView):
    """Verifies the registration OTP and activates the pending User."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone_number = serializer.validated_data["phone_number"]
        code = serializer.validated_data["code"]

        try:
            consume_otp(phone_number, OTP.Purpose.REGISTER, code)
        except OTPError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(phone_number=phone_number).first()
        if user is None:
            return Response(
                {"detail": "No pending registration for this number."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_active = True
        user.is_phone_verified = True
        user.save(update_fields=["is_active", "is_phone_verified"])

        return Response(_tokens_for(user), status=status.HTTP_200_OK)


class LoginView(APIView):
    """Phone number + password login for an already-registered, active user."""

    permission_classes = [AllowAny]
    throttle_classes = [LoginAttemptThrottle, LoginIPThrottle]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone_number = serializer.validated_data["phone_number"]
        password = serializer.validated_data["password"]

        user = User.objects.filter(phone_number=phone_number).first()
        if user is None or not user.check_password(password):
            return Response(
                {"detail": "Invalid phone number or password."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not user.is_active:
            return Response(
                {"detail": "Account not active. Complete registration first."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(_tokens_for(user), status=status.HTTP_200_OK)


class LogoutView(APIView):
    """Blacklists the given refresh token so it can no longer be used."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh = request.data.get("refresh")
        if not refresh:
            return Response(
                {"detail": "refresh is required."}, status=status.HTTP_400_BAD_REQUEST
            )
        try:
            token = RefreshToken(refresh)
        except TokenError:
            return Response(
                {"detail": "Invalid or already-used refresh token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Being authenticated only proves *some* valid access token was
        # presented — without this, a caller could blacklist a refresh token
        # that isn't theirs. Same generic error either way, so this doesn't
        # confirm to a caller whether a token they don't own is otherwise valid.
        if str(token["user_id"]) != str(request.user.id):
            return Response(
                {"detail": "Invalid or already-used refresh token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token.blacklist()

        return Response({"detail": "Logged out."}, status=status.HTTP_200_OK)


class MeView(APIView):
    """Returns the authenticated user — for a client resuming from a stored token."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class PasswordResetRequestView(APIView):
    """
    Texts a password-reset OTP to an existing, active user. Same response for
    unregistered numbers (still 200, no OTP sent) so this can't be used to
    enumerate which phone numbers have accounts.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PhoneNumberSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone_number = serializer.validated_data["phone_number"]

        user = User.objects.filter(phone_number=phone_number, is_active=True).first()
        if user is not None:
            _enforce_throttle([PasswordResetOTPThrottle, PasswordResetIPThrottle], request, self)
            try:
                issue_otp(phone_number, OTP.Purpose.PASSWORD_RESET)
            except Exception:
                logger.exception("Failed to send OTP SMS to %s", phone_number)
                return Response(
                    {"detail": "Could not send the verification code. Try again shortly."},
                    status=status.HTTP_502_BAD_GATEWAY,
                )

        return Response(
            {"detail": "If an account exists for this number, a reset code has been sent."},
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(APIView):
    """Verifies the reset OTP, sets the new password, and logs the user in."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone_number = serializer.validated_data["phone_number"]
        code = serializer.validated_data["code"]
        new_password = serializer.validated_data["new_password"]

        try:
            consume_otp(phone_number, OTP.Purpose.PASSWORD_RESET, code)
        except OTPError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(phone_number=phone_number, is_active=True).first()
        if user is None:
            return Response(
                {"detail": "No account found for this number."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.save(update_fields=["password"])
        revoke_all_tokens(user)

        return Response(_tokens_for(user), status=status.HTTP_200_OK)
