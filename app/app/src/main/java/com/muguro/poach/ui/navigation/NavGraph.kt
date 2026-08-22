package com.muguro.poach.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import androidx.navigation.NavType
import com.muguro.poach.ui.screens.auth.composables.LoginScreen
import com.muguro.poach.ui.screens.auth.composables.RegisterConfirmScreen
import com.muguro.poach.ui.screens.auth.composables.RegisterScreen
import com.muguro.poach.ui.screens.main.composables.AccountScreen
import com.muguro.poach.ui.screens.main.composables.HomeScreen
import com.muguro.poach.ui.screens.main.composables.JobsScreen
import com.muguro.poach.ui.screens.main.composables.OrdersScreen
import com.muguro.poach.ui.screens.main.composables.PlacedOrdersScreen
import com.muguro.poach.ui.screens.main.composables.WalletScreen

@Composable
fun NavGraph(
    startDestination: String,
    navController: NavHostController,
    isDarkTheme: Boolean,
) {
    NavHost(navController = navController, startDestination = startDestination) {
        composable(Screens.LoginScreen.route) { LoginScreen(navController, isDarkTheme) }
        composable(Screens.RegisterScreen.route) { RegisterScreen(navController, isDarkTheme) }
        composable(
            route = Screens.RegisterConfirmScreen.route,
            arguments = listOf(navArgument("phone") { type = NavType.StringType }),
        ) { backStackEntry ->
            val phone = backStackEntry.arguments?.getString("phone").orEmpty()
            RegisterConfirmScreen(phone = phone, navController = navController)
        }

        // Every role's routes are registered up front. Which of them a user
        // can reach is decided by the bottom bar (see tabsFor), not by the
        // graph — swapping the graph out on a role change would mean
        // rebuilding the NavHost underneath a live back stack.
        composable(BottomBarScreen.Home.route) { HomeScreen() }
        composable(BottomBarScreen.Orders.route) { OrdersScreen() }
        composable(BottomBarScreen.Account.route) {
            AccountScreen(navController = navController)
        }
        composable(BottomBarScreen.Jobs.route) { JobsScreen() }
        composable(BottomBarScreen.PlacedOrders.route) { PlacedOrdersScreen() }
        composable(BottomBarScreen.Wallet.route) {
            WalletScreen(navController = navController)
        }
    }
}
