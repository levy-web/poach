from rest_framework import serializers

from core.roles import RUNNER, conflict_message, conflicting_role
from vendors.serializers import UserByPhoneMixin

from .models import RunnerProfile


class RunnerProfileSerializer(UserByPhoneMixin, serializers.ModelSerializer):
    user_lookup_label = "runner"

    zone_name = serializers.CharField(source="zone.name", read_only=True)
    user_phone = serializers.CharField(source="user.phone_number", read_only=True)
    user_full_name = serializers.CharField(source="user.full_name", read_only=True)
    # Write-only alternative to posting `user` as a numeric PK.
    user_phone_number = serializers.CharField(write_only=True, required=False)
    # Populated by an annotation on the list queryset; None elsewhere rather
    # than costing a COUNT per row.
    active_order_count = serializers.IntegerField(read_only=True, default=None)

    class Meta:
        model = RunnerProfile
        fields = [
            "id",
            "user",
            "user_phone",
            "user_full_name",
            "user_phone_number",
            "zone",
            "zone_name",
            "is_approved",
            "is_online",
            "wallet_balance",
            "rating_avg",
            "rating_count",
            "active_order_count",
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
            "active_order_count",
            "created_at",
            "updated_at",
        ]
        extra_kwargs = {"user": {"required": False}}

    def validate(self, attrs):
        attrs = self.resolve_user(super().validate(attrs))
        return self.validate_single_role(attrs)

    def validate_single_role(self, attrs):
        """The mirror of VendorProfileSerializer's rule — see core.roles."""
        user = attrs.get("user", self.instance.user if self.instance else None)
        held = conflicting_role(user, RUNNER)
        if held:
            raise serializers.ValidationError(
                {"user_phone_number": conflict_message(RUNNER, held)}
            )
        return attrs

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        is_staff = bool(request and request.user and request.user.is_staff)
        if not is_staff:
            # A runner may only toggle is_online on their own profile —
            # onboarding (user, zone) and approval are admin-driven.
            for field_name in ("user", "user_phone_number", "zone", "is_approved"):
                self.fields[field_name].read_only = True
