from unittest.mock import patch

from django.core.cache import cache
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import OTP, User
from .throttling import RegisterOTPThrottle

VALID_PASSWORD = "CorrectHorseBattery9"
PHONE = "+254711000001"


def send_otp_sms_mock(*args, **kwargs):
    return None


class BaseAPITestCase(APITestCase):
    """Throttle state lives in Django's cache, which isn't per-test — clear
    it so one test's OTP/login attempts don't rate-limit the next test that
    happens to reuse the same phone number."""

    def setUp(self):
        cache.clear()


@patch("users.services.send_otp_sms", side_effect=send_otp_sms_mock)
class RegistrationTests(BaseAPITestCase):
    def test_register_creates_inactive_user_and_sends_otp(self, mock_send):
        response = self.client.post(
            reverse("register"),
            {"phone_number": PHONE, "full_name": "Alex", "password": VALID_PASSWORD},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user = User.objects.get(phone_number=PHONE)
        self.assertFalse(user.is_active)
        self.assertFalse(user.is_phone_verified)
        self.assertTrue(user.has_usable_password())
        mock_send.assert_called_once()

    def test_register_normalizes_local_phone_format(self, mock_send):
        response = self.client.post(
            reverse("register"),
            {"phone_number": "0711000002", "full_name": "Alex", "password": VALID_PASSWORD},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(User.objects.filter(phone_number="+254711000002").exists())

    def test_register_rejects_weak_password(self, mock_send):
        response = self.client.post(
            reverse("register"),
            {"phone_number": PHONE, "full_name": "Alex", "password": "weak"},
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.filter(phone_number=PHONE).exists())

    def test_register_again_before_confirm_updates_and_resends(self, mock_send):
        self.client.post(
            reverse("register"),
            {"phone_number": PHONE, "full_name": "Alex", "password": VALID_PASSWORD},
        )
        response = self.client.post(
            reverse("register"),
            {"phone_number": PHONE, "full_name": "Alex Renamed", "password": "AnotherPass99"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user = User.objects.get(phone_number=PHONE)
        self.assertEqual(user.full_name, "Alex Renamed")
        self.assertTrue(user.check_password("AnotherPass99"))
        self.assertEqual(mock_send.call_count, 2)

    def test_register_blocked_once_already_verified(self, mock_send):
        User.objects.create_user(
            phone_number=PHONE, full_name="Alex", password=VALID_PASSWORD,
            is_active=True, is_phone_verified=True,
        )

        response = self.client.post(
            reverse("register"),
            {"phone_number": PHONE, "full_name": "Alex", "password": VALID_PASSWORD},
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        mock_send.assert_not_called()

    def test_duplicate_registration_attempts_never_throttled(self, mock_send):
        User.objects.create_user(
            phone_number=PHONE, full_name="Alex", password=VALID_PASSWORD,
            is_active=True, is_phone_verified=True,
        )

        # Default rate is 5/hour — 6 attempts would 429 if this endpoint
        # threw before returning early for an already-registered number.
        for _ in range(6):
            response = self.client.post(
                reverse("register"),
                {"phone_number": PHONE, "full_name": "Alex", "password": VALID_PASSWORD},
            )
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        mock_send.assert_not_called()

    # SimpleRateThrottle.THROTTLE_RATES is bound once at import time, so
    # override_settings(REST_FRAMEWORK=...) doesn't reach it — patch get_rate
    # directly to exercise the actual throttling path.
    @patch.object(RegisterOTPThrottle, "get_rate", return_value="1/hour")
    def test_repeated_pending_registration_is_throttled(self, mock_rate, mock_send):
        self.client.post(
            reverse("register"),
            {"phone_number": PHONE, "full_name": "Alex", "password": VALID_PASSWORD},
        )
        response = self.client.post(
            reverse("register"),
            {"phone_number": PHONE, "full_name": "Alex", "password": VALID_PASSWORD},
        )

        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)


@patch("users.services.send_otp_sms", side_effect=send_otp_sms_mock)
class ResendRegistrationOTPTests(BaseAPITestCase):
    def test_resend_for_pending_registration(self, mock_send):
        self.client.post(
            reverse("register"),
            {"phone_number": PHONE, "full_name": "Alex", "password": VALID_PASSWORD},
        )
        response = self.client.post(reverse("register-resend"), {"phone_number": PHONE})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(mock_send.call_count, 2)

    def test_resend_with_no_pending_registration(self, mock_send):
        response = self.client.post(reverse("register-resend"), {"phone_number": PHONE})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        mock_send.assert_not_called()


@patch("users.services.send_otp_sms", side_effect=send_otp_sms_mock)
class ConfirmRegistrationTests(BaseAPITestCase):
    def _register(self):
        self.client.post(
            reverse("register"),
            {"phone_number": PHONE, "full_name": "Alex", "password": VALID_PASSWORD},
        )
        return OTP.objects.filter(phone_number=PHONE, purpose=OTP.Purpose.REGISTER).latest(
            "created_at"
        )

    def test_confirm_activates_user_and_returns_tokens(self, mock_send):
        otp = self._register()

        response = self.client.post(
            reverse("register-confirm"), {"phone_number": PHONE, "code": otp.code}
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        user = User.objects.get(phone_number=PHONE)
        self.assertTrue(user.is_active)
        self.assertTrue(user.is_phone_verified)

    def test_confirm_wrong_code_rejected(self, mock_send):
        self._register()

        response = self.client.post(
            reverse("register-confirm"), {"phone_number": PHONE, "code": "000000"}
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.get(phone_number=PHONE).is_active)

    def test_confirm_with_no_otp_issued(self, mock_send):
        response = self.client.post(
            reverse("register-confirm"), {"phone_number": PHONE, "code": "123456"}
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_confirm_code_is_single_use(self, mock_send):
        otp = self._register()
        self.client.post(reverse("register-confirm"), {"phone_number": PHONE, "code": otp.code})

        response = self.client.post(
            reverse("register-confirm"), {"phone_number": PHONE, "code": otp.code}
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


@patch("users.services.send_otp_sms", side_effect=send_otp_sms_mock)
class LoginTests(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        self.user = User.objects.create_user(
            phone_number=PHONE, full_name="Alex", password=VALID_PASSWORD,
            is_active=True, is_phone_verified=True,
        )

    def test_login_success(self, mock_send):
        response = self.client.post(
            reverse("login"), {"phone_number": PHONE, "password": VALID_PASSWORD}
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_login_wrong_password(self, mock_send):
        response = self.client.post(
            reverse("login"), {"phone_number": PHONE, "password": "WrongPassword1"}
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_unknown_number(self, mock_send):
        response = self.client.post(
            reverse("login"), {"phone_number": "+254799999999", "password": "whatever"}
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_inactive_account_rejected(self, mock_send):
        self.user.is_active = False
        self.user.save(update_fields=["is_active"])

        response = self.client.post(
            reverse("login"), {"phone_number": PHONE, "password": VALID_PASSWORD}
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


@patch("users.services.send_otp_sms", side_effect=send_otp_sms_mock)
class MeViewTests(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        self.user = User.objects.create_user(
            phone_number=PHONE, full_name="Alex", password=VALID_PASSWORD,
            is_active=True, is_phone_verified=True,
        )

    def test_me_requires_auth(self, mock_send):
        response = self.client.get(reverse("me"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_returns_current_user(self, mock_send):
        login = self.client.post(
            reverse("login"), {"phone_number": PHONE, "password": VALID_PASSWORD}
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")

        response = self.client.get(reverse("me"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["phone_number"], PHONE)


@patch("users.services.send_otp_sms", side_effect=send_otp_sms_mock)
class LogoutTests(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        self.user = User.objects.create_user(
            phone_number=PHONE, full_name="Alex", password=VALID_PASSWORD,
            is_active=True, is_phone_verified=True,
        )
        login = self.client.post(
            reverse("login"), {"phone_number": PHONE, "password": VALID_PASSWORD}
        )
        self.access = login.data["access"]
        self.refresh = login.data["refresh"]

    def test_logout_requires_auth(self, mock_send):
        response = self.client.post(reverse("logout"), {"refresh": self.refresh})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_blacklists_refresh_token(self, mock_send):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access}")

        response = self.client.post(reverse("logout"), {"refresh": self.refresh})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        refresh_response = self.client.post(reverse("token-refresh"), {"refresh": self.refresh})
        self.assertEqual(refresh_response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_missing_refresh(self, mock_send):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access}")
        response = self.client.post(reverse("logout"), {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_logout_rejects_another_users_refresh_token(self, mock_send):
        other_phone = "+254711000099"
        User.objects.create_user(
            phone_number=other_phone, full_name="Other", password=VALID_PASSWORD,
            is_active=True, is_phone_verified=True,
        )
        other_login = self.client.post(
            reverse("login"), {"phone_number": other_phone, "password": VALID_PASSWORD}
        )
        other_refresh = other_login.data["refresh"]

        # Authenticated as self.user, but trying to blacklist the OTHER user's
        # refresh token.
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access}")
        response = self.client.post(reverse("logout"), {"refresh": other_refresh})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # The other user's token must still work — it wasn't blacklisted.
        refresh_response = self.client.post(
            reverse("token-refresh"), {"refresh": other_refresh}
        )
        self.assertEqual(refresh_response.status_code, status.HTTP_200_OK)


@patch("users.services.send_otp_sms", side_effect=send_otp_sms_mock)
class TokenRefreshTests(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        User.objects.create_user(
            phone_number=PHONE, full_name="Alex", password=VALID_PASSWORD,
            is_active=True, is_phone_verified=True,
        )
        login = self.client.post(
            reverse("login"), {"phone_number": PHONE, "password": VALID_PASSWORD}
        )
        self.refresh = login.data["refresh"]

    def test_refresh_returns_new_access_token(self, mock_send):
        response = self.client.post(reverse("token-refresh"), {"refresh": self.refresh})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_rotated_refresh_token_cannot_be_reused(self, mock_send):
        self.client.post(reverse("token-refresh"), {"refresh": self.refresh})

        response = self.client.post(reverse("token-refresh"), {"refresh": self.refresh})

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


@patch("users.services.send_otp_sms", side_effect=send_otp_sms_mock)
class PasswordResetTests(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        self.user = User.objects.create_user(
            phone_number=PHONE, full_name="Alex", password=VALID_PASSWORD,
            is_active=True, is_phone_verified=True,
        )

    def test_reset_request_for_existing_user_sends_otp(self, mock_send):
        response = self.client.post(reverse("password-reset"), {"phone_number": PHONE})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        mock_send.assert_called_once()
        self.assertTrue(
            OTP.objects.filter(phone_number=PHONE, purpose=OTP.Purpose.PASSWORD_RESET).exists()
        )

    def test_reset_request_for_unknown_number_looks_identical(self, mock_send):
        known = self.client.post(reverse("password-reset"), {"phone_number": PHONE})
        unknown = self.client.post(
            reverse("password-reset"), {"phone_number": "+254799999999"}
        )

        self.assertEqual(known.status_code, unknown.status_code)
        self.assertEqual(known.data, unknown.data)
        mock_send.assert_called_once()  # only for the known number

    def test_reset_confirm_changes_password_and_logs_in(self, mock_send):
        self.client.post(reverse("password-reset"), {"phone_number": PHONE})
        otp = OTP.objects.filter(
            phone_number=PHONE, purpose=OTP.Purpose.PASSWORD_RESET
        ).latest("created_at")

        response = self.client.post(
            reverse("password-reset-confirm"),
            {"phone_number": PHONE, "code": otp.code, "new_password": "BrandNewPass42"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("BrandNewPass42"))
        self.assertFalse(self.user.check_password(VALID_PASSWORD))

    def test_reset_confirm_revokes_previously_issued_refresh_tokens(self, mock_send):
        login = self.client.post(
            reverse("login"), {"phone_number": PHONE, "password": VALID_PASSWORD}
        )
        old_refresh = login.data["refresh"]

        self.client.post(reverse("password-reset"), {"phone_number": PHONE})
        otp = OTP.objects.filter(
            phone_number=PHONE, purpose=OTP.Purpose.PASSWORD_RESET
        ).latest("created_at")
        self.client.post(
            reverse("password-reset-confirm"),
            {"phone_number": PHONE, "code": otp.code, "new_password": "BrandNewPass42"},
        )

        response = self.client.post(reverse("token-refresh"), {"refresh": old_refresh})

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_reset_confirm_rejects_weak_password(self, mock_send):
        self.client.post(reverse("password-reset"), {"phone_number": PHONE})
        otp = OTP.objects.filter(
            phone_number=PHONE, purpose=OTP.Purpose.PASSWORD_RESET
        ).latest("created_at")

        response = self.client.post(
            reverse("password-reset-confirm"),
            {"phone_number": PHONE, "code": otp.code, "new_password": "weak"},
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reset_code_is_single_use(self, mock_send):
        self.client.post(reverse("password-reset"), {"phone_number": PHONE})
        otp = OTP.objects.filter(
            phone_number=PHONE, purpose=OTP.Purpose.PASSWORD_RESET
        ).latest("created_at")
        self.client.post(
            reverse("password-reset-confirm"),
            {"phone_number": PHONE, "code": otp.code, "new_password": "BrandNewPass42"},
        )

        response = self.client.post(
            reverse("password-reset-confirm"),
            {"phone_number": PHONE, "code": otp.code, "new_password": "AnotherPass99"},
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
