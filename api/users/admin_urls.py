"""
Staff-only user management endpoints for the admin console.

Kept separate from `users.urls` (mounted at /api/auth/) because these aren't
authentication routes — they're the admin console reading the user table.
"""
from django.urls import path

from .views import AdminUserListView, AdminUserStatsView

urlpatterns = [
    path("", AdminUserListView.as_view(), name="admin-user-list"),
    path("stats/", AdminUserStatsView.as_view(), name="admin-user-stats"),
]
