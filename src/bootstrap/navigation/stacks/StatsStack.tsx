import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { StatsStackParamList } from '@/bootstrap/navigation/types';
import { StatsScreen } from '@/features/stats/screens/StatsScreen';

const Stack = createNativeStackNavigator<StatsStackParamList>();

export function StatsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Stats" component={StatsScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
