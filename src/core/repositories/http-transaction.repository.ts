import { Transaction } from '@/core/models/transaction.model';
import { transactionFromDto } from '@/core/repositories/transaction.adapter';
import { TransactionDto } from '@/core/repositories/transaction.dto';
import { TransactionRepository } from '@/core/repositories/transaction.repository';

export class HttpTransactionRepository implements TransactionRepository {
  constructor(private readonly baseUrl: string) {}

  async getTransactions(): Promise<Transaction[]> {
    const response = await fetch(`${this.baseUrl}/transactions`);
    if (!response.ok) {
      throw new Error(`No se pudieron obtener los movimientos (HTTP ${response.status})`);
    }
    const dtos: TransactionDto[] = await response.json();
    return dtos.map(transactionFromDto);
  }
}
