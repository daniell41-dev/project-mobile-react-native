import ExpoModulesCore
import Security

// kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly: legible tras el primer desbloqueo
// del dispositivo (para restoreSession() en el arranque de la app, antes de que el
// usuario interactúe) y nunca sincronizado por iCloud Keychain a otros dispositivos —
// el token de sesión de este dispositivo no debe viajar a otro.
private let keychainAccessibility = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
private let keychainService = "dev.daniell.indigo.securestore"

final class SecureStoreException: GenericException<OSStatus>, @unchecked Sendable {
  override var reason: String {
    "Error de Keychain (OSStatus \(param))"
  }
}

struct InvalidStorageKeyException: Error, CustomStringConvertible {
  let key: String
  var description: String {
    "La clave de almacenamiento no puede estar vacía (recibido: \"\(key)\")."
  }
}

public class IndigoSecureStoreModule: Module {
  public func definition() -> ModuleDefinition {
    Name("IndigoSecureStore")

    AsyncFunction("getItem") { (key: String) throws -> String? in
      try getKeychainItem(key: key)
    }

    AsyncFunction("setItem") { (key: String, value: String) throws in
      try setKeychainItem(key: key, value: value)
    }

    AsyncFunction("removeItem") { (key: String) throws in
      try removeKeychainItem(key: key)
    }
  }
}

private func baseQuery(for key: String) -> [String: Any] {
  [
    kSecClass as String: kSecClassGenericPassword,
    kSecAttrService as String: keychainService,
    kSecAttrAccount as String: key,
  ]
}

// Funciones libres (no métodos privados) a propósito, igual que en indigo-biometrics:
// separan la lógica del Keychain de la definición del módulo.
func getKeychainItem(key: String) throws -> String? {
  guard isValidStorageKey(key) else { throw InvalidStorageKeyException(key: key) }

  var query = baseQuery(for: key)
  query[kSecReturnData as String] = true
  query[kSecMatchLimit as String] = kSecMatchLimitOne

  var result: AnyObject?
  let status = SecItemCopyMatching(query as CFDictionary, &result)

  if status == errSecItemNotFound {
    return nil
  }
  guard status == errSecSuccess, let data = result as? Data else {
    throw SecureStoreException(status)
  }
  return String(data: data, encoding: .utf8)
}

func setKeychainItem(key: String, value: String) throws {
  guard isValidStorageKey(key) else { throw InvalidStorageKeyException(key: key) }

  let data = Data(value.utf8)
  let query = baseQuery(for: key)
  let updateStatus = SecItemUpdate(query as CFDictionary, [kSecValueData as String: data] as CFDictionary)

  if updateStatus == errSecItemNotFound {
    var addQuery = query
    addQuery[kSecValueData as String] = data
    addQuery[kSecAttrAccessible as String] = keychainAccessibility

    let addStatus = SecItemAdd(addQuery as CFDictionary, nil)
    guard addStatus == errSecSuccess else {
      throw SecureStoreException(addStatus)
    }
    return
  }

  guard updateStatus == errSecSuccess else {
    throw SecureStoreException(updateStatus)
  }
}

func removeKeychainItem(key: String) throws {
  guard isValidStorageKey(key) else { throw InvalidStorageKeyException(key: key) }

  let status = SecItemDelete(baseQuery(for: key) as CFDictionary)
  guard status == errSecSuccess || status == errSecItemNotFound else {
    throw SecureStoreException(status)
  }
}

// Misma lógica pura que isValidStorageKey en el lado Kotlin — la única parte de este
// módulo testeable sin un Keychain real.
func isValidStorageKey(_ key: String) -> Bool {
  !key.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
}
