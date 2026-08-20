package com.muguro.poach.helpers

import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SessionManager @Inject constructor(private val preferenceUtil: PreferenceUtil) {

    companion object {
        private const val KEY_ACCESS_TOKEN = "access_token"
        private const val KEY_REFRESH_TOKEN = "refresh_token"
        private const val KEY_PHONE_NUMBER = "phone_number"
        private const val KEY_FULL_NAME = "full_name"
    }

    fun saveSession(access: String, refresh: String, phoneNumber: String, fullName: String) {
        preferenceUtil.putString(KEY_ACCESS_TOKEN, access)
        preferenceUtil.putString(KEY_REFRESH_TOKEN, refresh)
        preferenceUtil.putString(KEY_PHONE_NUMBER, phoneNumber)
        preferenceUtil.putString(KEY_FULL_NAME, fullName)
    }

    fun saveTokens(access: String, refresh: String) {
        preferenceUtil.putString(KEY_ACCESS_TOKEN, access)
        preferenceUtil.putString(KEY_REFRESH_TOKEN, refresh)
    }

    fun getToken(): String? = preferenceUtil.getString(KEY_ACCESS_TOKEN)

    fun getRefreshToken(): String? = preferenceUtil.getString(KEY_REFRESH_TOKEN)

    fun getPhoneNumber(): String? = preferenceUtil.getString(KEY_PHONE_NUMBER)

    fun getFullName(): String? = preferenceUtil.getString(KEY_FULL_NAME)

    fun clearSession() {
        preferenceUtil.putString(KEY_ACCESS_TOKEN, null)
        preferenceUtil.putString(KEY_REFRESH_TOKEN, null)
        preferenceUtil.putString(KEY_PHONE_NUMBER, null)
        preferenceUtil.putString(KEY_FULL_NAME, null)
    }

    fun isLoggedIn(): Boolean = getToken() != null
}
