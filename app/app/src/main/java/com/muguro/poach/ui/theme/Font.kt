package com.muguro.poach.ui.theme

import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.googlefonts.Font
import androidx.compose.ui.text.googlefonts.GoogleFont

private val fontProvider = GoogleFont.Provider(
    providerAuthority = "com.google.android.gms.fonts",
    providerPackage = "com.google.android.gms",
    certificates = com.muguro.poach.R.array.com_google_android_gms_fonts_certs,
)

private fun googleFontFamily(name: String) = FontFamily(
    Font(googleFont = GoogleFont(name), fontProvider = fontProvider, weight = FontWeight.Normal),
    Font(googleFont = GoogleFont(name), fontProvider = fontProvider, weight = FontWeight.Medium),
    Font(googleFont = GoogleFont(name), fontProvider = fontProvider, weight = FontWeight.SemiBold),
    Font(googleFont = GoogleFont(name), fontProvider = fontProvider, weight = FontWeight.Bold),
)

// Headlines — vendor names, section titles.
val PlusJakartaSans = googleFontFamily("Plus Jakarta Sans")

// Body/UI text.
val WorkSans = googleFontFamily("Work Sans")

// Prices, ETAs, ratings — the "data layer" per the design system.
val JetBrainsMono = googleFontFamily("JetBrains Mono")
