from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

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
