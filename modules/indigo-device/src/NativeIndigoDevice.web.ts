import type { Spec } from './NativeIndigoDevice';

// Los TurboModules "bare" no tienen un mecanismo de fallback web automático como los
// módulos de Expo (registerWebModule) — pero Metro sí resuelve .web.ts por plataforma
// para cualquier módulo, no solo los de Expo, así que este archivo cumple el mismo
// papel a mano.
const NativeIndigoDeviceWeb: Spec = {
  getDeviceName: () => 'Navegador web',
  isTablet: () => false,
  getBatteryLevelAsync: async () => -1,
};

export default NativeIndigoDeviceWeb;
