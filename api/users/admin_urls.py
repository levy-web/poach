"""
Staff-only user management endpoints for the admin console.

Kept separate from `users.urls` (mounted at /api/auth/) because these aren't
authentication routes — they're the admin console managing the user table.
"""
from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import AdminUserStatsView, AdminUserViewSet

router = DefaultRouter()
router.register("", AdminUserViewSet, basename="admin-user")

# Listed before the router so "stats/" isn't captured as a detail lookup.
urlpatterns = [
    path("stats/", AdminUserStatsView.as_view(), name="admin-user-stats"),
] + router.urls
