from rest_framework.routers import DefaultRouter

from .views import BuildingViewSet, DeliveryLocationViewSet

router = DefaultRouter()
router.register("buildings", BuildingViewSet, basename="building")
router.register("delivery-locations", DeliveryLocationViewSet, basename="delivery-location")

urlpatterns = router.urls
