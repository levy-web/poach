from django.db.models import Q
from rest_framework import mixins, permissions, viewsets

from core.pagination import OptInPageNumberPagination

from .models import Building, DeliveryLocation
from .serializers import BuildingSerializer, DeliveryLocationSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.method in permissions.SAFE_METHODS
            or (request.user and request.user.is_staff)
        )


class BuildingViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    """
    Buildings are admin-registered (no self-service creation in MVP scope),
    so reads are open — customers need the list to pick a delivery point —
    while writes are staff-only, managed from the admin panel.

    No destroy action: a mis-registered building is deactivated instead, as
    the model's own help_text prescribes. Deleting is blocked by PROTECT
    from saved delivery locations and vendor pickup points.
    """

    serializer_class = BuildingSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = OptInPageNumberPagination

    def get_queryset(self):
        if self.request.user and self.request.user.is_staff:
            qs = Building.objects.all()
        else:
            qs = Building.objects.filter(is_active=True)

        qs = qs.select_related("zone")

        zone_id = self.request.query_params.get("zone")
        if zone_id:
            qs = qs.filter(zone_id=zone_id)

        search = self.request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(landmark__icontains=search))

        # Model Meta orders by (zone, name), which is unique together — but
        # spell it out with an id tiebreaker so paging stays stable.
        return qs.order_by("zone__name", "name", "id")

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


class DeliveryLocationViewSet(viewsets.ModelViewSet):
    """A customer's own saved delivery points — never visible across customers."""

    serializer_class = DeliveryLocationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DeliveryLocation.objects.filter(customer=self.request.user)

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)
