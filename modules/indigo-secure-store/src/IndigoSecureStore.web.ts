import { registerWebModule, NativeModule } from 'expo';

// Un navegador no tiene Keychain ni Keystore: se usa localStorage como mejor esfuerzo
// (igual que hace expo-secure-store en su propia implementación web) — NO es
// almacenamiento cifrado, solo mantiene la demo web funcional.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- forma del scaffold oficial de create-expo-module
class IndigoSecureStoreModule extends NativeModule<{}> {
  async getItem(key: string): Promise<string | null> {
    return localStorage.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(key);
  }
}

export default registerWebModule(IndigoSecureStoreModule, 'IndigoSecureStore');
