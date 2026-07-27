import { storageService } from '@/core/services/storage.service';

const TOKEN_KEY = 'indigo/auth-token';

// Mock: no hay backend hasta la FASE 4 (capa REST). Genera un token de sesión y lo
// persiste vía StorageService — cuando llegue la capa REST, solo cambia lo que hay
// dentro de login()/logout(), no la superficie que consume authStore.
export const AuthService = {
  async login(_email: string, _password: string): Promise<string> {
    const token = `mock-token.${Date.now()}.${Math.random().toString(36).slice(2)}`;
    await storageService.setItem(TOKEN_KEY, token);
    return token;
  },

  async logout(): Promise<void> {
    await storageService.removeItem(TOKEN_KEY);
  },

  async getPersistedToken(): Promise<string | null> {
    return storageService.getItem(TOKEN_KEY);
  },
};
