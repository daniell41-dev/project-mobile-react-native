package dev.daniell.indigo.modules.cardview

import android.content.Context
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicText
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView

private val DEFAULT_ACCENT_COLOR = Color(0xFF820AD1)

// Función de nivel de paquete (no un método privado) a propósito: la única lógica de
// esta vista que no necesita un árbol de Compose real para poder testearse — igual que
// mapBiometricErrorCode/isValidStorageKey en los módulos de las FASES 6 y 7.
internal fun parseAccentColor(hex: String): Color {
  val sanitized = hex.trim().removePrefix("#")
  if (sanitized.length != 6) return DEFAULT_ACCENT_COLOR

  return try {
    val rgb = sanitized.toLong(16)
    Color(
      red = ((rgb shr 16) and 0xFF).toInt(),
      green = ((rgb shr 8) and 0xFF).toInt(),
      blue = (rgb and 0xFF).toInt()
    )
  } catch (e: NumberFormatException) {
    DEFAULT_ACCENT_COLOR
  }
}

@Composable
private fun CardContent(
  holderName: String,
  last4: String,
  frozen: Boolean,
  accentColor: Color,
  onPress: () -> Unit
) {
  Box(
    modifier = Modifier
      .fillMaxSize()
      .clip(RoundedCornerShape(20.dp))
      .background(accentColor)
      .clickable(onClick = onPress)
      .padding(20.dp)
  ) {
    Column(modifier = Modifier.fillMaxSize(), verticalArrangement = Arrangement.SpaceBetween) {
      BasicText(
        text = "···· ···· ···· $last4",
        style = TextStyle(color = Color.White)
      )
      Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
        Column {
          BasicText(text = "Titular", style = TextStyle(color = Color.White.copy(alpha = 0.75f)))
          BasicText(text = holderName, style = TextStyle(color = Color.White))
        }
        if (frozen) {
          BasicText(text = "CONGELADA", style = TextStyle(color = Color.White))
        }
      }
    }
  }
}

class IndigoCardView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  val onPress by EventDispatcher<Unit>()

  // Sufijo "State" a propósito: `by mutableStateOf(...)` genera un setHolderName(String)
  // sintético para la propiedad delegada aunque sea `private` -- choca en JVM (mismo
  // nombre + firma, "platform declaration clash") con el setHolderName(String) público de
  // más abajo que exige ExpoView para el prop de Fabric. Confirmado real en CI:
  // ./gradlew compileDebugKotlin fallaba con ese clash antes de este rename.
  private var holderNameState by mutableStateOf("")
  private var last4State by mutableStateOf("")
  private var frozenState by mutableStateOf(false)
  private var accentColorState by mutableStateOf(DEFAULT_ACCENT_COLOR)

  private val composeView = ComposeView(context).apply {
    setContent {
      CardContent(
        holderName = holderNameState,
        last4 = last4State,
        frozen = frozenState,
        accentColor = accentColorState,
        onPress = { onPress(Unit) }
      )
    }
  }

  init {
    addView(composeView)
  }

  fun setHolderName(value: String) {
    holderNameState = value
  }

  fun setLast4(value: String) {
    last4State = value
  }

  fun setFrozen(value: Boolean) {
    frozenState = value
  }

  fun setAccentColor(value: String) {
    accentColorState = parseAccentColor(value)
  }
}
