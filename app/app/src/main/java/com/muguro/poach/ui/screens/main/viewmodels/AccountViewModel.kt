package com.muguro.poach.ui.screens.main.viewmodels

import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.muguro.poach.api.PoachAPI
import com.muguro.poach.helpers.SessionManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AccountViewModel @Inject constructor(
    private val poachApi: PoachAPI,
    private val sessionManager: SessionManager,
) : ViewModel() {

    val fullName = mutableStateOf(sessionManager.getFullName().orEmpty())
    val phoneNumber = mutableStateOf(sessionManager.getPhoneNumber().orEmpty())
    val isLoggingOut = mutableStateOf(false)

    fun logout(onDone: () -> Unit) {
        viewModelScope.launch {
            isLoggingOut.value = true
            // Best-effort: blacklist server-side, but always clear the local
            // session and let the user out even if the request fails (e.g. no
            // network) — staying "logged in" with a dead session is worse.
            poachApi.logout()
            sessionManager.clearSession()
            isLoggingOut.value = false
            onDone()
        }
    }
}
