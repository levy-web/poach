from rest_framework import serializers

from users.models import User
from users.phone import normalize_phone_number

from .models import MenuItem, VendorProfile


class UserByPhoneMixin:
    """
    Lets the admin console attach a profile by typing the person's phone
    number instead of looking up a numeric user id. `user` stays writable so
    any existing caller posting a PK keeps working.
    """

    user_lookup_label = "user"

    def resolve_user(self, attrs):
        phone = attrs.pop("user_phone_number", None)
        if phone:
            normalized = normalize_phone_number(phone)
            try:
                attrs["user"] = User.objects.get(phone_number=normalized)
            except User.DoesNotExist:
                raise serializers.ValidationError(
                    {
                        "user_phone_number": (
                            f"No account with this phone number. Create the {self.user_lookup_label} "
                            "as a user first, then attach this profile."
                        )
                    }
                )
        elif self.instance is None and not attrs.get("user"):
            raise serializers.ValidationError(
                {"user_phone_number": "A phone number is required."}
            )
        return attrs


class VendorProfileSerializer(UserByPhoneMixin, serializers.ModelSerializer):
    user_lookup_label = "owner"

    zone_name = serializers.CharField(source="zone.name", read_only=True)
    user_phone = serializers.CharField(source="user.phone_number", read_only=True)
    user_full_name = serializers.CharField(source="user.full_name", read_only=True)
    # Write-only alternative to posting `user` as a numeric PK.
    user_phone_number = serializers.CharField(write_only=True, required=False)
    pickup_building_name = serializers.CharField(
        source="pickup_building.name", read_only=True, default=None
    )
    # Populated by an annotation on the list queryset. Defaults to None on
    # detail routes (and any caller that doesn't annotate) rather than
    # triggering a COUNT per row.
    active_menu_item_count = serializers.IntegerField(read_only=True, default=None)

    class Meta:
        model = VendorProfile
        fields = [
            "id",
            "user",
            "user_phone",
            "user_full_name",
            "user_phone_number",
            "zone",
            "zone_name",
            "business_name",
            "pickup_building",
            "pickup_building_name",
            "commission_pct",
            "is_approved",
            "wallet_balance",
            "active_menu_item_count",
            "created_at",
            "updated_at",
        ]
        # wallet_balance is only ever written by the payments app's split
        # logic — never editable through this API, staff included.
        read_only_fields = ["id", "wallet_balance", "created_at", "updated_at"]
        extra_kwargs = {"user": {"required": False}}

    def validate(self, attrs):
        attrs = self.resolve_user(super().validate(attrs))
        return self.validate_pickup_building_zone(attrs)

    def validate_pickup_building_zone(self, attrs):
        """
        The building has to sit in the vendor's zone, or runners get sent to
        the wrong neighborhood. Checked against the incoming zone when one is
        supplied and the stored zone otherwise, so changing only the zone on
        an existing vendor can't silently strand its pickup building.
        """
        building = attrs.get(
            "pickup_building", self.instance.pickup_building if self.instance else None
        )
        if building is None:
            return attrs

        zone = attrs.get("zone", self.instance.zone if self.instance else None)
        if zone is not None and building.zone_id != zone.id:
            raise serializers.ValidationError(
                {
                    "pickup_building": (
                        f"“{building.name}” is in {building.zone.name}, "
                        f"but this vendor is in {zone.name}."
                    )
                }
            )
        return attrs


class MenuItemSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source="vendor.business_name", read_only=True)
    # The customer app's listing card shows where a dish is collected from,
    # so it needs the vendor's location alongside the dish itself — without
    # a second round trip to the vendor profile endpoint for every card.
    # Building is the specific pickup point; zone is the fallback for
    # vendors that haven't been assigned one yet.
    vendor_building_name = serializers.CharField(
        source="vendor.pickup_building.name", read_only=True, default=None
    )
    vendor_zone_name = serializers.CharField(
        source="vendor.zone.name", read_only=True
    )

    class Meta:
        model = MenuItem
        fields = [
            "id",
            "vendor",
            "vendor_name",
            "vendor_building_name",
            "vendor_zone_name",
            "dish_name",
            "description",
            "price",
            "image",
            "is_available",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
