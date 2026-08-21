import logging
from datetime import timedelta

from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import mixins, status, viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework.exceptions import PermissionDenied, Throttled, ValidationError
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .models import OTP, User
from .serializers import (
    AdminUserListSerializer,
    AdminUserWriteSerializer,
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


# Window used for both the "active" and "new" user stats below.
RECENT_ACTIVITY_DAYS = 30


class AdminUserPagination(PageNumberPagination):
    """
    Scoped to the admin user list rather than set as the project-wide
    DEFAULT_PAGINATION_CLASS, so the existing unpaginated vendor/runner
    endpoints keep returning plain lists to their current callers.
    """

    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class AdminUserViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    """
    Account management for the admin console. Staff-only — this exposes
    every user's phone number, so it must never be readable by an ordinary
    authenticated customer.

    Deliberately **not** a ModelViewSet: there is no destroy action, so
    DELETE returns 405. Accounts are retired by setting is_active=False
    instead. Deleting would either be blocked by the PROTECT on
    Order.customer or, worse, silently cascade away the user's
    VendorProfile/RunnerProfile and their delivery locations.

    Guards enforced below, in addition to the staff requirement:
      * an admin can't lock themselves out of their own account
      * only superusers may grant or revoke staff access
      * deactivating or changing a password revokes that user's sessions
    """

    serializer_class = AdminUserListSerializer
    permission_classes = [IsAdminUser]
    pagination_class = AdminUserPagination

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return AdminUserWriteSerializer
        return AdminUserListSerializer

    def get_queryset(self):
        # Annotated once per page instead of per row; ordered by newest
        # first, with a unique tiebreaker so pagination can't repeat or skip
        # a row when several accounts share a date_joined.
        qs = User.objects.annotate(order_count=Count("orders")).order_by("-date_joined", "-id")

        search = self.request.query_params.get("search", "").strip()
        if search:
            # A single Q rather than OR-ing two annotated querysets, which
            # would join the orders table twice and inflate order_count.
            qs = qs.filter(
                Q(full_name__icontains=search) | Q(phone_number__icontains=search)
            )

        # Powers the account picker on the vendor/runner forms. Both profiles
        # are OneToOne, so an account that already has one can't take another
        # — offering it would only produce a confusing uniqueness error at
        # save time.
        available_for = self.request.query_params.get("available_for")
        if available_for == "vendor":
            qs = qs.filter(vendor_profile__isnull=True)
        elif available_for == "runner":
            qs = qs.filter(runner_profile__isnull=True)

        return qs

    def _guard_privilege_change(self, validated, instance=None):
        """
        Staff access is the keys to this console. Letting any staff member
        grant it turns one compromised admin account into permanent, silent
        privilege escalation, so only superusers may change the flag.
        """
        if "is_staff" not in validated:
            return
        current = instance.is_staff if instance is not None else False
        if validated["is_staff"] == current:
            return  # no-op, e.g. re-saving a form with the flag unchanged
        if not self.request.user.is_superuser:
            raise PermissionDenied("Only a superuser can grant or revoke staff access.")

    def _guard_self_lockout(self, instance, validated):
        """An admin editing themselves must not be able to lock themselves out."""
        if instance.pk != self.request.user.pk:
            return
        if validated.get("is_active") is False:
            raise ValidationError({"is_active": "You can't deactivate your own account."})
        if validated.get("is_staff") is False:
            raise ValidationError({"is_staff": "You can't remove your own staff access."})

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        self._guard_privilege_change(data)

        # Routed through the manager so the phone number is normalized and a
        # missing password becomes an unusable one rather than an empty hash.
        user = User.objects.create_user(
            phone_number=data["phone_number"],
            password=data.get("password") or None,
            full_name=data.get("full_name", ""),
            is_active=data.get("is_active", True),
            is_staff=data.get("is_staff", False),
            is_phone_verified=data.get("is_phone_verified", False),
        )
        return Response(
            AdminUserListSerializer(self._with_order_count(user)).data,
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, partial=kwargs.pop("partial", False)
        )
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        self._guard_privilege_change(data, instance)
        self._guard_self_lockout(instance, data)

        for field in ("phone_number", "full_name", "is_active", "is_staff", "is_phone_verified"):
            if field in data:
                setattr(instance, field, data[field])

        password = data.get("password")
        if password:
            instance.set_password(password)

        instance.save()

        # A password change or a deactivation has to invalidate existing
        # sessions, otherwise the old refresh token keeps working and the
        # change is cosmetic.
        if password or data.get("is_active") is False:
            revoke_all_tokens(instance)

        return Response(AdminUserListSerializer(self._with_order_count(instance)).data)

    @staticmethod
    def _with_order_count(user):
        """The read serializer expects the annotation the list queryset adds."""
        user.order_count = user.orders.count()
        return user


class AdminUserStatsView(APIView):
    """Headline counts for the admin console's user page."""

    permission_classes = [IsAdminUser]

    def get(self, request):
        since = timezone.now() - timedelta(days=RECENT_ACTIVITY_DAYS)
        return Response(
            {
                "total_users": User.objects.count(),
                # "Active" means signed in within the window — last_login is
                # only set on an actual login, so accounts that never signed
                # in are correctly excluded.
                "active_users": User.objects.filter(last_login__gte=since).count(),
                "new_users": User.objects.filter(date_joined__gte=since).count(),
                "window_days": RECENT_ACTIVITY_DAYS,
            }
        )


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
