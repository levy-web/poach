from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from runners.models import RunnerProfile
from users.models import User
from zones.models import Zone

from .models import VendorProfile


class AdminProfileManagementTests(APITestCase):
    """
    Covers admin management of vendor and runner profiles: attaching a
    profile by phone number, approval as the retire switch, and the absence
    of any delete action.
    """

    def setUp(self):
        self.staff = User.objects.create_user(
            phone_number="+254700000010", full_name="Super Admin", is_staff=True
        )
        self.owner = User.objects.create_user(
            phone_number="+254788000001", full_name="Cafe Owner"
        )
        self.outsider = User.objects.create_user(
            phone_number="+254788000009", full_name="Random Person"
        )
        self.zone = Zone.objects.create(name="Kilimani")

    # --- vendors ----------------------------------------------------------

    def test_create_vendor_by_owner_phone_number(self):
        self.client.force_authenticate(self.staff)
        response = self.client.post(
            reverse("vendor-profile-list"),
            {
                "user_phone_number": "0788000001",
                "zone": self.zone.id,
                "business_name": "Corner Cafe",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(VendorProfile.objects.get().user, self.owner)

    def test_create_vendor_with_unknown_phone_is_rejected(self):
        self.client.force_authenticate(self.staff)
        response = self.client.post(
            reverse("vendor-profile-list"),
            {
                "user_phone_number": "0788999999",
                "zone": self.zone.id,
                "business_name": "Ghost Kitchen",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("user_phone_number", response.data)
        self.assertFalse(VendorProfile.objects.exists())

    def test_create_vendor_requires_a_phone_number(self):
        self.client.force_authenticate(self.staff)
        response = self.client.post(
            reverse("vendor-profile-list"),
            {"zone": self.zone.id, "business_name": "Nameless"},
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_non_staff_cannot_create_vendor(self):
        self.client.force_authenticate(self.outsider)
        response = self.client.post(
            reverse("vendor-profile-list"),
            {
                "user_phone_number": "0788000001",
                "zone": self.zone.id,
                "business_name": "Sneaky Cafe",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_approval_toggle_retires_and_restores_a_vendor(self):
        vendor = VendorProfile.objects.create(
            user=self.owner, zone=self.zone, business_name="Corner Cafe", is_approved=True
        )
        self.client.force_authenticate(self.staff)
        url = reverse("vendor-profile-detail", args=[vendor.pk])

        self.assertEqual(
            self.client.patch(url, {"is_approved": False}).status_code, status.HTTP_200_OK
        )
        vendor.refresh_from_db()
        self.assertFalse(vendor.is_approved)

        self.assertEqual(
            self.client.patch(url, {"is_approved": True}).status_code, status.HTTP_200_OK
        )
        vendor.refresh_from_db()
        self.assertTrue(vendor.is_approved)

    def test_unapproved_vendor_is_hidden_from_non_staff(self):
        VendorProfile.objects.create(
            user=self.owner, zone=self.zone, business_name="Corner Cafe", is_approved=False
        )
        self.client.force_authenticate(self.outsider)
        response = self.client.get(reverse("vendor-profile-list"))
        self.assertEqual(len(response.data), 0)

    def test_wallet_balance_is_not_writable(self):
        vendor = VendorProfile.objects.create(
            user=self.owner, zone=self.zone, business_name="Corner Cafe"
        )
        self.client.force_authenticate(self.staff)
        self.client.patch(
            reverse("vendor-profile-detail", args=[vendor.pk]), {"wallet_balance": "9999.00"}
        )
        vendor.refresh_from_db()
        self.assertEqual(str(vendor.wallet_balance), "0.00")

    def test_vendor_delete_is_not_allowed(self):
        """Vendors are retired via is_approved. Deleting would cascade away
        every MenuItem and be blocked by the PROTECT on Order.vendor."""
        vendor = VendorProfile.objects.create(
            user=self.owner, zone=self.zone, business_name="Corner Cafe"
        )
        self.client.force_authenticate(self.staff)
        response = self.client.delete(reverse("vendor-profile-detail", args=[vendor.pk]))
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        self.assertTrue(VendorProfile.objects.filter(pk=vendor.pk).exists())

    # --- runners ----------------------------------------------------------

    def test_create_runner_by_phone_number(self):
        self.client.force_authenticate(self.staff)
        response = self.client.post(
            reverse("runner-profile-list"),
            {"user_phone_number": "0788000001", "zone": self.zone.id},
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(RunnerProfile.objects.get().user, self.owner)

    def test_runner_delete_is_not_allowed(self):
        runner = RunnerProfile.objects.create(user=self.owner, zone=self.zone)
        self.client.force_authenticate(self.staff)
        response = self.client.delete(reverse("runner-profile-detail", args=[runner.pk]))
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        self.assertTrue(RunnerProfile.objects.filter(pk=runner.pk).exists())

    def test_runner_cannot_self_approve(self):
        """Approval gates going online, so a runner granting it to themselves
        would bypass admin onboarding entirely."""
        runner = RunnerProfile.objects.create(
            user=self.owner, zone=self.zone, is_approved=False
        )
        self.client.force_authenticate(self.owner)
        self.client.patch(
            reverse("runner-profile-detail", args=[runner.pk]), {"is_approved": True}
        )
        runner.refresh_from_db()
        self.assertFalse(runner.is_approved)

    def test_runner_cannot_reassign_their_profile_to_someone_else(self):
        runner = RunnerProfile.objects.create(user=self.owner, zone=self.zone)
        self.client.force_authenticate(self.owner)
        self.client.patch(
            reverse("runner-profile-detail", args=[runner.pk]),
            {"user_phone_number": self.outsider.phone_number},
        )
        runner.refresh_from_db()
        self.assertEqual(runner.user, self.owner)

    # --- pickup building --------------------------------------------------

    def test_pickup_building_must_be_in_the_vendors_zone(self):
        """A building in another zone would send runners to the wrong
        neighborhood."""
        from locations.models import Building

        other_zone = Zone.objects.create(name="Nakuru Town")
        foreign_building = Building.objects.create(zone=other_zone, name="Far Away Court")

        self.client.force_authenticate(self.staff)
        response = self.client.post(
            reverse("vendor-profile-list"),
            {
                "user_phone_number": "0788000001",
                "zone": self.zone.id,
                "business_name": "Corner Cafe",
                "pickup_building": foreign_building.id,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("pickup_building", response.data)
        self.assertFalse(VendorProfile.objects.exists())

    def test_pickup_building_in_the_same_zone_is_accepted(self):
        from locations.models import Building

        building = Building.objects.create(zone=self.zone, name="Green Court")

        self.client.force_authenticate(self.staff)
        response = self.client.post(
            reverse("vendor-profile-list"),
            {
                "user_phone_number": "0788000001",
                "zone": self.zone.id,
                "business_name": "Corner Cafe",
                "pickup_building": building.id,
            },
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(VendorProfile.objects.get().pickup_building, building)

    def test_changing_zone_alone_cannot_strand_the_pickup_building(self):
        """Editing only the zone must be rejected if the existing building
        no longer belongs to it — otherwise the mismatch slips through."""
        from locations.models import Building

        building = Building.objects.create(zone=self.zone, name="Green Court")
        other_zone = Zone.objects.create(name="Nakuru Town")
        vendor = VendorProfile.objects.create(
            user=self.owner,
            zone=self.zone,
            business_name="Corner Cafe",
            pickup_building=building,
        )

        self.client.force_authenticate(self.staff)
        response = self.client.patch(
            reverse("vendor-profile-detail", args=[vendor.pk]), {"zone": other_zone.id}
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        vendor.refresh_from_db()
        self.assertEqual(vendor.zone, self.zone)

    def test_pickup_building_is_optional(self):
        self.client.force_authenticate(self.staff)
        response = self.client.post(
            reverse("vendor-profile-list"),
            {
                "user_phone_number": "0788000001",
                "zone": self.zone.id,
                "business_name": "No Building Yet",
            },
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsNone(VendorProfile.objects.get().pickup_building)
