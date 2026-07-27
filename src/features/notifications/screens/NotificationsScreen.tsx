import { useLayoutEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { HomeStackParamList } from '@/bootstrap/navigation/types';
import { AppNotification, NotificationIcon } from '@/core/models/notification.model';
import { DataService } from '@/core/services/data.service';
import { AppText } from '@/shared/components/AppText';
import { Screen } from '@/shared/components/Screen';
import { useTheme } from '@/shared/hooks/useTheme';

type Props = NativeStackScreenProps<HomeStackParamList, 'Notifications'>;

const ICONS: Record<NotificationIcon, keyof typeof Ionicons.glyphMap> = {
  payment: 'cash-outline',
  security: 'shield-checkmark-outline',
  goal: 'trophy-outline',
  statement: 'document-text-outline',
};

export function NotificationsScreen({ navigation }: Props) {
  const theme = useTheme();
  const [notifications, setNotifications] = useState<AppNotification[]>(
    DataService.getNotifications(),
  );

  const markAllRead = () =>
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={markAllRead} hitSlop={8}>
          <AppText variant="subtitle" tone="accent">
            Marcar leídas
          </AppText>
        </Pressable>
      ),
    });
  }, [navigation]);

  return (
    <Screen padded={false}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: theme.spacing.screenPadding }}
        renderItem={({ item }) => (
          <View style={[styles.row, { borderBottomColor: theme.colors.hairline }]}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: theme.colors.surface2, borderRadius: theme.radii.md },
              ]}
            >
              <Ionicons name={ICONS[item.icon]} size={18} color={theme.colors.text} />
            </View>
            <View style={styles.textGroup}>
              <View style={styles.titleRow}>
                <AppText variant="itemTitle" style={styles.titleText}>
                  {item.title}
                </AppText>
                {!item.read && (
                  <View style={[styles.unreadDot, { backgroundColor: theme.colors.accent }]} />
                )}
              </View>
              <AppText variant="body" tone="textDim">
                {item.description}
              </AppText>
              <AppText variant="label" tone="textMute" style={styles.timestamp}>
                {item.timestamp}
              </AppText>
            </View>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconCircle: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textGroup: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    flexShrink: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  timestamp: {
    marginTop: 2,
  },
});
