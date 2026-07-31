import { HttpTransactionRepository } from '@/core/repositories/http-transaction.repository';
import { TransactionDto } from '@/core/repositories/transaction.dto';

const BASE_URL = 'https://api.indigo.test';

const dtoFixture: TransactionDto = {
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

describe('HttpTransactionRepository', () => {
  const fetchSpy = jest.spyOn(globalThis, 'fetch');

  afterEach(() => {
    fetchSpy.mockReset();
  });

  it('fetches transactions and adapts the DTO into the domain model', async () => {
    fetchSpy.mockResolvedValue(Response.json([dtoFixture]));
    const repository = new HttpTransactionRepository(BASE_URL);

    const transactions = await repository.getTransactions();

    expect(fetchSpy).toHaveBeenCalledWith(`${BASE_URL}/transactions`);
    expect(transactions).toEqual([expect.objectContaining({ id: 't1', amount: -87.5 })]);
  });

  it('throws when the response is not ok', async () => {
    fetchSpy.mockResolvedValue(new Response(null, { status: 500 }));
    const repository = new HttpTransactionRepository(BASE_URL);

    await expect(repository.getTransactions()).rejects.toThrow(/HTTP 500/);
  });
});
