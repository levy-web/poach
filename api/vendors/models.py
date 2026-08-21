from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from core.models import ABXMixin


class VendorProfile(ABXMixin, models.Model):
    """
    Attaches a vendor role to a User. A person becomes a vendor by having
    this profile, not by being a separate kind of account — matches the
    "roles as attachments" identity model used across the project.
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="vendor_profile",
    )
    zone = models.ForeignKey(
        "zones.Zone",
        on_delete=models.PROTECT,
        related_name="vendors",
    )

    business_name = models.CharField(max_length=150)
    # A registered Building rather than free text, so runners get the same
    # name/landmark/entry details they already use for deliveries, and a
    # vendor's pickup point can't drift out of sync with the buildings the
    # zone actually knows about.
    pickup_building = models.ForeignKey(
        "locations.Building",
        on_delete=models.PROTECT,
        related_name="vendors",
        null=True,
        blank=True,
        help_text="Registered building this vendor is collected from. Must be in the vendor's zone.",
    )

    # Overrides Zone.commission_pct when set. Leave blank to inherit the
    # zone's default rather than duplicating the same number per vendor.
    commission_pct = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Overrides the zone's default commission %% for this vendor specifically. Leave blank to inherit the zone default.",
    )

    is_approved = models.BooleanField(
        default=False,
        help_text="Vendor cannot list menu items or receive orders until admin approves.",
    )
    wallet_balance = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Accumulated earnings pending payout. Updated by the payments app, not edited directly here.",
    )

    class Meta:
        verbose_name = "Vendor Profile"
        verbose_name_plural = "Vendor Profiles"
        ordering = ["business_name"]

    def __str__(self):
        return self.business_name

    def effective_commission_pct(self):
        """Vendor-specific override if set, else the zone's default."""
        return self.commission_pct if self.commission_pct is not None else self.zone.commission_pct

    def clean(self):
        """
        A pickup building in a different zone would send runners to the wrong
        neighborhood, so the two have to agree. Enforced here as well as in
        the serializer, since the FK alone can't express the constraint.
        """
        super().clean()
        if (
            self.pickup_building_id
            and self.zone_id
            and self.pickup_building.zone_id != self.zone_id
        ):
            raise ValidationError(
                {"pickup_building": "The pickup building must be in the vendor's zone."}
            )


class MenuItem(ABXMixin, models.Model):
    """A single dish a vendor sells, with live availability."""

    vendor = models.ForeignKey(
        VendorProfile,
        on_delete=models.CASCADE,
        related_name="menu_items",
    )
    dish_name = models.CharField(max_length=100)
    description = models.CharField(max_length=255, blank=True)
    price = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    is_available = models.BooleanField(
        default=True,
        help_text="Vendor toggles this off when sold out — hides it from customer search immediately.",
    )

    class Meta:
        verbose_name = "Menu Item"
        verbose_name_plural = "Menu Items"
        ordering = ["dish_name"]
        constraints = [
            models.UniqueConstraint(
                fields=["vendor", "dish_name"],
                name="unique_dish_name_per_vendor",
            )
        ]

    def __str__(self):
        return f"{self.dish_name} — {self.vendor.business_name}"
