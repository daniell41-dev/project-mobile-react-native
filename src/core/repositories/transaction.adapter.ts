import { Transaction, TransactionIcon } from '@/core/models/transaction.model';
import { TransactionDto } from '@/core/repositories/transaction.dto';

// Adapter: aísla al resto de la app de la forma del DTO del backend (snake_case,
// centavos) — si la API cambia, solo se toca este archivo.
export function transactionFromDto(dto: TransactionDto): Transaction {
  return {
    id: dto.id,
    merchant: dto.merchant,
    category: dto.category,
    icon: dto.icon as TransactionIcon,
    amount: dto.amount_cents / 100,
    day: dto.day,
    time: dto.time,
    method: dto.method,
    reference: dto.reference,
  };
}
