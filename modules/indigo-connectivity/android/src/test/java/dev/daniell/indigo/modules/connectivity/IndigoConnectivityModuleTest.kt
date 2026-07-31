package dev.daniell.indigo.modules.connectivity

import org.junit.Assert.assertEquals
import org.junit.Test

class IndigoConnectivityModuleTest {

  @Test
  fun `reports no connection when there is no internet capability`() {
    val state = connectivityStateFrom(hasInternet = false, hasWifi = true, hasCellular = false)

    assertEquals(false, state.isConnected)
    assertEquals("none", state.type)
  }

  @Test
  fun `reports no connection as none even when a transport is technically present`() {
    // Un caso real: la red tiene transporte Wi-Fi pero no pasó la validación de
    // Internet (portal cautivo, sin datos) — hasInternet manda sobre el transporte.
    val state = connectivityStateFrom(hasInternet = false, hasWifi = true, hasCellular = true)

    assertEquals(false, state.isConnected)
    assertEquals("none", state.type)
  }

  @Test
  fun `reports wifi when connected over wifi`() {
    val state = connectivityStateFrom(hasInternet = true, hasWifi = true, hasCellular = false)

    assertEquals(true, state.isConnected)
    assertEquals("wifi", state.type)
  }

  @Test
  fun `reports cellular when connected over cellular`() {
    val state = connectivityStateFrom(hasInternet = true, hasWifi = false, hasCellular = true)

    assertEquals(true, state.isConnected)
    assertEquals("cellular", state.type)
  }

  @Test
  fun `prefers wifi over cellular when both transports are reported`() {
    val state = connectivityStateFrom(hasInternet = true, hasWifi = true, hasCellular = true)

    assertEquals(true, state.isConnected)
    assertEquals("wifi", state.type)
  }

  @Test
  fun `reports unknown when connected but neither wifi nor cellular (e_g_ ethernet, VPN)`() {
    val state = connectivityStateFrom(hasInternet = true, hasWifi = false, hasCellular = false)

    assertEquals(true, state.isConnected)
    assertEquals("unknown", state.type)
  }
}
