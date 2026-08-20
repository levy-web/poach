from rest_framework import serializers

from .models import MenuItem, VendorProfile


class VendorProfileSerializer(serializers.ModelSerializer):
    zone_name = serializers.CharField(source="zone.name", read_only=True)
    user_phone = serializers.CharField(source="user.phone_number", read_only=True)

    class Meta:
        model = VendorProfile
        fields = [
            "id",
            "user",
            "user_phone",
            "zone",
            "zone_name",
            "business_name",
            "pickup_address",
            "commission_pct",
            "is_approved",
            "wallet_balance",
            "created_at",
            "updated_at",
        ]
        # wallet_balance is only ever written by the payments app's split
        # logic — never editable through this API, staff included.
        read_only_fields = ["id", "wallet_balance", "created_at", "updated_at"]


class MenuItemSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source="vendor.business_name", read_only=True)

    class Meta:
        model = MenuItem
        fields = [
            "id",
            "vendor",
            "vendor_name",
            "dish_name",
            "description",
            "price",
            "is_available",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
