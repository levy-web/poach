from django.contrib import admin

from .models import Building, DeliveryLocation


@admin.register(Building)
class BuildingAdmin(admin.ModelAdmin):
    list_display = ["name", "zone", "landmark", "is_active", "created_at"]
    list_filter = ["zone", "is_active"]
    search_fields = ["name", "landmark"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(DeliveryLocation)
class DeliveryLocationAdmin(admin.ModelAdmin):
    list_display = ["customer", "building", "unit_number", "label", "created_at"]
    list_filter = ["building__zone"]
    search_fields = ["customer__phone_number", "building__name", "unit_number"]
    readonly_fields = ["created_at"]
    autocomplete_fields = ["customer", "building"]
