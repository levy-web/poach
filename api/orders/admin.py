from django.contrib import admin

from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ["dish_name", "unit_price", "quantity", "line_total"]
    can_delete = False

    def line_total(self, obj):
        return obj.line_total


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        "id", "customer", "vendor", "runner", "zone",
        "status", "total_amount", "created_at",
    ]
    list_filter = ["status", "zone", "vendor"]
    search_fields = ["id", "customer__phone_number", "vendor__business_name"]
    readonly_fields = [
        "subtotal", "delivery_fee", "accepted_at", "ready_at",
        "picked_up_at", "delivered_at", "cancelled_at",
        "created_at", "updated_at",
    ]
    autocomplete_fields = ["customer", "vendor", "runner", "delivery_location"]
    inlines = [OrderItemInline]

    def total_amount(self, obj):
        return obj.total_amount
