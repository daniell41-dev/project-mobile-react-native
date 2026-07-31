import { NumericKey } from '@/shared/components/NumericKeypad';

// Lógica de construcción de un monto a partir de las pulsaciones del NumericKeypad:
// backspace borra el último carácter (sin dejar el campo vacío), el punto no se
// duplica, y no se permiten más de 2 decimales.
export function applyNumericKey(amount: string, key: NumericKey): string {
  if (key === 'backspace') {
    return amount.length > 1 ? amount.slice(0, -1) : '0';
  }
  if (key === '.') {
    return amount.includes('.') ? amount : `${amount}.`;
  }
  const [, decimals] = amount.split('.');
  if (decimals && decimals.length >= 2) {
    return amount;
  }
  return amount === '0' ? key : `${amount}${key}`;
}
