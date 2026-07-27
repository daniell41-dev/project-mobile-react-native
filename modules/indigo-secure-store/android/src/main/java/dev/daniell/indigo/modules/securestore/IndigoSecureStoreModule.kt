package dev.daniell.indigo.modules.securestore

import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

private const val PREFS_FILE_NAME = "indigo_secure_store"

class MissingContextException :
  CodedException("ERR_NO_CONTEXT", "No hay un contexto de Android disponible.", null)

class InvalidStorageKeyException(key: String) :
  CodedException("ERR_INVALID_KEY", "La clave de almacenamiento no puede estar vacía (recibido: \"$key\").", null)

// Función de nivel de paquete (no un método privado) a propósito: es la única lógica de
// este módulo que no necesita un SharedPreferences/Keystore real para poder testearse.
internal fun isValidStorageKey(key: String): Boolean = key.isNotBlank()

class IndigoSecureStoreModule : Module() {
  // EncryptedSharedPreferences.create() hace trabajo de Keystore (genera/lee la clave
  // maestra) en la primera llamada — se crea una sola vez y se reutiliza.
  private val preferences: SharedPreferences by lazy { createEncryptedPreferences() }

  override fun definition() = ModuleDefinition {
    Name("IndigoSecureStore")

    AsyncFunction("getItem") Coroutine { key: String ->
      getItem(key)
    }

    AsyncFunction("setItem") Coroutine { key: String, value: String ->
      setItem(key, value)
    }

    AsyncFunction("removeItem") Coroutine { key: String ->
      removeItem(key)
    }
  }

  private fun createEncryptedPreferences(): SharedPreferences {
    val context = appContext.reactContext ?: throw MissingContextException()
    val masterKey = MasterKey.Builder(context)
      .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
      .build()

    return EncryptedSharedPreferences.create(
      context,
      PREFS_FILE_NAME,
      masterKey,
      EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
      EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )
  }

  private suspend fun getItem(key: String): String? {
    if (!isValidStorageKey(key)) throw InvalidStorageKeyException(key)
    return withContext(Dispatchers.IO) {
      preferences.getString(key, null)
    }
  }

  private suspend fun setItem(key: String, value: String) {
    if (!isValidStorageKey(key)) throw InvalidStorageKeyException(key)
    withContext(Dispatchers.IO) {
      preferences.edit().putString(key, value).apply()
    }
  }

  private suspend fun removeItem(key: String) {
    if (!isValidStorageKey(key)) throw InvalidStorageKeyException(key)
    withContext(Dispatchers.IO) {
      preferences.edit().remove(key).apply()
    }
  }
}
