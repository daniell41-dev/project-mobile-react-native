import { create } from 'zustand';

type AuthState = {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
};

// Stub de la FASE 1: solo lo necesario para que RootNavigator conmute entre
// AuthNavigator y TabNavigator. La persistencia del token (vía StorageService) y la
// validación real del formulario de login llegan en la FASE 2.
export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  login: () => set({ isAuthenticated: true }),
  logout: () => set({ isAuthenticated: false }),
}));
