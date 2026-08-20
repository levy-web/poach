from rest_framework import permissions, viewsets

from .models import Building, DeliveryLocation
from .serializers import BuildingSerializer, DeliveryLocationSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.method in permissions.SAFE_METHODS
            or (request.user and request.user.is_staff)
        )


class BuildingViewSet(viewsets.ModelViewSet):
    """
    Buildings are admin-registered (no self-service creation in MVP scope),
    so reads are open — customers need the list to pick a delivery point —
    while writes are staff-only, managed from the admin panel.
    """

    serializer_class = BuildingSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        if self.request.user and self.request.user.is_staff:
            qs = Building.objects.all()
        else:
            qs = Building.objects.filter(is_active=True)

        zone_id = self.request.query_params.get("zone")
        if zone_id:
            qs = qs.filter(zone_id=zone_id)
        return qs

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
