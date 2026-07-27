import { NavigatorScreenParams } from '@react-navigation/native';

// Pre-auth (sin tabs): Onboarding → Login.
export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
};

// Tab "Inicio": es la única con campana de notificaciones y acceso a Enviar dinero
// (ver docs/design/README.md — el header con campana solo está en Home).
export type HomeStackParamList = {
  Home: undefined;
  TxDetail: { transactionId: string };
  Send: undefined;
  SendDone: { amount: number; recipientName: string };
  Notifications: undefined;
};

export type TransactionsStackParamList = {
  Transactions: undefined;
  TxDetail: { transactionId: string };
};

export type CardsStackParamList = {
  Cards: undefined;
};

export type StatsStackParamList = {
  Stats: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
};

export type TabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  TransactionsTab: NavigatorScreenParams<TransactionsStackParamList>;
  CardsTab: NavigatorScreenParams<CardsStackParamList>;
  StatsTab: NavigatorScreenParams<StatsStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

// Augmentación global: habilita autocompletado y chequeo de tipos básico en
// useNavigation()/navigate() sin tener que pasar el generic en cada pantalla.
// Para composición precisa dentro de un stack anidado en un tab, cada pantalla
// tipa sus props localmente con NativeStackScreenProps<XStackParamList, 'Screen'>.
declare global {
  namespace ReactNavigation {
    interface RootParamList
      extends AuthStackParamList,
        HomeStackParamList,
        TransactionsStackParamList,
        CardsStackParamList,
        StatsStackParamList,
        ProfileStackParamList,
        TabParamList {}
  }
}
