import LocalAuthentication
import XCTest

@testable import IndigoBiometrics

// Se compila y corre en CI sobre macos-latest (FASE 11, ios.yml) — no hay Mac local en
// este entorno para ejecutar XCTest. Ver docs/02-guia-deploy-y-ci.md.
final class IndigoBiometricsModuleTests: XCTestCase {

  func testMapsNotEnrolledError() {
    XCTAssertEqual(mapBiometricErrorCode(.biometryNotEnrolled), "not_enrolled")
  }

  func testMapsUnavailableErrors() {
    XCTAssertEqual(mapBiometricErrorCode(.biometryNotAvailable), "not_available")
  }

  func testMapsLockoutError() {
    XCTAssertEqual(mapBiometricErrorCode(.biometryLockout), "lockout")
  }

  func testMapsCancellationErrors() {
    XCTAssertEqual(mapBiometricErrorCode(.userCancel), "user_cancel")
    XCTAssertEqual(mapBiometricErrorCode(.systemCancel), "user_cancel")
    XCTAssertEqual(mapBiometricErrorCode(.appCancel), "user_cancel")
    XCTAssertEqual(mapBiometricErrorCode(.userFallback), "user_cancel")
  }

  func testMapsMissingCodeToUnknown() {
    XCTAssertEqual(mapBiometricErrorCode(nil), "unknown")
  }
}
