import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HomeStackParamList } from '@/bootstrap/navigation/types';
import { HomeScreen } from '@/features/home/screens/HomeScreen';
import { NotificationsScreen } from '@/features/notifications/screens/NotificationsScreen';
import { SendDoneScreen } from '@/features/send/screens/SendDoneScreen';
import { SendScreen } from '@/features/send/screens/SendScreen';
import { TxDetailScreen } from '@/features/transactions/screens/TxDetailScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="TxDetail"
        component={TxDetailScreen}
        options={{ title: 'Detalle de movimiento' }}
      />
      <Stack.Screen name="Send" component={SendScreen} options={{ title: 'Enviar dinero' }} />
      <Stack.Screen name="SendDone" component={SendDoneScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Notificaciones' }}
      />
    </Stack.Navigator>
  );
}
