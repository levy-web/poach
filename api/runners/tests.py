from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from users.models import User
from zones.models import Zone

from .models import RunnerProfile


class RunnerProfileAPITests(APITestCase):
    def setUp(self):
        self.zone = Zone.objects.create(name="Kilimani")
        self.other_zone = Zone.objects.create(name="Westlands")

        self.runner_user = User.objects.create_user(
            phone_number="+254711000001", password="CorrectHorseBattery9"
        )
        self.other_runner_user = User.objects.create_user(
            phone_number="+254711000004", password="CorrectHorseBattery9"
        )
        self.customer = User.objects.create_user(
            phone_number="+254711000002", password="CorrectHorseBattery9"
        )
        self.staff = User.objects.create_user(
            phone_number="+254711000003", password="CorrectHorseBattery9", is_staff=True
        )

        self.runner_profile = RunnerProfile.objects.create(
            user=self.runner_user, zone=self.zone, is_approved=True
        )
        self.other_runner_profile = RunnerProfile.objects.create(
            user=self.other_runner_user, zone=self.other_zone
        )

    def test_anonymous_cannot_access(self):
        response = self.client.get(reverse("runner-profile-list"))

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_runner_only_sees_own_profile(self):
        self.client.force_authenticate(self.runner_user)

        response = self.client.get(reverse("runner-profile-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], self.runner_profile.id)

    def test_runner_cannot_retrieve_another_runners_profile(self):
        self.client.force_authenticate(self.runner_user)

        response = self.client.get(
            reverse("runner-profile-detail", args=[self.other_runner_profile.id])
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_customer_with_no_profile_sees_empty_list(self):
        self.client.force_authenticate(self.customer)

        response = self.client.get(reverse("runner-profile-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_staff_sees_all_profiles(self):
        self.client.force_authenticate(self.staff)

        response = self.client.get(reverse("runner-profile-list"))

        ids = {p["id"] for p in response.data}
        self.assertEqual(ids, {self.runner_profile.id, self.other_runner_profile.id})

    def test_runner_cannot_create_profile(self):
        self.client.force_authenticate(self.customer)

        response = self.client.post(
            reverse("runner-profile-list"),
            {"user": self.customer.id, "zone": self.zone.id},
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_staff_create_stamps_created_by(self):
        self.client.force_authenticate(self.staff)

        response = self.client.post(
            reverse("runner-profile-list"),
            {"user": self.customer.id, "zone": self.zone.id},
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        profile = RunnerProfile.objects.get(user=self.customer)
        self.assertEqual(profile.created_by, self.staff)
        self.assertFalse(profile.is_approved)

    def test_runner_can_toggle_own_is_online(self):
        self.client.force_authenticate(self.runner_user)

        response = self.client.patch(
            reverse("runner-profile-detail", args=[self.runner_profile.id]),
            {"is_online": True},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.runner_profile.refresh_from_db()
        self.assertTrue(self.runner_profile.is_online)

    def test_runner_cannot_self_approve(self):
        self.client.force_authenticate(self.other_runner_user)

        response = self.client.patch(
            reverse("runner-profile-detail", args=[self.other_runner_profile.id]),
            {"is_approved": True, "is_online": True},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.other_runner_profile.refresh_from_db()
        self.assertFalse(self.other_runner_profile.is_approved)
        self.assertTrue(self.other_runner_profile.is_online)

    def test_runner_cannot_reassign_own_zone(self):
        self.client.force_authenticate(self.runner_user)

        response = self.client.patch(
            reverse("runner-profile-detail", args=[self.runner_profile.id]),
            {"zone": self.other_zone.id},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.runner_profile.refresh_from_db()
        self.assertEqual(self.runner_profile.zone, self.zone)

    def test_wallet_and_rating_fields_not_writable_even_by_staff(self):
        self.client.force_authenticate(self.staff)

        response = self.client.patch(
            reverse("runner-profile-detail", args=[self.runner_profile.id]),
            {"wallet_balance": "999.99", "rating_avg": "5.00", "rating_count": 100},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.runner_profile.refresh_from_db()
        self.assertEqual(str(self.runner_profile.wallet_balance), "0.00")
        self.assertIsNone(self.runner_profile.rating_avg)
        self.assertEqual(self.runner_profile.rating_count, 0)

    def test_runner_cannot_delete_own_profile(self):
        self.client.force_authenticate(self.runner_user)

        response = self.client.delete(
            reverse("runner-profile-detail", args=[self.runner_profile.id])
        )

        # The viewset has no destroy action at all, so this is now 405 rather
        # than the 403 the permission class used to produce. Either way the
        # profile survives, which is what this test is really asserting.
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        self.assertTrue(RunnerProfile.objects.filter(id=self.runner_profile.id).exists())

    def test_staff_cannot_delete_profile_either(self):
        """Deletion was removed deliberately: runners are retired by clearing
        is_approved, which keeps their delivery history intact. Order.runner
        is PROTECT, so deleting an active runner would fail anyway."""
        self.client.force_authenticate(self.staff)

        response = self.client.delete(
            reverse("runner-profile-detail", args=[self.runner_profile.id])
        )

        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        self.assertTrue(RunnerProfile.objects.filter(id=self.runner_profile.id).exists())

    def test_staff_filter_by_zone(self):
        self.client.force_authenticate(self.staff)

        response = self.client.get(reverse("runner-profile-list"), {"zone": self.zone.id})

        ids = {p["id"] for p in response.data}
        self.assertEqual(ids, {self.runner_profile.id})
