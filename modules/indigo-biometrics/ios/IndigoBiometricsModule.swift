import ExpoModulesCore
import LocalAuthentication

struct BiometricsAvailability: Record {
  @Field
  var available: Bool = false
  @Field
  var biometryType: String = "none"
}

struct BiometricsAuthResult: Record {
  @Field
  var success: Bool = false
  @Field
  var error: String? = nil
}

public class IndigoBiometricsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("IndigoBiometrics")

    AsyncFunction("isAvailable") { () -> BiometricsAvailability in
      checkAvailability()
    }

    AsyncFunction("authenticate") { (reason: String) async -> BiometricsAuthResult in
      await authenticate(reason: reason)
    }
  }

  private func checkAvailability() -> BiometricsAvailability {
    let context = LAContext()
    var evaluationError: NSError?
    let available = context.canEvaluatePolicy(
      .deviceOwnerAuthenticationWithBiometrics,
      error: &evaluationError
    )

    return BiometricsAvailability(
      available: available,
      biometryType: available ? mapBiometryType(context.biometryType) : "none"
    )
  }

  private func authenticate(reason: String) async -> BiometricsAuthResult {
    let context = LAContext()
    var evaluationError: NSError?

    guard
      context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &evaluationError)
    else {
      return BiometricsAuthResult(success: false, error: "not_available")
    }

    // LocalAuthentication no tiene una API async/await nativa (a diferencia de
    // BiometricPrompt del lado Kotlin, que sí es callback + corrutina): se envuelve el
    // callback de evaluatePolicy en una continuation, el equivalente Swift.
    return await withCheckedContinuation { continuation in
      context.evaluatePolicy(
        .deviceOwnerAuthenticationWithBiometrics,
        localizedReason: reason
      ) { success, error in
        if success {
          continuation.resume(returning: BiometricsAuthResult(success: true))
          return
        }
        let code = (error as? LAError)?.code
        continuation.resume(
          returning: BiometricsAuthResult(success: false, error: mapBiometricErrorCode(code))
        )
      }
    }
  }
}

private func mapBiometryType(_ type: LABiometryType) -> String {
  switch type {
  case .faceID:
    return "faceId"
  case .touchID:
    return "touchId"
  default:
    return "none"
  }
}

// Función libre (no un método privado de la clase) a propósito: así se puede testear
// con XCTest sin necesitar una instancia de Module ni un contexto de LocalAuthentication.
func mapBiometricErrorCode(_ code: LAError.Code?) -> String {
  switch code {
  case .biometryNotEnrolled:
    return "not_enrolled"
  case .biometryNotAvailable, .biometryLockout:
    return code == .biometryLockout ? "lockout" : "not_available"
  case .userCancel, .systemCancel, .appCancel, .userFallback:
    return "user_cancel"
  default:
    return "unknown"
  }
}
