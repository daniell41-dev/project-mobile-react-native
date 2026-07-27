package dev.daniell.indigo.modules.connectivity

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.Job
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.launch

data class ConnectivityState(val isConnected: Boolean, val type: String)

// Función de nivel de paquete (no un método privado) a propósito, igual que en los
// módulos de las FASES 6-9: toma booleanos primitivos, no NetworkCapabilities (una
// clase del framework de Android que no se puede instanciar/mockear en un test JUnit
// puro) — así es 100% testeable sin Robolectric ni un dispositivo real.
internal fun connectivityStateFrom(
  hasInternet: Boolean,
  hasWifi: Boolean,
  hasCellular: Boolean,
): ConnectivityState {
  if (!hasInternet) return ConnectivityState(isConnected = false, type = "none")

  val type = when {
    hasWifi -> "wifi"
    hasCellular -> "cellular"
    else -> "unknown"
  }
  return ConnectivityState(isConnected = true, type = type)
}

private fun connectivityStateFromCapabilities(capabilities: NetworkCapabilities?): ConnectivityState {
  if (capabilities == null) return ConnectivityState(isConnected = false, type = "none")

  return connectivityStateFrom(
    hasInternet = capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET),
    hasWifi = capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI),
    hasCellular = capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR),
  )
}

private fun ConnectivityState.toMap(): Map<String, Any?> =
  mapOf("isConnected" to isConnected, "type" to type)

// Coroutines + Flow: envuelve la API de ConnectivityManager, basada en callbacks
// (NetworkCallback), en un callbackFlow — el patrón estándar de Kotlin para exponer
// una API de callbacks como un Flow frío y cancelable. awaitClose garantiza que
// unregisterNetworkCallback se llama siempre que el Flow se cancele (cuando JS deja de
// escuchar el evento), sin importar cómo termine la colección.
private fun observeConnectivity(context: Context): Flow<ConnectivityState> = callbackFlow {
  val connectivityManager =
    context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
  val request = NetworkRequest.Builder()
    .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    .build()

  val callback = object : ConnectivityManager.NetworkCallback() {
    override fun onCapabilitiesChanged(network: Network, capabilities: NetworkCapabilities) {
      trySend(connectivityStateFromCapabilities(capabilities))
    }

    override fun onLost(network: Network) {
      trySend(ConnectivityState(isConnected = false, type = "none"))
    }
  }

  connectivityManager.registerNetworkCallback(request, callback)
  awaitClose { connectivityManager.unregisterNetworkCallback(callback) }
}.distinctUntilChanged()

class IndigoConnectivityModule : Module() {
  private var observationJob: Job? = null

  override fun definition() = ModuleDefinition {
    Name("IndigoConnectivity")
    Events("onConnectivityChange")

    AsyncFunction("getCurrentState") {
      currentConnectivityState()
    }

    // Se suscribe al Flow solo cuando JS tiene al menos un listener activo — evita
    // tener un NetworkCallback registrado (y consumiendo batería) sin que nadie del
    // lado JS esté escuchando.
    OnStartObserving("onConnectivityChange") {
      val context = appContext.reactContext ?: return@OnStartObserving
      observationJob = appContext.modulesQueue.launch {
        observeConnectivity(context).collect { state ->
          sendEvent("onConnectivityChange", state.toMap())
        }
      }
    }

    OnStopObserving("onConnectivityChange") {
      observationJob?.cancel()
      observationJob = null
    }
  }

  private fun currentConnectivityState(): Map<String, Any?> {
    val context = appContext.reactContext
      ?: return ConnectivityState(isConnected = false, type = "none").toMap()

    val connectivityManager =
      context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
    val capabilities = connectivityManager.getNetworkCapabilities(connectivityManager.activeNetwork)
    return connectivityStateFromCapabilities(capabilities).toMap()
  }
}
