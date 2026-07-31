import { transactionFromDto } from '@/core/repositories/transaction.adapter';
import { TransactionDto } from '@/core/repositories/transaction.dto';

describe('transactionFromDto', () => {
  it('converts cents to a decimal amount and maps every field', () => {
    const dto: TransactionDto = {
      id: 't1',
      merchant: 'OXXO',
      category: 'Tiendas',
      icon: 'store',
      amount_cents: -8750,
      day: 'Hoy',
      time: '21:36',
      method: 'Índigo Débito ·· 4821',
      reference: 'POS-58210',
    };

    expect(transactionFromDto(dto)).toEqual({
      id: 't1',
      merchant: 'OXXO',
      category: 'Tiendas',
      icon: 'store',
      amount: -87.5,
      day: 'Hoy',
      time: '21:36',
      method: 'Índigo Débito ·· 4821',
      reference: 'POS-58210',
    });
  });
});
