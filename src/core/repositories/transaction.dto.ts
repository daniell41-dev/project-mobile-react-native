// Forma esperada de un backend REST real (snake_case, monto en centavos como entero
// para evitar errores de punto flotante en dinero — práctica estándar de APIs de pagos).
export type TransactionDto = {
  id: string;
  merchant: string;
  category: string;
  icon: string;
  amount_cents: number;
  day: string;
  time: string;
  method: string;
  reference: string;
};
