import { useQuery } from '@tanstack/react-query';

import { transactionRepository } from '@/core/repositories/transaction.repository.factory';

export const transactionsQueryKey = ['transactions'] as const;

export function useTransactionsQuery() {
  return useQuery({
    queryKey: transactionsQueryKey,
    queryFn: () => transactionRepository.getTransactions(),
  });
}
