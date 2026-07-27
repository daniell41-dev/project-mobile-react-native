import { InMemoryTransactionRepository } from '@/core/repositories/in-memory-transaction.repository';
import { transactionSeed } from '@/core/repositories/transaction.seed';

describe('InMemoryTransactionRepository', () => {
  it('resolves with the seed data', async () => {
    const repository = new InMemoryTransactionRepository();

    await expect(repository.getTransactions()).resolves.toEqual(transactionSeed);
  });
});
