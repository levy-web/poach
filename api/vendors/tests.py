from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from users.models import User
from zones.models import Zone

from .models import MenuItem, VendorProfile


class VendorProfileAPITests(APITestCase):
    def setUp(self):
        self.zone = Zone.objects.create(name="Kilimani")
        self.other_zone = Zone.objects.create(name="Westlands")

        self.vendor_user = User.objects.create_user(
            phone_number="+254711000001", password="CorrectHorseBattery9"
        )
        self.other_vendor_user = User.objects.create_user(
            phone_number="+254711000004", password="CorrectHorseBattery9"
        )
        self.customer = User.objects.create_user(
            phone_number="+254711000002", password="CorrectHorseBattery9"
        )
        self.staff = User.objects.create_user(
            phone_number="+254711000003", password="CorrectHorseBattery9", is_staff=True
        )

        self.approved_vendor = VendorProfile.objects.create(
            user=self.vendor_user, zone=self.zone, business_name="Mama's Kitchen", is_approved=True
        )
        self.unapproved_vendor = VendorProfile.objects.create(
            user=self.other_vendor_user, zone=self.other_zone, business_name="New Joint"
        )

    def test_anonymous_can_list_only_approved_vendors(self):
        response = self.client.get(reverse("vendor-profile-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = {v["business_name"] for v in response.data}
        self.assertEqual(names, {"Mama's Kitchen"})

    def test_staff_list_includes_unapproved_vendors(self):
        self.client.force_authenticate(self.staff)

        response = self.client.get(reverse("vendor-profile-list"))

        names = {v["business_name"] for v in response.data}
        self.assertEqual(names, {"Mama's Kitchen", "New Joint"})

    def test_filter_by_zone(self):
        self.client.force_authenticate(self.staff)

        response = self.client.get(reverse("vendor-profile-list"), {"zone": self.zone.id})

        names = {v["business_name"] for v in response.data}
        self.assertEqual(names, {"Mama's Kitchen"})

    def test_non_staff_cannot_see_unapproved_vendor_detail(self):
        response = self.client.get(
            reverse("vendor-profile-detail", args=[self.unapproved_vendor.id])
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_non_staff_cannot_create(self):
        self.client.force_authenticate(self.customer)

        response = self.client.post(
            reverse("vendor-profile-list"),
            {"user": self.customer.id, "zone": self.zone.id, "business_name": "New Vendor"},
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_staff_create_stamps_created_by(self):
        self.client.force_authenticate(self.staff)

        response = self.client.post(
            reverse("vendor-profile-list"),
            {"user": self.customer.id, "zone": self.zone.id, "business_name": "New Vendor"},
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        vendor = VendorProfile.objects.get(business_name="New Vendor")
        self.assertEqual(vendor.created_by, self.staff)
        self.assertFalse(vendor.is_approved)

    def test_staff_can_approve_vendor(self):
        self.client.force_authenticate(self.staff)

        response = self.client.patch(
            reverse("vendor-profile-detail", args=[self.unapproved_vendor.id]),
            {"is_approved": True},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.unapproved_vendor.refresh_from_db()
        self.assertTrue(self.unapproved_vendor.is_approved)
        self.assertEqual(self.unapproved_vendor.updated_by, self.staff)

    def test_wallet_balance_is_not_writable_even_by_staff(self):
        self.client.force_authenticate(self.staff)

        response = self.client.patch(
            reverse("vendor-profile-detail", args=[self.approved_vendor.id]),
            {"wallet_balance": "999.99"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.approved_vendor.refresh_from_db()
        self.assertEqual(str(self.approved_vendor.wallet_balance), "0.00")


class MenuItemAPITests(APITestCase):
    def setUp(self):
        self.zone = Zone.objects.create(name="Kilimani")

        self.approved_vendor_user = User.objects.create_user(
            phone_number="+254711000001", password="CorrectHorseBattery9"
        )
        self.unapproved_vendor_user = User.objects.create_user(
            phone_number="+254711000004", password="CorrectHorseBattery9"
        )
        self.staff = User.objects.create_user(
            phone_number="+254711000003", password="CorrectHorseBattery9", is_staff=True
        )

        self.approved_vendor = VendorProfile.objects.create(
            user=self.approved_vendor_user,
            zone=self.zone,
            business_name="Mama's Kitchen",
            is_approved=True,
        )
        self.unapproved_vendor = VendorProfile.objects.create(
            user=self.unapproved_vendor_user, zone=self.zone, business_name="New Joint"
        )

        self.available_item = MenuItem.objects.create(
            vendor=self.approved_vendor, dish_name="Pilau", price="250.00"
        )
        self.sold_out_item = MenuItem.objects.create(
            vendor=self.approved_vendor, dish_name="Chapati", price="20.00", is_available=False
        )
        self.unapproved_vendor_item = MenuItem.objects.create(
            vendor=self.unapproved_vendor, dish_name="Ugali", price="100.00"
        )

    def test_anonymous_only_sees_available_items_from_approved_vendors(self):
        response = self.client.get(reverse("menu-item-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = {i["dish_name"] for i in response.data}
        self.assertEqual(names, {"Pilau"})

    def test_staff_sees_all_items(self):
        self.client.force_authenticate(self.staff)

        response = self.client.get(reverse("menu-item-list"))

        names = {i["dish_name"] for i in response.data}
        self.assertEqual(names, {"Pilau", "Chapati", "Ugali"})

    def test_filter_by_vendor(self):
        self.client.force_authenticate(self.staff)

        response = self.client.get(
            reverse("menu-item-list"), {"vendor": self.approved_vendor.id}
        )

        names = {i["dish_name"] for i in response.data}
        self.assertEqual(names, {"Pilau", "Chapati"})

    def test_non_staff_cannot_create(self):
        self.client.force_authenticate(self.approved_vendor_user)

        response = self.client.post(
            reverse("menu-item-list"),
            {"vendor": self.approved_vendor.id, "dish_name": "Samosa", "price": "50.00"},
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_staff_create_stamps_created_by(self):
        self.client.force_authenticate(self.staff)

        response = self.client.post(
            reverse("menu-item-list"),
            {"vendor": self.approved_vendor.id, "dish_name": "Samosa", "price": "50.00"},
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        item = MenuItem.objects.get(dish_name="Samosa")
        self.assertEqual(item.created_by, self.staff)
