package dev.daniell.indigo.modules.biometrics

import androidx.biometric.BiometricManager
import androidx.biometric.BiometricManager.Authenticators.BIOMETRIC_STRONG
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import kotlinx.coroutines.suspendCancellableCoroutine

class BiometricsAvailability(
  @Field val available: Boolean,
  @Field val biometryType: String
) : Record

class BiometricsAuthResult(
  @Field val success: Boolean,
  @Field val error: String? = null
) : Record

// androidx.biometric no distingue huella de reconocimiento facial por API pública (a
// diferencia de LAContext.biometryType en iOS): "biometric" es genérico a propósito.
private const val BIOMETRY_TYPE = "biometric"

// Función de nivel de paquete (no un método privado de la clase) a propósito: así se
// puede testear con JUnit sin necesitar una instancia de Module ni mockear Android.
internal fun mapBiometricErrorCode(code: Int): String = when (code) {
  BiometricPrompt.ERROR_NO_BIOMETRICS,
  BiometricPrompt.ERROR_NO_DEVICE_CREDENTIAL -> "not_enrolled"
  BiometricPrompt.ERROR_HW_NOT_PRESENT,
  BiometricPrompt.ERROR_HW_UNAVAILABLE -> "not_available"
  BiometricPrompt.ERROR_USER_CANCELED,
  BiometricPrompt.ERROR_NEGATIVE_BUTTON -> "user_cancel"
  BiometricPrompt.ERROR_LOCKOUT,
  BiometricPrompt.ERROR_LOCKOUT_PERMANENT -> "lockout"
  else -> "unknown"
}

class IndigoBiometricsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("IndigoBiometrics")

    AsyncFunction("isAvailable") {
      checkAvailability()
    }

    AsyncFunction("authenticate") Coroutine { reason: String ->
      authenticate(reason)
    }
  }

  private fun checkAvailability(): BiometricsAvailability {
    val context = appContext.reactContext
      ?: return BiometricsAvailability(available = false, biometryType = "none")

    val canAuthenticate = BiometricManager.from(context).canAuthenticate(BIOMETRIC_STRONG)
    val available = canAuthenticate == BiometricManager.BIOMETRIC_SUCCESS

    return BiometricsAvailability(
      available = available,
      biometryType = if (available) BIOMETRY_TYPE else "none"
    )
  }

  private suspend fun authenticate(reason: String): BiometricsAuthResult {
    val activity = appContext.currentActivity as? FragmentActivity
      ?: return BiometricsAuthResult(success = false, error = "not_available")

    return suspendCancellableCoroutine { continuation ->
      val executor = ContextCompat.getMainExecutor(activity)
      val callback = object : BiometricPrompt.AuthenticationCallback() {
        override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
          if (continuation.isActive) {
            continuation.resumeWith(Result.success(BiometricsAuthResult(success = true)))
          }
        }

        override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
          if (continuation.isActive) {
            continuation.resumeWith(
              Result.success(
                BiometricsAuthResult(success = false, error = mapBiometricErrorCode(errorCode))
              )
            )
          }
        }

        override fun onAuthenticationFailed() {
          // Un intento no reconocido (huella/rostro no coincide). BiometricPrompt deja
          // reintentar solo, no es un error terminal: no resolvemos la coroutine aquí.
        }
      }

      val prompt = BiometricPrompt(activity, executor, callback)
      val promptInfo = BiometricPrompt.PromptInfo.Builder()
        .setTitle(reason)
        .setAllowedAuthenticators(BIOMETRIC_STRONG)
        .setNegativeButtonText("Cancelar")
        .build()

      continuation.invokeOnCancellation { prompt.cancelAuthentication() }
      prompt.authenticate(promptInfo)
    }
  }
}
