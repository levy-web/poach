from rest_framework import permissions, viewsets

from .models import RunnerProfile
from .serializers import RunnerProfileSerializer


class IsStaffOrOwner(permissions.BasePermission):
    """
    Runner profiles are internal — no customer-facing visibility, unlike
    vendors. Staff manage everything; a runner may read/patch (is_online
    only, enforced by the serializer) their own profile, but only staff
    may delete a profile or create one (admin-driven onboarding).
    """

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if view.action == "create":
            return request.user.is_staff
        return True

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        if request.method == "DELETE":
            return False
        return obj.user_id == request.user.id


class RunnerProfileViewSet(viewsets.ModelViewSet):
    serializer_class = RunnerProfileSerializer
    permission_classes = [IsStaffOrOwner]

    def get_queryset(self):
        if self.request.user and self.request.user.is_staff:
            qs = RunnerProfile.objects.all()
            zone_id = self.request.query_params.get("zone")
            if zone_id:
                qs = qs.filter(zone_id=zone_id)
            return qs
        return RunnerProfile.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
