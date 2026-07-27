import { clearAllMockStorages } from '@react-native-async-storage/async-storage/jest';

import { AuthService } from '@/core/services/auth.service';

describe('AuthService', () => {
  afterEach(() => {
    clearAllMockStorages();
  });

  it('returns null when there is no persisted session', async () => {
    const token = await AuthService.getPersistedToken();
    expect(token).toBeNull();
  });

  it('persists a token on login and returns it via getPersistedToken', async () => {
    await AuthService.login('andrea@correo.mx', 'password123');

    const token = await AuthService.getPersistedToken();
    expect(token).toEqual(expect.stringContaining('mock-token.'));
  });

  it('removes the token on logout', async () => {
    await AuthService.login('andrea@correo.mx', 'password123');
    await AuthService.logout();

    const token = await AuthService.getPersistedToken();
    expect(token).toBeNull();
  });
});
