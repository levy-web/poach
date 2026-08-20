from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone

from core.models import ABXMixin


class Order(ABXMixin, models.Model):
    """
    The hub model — ties customer, vendor, runner, zone, and delivery
    location together, and drives the status state machine that both the
    vendor app (accept/prepare/ready) and the runner app (claim/pickup/
    deliver) key off of.

    Runner starts null: an order has no runner until one claims it after
    the vendor marks it ready (pull-based assignment, not auto-dispatch).
    """

    class Status(models.TextChoices):
        PLACED = "placed", "Placed"
        ACCEPTED = "accepted", "Accepted"
        PREPARING = "preparing", "Preparing"
        READY = "ready", "Ready"              # unlocks runner job list
        PICKED_UP = "picked_up", "Picked up"
        DELIVERED = "delivered", "Delivered"
        CANCELLED = "cancelled", "Cancelled"

    # Valid forward transitions. Cancellation is allowed from any
    # non-terminal state and is handled separately in cancel(), not listed
    # here, so this dict only expresses the "happy path" sequence.
    _TRANSITIONS = {
        Status.PLACED: Status.ACCEPTED,
        Status.ACCEPTED: Status.PREPARING,
        Status.PREPARING: Status.READY,
        Status.READY: Status.PICKED_UP,
        Status.PICKED_UP: Status.DELIVERED,
    }

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="orders",
    )
    vendor = models.ForeignKey(
        "vendors.VendorProfile",
        on_delete=models.PROTECT,
        related_name="orders",
    )
    runner = models.ForeignKey(
        "runners.RunnerProfile",
        on_delete=models.PROTECT,
        related_name="orders",
        null=True,
        blank=True,
        help_text="Null until a runner claims this order after it's marked ready.",
    )
    zone = models.ForeignKey(
        "zones.Zone",
        on_delete=models.PROTECT,
        related_name="orders",
    )
    delivery_location = models.ForeignKey(
        "locations.DeliveryLocation",
        on_delete=models.PROTECT,
        related_name="orders",
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PLACED,
    )

    subtotal = models.DecimalField(
        max_digits=10, decimal_places=2,
        help_text="Sum of order items at time of order — snapshot, not live menu prices.",
    )
    delivery_fee = models.DecimalField(max_digits=8, decimal_places=2)

    # Status timeline. Each is set the moment the corresponding transition
    # happens — gives you delivery-time analytics for free without a
    # separate event log table.
    accepted_at = models.DateTimeField(null=True, blank=True)
    ready_at = models.DateTimeField(null=True, blank=True)
    picked_up_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.CharField(max_length=255, blank=True)

    class Meta:
        verbose_name = "Order"
        verbose_name_plural = "Orders"
        ordering = ["-created_at"]
        indexes = [
            # Powers the runner job list: "ready orders in my zone, unclaimed"
            models.Index(fields=["zone", "status"]),
        ]

    def __str__(self):
        return f"Order #{self.pk} — {self.status}"

    @property
    def total_amount(self):
        return self.subtotal + self.delivery_fee

    # --- State machine -------------------------------------------------

    def _transition(self, expected_current, next_status, timestamp_field=None):
        if self.status != expected_current:
            raise ValidationError(
                f"Cannot move to '{next_status}' from '{self.status}' "
                f"(expected '{expected_current}')."
            )
        self.status = next_status
        update_fields = ["status", "updated_at"]
        if timestamp_field:
            setattr(self, timestamp_field, timezone.now())
            update_fields.append(timestamp_field)
        self.save(update_fields=update_fields)

    def accept(self):
        """Vendor confirms they'll make this order."""
        self._transition(self.Status.PLACED, self.Status.ACCEPTED, "accepted_at")

    def start_preparing(self):
        """Vendor begins cooking/assembling the order."""
        self._transition(self.Status.ACCEPTED, self.Status.PREPARING)

    def mark_ready(self):
        """
        Vendor marks the order ready. This is the single event that
        exposes the order to the runner job list — no separate "notify
        runner" step, per the pull-based assignment design.
        """
        self._transition(self.Status.PREPARING, self.Status.READY, "ready_at")

    def claim(self, runner_profile):
        """
        A runner claims a ready order. Must be atomic at the call site
        (wrap in select_for_update / a transaction) so two runners can't
        both claim the same order — first request wins, the loser gets a
        'no longer available' response.
        """
        if self.status != self.Status.READY:
            raise ValidationError("Only orders with status 'ready' can be claimed.")
        if self.runner_id is not None:
            raise ValidationError("Order already claimed by another runner.")
        self.runner = runner_profile
        self.status = self.Status.PICKED_UP
        self.picked_up_at = timezone.now()
        self.save(update_fields=["runner", "status", "picked_up_at", "updated_at"])

    def mark_delivered(self):
        """Runner confirms delivery to the customer."""
        self._transition(self.Status.PICKED_UP, self.Status.DELIVERED, "delivered_at")

    def cancel(self, reason=""):
        """Allowed from any state before pickup — not after food is in transit."""
        if self.status in (self.Status.PICKED_UP, self.Status.DELIVERED, self.Status.CANCELLED):
            raise ValidationError(f"Cannot cancel an order that is already '{self.status}'.")
        self.status = self.Status.CANCELLED
        self.cancelled_at = timezone.now()
        self.cancellation_reason = reason
        self.save(update_fields=["status", "cancelled_at", "cancellation_reason", "updated_at"])


class OrderItem(models.Model):
    """
    One line item within an order. Snapshots the dish name and price at
    order time — if a vendor changes a MenuItem's price tomorrow, past
    orders must still reflect what the customer actually paid.
    """

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
    )
    menu_item = models.ForeignKey(
        "vendors.MenuItem",
        on_delete=models.PROTECT,
        related_name="order_items",
    )
    dish_name = models.CharField(max_length=100, help_text="Snapshot of MenuItem.dish_name at order time.")
    unit_price = models.DecimalField(
        max_digits=8, decimal_places=2,
        help_text="Snapshot of MenuItem.price at order time.",
    )
    quantity = models.PositiveSmallIntegerField(
        default=1,
        validators=[MinValueValidator(1)],
    )

    class Meta:
        verbose_name = "Order Item"
        verbose_name_plural = "Order Items"

    def __str__(self):
        return f"{self.quantity}x {self.dish_name}"

    @property
    def line_total(self):
        return self.unit_price * self.quantity
