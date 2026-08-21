from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from users.models import User

from .models import Zone


class ZoneAPITests(APITestCase):
    def setUp(self):
        self.active_zone = Zone.objects.create(name="Kilimani")
        self.inactive_zone = Zone.objects.create(name="Nakuru Town", is_active=False)

        self.customer = User.objects.create_user(
            phone_number="+254711000001", password="CorrectHorseBattery9"
        )
        self.staff = User.objects.create_user(
            phone_number="+254711000002", password="CorrectHorseBattery9", is_staff=True
        )

    def test_anonymous_can_list_only_active_zones(self):
        response = self.client.get(reverse("zone-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = [z["name"] for z in response.data]
        self.assertEqual(names, ["Kilimani"])

    def test_staff_list_includes_inactive_zones(self):
        self.client.force_authenticate(self.staff)

        response = self.client.get(reverse("zone-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = {z["name"] for z in response.data}
        self.assertEqual(names, {"Kilimani", "Nakuru Town"})

    def test_anonymous_create_requires_authentication(self):
        response = self.client.post(reverse("zone-list"), {"name": "Westlands"})

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_non_staff_cannot_create(self):
        self.client.force_authenticate(self.customer)

        response = self.client.post(reverse("zone-list"), {"name": "Westlands"})

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_staff_create_stamps_created_by_and_updated_by(self):
        self.client.force_authenticate(self.staff)

        response = self.client.post(reverse("zone-list"), {"name": "Westlands"})

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        zone = Zone.objects.get(name="Westlands")
        self.assertEqual(zone.created_by, self.staff)
        self.assertEqual(zone.updated_by, self.staff)

    def test_staff_update_stamps_updated_by(self):
        self.client.force_authenticate(self.staff)

        response = self.client.patch(
            reverse("zone-detail", args=[self.active_zone.id]),
            {"delivery_fee": "50.00"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.active_zone.refresh_from_db()
        self.assertEqual(str(self.active_zone.delivery_fee), "50.00")
        self.assertEqual(self.active_zone.updated_by, self.staff)

    def test_non_staff_cannot_update(self):
        self.client.force_authenticate(self.customer)

        response = self.client.patch(
            reverse("zone-detail", args=[self.active_zone.id]),
            {"delivery_fee": "50.00"},
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_non_staff_cannot_delete(self):
        self.client.force_authenticate(self.customer)

        response = self.client.delete(reverse("zone-detail", args=[self.active_zone.id]))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(Zone.objects.filter(id=self.active_zone.id).exists())

    def test_staff_cannot_delete(self):
        self.client.force_authenticate(self.staff)

        response = self.client.delete(reverse("zone-detail", args=[self.active_zone.id]))

        # Deletion was removed deliberately: zones are retired with
        # is_active=False, and PROTECT from buildings/vendors/runners/orders
        # would block a real delete anyway.
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        self.assertTrue(Zone.objects.filter(id=self.active_zone.id).exists())

    def test_non_staff_cannot_see_inactive_zone_detail(self):
        self.client.force_authenticate(self.customer)

        response = self.client.get(reverse("zone-detail", args=[self.inactive_zone.id]))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
