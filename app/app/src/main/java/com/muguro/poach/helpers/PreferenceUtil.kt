package com.muguro.poach.helpers

import android.content.Context
import android.content.SharedPreferences

class PreferenceUtil(context: Context) {
    private var prefs: SharedPreferences =
        context.getSharedPreferences("poach_settings", Context.MODE_PRIVATE)

    fun putString(key: String, value: String?) {
        prefs.edit().putString(key, value).apply()
    }

    fun getString(key: String, defValue: String? = null): String? =
        prefs.getString(key, defValue)

    fun putBoolean(key: String, value: Boolean) {
        prefs.edit().putBoolean(key, value).apply()
    }

    fun getBoolean(key: String, defValue: Boolean = false): Boolean =
        prefs.getBoolean(key, defValue)
}
