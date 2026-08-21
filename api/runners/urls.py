from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import RunnerProfileViewSet, RunnerStatsView

router = DefaultRouter()
router.register("profiles", RunnerProfileViewSet, basename="runner-profile")

# Listed before the router so "stats/" isn't shadowed by a router route.
urlpatterns = [
    path("stats/", RunnerStatsView.as_view(), name="runner-stats"),
] + router.urls
