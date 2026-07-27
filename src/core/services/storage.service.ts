import IndigoSecureStore from '@modules/indigo-secure-store/src/IndigoSecureStore';

// Abstracción de almacenamiento (DIP / Strategy): el resto del código depende de esta
// interfaz, no de una implementación concreta. Desde la FASE 7, storageService usa
// SecureStorageService (Keystore/Keychain vía modules/indigo-secure-store) para datos
// sensibles como el token de sesión — ver core/services/auth.service.ts. AsyncStorage
// (sin pasar por esta interfaz) sigue siendo la herramienta correcta para preferencias
// no sensibles: theme.store.ts la usa directamente, no todo necesita Keystore/Keychain.
export interface StorageService {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

class SecureStorageService implements StorageService {
  getItem(key: string): Promise<string | null> {
    return IndigoSecureStore.getItem(key);
  }

  setItem(key: string, value: string): Promise<void> {
    return IndigoSecureStore.setItem(key, value);
  }

  removeItem(key: string): Promise<void> {
    return IndigoSecureStore.removeItem(key);
  }
}

export const storageService: StorageService = new SecureStorageService();
