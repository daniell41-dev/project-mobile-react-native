import { NativeSyntheticEvent, ViewProps } from 'react-native';

export type IndigoCardViewProps = ViewProps & {
  holderName: string;
  last4: string;
  frozen?: boolean;
  accentColor?: string;
  onPress?: (event: NativeSyntheticEvent<Record<string, never>>) => void;
};
