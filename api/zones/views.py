from django.db.models import Count, Q
from rest_framework import mixins, permissions, viewsets

from core.pagination import OptInPageNumberPagination

from .models import Zone
from .serializers import ZoneSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.method in permissions.SAFE_METHODS
            or (request.user and request.user.is_staff)
        )


class ZoneViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    """
    Read access is open (clients need the active zone list to sign up or
    pick a delivery area); writes are staff-only, managed from the admin
    panel rather than by end users.

    No destroy action: a zone is retired with is_active=False. Deleting is
    blocked by PROTECT from buildings, vendors, runners and orders anyway,
    and would discard the coverage history behind them.
    """

    serializer_class = ZoneSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = OptInPageNumberPagination

    def get_queryset(self):
        is_staff = bool(self.request.user and self.request.user.is_staff)
        if not is_staff:
            return Zone.objects.filter(is_active=True)

        # Counts drive the admin console's zone table. Annotated for staff
        # only — vendor/runner headcount per zone isn't something the public
        # zone list should leak.
        qs = Zone.objects.annotate(
            building_count=Count("buildings", filter=Q(buildings__is_active=True), distinct=True),
            vendor_count=Count("vendors", distinct=True),
            runner_count=Count("runners", distinct=True),
        )

        search = self.request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(name__icontains=search)
        return qs.order_by("name")

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
