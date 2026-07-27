// Android (androidx.biometric) no distingue huella de reconocimiento facial por API
// pública, a diferencia de iOS (LAContext.biometryType) — "biometric" es el valor
// genérico que devuelve el lado Kotlin cuando hay biometría disponible.
export type BiometryType = 'faceId' | 'touchId' | 'biometric' | 'none';

export type BiometricsAvailability = {
  available: boolean;
  biometryType: BiometryType;
};

export type BiometricsErrorCode =
  | 'not_available'
  | 'not_enrolled'
  | 'user_cancel'
  | 'lockout'
  | 'unknown';

export type BiometricsAuthResult =
  | { success: true; error?: undefined }
  | { success: false; error: BiometricsErrorCode };
