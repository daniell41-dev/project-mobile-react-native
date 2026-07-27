import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { HomeStackParamList } from '@/bootstrap/navigation/types';
import { DataService } from '@/core/services/data.service';
import { Screen } from '@/shared/components/Screen';
import { useTheme } from '@/shared/hooks/useTheme';
import { fontFamily, fontSize } from '@/theme/typography';

type Props = NativeStackScreenProps<HomeStackParamList, 'Notifications'>;

export function NotificationsScreen(_props: Props) {
  const theme = useTheme();
  const notifications = DataService.getNotifications();

  return (
    <Screen>
      <Text style={[styles.title, { color: theme.colors.text }]}>Notificaciones</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.row, { borderBottomColor: theme.colors.hairline }]}>
            <View style={styles.rowHeader}>
              <Text style={{ color: theme.colors.text, fontFamily: fontFamily.uiSemiBold }}>
                {item.title}
              </Text>
              {!item.read && (
                <View style={[styles.dot, { backgroundColor: theme.colors.accent }]} />
              )}
            </View>
            <Text style={{ color: theme.colors.textDim }} numberOfLines={2}>
              {item.description}
            </Text>
            <Text style={{ color: theme.colors.textMute, fontSize: fontSize.label }}>
              {item.timestamp}
            </Text>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: fontFamily.uiBold,
    fontSize: fontSize.screenTitle,
    marginVertical: 16,
  },
  row: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
