import { Transaction } from '@/core/models/transaction.model';
import { groupTransactionsByDay } from '@/shared/utils/groupByDay';

function tx(overrides: Partial<Transaction>): Transaction {
  return {
    id: 't1',
    merchant: 'Comercio',
    category: 'Compras',
    icon: 'bag',
    amount: -100,
    day: 'Hoy',
    time: '10:00',
    method: 'Débito',
    reference: 'REF-1',
    ...overrides,
  };
}

describe('groupTransactionsByDay', () => {
  it('groups consecutive transactions sharing the same day', () => {
    const sections = groupTransactionsByDay([
      tx({ id: 't1', day: 'Hoy' }),
      tx({ id: 't2', day: 'Hoy' }),
      tx({ id: 't3', day: 'Ayer' }),
    ]);

    expect(sections).toEqual([
      { title: 'Hoy', data: [expect.objectContaining({ id: 't1' }), expect.objectContaining({ id: 't2' })] },
      { title: 'Ayer', data: [expect.objectContaining({ id: 't3' })] },
    ]);
  });

  it('returns an empty array for no transactions', () => {
    expect(groupTransactionsByDay([])).toEqual([]);
  });
});
