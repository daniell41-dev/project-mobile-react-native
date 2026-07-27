import NativeIndigoDevice from '@modules/indigo-device/src/NativeIndigoDevice';

// Facade sobre el TurboModule "bare" (modules/indigo-device, FASE 9): el resto de la
// app nunca importa NativeIndigoDevice directamente, igual que con los módulos de
// Expo Modules API de las FASES 6-8.
export const DeviceService = {
  getDeviceName: (): string => NativeIndigoDevice.getDeviceName(),
  isTablet: (): boolean => NativeIndigoDevice.isTablet(),
  getBatteryLevelAsync: (): Promise<number> => NativeIndigoDevice.getBatteryLevelAsync(),
};
