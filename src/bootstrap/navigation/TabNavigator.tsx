import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { CardsStack } from '@/bootstrap/navigation/stacks/CardsStack';
import { HomeStack } from '@/bootstrap/navigation/stacks/HomeStack';
import { ProfileStack } from '@/bootstrap/navigation/stacks/ProfileStack';
import { StatsStack } from '@/bootstrap/navigation/stacks/StatsStack';
import { TransactionsStack } from '@/bootstrap/navigation/stacks/TransactionsStack';
import { TabParamList } from '@/bootstrap/navigation/types';
import { useTheme } from '@/shared/hooks/useTheme';

const Tab = createBottomTabNavigator<TabParamList>();

const TAB_ICONS: Record<keyof TabParamList, keyof typeof Ionicons.glyphMap> = {
  HomeTab: 'home-outline',
  TransactionsTab: 'swap-horizontal-outline',
  CardsTab: 'card-outline',
  StatsTab: 'bar-chart-outline',
  ProfileTab: 'person-outline',
};

export function TabNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textMute,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.hairline,
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={TAB_ICONS[route.name as keyof TabParamList]} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: 'Inicio' }} />
      <Tab.Screen
        name="TransactionsTab"
        component={TransactionsStack}
        options={{ title: 'Movimientos' }}
      />
      <Tab.Screen name="CardsTab" component={CardsStack} options={{ title: 'Tarjetas' }} />
      <Tab.Screen name="StatsTab" component={StatsStack} options={{ title: 'Análisis' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}
