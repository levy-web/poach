package com.muguro.poach

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import com.muguro.poach.ui.screens.main.MainScreen
import com.muguro.poach.ui.theme.PoachTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    private val mainViewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            val isDarkTheme = isSystemInDarkTheme()
            PoachTheme(darkTheme = isDarkTheme) {
                Surface(modifier = Modifier.fillMaxSize()) {
                    val startDestination by mainViewModel.startDestination
                    val role by mainViewModel.role.collectAsState()
                    MainScreen(
                        startDestination = startDestination,
                        sessionExpired = mainViewModel.sessionExpired,
                        role = role,
                        roleChanged = mainViewModel.roleChanged,
                        isDarkTheme = isDarkTheme,
                    )
                }
            }
        }
    }
}
