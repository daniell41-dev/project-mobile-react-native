import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { TransactionsStackParamList } from '@/bootstrap/navigation/types';
import { TransactionsScreen } from '@/features/transactions/screens/TransactionsScreen';
import { TxDetailScreen } from '@/features/transactions/screens/TxDetailScreen';

const Stack = createNativeStackNavigator<TransactionsStackParamList>();

export function TransactionsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TxDetail"
        component={TxDetailScreen}
        options={{ title: 'Detalle de movimiento' }}
      />
    </Stack.Navigator>
  );
}
