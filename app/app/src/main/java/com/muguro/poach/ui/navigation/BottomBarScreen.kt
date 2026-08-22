package com.muguro.poach.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ReceiptLong
import androidx.compose.material.icons.filled.AccountBalanceWallet
import androidx.compose.material.icons.filled.DeliveryDining
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Storefront
import androidx.compose.ui.graphics.vector.ImageVector
import com.muguro.poach.api.models.UserRole

sealed class BottomBarScreen(val route: String, val title: String, val icon: ImageVector) {
    // Customer
    data object Home : BottomBarScreen("home", "Home", Icons.Default.Home)
    data object Orders : BottomBarScreen("orders", "Orders", Icons.AutoMirrored.Filled.ReceiptLong)
    data object Account : BottomBarScreen("account", "Account", Icons.Default.Person)

    // Runner
    data object Jobs : BottomBarScreen("jobs", "Jobs", Icons.Default.DeliveryDining)

    // Vendor — the orders customers have placed with them, distinct from the
    // customer's own "Orders" tab, hence a separate route.
    data object PlacedOrders : BottomBarScreen("placed_orders", "Orders", Icons.Default.Storefront)

    // Runner and vendor both.
    data object Wallet : BottomBarScreen("wallet", "Wallet", Icons.Default.AccountBalanceWallet)
}

/**
 * The tabs a role sees. Roles are mutually exclusive on the backend, so
 * these sets never need to be merged.
 */
fun tabsFor(role: UserRole): List<BottomBarScreen> = when (role) {
    UserRole.CUSTOMER -> listOf(BottomBarScreen.Home, BottomBarScreen.Orders, BottomBarScreen.Account)
    UserRole.RUNNER -> listOf(BottomBarScreen.Jobs, BottomBarScreen.Wallet)
    UserRole.VENDOR -> listOf(BottomBarScreen.PlacedOrders, BottomBarScreen.Wallet)
}

/** Where a role lands after signing in — its leftmost tab. */
fun homeRouteFor(role: UserRole): String = tabsFor(role).first().route
