import { act, fireEvent } from '@testing-library/react-native';

import App from '@/bootstrap/App';
import { useAuthStore } from '@/core/stores/auth.store';
import { renderWithProviders } from '@/shared/testing/renderWithProviders';

describe('App', () => {
  afterEach(() => {
    useAuthStore.getState().logout();
  });

  it('renders the pre-auth flow (Onboarding) by default', async () => {
    const { findByText } = await renderWithProviders(<App />);

    expect(await findByText('Índigo')).toBeTruthy();
  });

  it('shows the tab shell once authenticated, and the theme toggle keeps the session', async () => {
    const { findByText, getByRole } = await renderWithProviders(<App />);

    // El swap AuthNavigator -> TabNavigator dispara efectos internos de React
    // Navigation (PreventRemoveProvider) en un tick posterior a este act(); React
    // Navigation emite un warning de "not wrapped in act()" ya conocido en este
    // escenario (mutar el store fuera de un evento de UI), inofensivo: los asserts
    // siguen verificando el comportamiento real.
    await act(async () => {
      useAuthStore.getState().login();
    });

    const profileTab = await findByText('Perfil');
    await act(async () => {
      fireEvent.press(profileTab);
    });

    const themeToggle = getByRole('switch');
    await act(async () => {
      fireEvent(themeToggle, 'valueChange', true);
    });

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });
});
