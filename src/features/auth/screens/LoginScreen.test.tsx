import { clearAllMockStorages } from '@react-native-async-storage/async-storage/jest';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { act, fireEvent } from '@testing-library/react-native';

import { AuthStackParamList } from '@/bootstrap/navigation/types';
import { useAuthStore } from '@/core/stores/auth.store';
import { renderWithProviders } from '@/shared/testing/renderWithProviders';

import { LoginScreen } from './LoginScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

function renderLoginScreen() {
  return renderWithProviders(
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    </NavigationContainer>,
  );
}

describe('LoginScreen', () => {
  afterEach(() => {
    clearAllMockStorages();
    useAuthStore.setState({ status: 'unauthenticated', token: null });
  });

  it('shows validation errors when submitting an empty form', async () => {
    const { findByText, getByRole } = await renderLoginScreen();

    await act(async () => {
      fireEvent.press(getByRole('button', { name: 'Entrar' }));
    });

    expect(await findByText('Ingresa tu correo')).toBeTruthy();
    expect(await findByText('Mínimo 6 caracteres')).toBeTruthy();
  });

  it('logs in and updates authStore on valid submit', async () => {
    const { getByRole, getByPlaceholderText } = await renderLoginScreen();

    await act(async () => {
      fireEvent.changeText(getByPlaceholderText('tu@correo.mx'), 'andrea@correo.mx');
      fireEvent.changeText(getByPlaceholderText('••••••••'), 'password123');
    });

    await act(async () => {
      fireEvent.press(getByRole('button', { name: 'Entrar' }));
    });

    expect(useAuthStore.getState().status).toBe('authenticated');
  });
});
