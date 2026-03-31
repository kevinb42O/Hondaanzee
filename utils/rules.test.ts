import { describe, expect, it } from 'vitest';
import { CITIES } from '../cityData.ts';
import { evaluateCityRuleStatus, getCityMapStatus } from './rules.ts';

const getCity = (slug: string) => {
  const city = CITIES.find((entry) => entry.slug === slug);
  if (!city) {
    throw new Error(`City not found for slug: ${slug}`);
  }
  return city;
};

describe('evaluateCityRuleStatus', () => {
  it('uses the winter rule outside summer and override periods', () => {
    const zeebrugge = getCity('zeebrugge');

    const result = evaluateCityRuleStatus(zeebrugge, new Date('2026-02-01T12:00:00'));

    expect(result.status).toBe('JA');
    expect(result.label).toBe('Vrije toegang: Winterregeling');
    expect(result.rule).toContain('16 okt');
  });

  it('lets overrides win over summer and winter rules', () => {
    const bredene = getCity('bredene');

    const result = evaluateCityRuleStatus(bredene, new Date('2026-03-16T12:00:00'));

    expect(result.status).toBe('DEELS');
    expect(result.label).toBe('Opgelet: Tussenseizoen');
    expect(result.rule).toContain('TUSSENSEIZOEN');
  });

  it('recognizes the exact summer start and end dates for a city with time windows', () => {
    const zeebrugge = getCity('zeebrugge');

    const summerStart = evaluateCityRuleStatus(zeebrugge, new Date('2026-03-15T10:00:00'));
    const summerEnd = evaluateCityRuleStatus(zeebrugge, new Date('2026-10-15T20:00:00'));

    expect(summerStart.status).toBe('DEELS');
    expect(summerStart.label).toBe('Zomerregeling (10:00-20:00)');
    expect(summerEnd.status).toBe('DEELS');
    expect(summerEnd.label).toBe('Zomerregeling (10:00-20:00)');
  });

  it('keeps the current summer contract outside the active summer hours', () => {
    const zeebrugge = getCity('zeebrugge');

    const result = evaluateCityRuleStatus(zeebrugge, new Date('2026-03-15T09:59:00'));

    expect(result.status).toBe('DEELS');
    expect(result.label).toBe('Opgelet: Zomerregeling');
    expect(result.rule).toContain('Verboden 10u–20u');
  });

  it('handles override boundary dates exactly on start and end dates', () => {
    const bredene = getCity('bredene');

    const firstOverrideStart = evaluateCityRuleStatus(bredene, new Date('2026-03-16T00:00:00'));
    const firstOverrideEnd = evaluateCityRuleStatus(bredene, new Date('2026-06-30T23:59:00'));
    const secondOverrideStart = evaluateCityRuleStatus(bredene, new Date('2026-09-01T00:00:00'));

    expect(firstOverrideStart.label).toBe('Opgelet: Tussenseizoen');
    expect(firstOverrideEnd.label).toBe('Opgelet: Tussenseizoen');
    expect(secondOverrideStart.label).toBe('Opgelet: Tussenseizoen');
  });

  it('returns the same status via getCityMapStatus as the full evaluator', () => {
    const deHaan = getCity('de-haan');
    const now = new Date('2026-06-01T10:00:00');

    expect(getCityMapStatus(deHaan, now)).toBe(evaluateCityRuleStatus(deHaan, now).status);
  });
});
