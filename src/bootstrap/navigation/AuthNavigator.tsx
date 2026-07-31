import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthStackParamList } from '@/bootstrap/navigation/types';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';
import { OnboardingScreen } from '@/features/auth/screens/OnboardingScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}
