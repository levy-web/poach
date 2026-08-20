from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from users.models import User
from zones.models import Zone

from .models import Building, DeliveryLocation


class BuildingAPITests(APITestCase):
    def setUp(self):
        self.zone = Zone.objects.create(name="Kilimani")
        self.other_zone = Zone.objects.create(name="Westlands")

        self.active_building = Building.objects.create(zone=self.zone, name="Green Court")
        self.inactive_building = Building.objects.create(
            zone=self.zone, name="Old Court", is_active=False
        )
        self.other_zone_building = Building.objects.create(zone=self.other_zone, name="ABC Place")

        self.customer = User.objects.create_user(
            phone_number="+254711000001", password="CorrectHorseBattery9"
        )
        self.staff = User.objects.create_user(
            phone_number="+254711000002", password="CorrectHorseBattery9", is_staff=True
        )

    def test_anonymous_can_list_only_active_buildings(self):
        response = self.client.get(reverse("building-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = {b["name"] for b in response.data}
        self.assertEqual(names, {"Green Court", "ABC Place"})

    def test_staff_list_includes_inactive_buildings(self):
        self.client.force_authenticate(self.staff)

        response = self.client.get(reverse("building-list"))

        names = {b["name"] for b in response.data}
        self.assertIn("Old Court", names)

    def test_filter_by_zone(self):
        response = self.client.get(reverse("building-list"), {"zone": self.zone.id})

        names = {b["name"] for b in response.data}
        self.assertEqual(names, {"Green Court"})

    def test_non_staff_cannot_create(self):
        self.client.force_authenticate(self.customer)

        response = self.client.post(
            reverse("building-list"), {"zone": self.zone.id, "name": "New Building"}
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_staff_create_stamps_created_by(self):
        self.client.force_authenticate(self.staff)

        response = self.client.post(
            reverse("building-list"), {"zone": self.zone.id, "name": "New Building"}
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        building = Building.objects.get(name="New Building")
        self.assertEqual(building.created_by, self.staff)


class DeliveryLocationAPITests(APITestCase):
    def setUp(self):
        self.zone = Zone.objects.create(name="Kilimani")
        self.building = Building.objects.create(zone=self.zone, name="Green Court")

        self.customer = User.objects.create_user(
            phone_number="+254711000001", password="CorrectHorseBattery9"
        )
        self.other_customer = User.objects.create_user(
            phone_number="+254711000003", password="CorrectHorseBattery9"
        )

    def test_anonymous_cannot_access(self):
        response = self.client.get(reverse("delivery-location-list"))

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_assigns_authenticated_customer(self):
        self.client.force_authenticate(self.customer)

        response = self.client.post(
            reverse("delivery-location-list"),
            {"building": self.building.id, "unit_number": "House 12", "label": "Home"},
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        location = DeliveryLocation.objects.get(id=response.data["id"])
        self.assertEqual(location.customer, self.customer)

    def test_customer_field_in_payload_is_ignored(self):
        self.client.force_authenticate(self.customer)

        response = self.client.post(
            reverse("delivery-location-list"),
            {
                "customer": self.other_customer.id,
                "building": self.building.id,
                "unit_number": "House 12",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        location = DeliveryLocation.objects.get(id=response.data["id"])
        self.assertEqual(location.customer, self.customer)

    def test_list_only_returns_own_locations(self):
        DeliveryLocation.objects.create(
            customer=self.customer, building=self.building, unit_number="House 12"
        )
        DeliveryLocation.objects.create(
            customer=self.other_customer, building=self.building, unit_number="House 99"
        )

        self.client.force_authenticate(self.customer)
        response = self.client.get(reverse("delivery-location-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["unit_number"], "House 12")

    def test_cannot_retrieve_another_customers_location(self):
        other_location = DeliveryLocation.objects.create(
            customer=self.other_customer, building=self.building, unit_number="House 99"
        )

        self.client.force_authenticate(self.customer)
        response = self.client.get(reverse("delivery-location-detail", args=[other_location.id]))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_can_delete_own_location(self):
        location = DeliveryLocation.objects.create(
            customer=self.customer, building=self.building, unit_number="House 12"
        )

        self.client.force_authenticate(self.customer)
        response = self.client.delete(reverse("delivery-location-detail", args=[location.id]))

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(DeliveryLocation.objects.filter(id=location.id).exists())
