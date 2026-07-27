import { env } from '@/core/config/env';
import { HttpTransactionRepository } from '@/core/repositories/http-transaction.repository';
import { InMemoryTransactionRepository } from '@/core/repositories/in-memory-transaction.repository';
import { TransactionRepository } from '@/core/repositories/transaction.repository';

function createTransactionRepository(): TransactionRepository {
  return env.useMockApi
    ? new InMemoryTransactionRepository()
    : new HttpTransactionRepository(env.apiBaseUrl);
}

export const transactionRepository = createTransactionRepository();
