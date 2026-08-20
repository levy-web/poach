from rest_framework import serializers

from .models import RunnerProfile


class RunnerProfileSerializer(serializers.ModelSerializer):
    zone_name = serializers.CharField(source="zone.name", read_only=True)
    user_phone = serializers.CharField(source="user.phone_number", read_only=True)

    class Meta:
        model = RunnerProfile
        fields = [
            "id",
            "user",
            "user_phone",
            "zone",
            "zone_name",
            "is_approved",
            "is_online",
            "wallet_balance",
            "rating_avg",
            "rating_count",
            "created_at",
            "updated_at",
        ]
        # wallet_balance/rating_avg/rating_count are only ever written by
        # the payments/ratings logic — never editable through this API.
        read_only_fields = [
            "id",
            "wallet_balance",
            "rating_avg",
            "rating_count",
            "created_at",
            "updated_at",
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        is_staff = bool(request and request.user and request.user.is_staff)
        if not is_staff:
            # A runner may only toggle is_online on their own profile —
            # onboarding (user, zone) and approval are admin-driven.
            for field_name in ("user", "zone", "is_approved"):
                self.fields[field_name].read_only = True
