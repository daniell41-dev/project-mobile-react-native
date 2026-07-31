import XCTest

@testable import IndigoConnectivity

// Se compila y corre en CI sobre macos-latest (FASE 11, ios.yml) — no hay Mac local en
// este entorno para ejecutar XCTest. Ver docs/02-guia-deploy-y-ci.md.
final class IndigoConnectivityModuleTests: XCTestCase {

  func testReportsNoConnectionWhenNotConnected() {
    let state = connectivityState(isConnected: false, usesWifi: true, usesCellular: false)

    XCTAssertFalse(state.isConnected)
    XCTAssertEqual(state.type, "none")
  }

  func testReportsNoConnectionAsNoneEvenWhenATransportIsTechnicallyPresent() {
    // Caso real: hay interfaz Wi-Fi pero el path no está "satisfied" (portal cautivo,
    // sin datos) — isConnected manda sobre el tipo de interfaz.
    let state = connectivityState(isConnected: false, usesWifi: true, usesCellular: true)

    XCTAssertFalse(state.isConnected)
    XCTAssertEqual(state.type, "none")
  }

  func testReportsWifiWhenConnectedOverWifi() {
    let state = connectivityState(isConnected: true, usesWifi: true, usesCellular: false)

    XCTAssertTrue(state.isConnected)
    XCTAssertEqual(state.type, "wifi")
  }

  func testReportsCellularWhenConnectedOverCellular() {
    let state = connectivityState(isConnected: true, usesWifi: false, usesCellular: true)

    XCTAssertTrue(state.isConnected)
    XCTAssertEqual(state.type, "cellular")
  }

  func testPrefersWifiOverCellularWhenBothInterfacesAreReported() {
    let state = connectivityState(isConnected: true, usesWifi: true, usesCellular: true)

    XCTAssertTrue(state.isConnected)
    XCTAssertEqual(state.type, "wifi")
  }

  func testReportsUnknownWhenConnectedButNeitherWifiNorCellular() {
    let state = connectivityState(isConnected: true, usesWifi: false, usesCellular: false)

    XCTAssertTrue(state.isConnected)
    XCTAssertEqual(state.type, "unknown")
  }
}
