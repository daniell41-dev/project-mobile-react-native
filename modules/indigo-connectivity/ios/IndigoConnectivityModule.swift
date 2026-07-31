import ExpoModulesCore
import Network

struct ConnectivityState {
  let isConnected: Bool
  let type: String
}

// Función libre (no un método privado), igual que en los módulos de las FASES 6-9:
// toma booleanos primitivos, no NWPath (una clase del framework que no se puede
// instanciar en un test XCTest puro) — así es 100% testeable sin un monitor real.
func connectivityState(isConnected: Bool, usesWifi: Bool, usesCellular: Bool) -> ConnectivityState {
  guard isConnected else {
    return ConnectivityState(isConnected: false, type: "none")
  }

  let type: String
  if usesWifi {
    type = "wifi"
  } else if usesCellular {
    type = "cellular"
  } else {
    type = "unknown"
  }
  return ConnectivityState(isConnected: true, type: type)
}

private func connectivityState(from path: NWPath) -> ConnectivityState {
  connectivityState(
    isConnected: path.status == .satisfied,
    usesWifi: path.usesInterfaceType(.wifi),
    usesCellular: path.usesInterfaceType(.cellular)
  )
}

private func connectivityStateDict(_ state: ConnectivityState) -> [String: Any?] {
  ["isConnected": state.isConnected, "type": state.type]
}

// AsyncStream: envuelve el pathUpdateHandler basado en callback de NWPathMonitor — el
// equivalente Swift exacto de callbackFlow en Kotlin. onTermination garantiza que el
// monitor se cancela siempre que el stream se cancele (cuando JS deja de escuchar el
// evento), sin importar cómo termine el consumo.
private func connectivityUpdates() -> AsyncStream<ConnectivityState> {
  AsyncStream { continuation in
    let monitor = NWPathMonitor()
    let queue = DispatchQueue(label: "dev.daniell.indigo.modules.connectivity")

    monitor.pathUpdateHandler = { path in
      continuation.yield(connectivityState(from: path))
    }
    continuation.onTermination = { _ in
      monitor.cancel()
    }

    monitor.start(queue: queue)
  }
}

public class IndigoConnectivityModule: Module {
  private var observationTask: Task<Void, Never>?

  public func definition() -> ModuleDefinition {
    Name("IndigoConnectivity")
    Events("onConnectivityChange")

    AsyncFunction("getCurrentState") { () -> [String: Any?] in
      await currentConnectivityState()
    }

    // Se suscribe al AsyncStream solo cuando JS tiene al menos un listener activo —
    // evita tener un NWPathMonitor corriendo sin que nadie del lado JS esté escuchando.
    OnStartObserving("onConnectivityChange") {
      observationTask = Task {
        for await state in connectivityUpdates() {
          sendEvent("onConnectivityChange", connectivityStateDict(state))
        }
      }
    }

    OnStopObserving("onConnectivityChange") {
      observationTask?.cancel()
      observationTask = nil
    }
  }

  private func currentConnectivityState() async -> [String: Any?] {
    await withCheckedContinuation { continuation in
      let monitor = NWPathMonitor()
      let queue = DispatchQueue(label: "dev.daniell.indigo.modules.connectivity.snapshot")

      monitor.pathUpdateHandler = { path in
        let state = connectivityState(from: path)
        monitor.cancel()
        continuation.resume(returning: connectivityStateDict(state))
      }
      monitor.start(queue: queue)
    }
  }
}
