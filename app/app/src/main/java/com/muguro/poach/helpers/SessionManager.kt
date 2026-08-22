package com.muguro.poach.helpers

import com.muguro.poach.api.models.UserRole
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SessionManager @Inject constructor(private val preferenceUtil: PreferenceUtil) {

    companion object {
        private const val KEY_ACCESS_TOKEN = "access_token"
        private const val KEY_REFRESH_TOKEN = "refresh_token"
        private const val KEY_PHONE_NUMBER = "phone_number"
        private const val KEY_FULL_NAME = "full_name"
        private const val KEY_ROLE = "role"
    }

    // Observable rather than a plain getter: the bottom bar's whole tab set
    // is derived from it, so signing in (or an admin granting a role between
    // launches) has to move the UI without a restart.
    private val _role = MutableStateFlow(UserRole.fromApi(preferenceUtil.getString(KEY_ROLE)))
    val role: StateFlow<UserRole> = _role.asStateFlow()

    fun saveSession(
        access: String,
        refresh: String,
        phoneNumber: String,
        fullName: String,
        role: UserRole,
    ) {
        preferenceUtil.putString(KEY_ACCESS_TOKEN, access)
        preferenceUtil.putString(KEY_REFRESH_TOKEN, refresh)
        preferenceUtil.putString(KEY_PHONE_NUMBER, phoneNumber)
        preferenceUtil.putString(KEY_FULL_NAME, fullName)
        saveRole(role)
    }

    fun saveTokens(access: String, refresh: String) {
        preferenceUtil.putString(KEY_ACCESS_TOKEN, access)
        preferenceUtil.putString(KEY_REFRESH_TOKEN, refresh)
    }

    fun saveRole(role: UserRole) {
        preferenceUtil.putString(KEY_ROLE, role.apiValue)
        _role.value = role
    }

    fun getToken(): String? = preferenceUtil.getString(KEY_ACCESS_TOKEN)

    fun getRefreshToken(): String? = preferenceUtil.getString(KEY_REFRESH_TOKEN)

    fun getPhoneNumber(): String? = preferenceUtil.getString(KEY_PHONE_NUMBER)

    fun getFullName(): String? = preferenceUtil.getString(KEY_FULL_NAME)

    fun getRole(): UserRole = _role.value

    fun clearSession() {
        preferenceUtil.putString(KEY_ACCESS_TOKEN, null)
        preferenceUtil.putString(KEY_REFRESH_TOKEN, null)
        preferenceUtil.putString(KEY_PHONE_NUMBER, null)
        preferenceUtil.putString(KEY_FULL_NAME, null)
        // Back to the default so the next sign-in screen isn't rendered
        // behind a stale role's tab set.
        saveRole(UserRole.CUSTOMER)
    }

    fun isLoggedIn(): Boolean = getToken() != null
}
