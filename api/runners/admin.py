from django.contrib import admin

from .models import RunnerProfile


@admin.register(RunnerProfile)
class RunnerProfileAdmin(admin.ModelAdmin):
    list_display = [
        "__str__",
        "zone",
        "is_approved",
        "is_online",
        "wallet_balance",
        "rating_avg",
        "rating_count",
    ]
    list_filter = ["zone", "is_approved", "is_online"]
    search_fields = ["user__phone_number", "user__full_name"]
    readonly_fields = ["wallet_balance", "rating_avg", "rating_count", "created_at", "updated_at"]
    autocomplete_fields = ["user"]
    actions = ["approve_runners"]

    @admin.action(description="Approve selected runners")
    def approve_runners(self, request, queryset):
        queryset.update(is_approved=True)
