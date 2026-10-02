export const SUPPORT_IBAN = 'BE43 7380 0488 6701';
export const SUPPORT_RECIPIENT = 'Kevin Bourguignon';
export const SUPPORT_REFERENCE = 'Donatie Hond aan Zee';

// Accept Belgian decimal commas without interpreting grouping or scientific notation.
export function parseSupportAmount(value: string): number | null {
  const normalized = value.trim().replace(',', '.');
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null;
  const [euros, decimals = ''] = normalized.split('.');
  const cents = Number(euros) * 100 + Number(decimals.padEnd(2, '0'));
  return Number.isSafeInteger(cents) && cents > 0 ? cents / 100 : null;
}

export function buildSupportQrUrl(amount?: number): string {
  const params = new URLSearchParams({
    bname: SUPPORT_RECIPIENT,
    iban: SUPPORT_IBAN.replaceAll(' ', ''),
    euro: amount === undefined ? '' : amount.toFixed(2),
    info: SUPPORT_REFERENCE,
    zero: 'blank',
  });
  return `https://epc-qr.eu/?${params}`;
}

export const formatSupportAmount = (amount: number) =>
  new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(amount);
