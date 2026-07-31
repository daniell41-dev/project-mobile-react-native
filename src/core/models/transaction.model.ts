export type TransactionIcon =
  | 'salary'
  | 'music'
  | 'store'
  | 'car'
  | 'person'
  | 'coffee'
  | 'bag'
  | 'refund'
  | 'bolt'
  | 'ticket';

export type Transaction = {
  id: string;
  merchant: string;
  category: string;
  icon: TransactionIcon;
  /** Positivo = ingreso, negativo = gasto. */
  amount: number;
  day: string;
  time: string;
  method: string;
  reference: string;
};
