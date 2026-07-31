// "wifi"/"cellular" son los únicos transportes que distinguimos (ver connectivityStateFrom
// en Kotlin y connectivityState en Swift) — "unknown" cubre ethernet/VPN/otros, "none" es
// sin conexión.
export type ConnectivityType = 'wifi' | 'cellular' | 'unknown' | 'none';

export type ConnectivityState = {
  isConnected: boolean;
  type: ConnectivityType;
};

export type IndigoConnectivityEvents = {
  onConnectivityChange: (state: ConnectivityState) => void;
};
