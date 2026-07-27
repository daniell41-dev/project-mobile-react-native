import { Transaction } from '@/core/models/transaction.model';
import { TransactionRepository } from '@/core/repositories/transaction.repository';
import { transactionSeed } from '@/core/repositories/transaction.seed';

export class InMemoryTransactionRepository implements TransactionRepository {
  async getTransactions(): Promise<Transaction[]> {
    return transactionSeed;
  }
}
