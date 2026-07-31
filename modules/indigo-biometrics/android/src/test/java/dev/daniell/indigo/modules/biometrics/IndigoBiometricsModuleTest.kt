package dev.daniell.indigo.modules.biometrics

import androidx.biometric.BiometricPrompt
import org.junit.Assert.assertEquals
import org.junit.Test

class IndigoBiometricsModuleTest {

  @Test
  fun `maps not enrolled errors`() {
    assertEquals("not_enrolled", mapBiometricErrorCode(BiometricPrompt.ERROR_NO_BIOMETRICS))
    assertEquals("not_enrolled", mapBiometricErrorCode(BiometricPrompt.ERROR_NO_DEVICE_CREDENTIAL))
  }

  @Test
  fun `maps hardware unavailable errors`() {
    assertEquals("not_available", mapBiometricErrorCode(BiometricPrompt.ERROR_HW_NOT_PRESENT))
    assertEquals("not_available", mapBiometricErrorCode(BiometricPrompt.ERROR_HW_UNAVAILABLE))
  }

  @Test
  fun `maps user cancellation errors`() {
    assertEquals("user_cancel", mapBiometricErrorCode(BiometricPrompt.ERROR_USER_CANCELED))
    assertEquals("user_cancel", mapBiometricErrorCode(BiometricPrompt.ERROR_NEGATIVE_BUTTON))
  }

  @Test
  fun `maps lockout errors`() {
    assertEquals("lockout", mapBiometricErrorCode(BiometricPrompt.ERROR_LOCKOUT))
    assertEquals("lockout", mapBiometricErrorCode(BiometricPrompt.ERROR_LOCKOUT_PERMANENT))
  }

  @Test
  fun `maps unrecognized codes to unknown`() {
    assertEquals("unknown", mapBiometricErrorCode(-1))
  }
}
