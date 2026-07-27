import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CardsStackParamList } from '@/bootstrap/navigation/types';
import { CardsScreen } from '@/features/cards/screens/CardsScreen';

const Stack = createNativeStackNavigator<CardsStackParamList>();

export function CardsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Cards" component={CardsScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
