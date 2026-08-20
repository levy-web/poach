from django.contrib import admin

from .models import Zone


@admin.register(Zone)
class ZoneAdmin(admin.ModelAdmin):
    list_display = ["name", "is_active", "delivery_fee", "commission_pct", "created_at"]
    list_filter = ["is_active"]
    search_fields = ["name"]
    readonly_fields = ["created_at", "updated_at"]
