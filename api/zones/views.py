from rest_framework import permissions, viewsets

from .models import Zone
from .serializers import ZoneSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.method in permissions.SAFE_METHODS
            or (request.user and request.user.is_staff)
        )


class ZoneViewSet(viewsets.ModelViewSet):
    """
    Read access is open (clients need the active zone list to sign up or
    pick a delivery area); writes are staff-only, managed from the admin
    panel rather than by end users.
    """

    serializer_class = ZoneSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        if self.request.user and self.request.user.is_staff:
            return Zone.objects.all()
        return Zone.objects.filter(is_active=True)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
