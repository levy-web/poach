package com.muguro.poach.api.models

import kotlinx.serialization.Serializable

@Serializable
data class RegisterRequest(
    val phone_number: String,
    val full_name: String,
    val password: String,
)

@Serializable
data class RegisterConfirmRequest(
    val phone_number: String,
    val code: String,
)

@Serializable
data class ResendRequest(
    val phone_number: String,
)

@Serializable
data class LoginRequest(
    val phone_number: String,
    val password: String,
)

@Serializable
data class RefreshRequest(
    val refresh: String,
)

@Serializable
data class RefreshResponse(
    val access: String,
    val refresh: String,
)

@Serializable
data class LogoutRequest(
    val refresh: String,
)

@Serializable
data class User(
    val id: Int,
    val phone_number: String,
    val full_name: String,
    val is_phone_verified: Boolean,
    // "customer" | "vendor" | "runner" — see UserRole.
    val role: String = UserRole.CUSTOMER.apiValue,
    val role_profile: RoleProfile? = null,
)

/**
 * The vendor's or runner's own record, sent alongside the user. Null for
 * customers, who have no profile. One class covers both roles because the
 * fields they don't share are absent rather than conflicting.
 */
@Serializable
data class RoleProfile(
    val id: Int,
    // Vendor only.
    val business_name: String? = null,
    val zone_name: String? = null,
    val is_approved: Boolean = false,
    // Runner only.
    val is_online: Boolean? = null,
    // Decimal string, matching every money field in the API.
    val wallet_balance: String = "0.00",
    val rating_avg: String? = null,
    val rating_count: Int = 0,
)

@Serializable
data class AuthResponse(
    val access: String,
    val refresh: String,
    val user: User,
)

@Serializable
data class DetailResponse(
    val detail: String,
)
