package com.muguro.poach.ui.screens.main.composables

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.muguro.poach.ui.navigation.Screens
import com.muguro.poach.ui.screens.main.viewmodels.AccountViewModel

@Composable
fun AccountScreen(
    navController: NavController,
    viewModel: AccountViewModel = hiltViewModel(),
) {
    Scaffold(containerColor = MaterialTheme.colorScheme.background) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(24.dp),
        ) {
            Text(
                viewModel.fullName.value,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground,
            )
            Text(
                viewModel.phoneNumber.value,
                color = MaterialTheme.colorScheme.onBackground,
                modifier = Modifier.padding(bottom = 24.dp),
            )

            HorizontalDivider(
                color = MaterialTheme.colorScheme.outlineVariant,
                modifier = Modifier.padding(bottom = 16.dp),
            )

            Button(
                onClick = {
                    viewModel.logout {
                        navController.navigate(Screens.LoginScreen.route) {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                },
                enabled = !viewModel.isLoggingOut.value,
                shape = MaterialTheme.shapes.large,
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(54.dp),
            ) {
                if (viewModel.isLoggingOut.value) {
                    CircularProgressIndicator(
                        color = MaterialTheme.colorScheme.onPrimary,
                        modifier = Modifier.height(24.dp),
                    )
                } else {
                    Text("Log out", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
