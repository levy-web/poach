package com.muguro.poach

import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.muguro.poach.api.PoachAPI
import com.muguro.poach.api.models.UserRole
import com.muguro.poach.helpers.SessionManager
import com.muguro.poach.ui.navigation.Screens
import com.muguro.poach.ui.navigation.homeRouteFor
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class MainViewModel @Inject constructor(
    private val sessionManager: SessionManager,
    private val poachApi: PoachAPI,
) : ViewModel() {

    // Seeded from the stored role so a resumed session lands on the right
    // tab immediately, without waiting on the network.
    val startDestination = mutableStateOf(
        if (sessionManager.isLoggedIn()) {
            homeRouteFor(sessionManager.getRole())
        } else {
            Screens.LoginScreen.route
        }
    )

    val role: StateFlow<UserRole> = sessionManager.role

    private val _sessionExpired = MutableSharedFlow<Unit>(extraBufferCapacity = 1)
    val sessionExpired: SharedFlow<Unit> = _sessionExpired.asSharedFlow()

    private val _roleChanged = MutableSharedFlow<UserRole>(extraBufferCapacity = 1)
    val roleChanged: SharedFlow<UserRole> = _roleChanged.asSharedFlow()

    init {
        poachApi.onUnauthorized = { _sessionExpired.tryEmit(Unit) }
        refreshRole()
    }

    /**
     * Roles are granted by an admin, not by the user, so the stored copy can
     * go stale between sign-ins. Re-checking on launch means someone
     * onboarded as a vendor since last time gets vendor tabs without having
     * to sign out and back in. A failure here is ignored: the stored role
     * stays in effect rather than dumping the user somewhere unexpected
     * because the network was down.
     */
    private fun refreshRole() {
        if (!sessionManager.isLoggedIn()) return
        viewModelScope.launch {
            poachApi.getMe().onSuccess { user ->
                val fresh = UserRole.fromApi(user.role)
                if (fresh != sessionManager.getRole()) {
                    sessionManager.saveRole(fresh)
                    _roleChanged.tryEmit(fresh)
                }
            }
        }
    }
}
