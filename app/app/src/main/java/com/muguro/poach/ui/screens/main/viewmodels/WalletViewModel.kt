package com.muguro.poach.ui.screens.main.viewmodels

import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.muguro.poach.api.PoachAPI
import com.muguro.poach.api.models.RoleProfile
import com.muguro.poach.api.models.UserRole
import com.muguro.poach.helpers.SessionManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * The wallet reads from `/api/auth/me/` rather than a dedicated endpoint —
 * the profile it returns already carries the balance, and going back to it
 * on every visit means the number is never a stale copy from login.
 */
@HiltViewModel
class WalletViewModel @Inject constructor(
    private val poachApi: PoachAPI,
    private val sessionManager: SessionManager,
) : ViewModel() {

    val role = mutableStateOf(sessionManager.getRole())
    val profile = mutableStateOf<RoleProfile?>(null)
    val isLoading = mutableStateOf(true)
    val error = mutableStateOf<String?>(null)

    init {
        load()
    }

    fun load() {
        viewModelScope.launch {
            isLoading.value = true
            error.value = null
            poachApi.getMe()
                .onSuccess {
                    profile.value = it.role_profile
                    // The role can have changed since login; keep the local
                    // copy honest so Account/logout behave consistently.
                    val fresh = UserRole.fromApi(it.role)
                    role.value = fresh
                    sessionManager.saveRole(fresh)
                }
                .onFailure { error.value = it.message ?: "Couldn't load your wallet." }
            isLoading.value = false
        }
    }

    fun logout(onDone: () -> Unit) {
        viewModelScope.launch {
            // Same best-effort contract as AccountScreen: always clear the
            // local session even if blacklisting the token fails.
            poachApi.logout()
            sessionManager.clearSession()
            onDone()
        }
    }
}
