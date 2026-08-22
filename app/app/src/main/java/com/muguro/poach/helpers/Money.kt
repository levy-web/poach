package com.muguro.poach.helpers

import java.math.BigDecimal
import java.text.DecimalFormat
import java.text.DecimalFormatSymbols
import java.util.Locale

/**
 * Formats one of the API's decimal-string money values for display.
 *
 * Listing prices drop a trailing ".00" the way the design system's price
 * labels do; balances keep both decimal places, since a wallet reading
 * "KSh 0" instead of "KSh 0.00" looks like a rendering bug.
 */
fun formatKsh(raw: String, alwaysCents: Boolean = false): String {
    val amount = raw.toBigDecimalOrNull() ?: return raw
    val trimmed = if (alwaysCents) amount else amount.stripTrailingZeros()
    val pattern = if (!alwaysCents && trimmed.scale() <= 0) "#,##0" else "#,##0.00"
    val format = DecimalFormat(pattern, DecimalFormatSymbols(Locale.US))
    return "KSh ${format.format(trimmed.max(BigDecimal.ZERO))}"
}
