from django.contrib.auth.base_user import BaseUserManager


class UserManager(BaseUserManager):
    """
    Registration collects a password, but a user isn't required to have
    one — create_user() falls back to set_unusable_password() when none is
    given, since that's still how e.g. a management command might create one.
    """

    def create_user(self, phone_number, password=None, **extra_fields):
        if not phone_number:
            raise ValueError("A phone number is required")
        phone_number = self.normalize_phone(phone_number)
        user = self.model(phone_number=phone_number, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, phone_number, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_phone_verified", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True")

        phone_number = self.normalize_phone(phone_number)
        user = self.model(phone_number=phone_number, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    @staticmethod
    def normalize_phone(phone_number):
        return phone_number.strip().replace(" ", "")
