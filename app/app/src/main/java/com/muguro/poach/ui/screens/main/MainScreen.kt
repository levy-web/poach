package com.muguro.poach.ui.screens.main

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.muguro.poach.ui.navigation.NavGraph
import com.muguro.poach.ui.navigation.Screens
import com.muguro.poach.ui.navigation.bottomBarScreens
import kotlinx.coroutines.flow.SharedFlow

@Composable
fun MainScreen(
    startDestination: String,
    sessionExpired: SharedFlow<Unit>,
    isDarkTheme: Boolean,
) {
    val navController = rememberNavController()

    LaunchedEffect(sessionExpired) {
        sessionExpired.collect {
            navController.navigate(Screens.LoginScreen.route) {
                popUpTo(navController.graph.findStartDestination().id) { inclusive = true }
                launchSingleTop = true
            }
        }
    }

    Scaffold(bottomBar = { BottomBar(navController) }) { padding ->
        Box(modifier = Modifier.fillMaxSize().padding(padding)) {
            NavGraph(
                startDestination = startDestination,
                navController = navController,
                isDarkTheme = isDarkTheme,
            )
        }
    }
}

@Composable
private fun BottomBar(navController: NavHostController) {
    val backStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = backStackEntry?.destination
    val showBar = bottomBarScreens.any { screen ->
        currentRoute?.hierarchy?.any { it.route == screen.route } == true
    }

    AnimatedVisibility(
        visible = showBar,
        enter = slideInVertically(initialOffsetY = { it }),
        exit = slideOutVertically(targetOffsetY = { it }),
    ) {
        NavigationBar(containerColor = MaterialTheme.colorScheme.surface) {
            bottomBarScreens.forEach { screen ->
                val selected = currentRoute?.hierarchy?.any { it.route == screen.route } == true
                NavigationBarItem(
                    selected = selected,
                    onClick = {
                        navController.navigate(screen.route) {
                            popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    },
                    icon = { Icon(screen.icon, contentDescription = screen.title) },
                    label = { Text(screen.title) },
                    colors = androidx.compose.material3.NavigationBarItemDefaults.colors(
                        selectedIconColor = MaterialTheme.colorScheme.primary,
                        selectedTextColor = MaterialTheme.colorScheme.primary,
                        indicatorColor = MaterialTheme.colorScheme.surfaceVariant,
                    ),
                )
            }
        }
    }
}
