import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ProfileStackParamList } from '@/bootstrap/navigation/types';
import { ProfileScreen } from '@/features/profile/screens/ProfileScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
