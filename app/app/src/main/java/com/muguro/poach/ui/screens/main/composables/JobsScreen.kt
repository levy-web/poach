package com.muguro.poach.ui.screens.main.composables

import androidx.compose.runtime.Composable

/**
 * Runner's delivery job feed. The Order model exists, but the orders app
 * has no views or URL routing yet, so there's nothing to list until the
 * ready-order endpoint lands.
 */
@Composable
fun JobsScreen() {
    PlaceholderScreen(
        title = "Jobs",
        message = "Delivery jobs will show up here once an order is marked ready for pickup.",
    )
}
