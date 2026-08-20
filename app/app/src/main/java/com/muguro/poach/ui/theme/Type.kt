package com.muguro.poach.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

// Maps the design system's headline-lg/md, body-lg/md, label-caps, label-price
// styles onto Material3's Typography slots.
val Typography = Typography(
    headlineLarge = TextStyle(
        fontFamily = PlusJakartaSans,
        fontWeight = FontWeight.Bold,
        fontSize = 28.sp,
        lineHeight = 34.sp,
        letterSpacing = (-0.02).sp,
    ),
    headlineMedium = TextStyle(
        fontFamily = PlusJakartaSans,
        fontWeight = FontWeight.SemiBold,
        fontSize = 22.sp,
        lineHeight = 28.sp,
    ),
    bodyLarge = TextStyle(
        fontFamily = WorkSans,
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp,
        lineHeight = 24.sp,
    ),
    bodyMedium = TextStyle(
        fontFamily = WorkSans,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp,
        lineHeight = 20.sp,
    ),
    labelSmall = TextStyle(
        fontFamily = WorkSans,
        fontWeight = FontWeight.Bold,
        fontSize = 11.sp,
        lineHeight = 12.sp,
        letterSpacing = 0.05.sp,
    ),
    // Button/tab labels — NOT the design system's monospaced "label-price"
    // style (that's JetBrainsMono, applied directly wherever prices/ETAs are
    // shown later; using it here would make every button read in monospace).
    labelLarge = TextStyle(
        fontFamily = WorkSans,
        fontWeight = FontWeight.Bold,
        fontSize = 14.sp,
        lineHeight = 20.sp,
        letterSpacing = 0.1.sp,
    ),
    labelMedium = TextStyle(
        fontFamily = WorkSans,
        fontWeight = FontWeight.Medium,
        fontSize = 12.sp,
        lineHeight = 16.sp,
    ),
)

// The design system's "data layer" style — prices, ETAs, ratings. Apply
// directly (style = PriceLabel) wherever those show up; not a Material3
// Typography slot since nothing maps onto it cleanly without colliding with
// button/tab labels.
val PriceLabel = TextStyle(
    fontFamily = JetBrainsMono,
    fontWeight = FontWeight.SemiBold,
    fontSize = 18.sp,
    lineHeight = 18.sp,
    letterSpacing = (-0.05).sp,
)
