import { storageService } from '@/core/services/storage.service';

describe('storageService', () => {
  const key = 'indigo/test-key';

  afterEach(async () => {
    await storageService.removeItem(key);
  });

  it('returns null for a key that was never set', async () => {
    await expect(storageService.getItem(key)).resolves.toBeNull();
  });

  it('round-trips a value through setItem/getItem', async () => {
    await storageService.setItem(key, 'a-secret-value');

    await expect(storageService.getItem(key)).resolves.toBe('a-secret-value');
  });

  it('removes a value', async () => {
    await storageService.setItem(key, 'a-secret-value');
    await storageService.removeItem(key);

    await expect(storageService.getItem(key)).resolves.toBeNull();
  });
});
