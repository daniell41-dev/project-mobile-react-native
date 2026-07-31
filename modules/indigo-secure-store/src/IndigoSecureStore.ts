import { NativeModule, requireNativeModule } from 'expo';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- forma del scaffold oficial de create-expo-module
declare class IndigoSecureStoreModule extends NativeModule<{}> {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export default requireNativeModule<IndigoSecureStoreModule>('IndigoSecureStore');
