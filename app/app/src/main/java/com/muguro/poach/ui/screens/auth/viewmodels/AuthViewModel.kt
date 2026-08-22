package com.muguro.poach.ui.screens.auth.viewmodels

import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.muguro.poach.api.PoachAPI
import com.muguro.poach.api.models.AuthResponse
import com.muguro.poach.api.models.LoginRequest
import com.muguro.poach.api.models.RegisterConfirmRequest
import com.muguro.poach.api.models.RegisterRequest
import com.muguro.poach.api.models.UserRole
import com.muguro.poach.helpers.SessionManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val poachApi: PoachAPI,
    private val sessionManager: SessionManager,
) : ViewModel() {

    // --- Login ---
    var loginPhone = mutableStateOf("")
    var loginPassword = mutableStateOf("")
    var isLoading = mutableStateOf(false)
    var error = mutableStateOf<String?>(null)

    fun login(onSuccess: (UserRole) -> Unit) {
        viewModelScope.launch {
            isLoading.value = true
            error.value = null
            poachApi.login(LoginRequest(loginPhone.value.trim(), loginPassword.value))
                .onSuccess { onSuccess(saveAuthSession(it)) }
                .onFailure { error.value = it.message }
            isLoading.value = false
        }
    }

    // --- Register (step 1) ---
    var registerFullName = mutableStateOf("")
    var registerPhone = mutableStateOf("")
    var registerPassword = mutableStateOf("")
    var registerLoading = mutableStateOf(false)
    var registerError = mutableStateOf<String?>(null)

    fun register(onSuccess: () -> Unit) {
        viewModelScope.launch {
            registerLoading.value = true
            registerError.value = null
            poachApi.register(
                RegisterRequest(
                    phone_number = registerPhone.value.trim(),
                    full_name = registerFullName.value.trim(),
                    password = registerPassword.value,
                )
            )
                .onSuccess { onSuccess() }
                .onFailure { registerError.value = it.message }
            registerLoading.value = false
        }
    }

    // --- Register confirm (OTP) ---
    var confirmationCode = mutableStateOf("")
    var confirmLoading = mutableStateOf(false)
    var confirmError = mutableStateOf<String?>(null)
    var resendLoading = mutableStateOf(false)
    var resendMessage = mutableStateOf<String?>(null)

    fun confirmRegister(phone: String, onSuccess: (UserRole) -> Unit) {
        viewModelScope.launch {
            confirmLoading.value = true
            confirmError.value = null
            poachApi.registerConfirm(RegisterConfirmRequest(phone, confirmationCode.value.trim()))
                .onSuccess { onSuccess(saveAuthSession(it)) }
                .onFailure { confirmError.value = it.message }
            confirmLoading.value = false
        }
    }

    fun resendRegisterOtp(phone: String) {
        viewModelScope.launch {
            resendLoading.value = true
            confirmError.value = null
            resendMessage.value = null
            poachApi.resendRegisterOtp(phone)
                .onSuccess { resendMessage.value = "Code resent." }
                .onFailure { confirmError.value = it.message }
            resendLoading.value = false
        }
    }

    // Returns the role so the caller can route to that role's home; the
    // login response already carries it, so there's no second round trip.
    private fun saveAuthSession(auth: AuthResponse): UserRole {
        val role = UserRole.fromApi(auth.user.role)
        sessionManager.saveSession(
            access = auth.access,
            refresh = auth.refresh,
            phoneNumber = auth.user.phone_number,
            fullName = auth.user.full_name,
            role = role,
        )
        return role
    }
}
