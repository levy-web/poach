package com.muguro.poach.api.models

/**
 * Which set of tabs a signed-in person gets. The backend guarantees exactly
 * one role per account (a user can't hold both a vendor and a runner
 * profile), so this is a plain enum rather than a set.
 */
enum class UserRole(val apiValue: String) {
    CUSTOMER("customer"),
    VENDOR("vendor"),
    RUNNER("runner");

    companion object {
        /** Unknown or missing values fall back to the least-privileged role. */
        fun fromApi(value: String?): UserRole =
            entries.firstOrNull { it.apiValue == value } ?: CUSTOMER
    }
}
