import { ConnectivityService } from '@/core/services/connectivity.service';
import IndigoConnectivity from '@modules/indigo-connectivity/src/IndigoConnectivity';

describe('ConnectivityService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('delegates getCurrentState to the native module', async () => {
    (IndigoConnectivity.getCurrentState as jest.Mock).mockResolvedValue({
      isConnected: true,
      type: 'wifi',
    });

    await expect(ConnectivityService.getCurrentState()).resolves.toEqual({
      isConnected: true,
      type: 'wifi',
    });
  });

  it('subscribes to onConnectivityChange and forwards updates to the listener', () => {
    const listener = jest.fn();

    ConnectivityService.subscribe(listener);

    expect(IndigoConnectivity.addListener).toHaveBeenCalledWith(
      'onConnectivityChange',
      listener,
    );
  });

  it('returns an unsubscribe function that removes the underlying subscription', () => {
    const listener = jest.fn();
    const remove = jest.fn();
    (IndigoConnectivity.addListener as jest.Mock).mockReturnValueOnce({ remove });

    const unsubscribe = ConnectivityService.subscribe(listener);
    unsubscribe();

    expect(remove).toHaveBeenCalledTimes(1);
  });
});
