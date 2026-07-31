import { applyNumericKey } from '@/shared/utils/applyNumericKey';

describe('applyNumericKey', () => {
  it('replaces the leading zero with the first digit', () => {
    expect(applyNumericKey('0', '5')).toBe('5');
  });

  it('appends digits', () => {
    expect(applyNumericKey('5', '2')).toBe('52');
  });

  it('adds a single decimal point', () => {
    expect(applyNumericKey('52', '.')).toBe('52.');
    expect(applyNumericKey('52.', '.')).toBe('52.');
  });

  it('limits to 2 decimal places', () => {
    expect(applyNumericKey('52.5', '0')).toBe('52.50');
    expect(applyNumericKey('52.50', '0')).toBe('52.50');
  });

  it('backspaces without leaving an empty string', () => {
    expect(applyNumericKey('52', 'backspace')).toBe('5');
    expect(applyNumericKey('5', 'backspace')).toBe('0');
  });
});
