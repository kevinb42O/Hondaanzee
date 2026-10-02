import { describe, expect, it } from 'vitest';
import { buildSupportQrUrl, parseSupportAmount, SUPPORT_RECIPIENT, SUPPORT_REFERENCE } from './support.ts';

describe('voluntary bank contributions', () => {
  it('accepts amounts above the suggestions, cents and Belgian decimal commas', () => {
    for (const [input, amount] of [['50', 50], ['125,50', 125.5], [' 2.5 ', 2.5], ['0,01', 0.01]] as const)
      expect(parseSupportAmount(input)).toBe(amount);
  });
  it('rejects ambiguous, negative, zero and imprecise amounts', () => {
    for (const input of ['', '0', '-5', '2,345', '1.000,00', '1e3', 'Infinity', 'NaN', '12abc', '999999999999999999'])
      expect(parseSupportAmount(input)).toBeNull();
  });
  it('keeps the recipient and reference consistent and encodes the exact amount', () => {
    const params = new URL(buildSupportQrUrl(parseSupportAmount('125,50')!)).searchParams;
    expect(params.get('euro')).toBe('125.50');
    expect(params.get('iban')).toBe('BE43738004886701');
    expect(params.get('bname')).toBe(SUPPORT_RECIPIENT);
    expect(params.get('info')).toBe(SUPPORT_REFERENCE);
    expect(new URL(buildSupportQrUrl()).searchParams.get('euro')).toBe('');
  });
});
