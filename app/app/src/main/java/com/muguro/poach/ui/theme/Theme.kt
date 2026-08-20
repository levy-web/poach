package com.muguro.poach.ui.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp

private val LightColorScheme = lightColorScheme(
    primary = LightPulse.Primary,
    onPrimary = LightPulse.OnPrimary,
    primaryContainer = LightPulse.PrimaryContainer,
    onPrimaryContainer = LightPulse.OnPrimaryContainer,
    secondary = LightPulse.Secondary,
    onSecondary = LightPulse.OnSecondary,
    secondaryContainer = LightPulse.SecondaryContainer,
    onSecondaryContainer = LightPulse.OnSecondaryContainer,
    tertiary = LightPulse.Tertiary,
    onTertiary = LightPulse.OnTertiary,
    tertiaryContainer = LightPulse.TertiaryContainer,
    onTertiaryContainer = LightPulse.OnTertiaryContainer,
    error = LightPulse.Error,
    onError = LightPulse.OnError,
    errorContainer = LightPulse.ErrorContainer,
    onErrorContainer = LightPulse.OnErrorContainer,
    background = LightPulse.Background,
    onBackground = LightPulse.OnBackground,
    surface = LightPulse.Surface,
    onSurface = LightPulse.OnSurface,
    surfaceVariant = LightPulse.SurfaceVariant,
    onSurfaceVariant = LightPulse.OnSurfaceVariant,
    surfaceContainerLowest = LightPulse.SurfaceContainerLowest,
    surfaceContainerLow = LightPulse.SurfaceContainerLow,
    surfaceContainer = LightPulse.SurfaceContainer,
    surfaceContainerHigh = LightPulse.SurfaceContainerHigh,
    surfaceContainerHighest = LightPulse.SurfaceContainerHighest,
    outline = LightPulse.Outline,
    outlineVariant = LightPulse.OutlineVariant,
    inverseSurface = LightPulse.InverseSurface,
    inverseOnSurface = LightPulse.InverseOnSurface,
    inversePrimary = LightPulse.InversePrimary,
)

private val DarkColorScheme = darkColorScheme(
    primary = DarkPulse.Primary,
    onPrimary = DarkPulse.OnPrimary,
    primaryContainer = DarkPulse.PrimaryContainer,
    onPrimaryContainer = DarkPulse.OnPrimaryContainer,
    secondary = DarkPulse.Secondary,
    onSecondary = DarkPulse.OnSecondary,
    secondaryContainer = DarkPulse.SecondaryContainer,
    onSecondaryContainer = DarkPulse.OnSecondaryContainer,
    tertiary = DarkPulse.Tertiary,
    onTertiary = DarkPulse.OnTertiary,
    tertiaryContainer = DarkPulse.TertiaryContainer,
    onTertiaryContainer = DarkPulse.OnTertiaryContainer,
    error = DarkPulse.Error,
    onError = DarkPulse.OnError,
    errorContainer = DarkPulse.ErrorContainer,
    onErrorContainer = DarkPulse.OnErrorContainer,
    background = DarkPulse.Background,
    onBackground = DarkPulse.OnBackground,
    surface = DarkPulse.Surface,
    onSurface = DarkPulse.OnSurface,
    surfaceVariant = DarkPulse.SurfaceVariant,
    onSurfaceVariant = DarkPulse.OnSurfaceVariant,
    surfaceContainerLowest = DarkPulse.SurfaceContainerLowest,
    surfaceContainerLow = DarkPulse.SurfaceContainerLow,
    surfaceContainer = DarkPulse.SurfaceContainer,
    surfaceContainerHigh = DarkPulse.SurfaceContainerHigh,
    surfaceContainerHighest = DarkPulse.SurfaceContainerHighest,
    outline = DarkPulse.Outline,
    outlineVariant = DarkPulse.OutlineVariant,
    inverseSurface = DarkPulse.InverseSurface,
    inverseOnSurface = DarkPulse.InverseOnSurface,
    inversePrimary = DarkPulse.InversePrimary,
)

// rounded.sm/DEFAULT/md/lg/xl from the design tokens (4/8/12/16/24dp).
val PoachShapes = Shapes(
    extraSmall = RoundedCornerShape(4.dp),
    small = RoundedCornerShape(8.dp),
    medium = RoundedCornerShape(12.dp),
    large = RoundedCornerShape(16.dp),
    extraLarge = RoundedCornerShape(24.dp),
)

@Composable
fun PoachTheme(darkTheme: Boolean, content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme,
        typography = Typography,
        shapes = PoachShapes,
        content = content,
    )
}
