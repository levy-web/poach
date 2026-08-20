from rest_framework import serializers

from .models import Zone


class ZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Zone
        fields = [
            "id",
            "name",
            "is_active",
            "delivery_fee",
            "commission_pct",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
