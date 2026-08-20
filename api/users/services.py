import logging

import africastalking
from django.conf import settings
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken

from .models import OTP

logger = logging.getLogger(__name__)

_sms = None


def _get_sms_service():
    global _sms
    if _sms is None:
        africastalking.initialize(settings.AT_USERNAME, settings.AT_API_KEY)
        _sms = africastalking.SMS
    return _sms


def send_otp_sms(phone_number, code):
    if settings.DEBUG:
        logger.info("OTP for %s: %s", phone_number, code)
    message = f"Your Kijiji Eats verification code is {code}. It expires in 5 minutes."
    return _get_sms_service().send(message, [phone_number])


class OTPError(Exception):
    """Raised with a user-facing message when an OTP fails to verify."""


def issue_otp(phone_number, purpose):
    """Creates and texts a new OTP. Lets send_otp_sms's exceptions propagate."""
    otp = OTP.objects.create(
        phone_number=phone_number, code=OTP.generate_code(), purpose=purpose
    )
    send_otp_sms(phone_number, otp.code)
    return otp


def consume_otp(phone_number, purpose, code):
    """Validates `code` against the latest unused OTP for phone_number/purpose
    and marks it used. Raises OTPError with a user-facing message on failure."""
    otp = (
        OTP.objects.filter(phone_number=phone_number, purpose=purpose, is_used=False)
        .order_by("-created_at")
        .first()
    )
    if otp is None or not otp.is_valid():
        raise OTPError("No active code for this number. Request a new one.")
    if otp.code != code:
        otp.verify_attempts += 1
        otp.save(update_fields=["verify_attempts"])
        raise OTPError("Incorrect code.")

    otp.is_used = True
    otp.save(update_fields=["is_used"])
    return otp


def revoke_all_tokens(user):
    """
    Blacklists every outstanding refresh token for `user` — used after a
    password reset so a session started with the old password can't keep
    refreshing. Already-issued access tokens stay valid until they naturally
    expire (ACCESS_TOKEN_LIFETIME); JWTs aren't otherwise revocable.
    """
    for outstanding in OutstandingToken.objects.filter(user=user):
        BlacklistedToken.objects.get_or_create(token=outstanding)
