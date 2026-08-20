from rest_framework import permissions, viewsets

from .models import MenuItem, VendorProfile
from .serializers import MenuItemSerializer, VendorProfileSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.method in permissions.SAFE_METHODS
            or (request.user and request.user.is_staff)
        )


class VendorProfileViewSet(viewsets.ModelViewSet):
    """
    Onboarding is admin-driven (no self-service vendor signup), so writes
    are staff-only. Reads are open, but unapproved vendors are hidden from
    everyone except staff — an unapproved vendor shouldn't show up in
    customer search.
    """

    serializer_class = VendorProfileSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        if self.request.user and self.request.user.is_staff:
            qs = VendorProfile.objects.all()
        else:
            qs = VendorProfile.objects.filter(is_approved=True)

        zone_id = self.request.query_params.get("zone")
        if zone_id:
            qs = qs.filter(zone_id=zone_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


class MenuItemViewSet(viewsets.ModelViewSet):
    """Same admin-driven write policy as VendorProfile; reads hide items
    that are unavailable or belong to an unapproved vendor."""

    serializer_class = MenuItemSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        if self.request.user and self.request.user.is_staff:
            qs = MenuItem.objects.all()
        else:
            qs = MenuItem.objects.filter(is_available=True, vendor__is_approved=True)

        vendor_id = self.request.query_params.get("vendor")
        if vendor_id:
            qs = qs.filter(vendor_id=vendor_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
