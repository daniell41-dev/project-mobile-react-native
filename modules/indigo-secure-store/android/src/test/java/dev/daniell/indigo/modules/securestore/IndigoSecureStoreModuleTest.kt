package dev.daniell.indigo.modules.securestore

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class IndigoSecureStoreModuleTest {

  @Test
  fun `rejects blank keys`() {
    assertFalse(isValidStorageKey(""))
    assertFalse(isValidStorageKey("   "))
  }

  @Test
  fun `accepts non blank keys`() {
    assertTrue(isValidStorageKey("indigo/auth-token"))
  }
}
