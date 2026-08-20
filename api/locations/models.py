from django.conf import settings
from django.db import models

from core.models import ABXMixin


class Building(ABXMixin, models.Model):
    """
    An admin-registered building/estate/compound within a Zone. No GPS
    coordinates by design — delivery is done on foot by runners who know
    the neighborhood, using the name and landmark description, plus a
    house/unit number supplied at order time.
    """

    zone = models.ForeignKey(
        "zones.Zone",
        on_delete=models.PROTECT,
        related_name="buildings",
    )
    name = models.CharField(
        max_length=150,
        help_text="e.g. 'Green Court Apartments'",
    )
    landmark = models.CharField(
        max_length=255,
        blank=True,
        help_text="e.g. 'Opposite the green kiosk, blue gate'",
    )
    entry_details = models.CharField(
        max_length=255,
        blank=True,
        help_text="e.g. gate/security details for gated compounds",
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Deactivate rather than delete if a building is mis-registered or no longer valid.",
    )

    class Meta:
        verbose_name = "Building"
        verbose_name_plural = "Buildings"
        ordering = ["zone", "name"]
        constraints = [
            models.UniqueConstraint(
                fields=["zone", "name"],
                name="unique_building_name_per_zone",
            )
        ]

    def __str__(self):
        return f"{self.name} ({self.zone.name})"


class DeliveryLocation(models.Model):
    """
    A customer's saved delivery point: a registered Building plus a
    house/unit number they typed in. Reused across multiple future orders
    once saved, so customers don't retype it every time.
    """

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="delivery_locations",
    )
    building = models.ForeignKey(
        Building,
        on_delete=models.PROTECT,
        related_name="delivery_locations",
    )
    unit_number = models.CharField(
        max_length=50,
        blank=True,
        help_text="e.g. 'House 12', 'Flat 3B'",
    )
    label = models.CharField(
        max_length=50,
        default="Home",
        help_text="Customer-facing label, e.g. 'Home', 'Work'",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Delivery Location"
        verbose_name_plural = "Delivery Locations"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.label}: {self.building.name} {self.unit_number}".strip()
