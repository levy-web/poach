from django.contrib import admin

from .models import MenuItem, VendorProfile


class MenuItemInline(admin.TabularInline):
    model = MenuItem
    extra = 0
    fields = ["dish_name", "price", "is_available"]


@admin.register(VendorProfile)
class VendorProfileAdmin(admin.ModelAdmin):
    list_display = ["business_name", "zone", "is_approved", "wallet_balance", "created_at"]
    list_filter = ["zone", "is_approved"]
    search_fields = ["business_name", "user__phone_number"]
    readonly_fields = ["wallet_balance", "created_at", "updated_at"]
    autocomplete_fields = ["user"]
    inlines = [MenuItemInline]
    actions = ["approve_vendors"]

    @admin.action(description="Approve selected vendors")
    def approve_vendors(self, request, queryset):
        queryset.update(is_approved=True)


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ["dish_name", "vendor", "price", "is_available", "updated_at"]
    list_filter = ["is_available", "vendor__zone"]
    search_fields = ["dish_name", "vendor__business_name"]
    autocomplete_fields = ["vendor"]
