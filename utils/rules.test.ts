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
    expect(result.label).toBe('Winterregeling van kracht');
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
    const summerEnd = evaluateCityRuleStatus(zeebrugge, new Date('2026-10-15T19:00:00'));

    expect(summerStart.status).toBe('DEELS');
    expect(summerStart.label).toBe('Zomerregeling (10:00-19:00)');
    expect(summerEnd.status).toBe('DEELS');
    expect(summerEnd.label).toBe('Zomerregeling (10:00-19:00)');
  });

  it('keeps the current summer contract outside the active summer hours', () => {
    const zeebrugge = getCity('zeebrugge');

    const result = evaluateCityRuleStatus(zeebrugge, new Date('2026-03-15T09:59:00'));

    expect(result.status).toBe('DEELS');
    expect(result.label).toBe('Opgelet: Zomerregeling');
    expect(result.rule).toContain('GELE ZONE (leiband)');
  });

  it('handles override boundary dates exactly on start and end dates', () => {
    const bredene = getCity('bredene');

    const firstOverrideStart = evaluateCityRuleStatus(bredene, new Date('2026-03-16T00:00:00'));
    const firstOverrideEnd = evaluateCityRuleStatus(bredene, new Date('2026-06-14T23:59:00'));
    const summerDay = evaluateCityRuleStatus(bredene, new Date('2026-09-15T12:00:00'));
    const secondOverrideStart = evaluateCityRuleStatus(bredene, new Date('2026-09-16T00:00:00'));
    const secondOverrideEnd = evaluateCityRuleStatus(bredene, new Date('2026-10-14T23:59:00'));

    expect(firstOverrideStart.label).toBe('Opgelet: Tussenseizoen');
    expect(firstOverrideEnd.label).toBe('Opgelet: Tussenseizoen');
    expect(summerDay.label).toBe('Zomerregeling (10:30-18:30)');
    expect(secondOverrideStart.label).toBe('Opgelet: Tussenseizoen');
    expect(secondOverrideEnd.label).toBe('Opgelet: Tussenseizoen');
  });

  it('correctly transitions cities on September 15 vs September 16', () => {
    const sept15 = new Date('2026-09-15T12:00:00');
    const sept16 = new Date('2026-09-16T12:00:00');

    // Nieuwpoort
    const nieuwpoort = getCity('nieuwpoort');
    expect(evaluateCityRuleStatus(nieuwpoort, sept15).status).toBe('DEELS');
    expect(evaluateCityRuleStatus(nieuwpoort, sept15).label).toBe('Zomerregeling (10:30-18:30)');
    expect(evaluateCityRuleStatus(nieuwpoort, sept16).status).toBe('JA');
    expect(evaluateCityRuleStatus(nieuwpoort, sept16).label).toBe('Winterregeling van kracht');

    // Koksijde
    const koksijde = getCity('koksijde');
    expect(evaluateCityRuleStatus(koksijde, sept15).status).toBe('DEELS');
    expect(evaluateCityRuleStatus(koksijde, sept16).status).toBe('JA');

    // De Panne
    const dePanne = getCity('de-panne');
    expect(evaluateCityRuleStatus(dePanne, sept15).status).toBe('DEELS');
    expect(evaluateCityRuleStatus(dePanne, sept16).status).toBe('JA');

    // De Haan
    const deHaan = getCity('de-haan');
    expect(evaluateCityRuleStatus(deHaan, sept15).status).toBe('DEELS');
    expect(evaluateCityRuleStatus(deHaan, sept16).status).toBe('JA');

    // Blankenberge
    const blankenberge = getCity('blankenberge');
    expect(evaluateCityRuleStatus(blankenberge, sept15).label).toBe('Opgelet: Zomerregeling');
    expect(evaluateCityRuleStatus(blankenberge, sept16).label).toBe('Najaarsregeling');

    // Cities that continue summer through October
    const oostende = getCity('oostende');
    expect(evaluateCityRuleStatus(oostende, sept16).status).toBe('DEELS');

    const knokke = getCity('knokke-heist');
    expect(evaluateCityRuleStatus(knokke, sept16).status).toBe('DEELS');

    const zeebrugge = getCity('zeebrugge');
    expect(evaluateCityRuleStatus(zeebrugge, sept16).status).toBe('DEELS');
  });

  it('returns the same status via getCityMapStatus as the full evaluator', () => {
    const deHaan = getCity('de-haan');
    const now = new Date('2026-06-01T10:00:00');

    expect(getCityMapStatus(deHaan, now)).toBe(evaluateCityRuleStatus(deHaan, now).status);
  });
});
