import { describe, expect, it } from 'vitest';
import { CITIES } from '../cityData.ts';
import { BEACH_RULES } from '../data/beachRules.ts';
import { HOME_FAQ, HOME_FAQ_SCHEMA } from '../data/homeFaq.ts';
import { buildCityFAQEntries, buildCityFAQSchema } from './cityFaq.ts';
import { evaluateCityRuleStatus, getBeachAnswer, getBeachDayAnswer, getBeachDayZoneVisits, getAnnualBeachRuleText, getBeachRuleDay, getCityMapStatus, getNextBeachRuleChange, parseBelgianVisit } from './rules.ts';

const city = (slug: string) => CITIES.find(entry => entry.slug === slug)!;
// Explicit UTC offsets make fixtures independent of the machine/browser timezone.
const at = (slug: string, instant: string) => evaluateCityRuleStatus(city(slug), new Date(instant));

describe('Municipal beach access (official rules verified 2026-10-03)', () => {
  it.each([
    ['nieuwpoort', '2026-06-14T12:00:00+02:00', 'JA'],
    ['nieuwpoort', '2026-06-15T10:29:59+02:00', 'JA'],
    ['nieuwpoort', '2026-06-15T10:30:00+02:00', 'NEE'],
    ['nieuwpoort', '2026-09-15T18:30:00+02:00', 'NEE'],
    ['nieuwpoort', '2026-09-15T18:30:01+02:00', 'JA'],
    ['nieuwpoort', '2026-09-16T12:00:00+02:00', 'JA'],
    ['de-haan', '2026-06-01T12:00:00+02:00', 'JA'],
    ['de-haan', '2026-06-14T12:00:00+02:00', 'JA'],
    ['de-haan', '2026-06-15T09:59:59+02:00', 'JA'],
    ['de-haan', '2026-06-15T10:00:00+02:00', 'DEELS'],
    ['de-haan', '2026-09-15T19:00:00+02:00', 'DEELS'],
    ['de-haan', '2026-09-15T19:00:01+02:00', 'JA'],
    ['wenduine', '2026-06-14T12:00:00+02:00', 'JA'],
    ['wenduine', '2026-06-15T12:00:00+02:00', 'DEELS'],
    ['koksijde', '2026-06-01T12:00:00+02:00', 'JA'],
    ['koksijde', '2026-06-15T10:30:00+02:00', 'DEELS'],
    ['koksijde', '2026-06-15T18:30:01+02:00', 'JA'],
    ['koksijde', '2026-09-16T12:00:00+02:00', 'JA'],
    ['middelkerke', '2026-06-14T23:59:59+02:00', 'JA'],
    ['middelkerke', '2026-06-15T00:00:00+02:00', 'DEELS'],
    ['middelkerke', '2026-09-15T23:59:59+02:00', 'DEELS'],
    ['middelkerke', '2026-09-16T00:00:00+02:00', 'JA'],
    ['de-panne', '2026-06-14T12:00:00+02:00', 'JA'],
    ['de-panne', '2026-06-15T08:00:00+02:00', 'DEELS'], // zone 2 stays prohibited all day
    ['de-panne', '2026-06-15T21:00:00+02:00', 'DEELS'],
    ['de-panne', '2026-09-16T12:00:00+02:00', 'JA'],
    ['bredene', '2026-06-15T10:29:59+02:00', 'JA'],
    ['bredene', '2026-06-15T10:30:00+02:00', 'DEELS'],
    ['bredene', '2026-09-15T18:30:00+02:00', 'DEELS'],
    ['bredene', '2026-09-15T18:30:01+02:00', 'JA'],
    ['knokke-heist', '2026-03-14T12:00:00+01:00', 'JA'],
    ['knokke-heist', '2026-03-15T09:59:59+01:00', 'JA'],
    ['knokke-heist', '2026-03-15T10:00:00+01:00', 'DEELS'],
    ['knokke-heist', '2026-10-15T19:59:59+02:00', 'DEELS'],
    ['knokke-heist', '2026-10-15T20:00:00+02:00', 'JA'],
    ['knokke-heist', '2026-10-16T12:00:00+02:00', 'JA'],
    ['zeebrugge', '2026-03-14T12:00:00+01:00', 'JA'],
    ['zeebrugge', '2026-03-15T09:59:59+01:00', 'JA'],
    ['zeebrugge', '2026-03-15T10:00:00+01:00', 'DEELS'],
    ['zeebrugge', '2026-10-15T19:00:00+02:00', 'DEELS'],
    ['zeebrugge', '2026-10-15T19:00:01+02:00', 'JA'],
    ['zeebrugge', '2026-10-16T12:00:00+02:00', 'JA'],
    ['oostende', '2026-03-31T12:00:00+02:00', 'JA'],
    ['oostende', '2026-04-01T10:00:00+02:00', 'DEELS'],
    ['oostende', '2026-06-30T19:00:00+02:00', 'JA'],
    ['oostende', '2026-07-01T19:00:00+02:00', 'DEELS'],
    ['oostende', '2026-08-31T20:00:00+02:00', 'DEELS'],
    ['oostende', '2026-08-31T20:00:01+02:00', 'JA'],
    ['oostende', '2026-09-01T19:00:00+02:00', 'JA'],
    ['oostende', '2026-10-01T12:00:00+02:00', 'JA'],
    ['blankenberge', '2026-03-15T12:00:00+01:00', 'DEELS'],
    ['blankenberge', '2026-09-15T12:00:00+02:00', 'DEELS'], // source conflict: no invented all-clear
    ['blankenberge', '2026-09-16T12:00:00+02:00', 'JA'],
  ])('%s at %s → %s', (slug, instant, expected) => {
    expect(at(slug, instant).status).toBe(expected);
    expect(getCityMapStatus(city(slug), new Date(instant))).toBe(expected);
  });

  it('uses Brussels even when the ISO date or timezone differs', () => {
    expect(at('nieuwpoort', '2026-06-15T08:30:00Z').status).toBe('NEE');
    expect(at('middelkerke', '2026-06-14T22:00:00Z').status).toBe('DEELS');
    expect(at('middelkerke', '2026-09-15T22:00:00Z').status).toBe('JA');
    expect(at('knokke-heist', '2026-03-15T01:00:00-08:00').status).toBe('DEELS');
  });
  it('distinguishes Bredene winter loose access from shoulder-season leash access', () => {
    for (const instant of ['2026-03-15T12:00:00+01:00', '2026-10-15T12:00:00+02:00']) {
      const rules = at('bredene', instant);
      expect(rules.zones?.find(z => z.id === 'other')?.leash).toBe('loose');
      expect(rules.zones?.find(z => z.id === 'twins')?.leash).toBe('leashed');
    }
    for (const instant of ['2026-03-16T12:00:00+01:00', '2026-10-14T12:00:00+02:00']) expect(at('bredene', instant).zones?.[0].leash).toBe('leashed');
    expect(at('bredene', '2026-12-01T12:00:00+01:00').conditions?.join(' ')).toContain('In de duinen is loslopen niet toegestaan');
  });
  it('keeps critical zone limits and conditions in public annual text', () => {
    const text = (slug: string) => getAnnualBeachRuleText(city(slug).rules);
    expect(text('zeebrugge')).toContain('in het water');
    expect(text('zeebrugge')).toContain('GROENE ZONE');
    expect(text('nieuwpoort')).toContain('maximaal 10 meter');
    expect(text('de-panne')).toContain('slufter');
    expect(text('de-panne')).toContain('Honden de hele dag verboden');
    expect(text('koksijde')).toContain('geen algemene toelating tot een vierde hondenzone');
    expect(text('koksijde')).toContain('zolang de reddingsdienst actief is');
    expect(text('middelkerke')).toContain('maximaal 2 meter');
    expect(text('oostende')).toContain('geen permanente uitzondering');
    expect(text('oostende')).toContain('Juli en augustus');
    expect(text('knokke-heist')).toContain('geen leibandplicht');
    expect(text('blankenberge')).toContain('15 september zowel');
  });
});

describe('Public beach information shares one source', () => {
  it.each(CITIES)('$name has canonical summary, rules, sources and verification date', entry => {
    expect(entry.rules).toBe(BEACH_RULES[entry.slug]);
    expect(entry.description).toBe(BEACH_RULES[entry.slug].summary);
    expect(entry.rules.sources?.length).toBeGreaterThan(0);
    expect(entry.rules.lastVerifiedAt).toBe('2026-10-03');
    const faq = buildCityFAQEntries(entry);
    expect(faq[0].answer).toBe(getAnnualBeachRuleText(entry.rules).replace(/\s+/g, ' ').trim());
    const schema = buildCityFAQSchema(entry) as typeof HOME_FAQ_SCHEMA;
    expect(schema.mainEntity.map(q => q.acceptedAnswer.text)).toEqual(faq.map(q => q.answer));
    expect(faq[0].answer).not.toContain('Op dit moment');
  });
  it('uses exactly the visible home questions and answers in JSON-LD', () => {
    expect(HOME_FAQ_SCHEMA.mainEntity.map(q => ({ q: q.name, a: q.acceptedAnswer.text }))).toEqual(HOME_FAQ);
  });
  it('publishes the same De Haan regulation for Wenduine', () => expect(city('wenduine').rules).toBe(city('de-haan').rules));
});

describe('Contextual guide: access and leash are separate', () => {
  it.each([
    ['blankenberge', 'west', 'allowed', 'loose'], ['blankenberge', 'middle', 'allowed', 'leashed'], ['blankenberge', 'east', 'allowed', 'leashed'],
    ['zeebrugge', 'green', 'allowed', 'loose'], ['zeebrugge', 'orange', 'allowed', 'leashed'], ['zeebrugge', 'red', 'prohibited', 'unknown'],
    ['knokke-heist', 'zoute', 'allowed', 'loose'], ['knokke-heist', 'other', 'prohibited', 'unknown'],
    ['de-haan', 'all', 'allowed', 'loose'], ['wenduine', 'all', 'allowed', 'loose'],
    ['bredene', 'all', 'allowed', 'leashed'],
    ['oostende', 'east', 'allowed', 'loose'], ['oostende', 'small', 'allowed', 'short'], ['oostende', 'raversijde', 'allowed', 'short'], ['oostende', 'sport', 'allowed', 'short'], ['oostende', 'other', 'allowed', 'loose'],
    ['middelkerke', 'west', 'allowed', 'max10'], ['middelkerke', 'sport', 'allowed', 'max10'], ['middelkerke', 'east', 'allowed', 'loose'], ['middelkerke', 'other', 'allowed', 'max2'],
    ['nieuwpoort', 'all', 'allowed', 'max10'],
    ['koksijde', 'west', 'allowed', 'max10'], ['koksijde', 'andre', 'allowed', 'max10'], ['koksijde', 'east', 'allowed', 'max10'], ['koksijde', 'other', 'allowed', 'max10'],
    ['de-panne', '1', 'allowed', 'leashed'], ['de-panne', '2', 'allowed', 'leashed'], ['de-panne', '3', 'allowed', 'leashed'], ['de-panne', '4', 'allowed', 'loose'],
  ])('3 October at noon: %s zone %s → %s, %s', (slug, id, access, leash) => {
    const current = at(slug, '2026-10-03T12:00:00+02:00');
    expect(current.zones?.find(z => z.id === id)).toMatchObject({ access, leash });
    // Current answer contains the applicable zones, not a summer reference.
    if (['de-haan', 'wenduine', 'bredene', 'oostende', 'middelkerke', 'nieuwpoort', 'koksijde', 'de-panne'].includes(slug)) {
      expect(current.rule).not.toContain('15 juni');
      expect(current.rule).not.toContain('zomerverbod');
    }
  });

  it.each([
    ['2026-07-03T10:29:59+02:00', 'loose'], ['2026-07-03T10:30:00+02:00', 'leashed'],
    ['2026-07-03T18:29:59+02:00', 'leashed'], ['2026-07-03T18:30:00+02:00', 'loose'], ['2026-07-03T21:00:00+02:00', 'loose'],
  ])('De Panne at %s: zone 4 changes leash without lifting zone 2 prohibition', (instant, leash) => {
    const current = at('de-panne', instant);
    expect(current.status).toBe('DEELS');
    expect(current.zones?.find(z => z.id === '2')?.access).toBe('prohibited');
    expect(current.zones?.find(z => z.id === '4')?.leash).toBe(leash);
  });

  it('answers Koksijde directly while keeping the active-swimming-zone exclusion in every answer', () => {
    for (const instant of ['2026-01-03T12:00:00+01:00', '2026-06-14T12:00:00+02:00', '2026-07-03T09:00:00+02:00', '2026-07-03T12:00:00+02:00', '2026-10-03T12:00:00+02:00']) {
      const current = at('koksijde', instant);
      expect(current.status).toBe(instant === '2026-07-03T12:00:00+02:00' ? 'DEELS' : 'JA');
      expect(current.zones?.find(z => z.id === 'andre')?.access).toBe('allowed');
      expect(current.zones?.find(z => z.id === 'andre')?.detail).toContain('buiten de actief bewaakte zwemzones');
      expect(getBeachAnswer(current)).toContain('maximaal 10 meter');
      expect(getBeachAnswer(current)).toContain('Bewaakte zwemzones zijn verboden zolang de reddingsdienst actief is.');
    }
  });

  it.each(CITIES)('$name has complete contextual data for every published period', entry => {
    const periods = [entry.rules.winter, ...(entry.rules.summer ? [entry.rules.summer, ...(entry.rules.summer.outsideHours ? [entry.rules.summer.outsideHours] : [])] : []), ...(entry.rules.overrides ?? []).flatMap(p => [p, ...(p.outsideHours ? [p.outsideHours] : [])])];
    expect(entry.rules.guidance?.length).toBeGreaterThan(0);
    for (const period of periods) {
      expect(period.zones?.length).toBeGreaterThan(0);
      expect(new Set(period.zones?.map(z => z.id)).size).toBe(period.zones?.length);
      for (const zone of period.zones!) {
        expect(zone.boundary.length).toBeGreaterThan(10);
        expect(period.rule).toContain(zone.boundary);
        if (zone.access === 'conditional') expect(zone.detail).toBeTruthy();
      }
    }
  });
});

describe('Visit planning in Belgium', () => {
  it.each([
    ['2026-06-15', '10:30', '2026-06-15T08:30:00.000Z'],
    ['2026-01-15', '10:30', '2026-01-15T09:30:00.000Z'],
    ['2026-03-29', '01:59', '2026-03-29T00:59:00.000Z'],
    ['2026-03-29', '03:00', '2026-03-29T01:00:00.000Z'],
    ['2026-10-25', '01:59', '2026-10-24T23:59:00.000Z'],
    ['2026-10-25', '03:00', '2026-10-25T02:00:00.000Z'],
    ['2028-02-29', '12:00', '2028-02-29T11:00:00.000Z'],
  ])('%s %s is interpreted in Brussels', (date, time, expected) => expect(parseBelgianVisit(date, time).date?.toISOString()).toBe(expected));
  it.each([
    ['', '10:00'], ['2026-10-03', ''], ['2026-02-29', '12:00'], ['2026-04-31', '12:00'],
    ['2026-10-03', '24:00'], ['2026-10-03', '12:60'], ['1999-10-03', '12:00'], ['2101-10-03', '12:00'],
    ['2026-03-29', '02:00'], ['2026-03-29', '02:59'], ['2026-10-25', '02:00'], ['2026-10-25', '02:59'],
  ])('rejects invalid/ambiguous %s %s without a stale access result', (date, time) => {
    expect(parseBelgianVisit(date, time)).toMatchObject({ date: null, error: expect.any(String) });
  });

  it.each([
    ['nieuwpoort', '2026-10-03T12:00:00+02:00', '2027-06-15T10:30:00+02:00', 'NEE'],
    ['de-haan', '2026-10-03T12:00:00+02:00', '2027-06-15T10:00:00+02:00', 'DEELS'],
    ['wenduine', '2026-10-03T12:00:00+02:00', '2027-06-15T10:00:00+02:00', 'DEELS'],
    ['oostende', '2026-10-03T12:00:00+02:00', '2027-04-01T10:00:00+02:00', 'DEELS'],
    ['middelkerke', '2026-10-03T12:00:00+02:00', '2027-06-15T00:00:00+02:00', 'DEELS'],
    ['bredene', '2026-10-03T12:00:00+02:00', '2026-10-15T00:00:00+02:00', 'JA'],
    ['blankenberge', '2026-10-03T12:00:00+02:00', '2026-10-16T00:00:00+02:00', 'JA'],
    ['zeebrugge', '2026-10-03T12:00:00+02:00', '2026-10-03T19:00:01+02:00', 'JA'],
    ['knokke-heist', '2026-10-03T12:00:00+02:00', '2026-10-03T20:00:00+02:00', 'JA'],
    ['de-panne', '2026-07-03T12:00:00+02:00', '2026-07-03T18:30:00+02:00', 'DEELS'],
    ['de-panne', '2026-09-15T21:00:00+02:00', '2026-09-16T00:00:00+02:00', 'JA'],
    ['nieuwpoort', '2026-06-15T18:30:00+02:00', '2026-06-15T18:30:01+02:00', 'JA'],
    ['oostende', '2026-06-30T19:00:00+02:00', '2026-07-01T10:00:00+02:00', 'DEELS'],
    ['knokke-heist', '2026-10-15T21:00:00+02:00', '2027-03-15T10:00:00+01:00', 'DEELS'],
  ])('%s from %s changes at %s → %s', (slug, from, expected, status) => {
    const next = getNextBeachRuleChange(city(slug), new Date(from));
    expect(next?.at.toISOString()).toBe(new Date(expected).toISOString());
    expect(next?.state.status).toBe(status);
  });
});

describe('Date-only beach visits cover the whole Belgian day', () => {
  it.each([
    ['nieuwpoort', '2026-07-03', 'DEELS', ['JA', 'NEE']],
    ['de-panne', '2026-07-03', 'DEELS', ['DEELS', 'DEELS']],
    ['de-haan', '2026-07-03', 'DEELS', ['JA', 'DEELS']],
    ['wenduine', '2026-07-03', 'DEELS', ['JA', 'DEELS']],
    ['zeebrugge', '2026-10-03', 'DEELS', ['JA', 'DEELS']],
    ['knokke-heist', '2026-10-03', 'DEELS', ['JA', 'DEELS']],
    ['oostende', '2026-07-03', 'DEELS', ['JA', 'DEELS']],
    ['bredene', '2026-07-03', 'DEELS', ['JA', 'DEELS']],
    ['middelkerke', '2026-07-03', 'DEELS', ['DEELS']],
    ['koksijde', '2026-07-03', 'DEELS', ['JA', 'DEELS']],
    ['blankenberge', '2026-07-03', 'DEELS', ['DEELS']],
    ['nieuwpoort', '2026-10-03', 'JA', ['JA']],
  ])('%s on %s keeps every distinct access/leash state', (slug, date, status, periods) => {
    const day = getBeachRuleDay(city(slug), date).day!;
    expect(day.status).toBe(status);
    expect(day.periods.map(period => period.state.status)).toEqual(periods);
  });
  it('Nieuwpoort shows daytime prohibition and both allowed outside periods', () => {
    const day = getBeachRuleDay(city('nieuwpoort'), '2026-07-03').day!;
    expect(day.periods[0].label).toBe('Vóór 10:30 · Na 18:30');
    expect(day.periods[1].label).toBe('Vanaf 10:30 tot 18:30 (einduur inbegrepen)');
    expect(day.periods[1].state.zones?.every(zone => zone.access === 'prohibited')).toBe(true);
  });
  it('De Panne never lifts the all-day zone 2 ban, but covers both zone 4 leash rules', () => {
    const day = getBeachRuleDay(city('de-panne'), '2026-07-03').day!;
    expect(day.periods[0].label).toBe('Vóór 10:30 · Vanaf 18:30');
    expect(day.periods[1].label).toBe('Vanaf 10:30 tot 18:30 (einduur niet inbegrepen)');
    for (const period of day.periods) expect(period.state.zones?.find(zone => zone.id === '2')?.access).toBe('prohibited');
    expect(day.periods.map(period => period.state.zones?.find(zone => zone.id === '4')?.leash)).toEqual(['loose', 'leashed']);
  });
  it('season-end evening belongs to that day, not to the following winter day', () => {
    const lastSummer = getBeachRuleDay(city('de-panne'), '2026-09-15').day!;
    const firstWinter = getBeachRuleDay(city('de-panne'), '2026-09-16').day!;
    expect(lastSummer.status).toBe('DEELS');
    expect(firstWinter.status).toBe('JA');
    expect(firstWinter.periods).toHaveLength(1);
    expect(firstWinter.periods[0].label).toBe('De hele dag');
  });
  it.each(['2026-03-29', '2026-10-25', '2028-02-29', '2100-12-31'])('supports the entire valid date %s without requiring a clock input', date => {
    const day = getBeachRuleDay(city('nieuwpoort'), date).day!;
    expect(day.date).toBeInstanceOf(Date);
    expect(day.periods).toHaveLength(1);
    expect(day.periods[0].label).toBe('De hele dag');
  });
  it.each(['', '2026-02-29', '2026-04-31', '2101-01-01'])('rejects invalid date %s instead of a misleading day answer', date => {
    expect(getBeachRuleDay(city('nieuwpoort'), date)).toMatchObject({ day: null, error: expect.any(String) });
  });
});

describe('The guide gives concrete permission answers', () => {
  it('answers Koksijde outside the bathing season with the leash length and actual exclusion', () => {
    const answer = getBeachAnswer(at('koksijde', '2026-10-03T12:00:00+02:00'));
    expect(answer).toBe('Je hond mag op het strand. Leiband maximaal 10 meter. Bewaakte zwemzones zijn verboden zolang de reddingsdienst actief is.');
    expect(answer).not.toMatch(/controleer|voorwaarden|onbekend/i);
  });
  it('a Koksijde summer date retains the limited daytime zones and active-swimming-zone prohibition', () => {
    const answer = getBeachDayAnswer(getBeachRuleDay(city('koksijde'), '2026-07-03').day!);
    expect(answer).toContain('Vanaf 10:30 tot 18:30 (einduur inbegrepen)');
    expect(answer).toContain('Permanente zone bij De Panne, Permanente zone Sint-André, Permanente zone Oostduinkerke');
    expect(answer).toContain('maximaal 10 meter');
    expect(answer).toContain('Bewaakte zwemzones zijn verboden zolang de reddingsdienst actief is.');
  });
  it('Nieuwpoort date planning puts the daytime ban directly in the main answer', () => {
    const answer = getBeachDayAnswer(getBeachRuleDay(city('nieuwpoort'), '2026-07-03').day!);
    expect(answer).toContain('Vanaf 10:30 tot 18:30 (einduur inbegrepen): honden verboden op het strand.');
    expect(answer).toContain('Buiten die uren');
    expect(answer).toContain('maximaal 10 meter');
  });
  it('Blankenberge clearly names the known allowed zones without inventing certainty about the middle strand', () => {
    const state = at('blankenberge', '2026-09-15T12:00:00+02:00');
    expect(state.status).toBe('DEELS');
    expect(getBeachAnswer(state)).toContain('Je hond mag mee in Zone west, Zone oost.');
    expect(state.zones?.find(zone => zone.id === 'middle')?.access).toBe('conditional');
    expect(state.zones?.find(zone => zone.id === 'middle')?.detail).toContain('15 september zowel');
  });
});

describe('A date-only zone card must cover the entire day', () => {
  it('Knokke has two geographic cards and never an unqualified whole-beach summer permission', () => {
    const visits = getBeachDayZoneVisits(getBeachRuleDay(city('knokke-heist'), '2026-07-03').day!);
    expect(visits.map(visit => visit.zone.id)).toEqual(['zoute', 'other']);
    const other = visits.find(visit => visit.zone.id === 'other')!;
    expect(other.variants.map(variant => variant.zone.access)).toEqual(['allowed', 'prohibited']);
    expect(other.variants[0].label).toBe('Vóór 10:00 · Vanaf 20:00');
    expect(other.variants[1].label).toBe('Vanaf 10:00 tot 20:00 (einduur niet inbegrepen)');
  });
  it('Zeebrugge projects the evening whole-beach rule onto its three zones', () => {
    const visits = getBeachDayZoneVisits(getBeachRuleDay(city('zeebrugge'), '2026-07-03').day!);
    expect(visits.map(visit => visit.zone.id)).toEqual(['green', 'orange', 'red']);
    expect(visits.find(visit => visit.zone.id === 'orange')!.variants.map(variant => variant.zone.leash)).toEqual(['loose', 'leashed']);
    const red = visits.find(visit => visit.zone.id === 'red')!;
    expect(red.variants.map(variant => variant.zone.access)).toEqual(['allowed', 'prohibited']);
    expect(red.variants.every(variant => Boolean(variant.label))).toBe(true);
    expect(red.variants[0].label).toBe('Vóór 10:00 · Na 19:00');
  });
  it('De Haan keeps an unchanged unguarded zone compact, with hours on the guarded strand', () => {
    const visits = getBeachDayZoneVisits(getBeachRuleDay(city('de-haan'), '2026-07-03').day!);
    expect(visits).toHaveLength(2);
    expect(visits.find(visit => visit.zone.id === 'unwatched')!.variants).toHaveLength(1);
    expect(visits.find(visit => visit.zone.id === 'unwatched')!.variants[0].label).toBeUndefined();
    expect(visits.find(visit => visit.zone.id === 'watched')!.variants.every(variant => Boolean(variant.label))).toBe(true);
  });
  it('Bredene does not extend a whole-beach evening permission to the dunes', () => {
    const visits = getBeachDayZoneVisits(getBeachRuleDay(city('bredene'), '2026-07-03').day!);
    expect(visits).toHaveLength(3);
    const other = visits.find(visit => visit.zone.id === 'other')!;
    expect(other.zone.boundary).not.toContain('duinen');
    expect(other.variants.map(variant => variant.zone.access)).toEqual(['allowed', 'prohibited']);
    expect(other.variants[1].zone.detail).toContain('ook in de duinen');
    expect(other.variants.every(variant => Boolean(variant.label))).toBe(true);
  });
});
