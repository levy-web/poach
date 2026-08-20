from rest_framework import serializers

from .models import Building, DeliveryLocation


class BuildingSerializer(serializers.ModelSerializer):
    zone_name = serializers.CharField(source="zone.name", read_only=True)

    class Meta:
        model = Building
        fields = [
            "id",
            "zone",
            "zone_name",
            "name",
            "landmark",
            "entry_details",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class DeliveryLocationSerializer(serializers.ModelSerializer):
    building_name = serializers.CharField(source="building.name", read_only=True)

    class Meta:
        model = DeliveryLocation
        fields = [
            "id",
            "customer",
            "building",
            "building_name",
            "unit_number",
            "label",
            "created_at",
        ]
        read_only_fields = ["id", "customer", "created_at"]
