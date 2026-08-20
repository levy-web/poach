from django.core.validators import MinValueValidator
from django.db import models

from core.models import ABXMixin


class Zone(ABXMixin, models.Model):
    """
    One operating area — a town, or the initial 1km neighborhood. Almost
    every other model (Building, VendorProfile, RunnerProfile, Order) FKs
    to this, so expanding to a new town is just adding a new Zone row plus
    the buildings/vendors/runners under it — not a new app or deployment.
    """

    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="e.g. 'Kilimani', 'Nakuru Town'",
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Inactive zones are hidden from search/signup but keep their historical data.",
    )

    # Optional per-zone override. Null = fall back to a global default
    # (e.g. a DEFAULT_DELIVERY_FEE setting) rather than duplicating the
    # same number into every zone row.
    delivery_fee = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        help_text="Flat delivery fee for this zone. Leave blank to use the platform default.",
    )
    commission_pct = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        help_text="Default vendor commission %% for this zone. A VendorProfile's own commission_pct, if set, overrides this.",
    )

    class Meta:
        verbose_name = "Zone"
        verbose_name_plural = "Zones"
        ordering = ["name"]

    def __str__(self):
        return self.name
