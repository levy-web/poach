from django.db.models import Avg, Count, Q
from rest_framework import permissions, viewsets
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from core.pagination import OptInPageNumberPagination
from orders.models import Order

from .models import RunnerProfile
from .serializers import RunnerProfileSerializer

# A runner's "active" workload: claimed but not yet finished. Orders land in
# a terminal state (delivered/cancelled) and stop counting against them.
ACTIVE_ORDER_STATUSES = [
    Order.Status.READY,
    Order.Status.PICKED_UP,
]


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
    pagination_class = OptInPageNumberPagination

    def get_queryset(self):
        if not (self.request.user and self.request.user.is_staff):
            return RunnerProfile.objects.filter(user=self.request.user)

        qs = RunnerProfile.objects.select_related("zone", "user").annotate(
            active_order_count=Count(
                "orders", filter=Q(orders__status__in=ACTIVE_ORDER_STATUSES)
            )
        )

        zone_id = self.request.query_params.get("zone")
        if zone_id:
            qs = qs.filter(zone_id=zone_id)

        search = self.request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(
                Q(user__full_name__icontains=search)
                | Q(user__phone_number__icontains=search)
                | Q(zone__name__icontains=search)
            )

        # created_at alone isn't unique enough to page over reliably.
        return qs.order_by("-created_at", "-id")

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


class RunnerStatsView(APIView):
    """Headline counts for the admin console's runner page. Staff-only."""

    permission_classes = [IsAdminUser]

    def get(self, request):
        # rating_avg is written by the ratings flow, which doesn't exist yet,
        # so this is null across the board today. Reported as-is rather than
        # substituted with a placeholder number.
        average = RunnerProfile.objects.aggregate(value=Avg("rating_avg"))["value"]
        return Response(
            {
                "total_runners": RunnerProfile.objects.count(),
                "online_runners": RunnerProfile.objects.filter(
                    is_online=True, is_approved=True
                ).count(),
                "pending_runners": RunnerProfile.objects.filter(is_approved=False).count(),
                "average_rating": round(float(average), 2) if average is not None else None,
            }
        )
