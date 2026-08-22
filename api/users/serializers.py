from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from core.roles import RUNNER, VENDOR, role_for

from .models import User
from .phone import PHONE_REGEX, normalize_phone_number


class PhoneNumberSerializer(serializers.Serializer):
    phone_number = serializers.CharField()

    def validate_phone_number(self, value):
        value = normalize_phone_number(value)
        if not PHONE_REGEX.match(value):
            raise serializers.ValidationError(
                "Enter a valid phone number, e.g. 0712345678 or +2547XXXXXXXX."
            )
        return value


class VerifyOTPSerializer(PhoneNumberSerializer):
    code = serializers.CharField(min_length=6, max_length=6)


class RegisterSerializer(PhoneNumberSerializer):
    full_name = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True)

    def validate_password(self, value):
        validate_password(value)
        return value


class LoginSerializer(PhoneNumberSerializer):
    password = serializers.CharField(write_only=True)


class PasswordResetConfirmSerializer(VerifyOTPSerializer):
    new_password = serializers.CharField(write_only=True)

    def validate_new_password(self, value):
        validate_password(value)
        return value


class UserSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    phone_number = serializers.CharField(read_only=True)
    full_name = serializers.CharField(read_only=True)
    is_phone_verified = serializers.BooleanField(read_only=True)
    is_staff = serializers.BooleanField(read_only=True)
    # Exposed so the admin console can hide the "admin access" toggle from
    # staff who aren't allowed to change it (see AdminUserViewSet).
    is_superuser = serializers.BooleanField(read_only=True)
    # "customer" | "vendor" | "runner". The mobile app picks its entire tab
    # set from this, so it rides along on login/register-confirm as well as
    # /me/ — all three go through this serializer.
    role = serializers.SerializerMethodField()
    # The role's own record: wallet balance, approval state, and the bits
    # each role's home screen needs. Null for customers, who have no profile.
    role_profile = serializers.SerializerMethodField()

    def get_role(self, obj):
        return role_for(obj)

    def get_role_profile(self, obj):
        role = role_for(obj)
        if role == VENDOR:
            p = obj.vendor_profile
            return {
                "id": p.id,
                "business_name": p.business_name,
                "zone_name": p.zone.name,
                "is_approved": p.is_approved,
                # Decimals as strings, matching every other money field in
                # this API, so no precision is lost in a JSON float.
                "wallet_balance": str(p.wallet_balance),
            }
        if role == RUNNER:
            p = obj.runner_profile
            return {
                "id": p.id,
                "zone_name": p.zone.name,
                "is_approved": p.is_approved,
                "is_online": p.is_online,
                "wallet_balance": str(p.wallet_balance),
                "rating_avg": str(p.rating_avg) if p.rating_avg is not None else None,
                "rating_count": p.rating_count,
            }
        return None


class AdminUserWriteSerializer(serializers.Serializer):
    """
    Create/update payload for the admin console's user management.

    Separate from the read serializer because the write surface is
    deliberately narrower: no wallet, no counts, and `password` is
    write-only so a hash never travels back out.
    """

    phone_number = serializers.CharField()
    full_name = serializers.CharField(max_length=150, allow_blank=True, required=False)
    # Optional: an admin-created account with no password gets an unusable
    # one, so the person signs in only after completing the SMS reset flow.
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    is_active = serializers.BooleanField(required=False)
    is_staff = serializers.BooleanField(required=False)
    is_phone_verified = serializers.BooleanField(required=False)

    def validate_phone_number(self, value):
        value = normalize_phone_number(value)
        if not PHONE_REGEX.match(value):
            raise serializers.ValidationError(
                "Enter a valid phone number, e.g. 0712345678 or +2547XXXXXXXX."
            )

        # `instance` is set on update — exclude self so saving an unchanged
        # number doesn't collide with the row being edited.
        taken = User.objects.filter(phone_number=value)
        if self.instance is not None:
            taken = taken.exclude(pk=self.instance.pk)
        if taken.exists():
            raise serializers.ValidationError("An account with this phone number already exists.")
        return value

    def validate_password(self, value):
        if not value:
            return value
        validate_password(value)
        return value


class AdminUserListSerializer(UserSerializer):
    """
    The admin console's user table. Read-only — this endpoint exists to list
    accounts, not to mutate them.

    `order_count` comes from an annotation on the queryset rather than a
    property, so listing a page of users stays a single query instead of one
    COUNT per row.
    """

    is_active = serializers.BooleanField(read_only=True)
    date_joined = serializers.DateTimeField(read_only=True)
    last_login = serializers.DateTimeField(read_only=True)
    order_count = serializers.IntegerField(read_only=True)
