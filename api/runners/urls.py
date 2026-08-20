from rest_framework.routers import DefaultRouter

from .views import RunnerProfileViewSet

router = DefaultRouter()
router.register("profiles", RunnerProfileViewSet, basename="runner-profile")

urlpatterns = router.urls
