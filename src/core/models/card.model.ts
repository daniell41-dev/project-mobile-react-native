export type Card = {
  id: string;
  holder: string;
  last4: string;
  network: 'visa' | 'mastercard';
  type: 'debit' | 'credit';
  debitBalance: number;
  creditAvailable: number;
  frozen: boolean;
  onlinePurchasesEnabled: boolean;
};
