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
