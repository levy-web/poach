from rest_framework.throttling import SimpleRateThrottle


class PhoneNumberThrottle(SimpleRateThrottle):
    """
    Scoped to the phone number in the request body, not the caller's
    IP/user — an attacker rotating IPs (or hitting the API pre-auth)
    shouldn't be able to spam OTPs or password guesses at one number.
    """

    def get_cache_key(self, request, view):
        phone_number = request.data.get("phone_number")
        if not phone_number:
            return None
        return self.cache_format % {
            "scope": self.scope,
            "ident": phone_number.strip().replace(" ", ""),
        }


class RegisterOTPThrottle(PhoneNumberThrottle):
    scope = "otp_register"


class PasswordResetOTPThrottle(PhoneNumberThrottle):
    scope = "otp_password_reset"


class LoginAttemptThrottle(PhoneNumberThrottle):
    scope = "login_attempt"
