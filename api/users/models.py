import random
from datetime import timedelta

from django.contrib.auth.base_user import AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin
from django.db import models
from django.utils import timezone

from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    """
    Base identity for every person on the platform — customer, vendor, or
    runner. Role-specific data (VendorProfile, RunnerProfile) attaches to
    this via a one-to-one FK in their own apps, so a person only ever has
    one identity, and can hold more than one role later without changes here.
    """

    phone_number = models.CharField(
        max_length=15,
        unique=True,
        db_index=True,
        help_text="E.164 format, e.g. +2547XXXXXXXX",
    )
    full_name = models.CharField(max_length=150, blank=True)

    is_phone_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)  # Django admin access

    date_joined = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "phone_number"
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return self.full_name or self.phone_number


class OTP(models.Model):
    """
    A single one-time-passcode issued for a phone number. Multiple rows can
    exist per phone number over time; only the most recent unused, unexpired
    one is valid at verify-time.
    """

    OTP_LIFETIME_MINUTES = 5
    MAX_VERIFY_ATTEMPTS = 5

    class Purpose(models.TextChoices):
        LOGIN = "login", "Login / Signup"
        # room to grow, e.g. PASSWORD_RESET, PHONE_CHANGE, without a new model

    phone_number = models.CharField(max_length=15, db_index=True)
    code = models.CharField(max_length=6)
    purpose = models.CharField(
        max_length=20, choices=Purpose.choices, default=Purpose.LOGIN
    )

    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)
    verify_attempts = models.PositiveSmallIntegerField(default=0)

    class Meta:
        verbose_name = "OTP"
        verbose_name_plural = "OTPs"
        indexes = [
            models.Index(fields=["phone_number", "code"]),
        ]

    def __str__(self):
        return f"OTP for {self.phone_number} ({'used' if self.is_used else 'active'})"

    def is_valid(self):
        not_expired = self.created_at > timezone.now() - timedelta(
            minutes=self.OTP_LIFETIME_MINUTES
        )
        under_attempt_limit = self.verify_attempts < self.MAX_VERIFY_ATTEMPTS
        return not self.is_used and not_expired and under_attempt_limit

    @staticmethod
    def generate_code():
        return str(random.randint(100000, 999999))
