from rest_framework.routers import DefaultRouter

from .views import MenuItemViewSet, VendorProfileViewSet

router = DefaultRouter()
router.register("profiles", VendorProfileViewSet, basename="vendor-profile")
router.register("menu-items", MenuItemViewSet, basename="menu-item")

urlpatterns = router.urls
