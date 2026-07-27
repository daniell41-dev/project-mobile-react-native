package dev.daniell.indigo.modules.cardview

import androidx.compose.ui.graphics.Color
import org.junit.Assert.assertEquals
import org.junit.Test

class IndigoCardViewTest {

  @Test
  fun `parses a valid hex color`() {
    assertEquals(Color(red = 0x82, green = 0x0A, blue = 0xD1), parseAccentColor("#820AD1"))
  }

  @Test
  fun `parses a hex color without the leading hash`() {
    assertEquals(Color(red = 0x82, green = 0x0A, blue = 0xD1), parseAccentColor("820AD1"))
  }

  @Test
  fun `falls back to the default color for invalid input`() {
    val fallback = parseAccentColor("#820AD1")

    assertEquals(fallback, parseAccentColor(""))
    assertEquals(fallback, parseAccentColor("not-a-color"))
    assertEquals(fallback, parseAccentColor("#FFF"))
  }
}
