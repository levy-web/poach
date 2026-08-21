from rest_framework import serializers

from .models import Zone


class ZoneSerializer(serializers.ModelSerializer):
    # Populated by annotations on the staff list queryset; absent elsewhere
    # rather than costing a COUNT per row.
    building_count = serializers.IntegerField(read_only=True, default=None)
    vendor_count = serializers.IntegerField(read_only=True, default=None)
    runner_count = serializers.IntegerField(read_only=True, default=None)

    class Meta:
        model = Zone
        fields = [
            "id",
            "name",
            "is_active",
            "delivery_fee",
            "commission_pct",
            "building_count",
            "vendor_count",
            "runner_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
