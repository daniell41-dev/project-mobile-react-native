import { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import { useTheme } from '@/shared/hooks/useTheme';

type ListRowProps = {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  detail?: boolean;
  onPress?: () => void;
};

// Fila genérica clave/valor o navegable (grupos de Perfil, "Más opciones" de
// Tarjetas, detalle de movimiento). `detail` añade la flecha de navegación.
export function ListRow({ title, subtitle, leading, trailing, detail, onPress }: ListRowProps) {
  const theme = useTheme();

  const content = (
    <View style={[styles.row, { borderBottomColor: theme.colors.hairline }]}>
      {leading}
      <View style={styles.textGroup}>
        <AppText variant="itemTitle" numberOfLines={1}>
          {title}
        </AppText>
        {subtitle && (
          <AppText variant="subtitle" tone="textDim" numberOfLines={1}>
            {subtitle}
          </AppText>
        )}
      </View>
      {trailing}
      {detail && <Ionicons name="chevron-forward" size={18} color={theme.colors.textMute} />}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return <Pressable onPress={onPress}>{content}</Pressable>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  textGroup: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
});
