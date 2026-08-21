from django.core.cache import cache
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import User

VALID_PASSWORD = "CorrectHorseBattery9"


class AdminUserManagementTests(APITestCase):
    """
    Covers the admin console's user CRUD, with an emphasis on the guards —
    these endpoints can grant staff access and destroy accounts, so the
    failure modes matter more than the happy path.
    """

    def setUp(self):
        cache.clear()
        self.superuser = User.objects.create_user(
            phone_number="+254700000010",
            full_name="Super Admin",
            password=VALID_PASSWORD,
            is_staff=True,
            is_superuser=True,
        )
        self.staff = User.objects.create_user(
            phone_number="+254700000011",
            full_name="Plain Staff",
            password=VALID_PASSWORD,
            is_staff=True,
        )
        self.customer = User.objects.create_user(
            phone_number="+254700000012",
            full_name="Ordinary Customer",
            password=VALID_PASSWORD,
        )
        self.list_url = reverse("admin-user-list")

    def detail_url(self, user):
        return reverse("admin-user-detail", args=[user.pk])

    # --- access control ---------------------------------------------------

    def test_anonymous_cannot_list_users(self):
        self.assertEqual(
            self.client.get(self.list_url).status_code, status.HTTP_401_UNAUTHORIZED
        )

    def test_ordinary_customer_cannot_list_users(self):
        self.client.force_authenticate(self.customer)
        self.assertEqual(self.client.get(self.list_url).status_code, status.HTTP_403_FORBIDDEN)

    def test_ordinary_customer_cannot_create_users(self):
        self.client.force_authenticate(self.customer)
        response = self.client.post(
            self.list_url, {"phone_number": "0733000111", "full_name": "Nope"}
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(User.objects.filter(full_name="Nope").exists())

    # --- create -----------------------------------------------------------

    def test_create_normalizes_phone_number(self):
        self.client.force_authenticate(self.staff)
        response = self.client.post(
            self.list_url,
            {"phone_number": "0733000111", "full_name": "New Person", "password": VALID_PASSWORD},
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(phone_number="+254733000111").exists())

    def test_create_without_password_leaves_account_unusable(self):
        """No password means the person must complete the SMS reset flow
        before they can sign in — not that they get a blank password."""
        self.client.force_authenticate(self.staff)
        response = self.client.post(
            self.list_url, {"phone_number": "0733000112", "full_name": "No Password"}
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertFalse(User.objects.get(phone_number="+254733000112").has_usable_password())

    def test_create_rejects_duplicate_phone_number(self):
        self.client.force_authenticate(self.staff)
        response = self.client.post(
            self.list_url, {"phone_number": self.customer.phone_number, "full_name": "Clash"}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_rejects_weak_password(self):
        self.client.force_authenticate(self.staff)
        response = self.client.post(
            self.list_url,
            {"phone_number": "0733000113", "full_name": "Weak", "password": "123"},
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.filter(phone_number="+254733000113").exists())

    def test_password_is_never_echoed_back(self):
        self.client.force_authenticate(self.staff)
        response = self.client.post(
            self.list_url,
            {"phone_number": "0733000114", "full_name": "Secret", "password": VALID_PASSWORD},
        )
        self.assertNotIn("password", response.data)

    # --- privilege escalation --------------------------------------------

    def test_non_superuser_staff_cannot_grant_staff(self):
        self.client.force_authenticate(self.staff)
        response = self.client.patch(
            self.detail_url(self.customer),
            {"phone_number": self.customer.phone_number, "is_staff": True},
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.customer.refresh_from_db()
        self.assertFalse(self.customer.is_staff)

    def test_non_superuser_staff_cannot_revoke_staff(self):
        self.client.force_authenticate(self.staff)
        response = self.client.patch(
            self.detail_url(self.superuser),
            {"phone_number": self.superuser.phone_number, "is_staff": False},
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.superuser.refresh_from_db()
        self.assertTrue(self.superuser.is_staff)

    def test_superuser_can_grant_staff(self):
        self.client.force_authenticate(self.superuser)
        response = self.client.patch(
            self.detail_url(self.customer),
            {"phone_number": self.customer.phone_number, "is_staff": True},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.customer.refresh_from_db()
        self.assertTrue(self.customer.is_staff)

    def test_unchanged_staff_flag_is_not_treated_as_escalation(self):
        """Re-saving an edit form that includes the current value shouldn't
        trip the superuser guard."""
        self.client.force_authenticate(self.staff)
        response = self.client.patch(
            self.detail_url(self.customer),
            {"phone_number": self.customer.phone_number, "full_name": "Renamed", "is_staff": False},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.customer.refresh_from_db()
        self.assertEqual(self.customer.full_name, "Renamed")

    # --- self-lockout -----------------------------------------------------

    def test_admin_cannot_deactivate_themselves(self):
        self.client.force_authenticate(self.staff)
        response = self.client.patch(
            self.detail_url(self.staff),
            {"phone_number": self.staff.phone_number, "is_active": False},
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.staff.refresh_from_db()
        self.assertTrue(self.staff.is_active)

    def test_superuser_cannot_revoke_their_own_staff_access(self):
        self.client.force_authenticate(self.superuser)
        response = self.client.patch(
            self.detail_url(self.superuser),
            {"phone_number": self.superuser.phone_number, "is_staff": False},
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.superuser.refresh_from_db()
        self.assertTrue(self.superuser.is_staff)

    # --- update -----------------------------------------------------------

    def test_update_can_change_password_and_it_takes_effect(self):
        self.client.force_authenticate(self.superuser)
        response = self.client.patch(
            self.detail_url(self.customer),
            {"phone_number": self.customer.phone_number, "password": "AnotherStrongPass77"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.customer.refresh_from_db()
        self.assertTrue(self.customer.check_password("AnotherStrongPass77"))

    def test_update_rejects_phone_number_taken_by_another_user(self):
        self.client.force_authenticate(self.superuser)
        response = self.client.patch(
            self.detail_url(self.customer), {"phone_number": self.staff.phone_number}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_allows_keeping_own_unchanged_phone_number(self):
        self.client.force_authenticate(self.superuser)
        response = self.client.patch(
            self.detail_url(self.customer),
            {"phone_number": self.customer.phone_number, "full_name": "Same Number"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # --- deletion is not offered -----------------------------------------

    def test_delete_is_not_allowed(self):
        """Accounts are retired with is_active=False. Deleting would be
        blocked by the PROTECT on Order.customer, or would silently cascade
        away the user's vendor/runner profile and delivery locations."""
        self.client.force_authenticate(self.superuser)
        response = self.client.delete(self.detail_url(self.customer))
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        self.assertTrue(User.objects.filter(pk=self.customer.pk).exists())

    def test_deactivating_a_user_revokes_their_sessions(self):
        from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken
        from rest_framework_simplejwt.tokens import RefreshToken

        RefreshToken.for_user(self.customer)
        before = BlacklistedToken.objects.count()

        self.client.force_authenticate(self.superuser)
        response = self.client.patch(
            self.detail_url(self.customer),
            {"phone_number": self.customer.phone_number, "is_active": False},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.customer.refresh_from_db()
        self.assertFalse(self.customer.is_active)
        self.assertGreater(BlacklistedToken.objects.count(), before)
