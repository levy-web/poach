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
import com.muguro.poach.ui.screens.main.composables.OrdersScreen

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

        composable(BottomBarScreen.Home.route) { HomeScreen() }
        composable(BottomBarScreen.Orders.route) { OrdersScreen() }
        composable(BottomBarScreen.Account.route) {
            AccountScreen(navController = navController)
        }
    }
}
