from django.db.models import Count, Q
from rest_framework import mixins, permissions, viewsets
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from core.pagination import OptInPageNumberPagination

from .models import MenuItem, VendorProfile
from .serializers import MenuItemSerializer, VendorProfileSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.method in permissions.SAFE_METHODS
            or (request.user and request.user.is_staff)
        )


class VendorProfileViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    """
    Onboarding is admin-driven (no self-service vendor signup), so writes
    are staff-only. Reads are open, but unapproved vendors are hidden from
    everyone except staff — an unapproved vendor shouldn't show up in
    customer search.

    No destroy action: a vendor is retired by clearing `is_approved`, which
    removes them from customer-facing listings while preserving their menu
    and order history. Deleting would cascade away every MenuItem and be
    blocked outright by the PROTECT on Order.vendor.
    """

    serializer_class = VendorProfileSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = OptInPageNumberPagination

    def get_queryset(self):
        if self.request.user and self.request.user.is_staff:
            qs = VendorProfile.objects.all()
        else:
            qs = VendorProfile.objects.filter(is_approved=True)

        qs = qs.select_related("zone", "user").annotate(
            active_menu_item_count=Count(
                "menu_items", filter=Q(menu_items__is_available=True)
            )
        )

        zone_id = self.request.query_params.get("zone")
        if zone_id:
            qs = qs.filter(zone_id=zone_id)

        search = self.request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(
                Q(business_name__icontains=search)
                | Q(user__phone_number__icontains=search)
                | Q(zone__name__icontains=search)
            )

        # Model Meta orders by business_name, which isn't unique — without a
        # tiebreaker two vendors sharing a name can swap places between page
        # requests and be duplicated or skipped.
        return qs.order_by("business_name", "id")

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


class VendorStatsView(APIView):
    """
    Headline counts for the admin console's vendor page. Staff-only: it
    reports on unapproved vendors, which the public list deliberately hides.
    """

    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response(
            {
                "total_vendors": VendorProfile.objects.count(),
                "approved_vendors": VendorProfile.objects.filter(is_approved=True).count(),
                "pending_vendors": VendorProfile.objects.filter(is_approved=False).count(),
                "active_menu_items": MenuItem.objects.filter(is_available=True).count(),
            }
        )
