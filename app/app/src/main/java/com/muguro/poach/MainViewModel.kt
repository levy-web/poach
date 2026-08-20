package com.muguro.poach

import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import com.muguro.poach.api.PoachAPI
import com.muguro.poach.helpers.SessionManager
import com.muguro.poach.ui.navigation.BottomBarScreen
import com.muguro.poach.ui.navigation.Screens
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import javax.inject.Inject

@HiltViewModel
class MainViewModel @Inject constructor(
    private val sessionManager: SessionManager,
    poachApi: PoachAPI,
) : ViewModel() {

    val startDestination = mutableStateOf(
        if (sessionManager.isLoggedIn()) BottomBarScreen.Home.route else Screens.LoginScreen.route
    )

    private val _sessionExpired = MutableSharedFlow<Unit>(extraBufferCapacity = 1)
    val sessionExpired: SharedFlow<Unit> = _sessionExpired.asSharedFlow()

    init {
        poachApi.onUnauthorized = { _sessionExpired.tryEmit(Unit) }
    }
}
