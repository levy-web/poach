package com.muguro.poach.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Receipt
import androidx.compose.ui.graphics.vector.ImageVector

sealed class BottomBarScreen(val route: String, val title: String, val icon: ImageVector) {
    data object Home : BottomBarScreen("home", "Home", Icons.Default.Home)
    data object Orders : BottomBarScreen("orders", "Orders", Icons.Default.Receipt)
    data object Account : BottomBarScreen("account", "Account", Icons.Default.Person)
}

val bottomBarScreens = listOf(BottomBarScreen.Home, BottomBarScreen.Orders, BottomBarScreen.Account)
