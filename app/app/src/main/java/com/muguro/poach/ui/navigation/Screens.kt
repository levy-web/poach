package com.muguro.poach.ui.navigation

import java.net.URLEncoder

sealed class Screens(val route: String) {
    data object LoginScreen : Screens("login_screen")
    data object RegisterScreen : Screens("register_screen")

    data object RegisterConfirmScreen : Screens("register_confirm_screen/{phone}") {
        fun withArgs(phone: String) = "register_confirm_screen/${URLEncoder.encode(phone, "UTF-8")}"
    }
}
