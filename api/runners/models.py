from django.conf import settings
from django.db import models

from core.models import ABXMixin


class RunnerProfile(ABXMixin, models.Model):
    """
    Attaches the runner (courier) role to a User. A person becomes a
    runner by having this profile — same "roles as attachments" pattern
    used by VendorProfile.
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="runner_profile",
    )
    zone = models.ForeignKey(
        "zones.Zone",
        on_delete=models.PROTECT,
        related_name="runners",
    )

    is_approved = models.BooleanField(
        default=False,
        help_text="Runner cannot go online or claim jobs until admin approves.",
    )
    is_online = models.BooleanField(
        default=False,
        help_text="Toggled by the runner in-app. Only online, approved runners see the ready-order job list.",
    )

    wallet_balance = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Accumulated delivery-fee earnings pending payout. Written to by the payments app only.",
    )

    # Cached rating summary rather than recomputing an average from Rating
    # rows on every read. Updated by the orders/ratings logic whenever a
    # new Rating targeting this runner is created.
    rating_avg = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Cached average rating (e.g. 4.80). Null until the runner has at least one rating.",
    )
    rating_count = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = "Runner Profile"
        verbose_name_plural = "Runner Profiles"
        ordering = ["-created_at"]

    def __str__(self):
        return self.user.full_name or self.user.phone_number

    @property
    def is_available_for_jobs(self):
        """Convenience check used when building the ready-order job list."""
        return self.is_approved and self.is_online
