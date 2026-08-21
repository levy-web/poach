from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import MenuItemViewSet, VendorProfileViewSet, VendorStatsView

router = DefaultRouter()
router.register("profiles", VendorProfileViewSet, basename="vendor-profile")
router.register("menu-items", MenuItemViewSet, basename="menu-item")

# Listed before the router so "stats/" isn't shadowed by a router route.
urlpatterns = [
    path("stats/", VendorStatsView.as_view(), name="vendor-stats"),
] + router.urls
