import { Text, TextProps, TextStyle } from 'react-native';

import { useTheme } from '@/shared/hooks/useTheme';
import { fontFamily, fontSize } from '@/theme/typography';

type Variant =
  | 'balance'
  | 'sendAmount'
  | 'screenTitle'
  | 'itemTitle'
  | 'subtitle'
  | 'label'
  | 'body'
  | 'numBody';

type Tone = 'text' | 'textDim' | 'textMute' | 'accent' | 'up' | 'down' | 'onAccent';

type AppTextProps = TextProps & {
  variant?: Variant;
  tone?: Tone;
};

const VARIANT_STYLES: Record<Variant, TextStyle> = {
  balance: { fontFamily: fontFamily.numBold, fontSize: fontSize.balanceLarge },
  sendAmount: { fontFamily: fontFamily.numBold, fontSize: fontSize.sendAmount },
  screenTitle: { fontFamily: fontFamily.uiBold, fontSize: fontSize.screenTitle },
  itemTitle: { fontFamily: fontFamily.uiSemiBold, fontSize: fontSize.itemTitle },
  subtitle: { fontFamily: fontFamily.uiMedium, fontSize: fontSize.subtitle },
  label: { fontFamily: fontFamily.uiRegular, fontSize: fontSize.label },
  body: { fontFamily: fontFamily.uiRegular, fontSize: fontSize.body },
  numBody: { fontFamily: fontFamily.numRegular, fontSize: fontSize.body },
};

// Primitiva tipográfica: centraliza la fuente (Plus Jakarta Sans / Sora) y el color de
// tema para no repetir `style={{ fontFamily, color: theme.colors.x }}` en cada pantalla.
export function AppText({ variant = 'body', tone = 'text', style, ...rest }: AppTextProps) {
  const theme = useTheme();
  const color = tone === 'onAccent' ? '#FFFFFF' : theme.colors[tone];

  return <Text {...rest} style={[VARIANT_STYLES[variant], { color }, style]} />;
}
