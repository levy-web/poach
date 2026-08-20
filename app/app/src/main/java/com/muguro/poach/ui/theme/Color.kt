package com.muguro.poach.ui.theme

import androidx.compose.ui.graphics.Color

// "Hyperlocal Pulse" — light theme tokens, from the Kijiji Eats design system.
object LightPulse {
    val Primary = Color(0xFFA63B00)
    val OnPrimary = Color(0xFFFFFFFF)
    val PrimaryContainer = Color(0xFFF26522)
    val OnPrimaryContainer = Color(0xFF4F1800)
    val Secondary = Color(0xFF126C39)
    val OnSecondary = Color(0xFFFFFFFF)
    val SecondaryContainer = Color(0xFF9DF2B2)
    val OnSecondaryContainer = Color(0xFF19713D)
    val Tertiary = Color(0xFF725C00)
    val OnTertiary = Color(0xFFFFFFFF)
    val TertiaryContainer = Color(0xFFCCA700)
    val OnTertiaryContainer = Color(0xFF4D3E00)
    val Error = Color(0xFFBA1A1A)
    val OnError = Color(0xFFFFFFFF)
    val ErrorContainer = Color(0xFFFFDAD6)
    val OnErrorContainer = Color(0xFF93000A)
    val Background = Color(0xFFFCF9F8)
    val OnBackground = Color(0xFF1C1B1B)
    val Surface = Color(0xFFFCF9F8)
    val OnSurface = Color(0xFF1C1B1B)
    val SurfaceVariant = Color(0xFFE5E2E1)
    val OnSurfaceVariant = Color(0xFF594138)
    val SurfaceContainerLowest = Color(0xFFFFFFFF)
    val SurfaceContainerLow = Color(0xFFF6F3F2)
    val SurfaceContainer = Color(0xFFF0EDEC)
    val SurfaceContainerHigh = Color(0xFFEBE7E7)
    val SurfaceContainerHighest = Color(0xFFE5E2E1)
    val Outline = Color(0xFF8D7166)
    val OutlineVariant = Color(0xFFE1BFB3)
    val InverseSurface = Color(0xFF313030)
    val InverseOnSurface = Color(0xFFF3F0EF)
    val InversePrimary = Color(0xFFFFB599)
}

// "Hyperlocal Pulse Dark" — dark theme tokens.
object DarkPulse {
    // Zest Orange (primary-container in the raw tokens) used as the actual
    // primary accent — matches the reference screens exactly, which use this
    // more saturated orange for the wordmark/buttons/links, not the paler
    // peach the raw "primary" token alone would give.
    val Primary = Color(0xFFF26522)
    val OnPrimary = Color(0xFF4F1800)
    val PrimaryContainer = Color(0xFFF26522)
    val OnPrimaryContainer = Color(0xFF4F1800)
    val Secondary = Color(0xFF85D99A)
    val OnSecondary = Color(0xFF00391A)
    val SecondaryContainer = Color(0xFF016532)
    val OnSecondaryContainer = Color(0xFF8BE0A0)
    val Tertiary = Color(0xFFECC201)
    val OnTertiary = Color(0xFF3B2F00)
    val TertiaryContainer = Color(0xFFCCA700)
    val OnTertiaryContainer = Color(0xFF4D3E00)
    val Error = Color(0xFFFFB4AB)
    val OnError = Color(0xFF690005)
    val ErrorContainer = Color(0xFF93000A)
    val OnErrorContainer = Color(0xFFFFDAD6)
    val Background = Color(0xFF131313)
    val OnBackground = Color(0xFFE5E2E1)
    val Surface = Color(0xFF131313)
    val OnSurface = Color(0xFFF3F0EF)
    val SurfaceVariant = Color(0xFF353534)
    val OnSurfaceVariant = Color(0xFFB5A39D)
    val SurfaceContainerLowest = Color(0xFF0E0E0E)
    val SurfaceContainerLow = Color(0xFF1E1E1E)
    val SurfaceContainer = Color(0xFF252525)
    val SurfaceContainerHigh = Color(0xFF2C2C2C)
    val SurfaceContainerHighest = Color(0xFF353534)
    val Outline = Color(0xFFA88A7F)
    val OutlineVariant = Color(0xFF594138)
    val InverseSurface = Color(0xFFE5E2E1)
    val InverseOnSurface = Color(0xFF313030)
    val InversePrimary = Color(0xFFA63B00)
}
