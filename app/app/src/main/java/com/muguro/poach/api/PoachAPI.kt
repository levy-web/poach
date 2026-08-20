package com.muguro.poach.api

import android.content.Context
import com.muguro.poach.api.models.AuthResponse
import com.muguro.poach.api.models.LoginRequest
import com.muguro.poach.api.models.LogoutRequest
import com.muguro.poach.api.models.RefreshRequest
import com.muguro.poach.api.models.RefreshResponse
import com.muguro.poach.api.models.RegisterConfirmRequest
import com.muguro.poach.api.models.RegisterRequest
import com.muguro.poach.api.models.ResendRequest
import com.muguro.poach.api.models.User
import com.muguro.poach.helpers.SessionManager
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import okhttp3.Authenticator
import okhttp3.Call
import okhttp3.Callback
import okhttp3.Interceptor
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import okhttp3.Route
import okhttp3.logging.HttpLoggingInterceptor
import java.io.IOException
import kotlin.coroutines.resume

class ApiException(message: String) : Exception(message)

/**
 * Hand-rolled client (no Retrofit) so token refresh can live in an OkHttp
 * Authenticator: a 401 transparently triggers one single-flight refresh
 * (synchronized so concurrent requests don't each fire their own refresh),
 * and an unrecoverable failure clears the session and notifies [onUnauthorized]
 * rather than surfacing as a normal request failure.
 */
class PoachAPI(context: Context, private val sessionManager: SessionManager) {

    companion object {
        // Android emulator's alias for the host machine's localhost. Swap to
        // your machine's LAN IP (and add it to the backend's ALLOWED_HOSTS)
        // to test against a physical device, e.g. "http://192.168.1.23:8000/api/auth/".
        private const val BASE_URL = "http://10.0.2.2:8000/api/auth/"
    }

    var onUnauthorized: (() -> Unit)? = null

    private val json = Json { ignoreUnknownKeys = true }
    private val jsonMediaType = "application/json".toMediaType()
    private val refreshLock = Any()

    // No authenticator attached — used only for the refresh call itself, so a
    // failed refresh can't recursively trigger another refresh attempt.
    private val refreshHttpClient = OkHttpClient.Builder().build()

    private val authInterceptor = Interceptor { chain ->
        val original = chain.request()
        val token = sessionManager.getToken()
        val request = if (token != null) {
            original.newBuilder().header("Authorization", "Bearer $token").build()
        } else {
            original
        }
        chain.proceed(request)
    }

    private val authenticator = Authenticator { _, response ->
        if (responseCount(response) >= 2) {
            sessionManager.clearSession()
            onUnauthorized?.invoke()
            return@Authenticator null
        }

        val requestToken = response.request.header("Authorization")?.removePrefix("Bearer ")
        val newAccessToken = synchronized(refreshLock) {
            val currentToken = sessionManager.getToken()
            // Another request may have already refreshed while we waited on the lock.
            if (currentToken != null && currentToken != requestToken) {
                currentToken
            } else {
                refreshAccessToken()
            }
        }

        if (newAccessToken == null) {
            sessionManager.clearSession()
            onUnauthorized?.invoke()
            null
        } else {
            response.request.newBuilder()
                .header("Authorization", "Bearer $newAccessToken")
                .build()
        }
    }

    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(authInterceptor)
        .addInterceptor(HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.BASIC })
        .authenticator(authenticator)
        .build()

    private fun responseCount(response: Response): Int {
        var count = 1
        var prior = response.priorResponse
        while (prior != null) {
            count++
            prior = prior.priorResponse
        }
        return count
    }

    private fun refreshAccessToken(): String? {
        val refreshToken = sessionManager.getRefreshToken() ?: return null
        val body = json.encodeToString(RefreshRequest.serializer(), RefreshRequest(refreshToken))
            .toRequestBody(jsonMediaType)
        val request = Request.Builder().url(BASE_URL + "token/refresh/").post(body).build()

        return try {
            refreshHttpClient.newCall(request).execute().use { response ->
                if (!response.isSuccessful) return null
                val parsed = json.decodeFromString(
                    RefreshResponse.serializer(),
                    response.body?.string().orEmpty(),
                )
                sessionManager.saveTokens(parsed.access, parsed.refresh)
                parsed.access
            }
        } catch (e: IOException) {
            null
        }
    }

    private fun extractErrorMessage(body: String): String {
        if (body.isBlank()) return "Something went wrong. Please try again."
        return try {
            val obj = json.parseToJsonElement(body).jsonObject
            obj["detail"]?.jsonPrimitive?.content
                ?: obj.values.firstOrNull()?.let { value ->
                    if (value is JsonArray) value.firstOrNull()?.jsonPrimitive?.content else null
                }
                ?: "Something went wrong. Please try again."
        } catch (e: Exception) {
            "Something went wrong. Please try again."
        }
    }

    private suspend inline fun <reified T> makeApiRequest(request: Request): Result<T> =
        suspendCancellableCoroutine { cont ->
            okHttpClient.newCall(request).enqueue(object : Callback {
                override fun onFailure(call: Call, e: IOException) {
                    cont.resume(Result.failure(e))
                }

                override fun onResponse(call: Call, response: Response) {
                    response.use {
                        val bodyString = it.body?.string().orEmpty()
                        if (it.isSuccessful) {
                            try {
                                cont.resume(Result.success(json.decodeFromString(bodyString)))
                            } catch (e: Exception) {
                                cont.resume(Result.failure(e))
                            }
                        } else {
                            cont.resume(Result.failure(ApiException(extractErrorMessage(bodyString))))
                        }
                    }
                }
            })
        }

    private suspend fun makeUnitApiRequest(request: Request): Result<Unit> =
        suspendCancellableCoroutine { cont ->
            okHttpClient.newCall(request).enqueue(object : Callback {
                override fun onFailure(call: Call, e: IOException) {
                    cont.resume(Result.failure(e))
                }

                override fun onResponse(call: Call, response: Response) {
                    response.use {
                        if (it.isSuccessful) {
                            cont.resume(Result.success(Unit))
                        } else {
                            val bodyString = it.body?.string().orEmpty()
                            cont.resume(Result.failure(ApiException(extractErrorMessage(bodyString))))
                        }
                    }
                }
            })
        }

    private fun <T> post(path: String, serializer: kotlinx.serialization.SerializationStrategy<T>, body: T): Request {
        val requestBody = json.encodeToString(serializer, body).toRequestBody(jsonMediaType)
        return Request.Builder().url(BASE_URL + path).post(requestBody).build()
    }

    suspend fun register(request: RegisterRequest): Result<Unit> =
        makeUnitApiRequest(post("register/", RegisterRequest.serializer(), request))

    suspend fun resendRegisterOtp(phoneNumber: String): Result<Unit> =
        makeUnitApiRequest(post("register/resend/", ResendRequest.serializer(), ResendRequest(phoneNumber)))

    suspend fun registerConfirm(request: RegisterConfirmRequest): Result<AuthResponse> =
        makeApiRequest(post("register/confirm/", RegisterConfirmRequest.serializer(), request))

    suspend fun login(request: LoginRequest): Result<AuthResponse> =
        makeApiRequest(post("login/", LoginRequest.serializer(), request))

    suspend fun logout(): Result<Unit> {
        val refreshToken = sessionManager.getRefreshToken()
            ?: return Result.failure(ApiException("Not logged in."))
        return makeUnitApiRequest(post("logout/", LogoutRequest.serializer(), LogoutRequest(refreshToken)))
    }

    suspend fun getMe(): Result<User> =
        makeApiRequest(Request.Builder().url(BASE_URL + "me/").get().build())
}
