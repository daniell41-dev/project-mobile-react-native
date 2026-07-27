import { create } from 'zustand';

import { AuthService } from '@/core/services/auth.service';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthState = {
  status: AuthStatus;
  token: string | null;
  restoreSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  token: null,

  // Se llama una vez al arrancar la app (ver src/bootstrap/App.tsx); gatea el splash
  // screen junto con la carga de fuentes para no mostrar un parpadeo Login->Home.
  restoreSession: async () => {
    const token = await AuthService.getPersistedToken();
    set({ status: token ? 'authenticated' : 'unauthenticated', token });
  },

  login: async (email, password) => {
    const token = await AuthService.login(email, password);
    set({ status: 'authenticated', token });
  },

  logout: async () => {
    await AuthService.logout();
    set({ status: 'unauthenticated', token: null });
  },
}));
