import { Transaction } from '@/core/models/transaction.model';

// Strategy: InMemoryTransactionRepository (mock, sin backend) y
// HttpTransactionRepository (REST real) implementan esta misma interfaz — las
// pantallas dependen de la abstracción, no de la implementación concreta (DIP).
export interface TransactionRepository {
  getTransactions(): Promise<Transaction[]>;
}
