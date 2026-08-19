from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import OTP, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ["-date_joined"]
    list_display = ["phone_number", "full_name", "is_phone_verified", "is_active", "date_joined"]
    list_filter = ["is_phone_verified", "is_active", "is_staff"]
    search_fields = ["phone_number", "full_name"]

    fieldsets = (
        (None, {"fields": ("phone_number", "password")}),
        ("Personal info", {"fields": ("full_name",)}),
        ("Status", {"fields": ("is_phone_verified", "is_active", "is_staff", "is_superuser")}),
        ("Permissions", {"fields": ("groups", "user_permissions")}),
        ("Important dates", {"fields": ("date_joined", "updated_at")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("phone_number", "password1", "password2"),
        }),
    )
    readonly_fields = ["date_joined", "updated_at"]


@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display = ["phone_number", "code", "purpose", "is_used", "verify_attempts", "created_at"]
    list_filter = ["purpose", "is_used"]
    search_fields = ["phone_number"]
    readonly_fields = ["created_at"]
