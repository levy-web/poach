package com.muguro.poach.ui.screens.main.composables

import androidx.compose.runtime.Composable

/**
 * Vendor's incoming orders. Waiting on the same orders endpoint as
 * [JobsScreen].
 */
@Composable
fun PlacedOrdersScreen() {
    PlaceholderScreen(
        title = "Placed orders",
        message = "Orders customers place with you will appear here.",
    )
}
