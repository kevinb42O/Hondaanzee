import { describe, expect, it } from 'vitest';
import { buildObservedAt, createReportInputSchema } from './reportSchema.ts';

const basePayload = {
  category: 'gif' as const,
  city_slug: 'oostende',
  location_text: 'Ter hoogte van strandpaal 12',
  description: 'Er lag een verdachte blauwe substantie naast het wandelpad.',
  observed_preset: 'now' as const,
  observed_custom_at: '',
  confirm_no_personal_data: true as const,
};

describe('createReportInputSchema', () => {
  it('accepteert een geldige payload', () => {
    const result = createReportInputSchema.safeParse(basePayload);
    expect(result.success).toBe(true);
  });

  it('weigert telefoonnummer in beschrijving', () => {
    const result = createReportInputSchema.safeParse({
      ...basePayload,
      description: 'Bel mij op 0471 12 34 56 voor meer info.',
    });

    expect(result.success).toBe(false);
  });

  it('geeft duidelijke melding bij te korte locatie en beschrijving', () => {
    const result = createReportInputSchema.safeParse({
      ...basePayload,
      location_text: 'test',
      description: 'test',
    });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    const messages = result.error.issues.map((issue) => issue.message);
    expect(messages).toContain('De locatie is te kort. Gebruik minstens 6 tekens.');
    expect(messages).toContain('De beschrijving is te kort. Gebruik minstens 12 tekens.');
  });

  it('vereist custom datetime bij custom preset', () => {
    const result = createReportInputSchema.safeParse({
      ...basePayload,
      observed_preset: 'custom' as const,
    });

    expect(result.success).toBe(false);
  });
});

describe('buildObservedAt', () => {
  it('geeft een ISO-string terug voor custom datum', () => {
    const iso = buildObservedAt({
      observed_preset: 'custom',
      observed_custom_at: '2026-03-30T15:45',
    });

    expect(new Date(iso).toISOString()).toBe(iso);
    expect(iso.startsWith('2026-03-30')).toBe(true);
  });
});
