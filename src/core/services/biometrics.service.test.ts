import { BiometricsService } from '@/core/services/biometrics.service';
import IndigoBiometrics from '@modules/indigo-biometrics/src/IndigoBiometrics';

jest.mock('@modules/indigo-biometrics/src/IndigoBiometrics', () => ({
  __esModule: true,
  default: {
    isAvailable: jest.fn(),
    authenticate: jest.fn(),
  },
}));

describe('BiometricsService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('delegates isAvailable to the native module', async () => {
    (IndigoBiometrics.isAvailable as jest.Mock).mockResolvedValue({
      available: true,
      biometryType: 'faceId',
    });

    await expect(BiometricsService.isAvailable()).resolves.toEqual({
      available: true,
      biometryType: 'faceId',
    });
  });

  it('delegates authenticate to the native module with the reason', async () => {
    (IndigoBiometrics.authenticate as jest.Mock).mockResolvedValue({ success: true });

    await expect(BiometricsService.authenticate('Confirma tu identidad')).resolves.toEqual({
      success: true,
    });
    expect(IndigoBiometrics.authenticate).toHaveBeenCalledWith('Confirma tu identidad');
  });
});
