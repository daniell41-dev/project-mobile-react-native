import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemePreference = 'system' | 'dark' | 'light';

type ThemeState = {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

// Preferencia de tema: UI de bajo riesgo, se persiste directamente con AsyncStorage vía
// el middleware `persist` de Zustand. No pasa por StorageService (a diferencia del token
// de auth, ver docs/03-arquitectura-y-buenas-practicas.md) porque no es un dato sensible
// que vaya a migrar a Keystore/Keychain en la FASE 7.
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      preference: 'system',
      setPreference: (preference) => set({ preference }),
    }),
    {
      name: 'indigo/theme-preference',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
