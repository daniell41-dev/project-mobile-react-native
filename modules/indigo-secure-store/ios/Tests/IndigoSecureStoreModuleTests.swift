import XCTest

@testable import IndigoSecureStore

// Se compila y corre en CI sobre macos-latest (FASE 11, ios.yml) — no hay Mac local en
// este entorno para ejecutar XCTest. Ver docs/02-guia-deploy-y-ci.md.
final class IndigoSecureStoreModuleTests: XCTestCase {

  func testRejectsBlankKeys() {
    XCTAssertFalse(isValidStorageKey(""))
    XCTAssertFalse(isValidStorageKey("   "))
  }

  func testAcceptsNonBlankKeys() {
    XCTAssertTrue(isValidStorageKey("indigo/auth-token"))
  }
}
