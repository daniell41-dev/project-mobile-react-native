import SwiftUI
import XCTest

@testable import IndigoCardView

// Se compila y corre en CI sobre macos-latest (FASE 11, ios.yml) — no hay Mac local en
// este entorno para ejecutar XCTest. Ver docs/02-guia-deploy-y-ci.md.
final class IndigoCardViewTests: XCTestCase {

  func testParsesAValidHexColor() {
    XCTAssertEqual(parseAccentColor("#820AD1"), Color(red: Double(0x82) / 255, green: Double(0x0A) / 255, blue: Double(0xD1) / 255))
  }

  func testParsesAHexColorWithoutTheLeadingHash() {
    XCTAssertEqual(parseAccentColor("820AD1"), Color(red: Double(0x82) / 255, green: Double(0x0A) / 255, blue: Double(0xD1) / 255))
  }

  func testFallsBackToTheDefaultColorForInvalidInput() {
    let fallback = parseAccentColor("#820AD1")

    XCTAssertEqual(parseAccentColor(""), fallback)
    XCTAssertEqual(parseAccentColor("not-a-color"), fallback)
    XCTAssertEqual(parseAccentColor("#FFF"), fallback)
  }
}
