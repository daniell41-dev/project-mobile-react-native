import AsyncStorage from '@react-native-async-storage/async-storage';

// Abstracción de almacenamiento (DIP): el resto del código depende de esta interfaz,
// no de AsyncStorage directamente. En la FASE 7 se sustituye la implementación por
// modules/indigo-secure-store (Keystore/Keychain) sin tocar ningún consumidor
// (ver docs/03-arquitectura-y-buenas-practicas.md).
export interface StorageService {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

class AsyncStorageService implements StorageService {
  getItem(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
  }

  setItem(key: string, value: string): Promise<void> {
    return AsyncStorage.setItem(key, value);
  }

  removeItem(key: string): Promise<void> {
    return AsyncStorage.removeItem(key);
  }
}

export const storageService: StorageService = new AsyncStorageService();
