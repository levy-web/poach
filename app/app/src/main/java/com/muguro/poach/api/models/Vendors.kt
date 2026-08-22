package com.muguro.poach.api.models

import kotlinx.serialization.Serializable

/**
 * A dish on a vendor's menu, as returned by `/api/vendors/menu-items/`.
 *
 * The list route only ever serves available dishes from approved vendors to
 * non-staff callers, so the customer app can render whatever it receives
 * without filtering again.
 */
@Serializable
data class MenuItem(
    val id: Int,
    val vendor: Int,
    val vendor_name: String,
    // Null until an admin assigns the vendor a pickup building; the zone is
    // always present, so the UI falls back to it.
    val vendor_building_name: String? = null,
    val vendor_zone_name: String? = null,
    val dish_name: String,
    val description: String = "",
    // DRF serializes DecimalField as a string ("350.00") — keep it as one so
    // no precision is lost before it's formatted for display.
    val price: String,
    val image: String? = null,
    val is_available: Boolean = true,
)
