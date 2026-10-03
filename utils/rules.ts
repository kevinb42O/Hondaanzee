import type { BeachRuleState, BeachZoneRule, City, CityRule, RulePeriodOverride, StatusValue } from '../types.ts';
import { BEACH_LEASH_LABELS } from '../data/beachRules.ts';

const brusselsClock = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Brussels', year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
});
export const belgianDateTimeParts = (date: Date) => Object.fromEntries(brusselsClock.formatToParts(date).map(part => [part.type, part.value]));
export const belgianDateInput = (date: Date) => { const p = belgianDateTimeParts(date); return `${p.year}-${p.month}-${p.day}`; };
export const belgianTimeInput = (date: Date) => { const p = belgianDateTimeParts(date); return `${p.hour}:${p.minute}`; };
export interface EvaluatedRuleStatus extends BeachRuleState { label: string }

/** Answer the permission question directly; known exclusions qualify that
 * answer and must never turn the whole municipality into an unknown result. */
export const getBeachAnswer = (state: BeachRuleState): string => {
  const allowed = state.zones?.filter(zone => zone.access === 'allowed') ?? [];
  const leashes = [...new Set(allowed.map(zone => zone.leash))];
  const permission = state.status === 'NEE' ? 'Je hond mag hier niet op het strand.'
    : state.status === 'JA' ? 'Je hond mag op het strand.'
    : allowed.length ? `Je hond mag mee in ${allowed.map(zone => zone.name).join(', ')}.`
    : 'De gemeentelijke bron geeft voor deze situatie geen eenduidig antwoord.';
  return [permission, leashes.length === 1 && leashes[0] !== 'unknown' ? `${BEACH_LEASH_LABELS[leashes[0]]}.` : leashes.length > 1 ? 'De leibandregels verschillen per zone.' : '', ...(state.accessExclusions ?? [])].filter(Boolean).join(' ');
};

export const formatPeriodDate = (date: string) => { const [month, day] = date.split('-'); return `${Number(day)} ${['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'][Number(month)-1]}`; };
const inDates = (date: string, period: { start: string; end: string }) => period.start <= period.end
  ? date >= period.start && date <= period.end : date >= period.start || date <= period.end;
const periodLabel = (period: { start: string; end: string; label?: string }) => `${period.label ?? 'Seizoensregeling'} (${formatPeriodDate(period.start)} t/m ${formatPeriodDate(period.end)})`;
const hoursLabel = (period: RulePeriodOverride) => period.startTime && period.endTime ? `${period.startTime}–${period.endTime}${period.endInclusive ? ' (einduur inbegrepen)' : ''}` : 'Op elk uur';
const outsideHoursLabel = (period: RulePeriodOverride) => `Vóór ${period.startTime} en ${period.endInclusive ? 'na' : 'vanaf'} ${period.endTime}`;

/** Annual reference stays in the HTML, without a frozen build-time "now". */
export const getAnnualBeachRuleSections = (rules: CityRule) => [
  ...(rules.summer ? [{ label: `${periodLabel(rules.summer)} · ${hoursLabel(rules.summer)}`, rule: rules.summer.rule },
    ...(rules.summer.outsideHours ? [{ label: `${periodLabel(rules.summer)} · ${outsideHoursLabel(rules.summer)}`, rule: rules.summer.outsideHours.rule }] : [])] : []),
  ...(rules.overrides ?? []).flatMap(period => [
    { label: `${periodLabel(period)} · ${hoursLabel(period)}`, rule: period.rule },
    ...(period.outsideHours ? [{ label: `${periodLabel(period)} · ${outsideHoursLabel(period)}`, rule: period.outsideHours.rule }] : []),
  ]),
  { label: rules.winter.start && rules.winter.end ? `${periodLabel({ ...rules.winter, start: rules.winter.start, end: rules.winter.end })} · Op elk uur` : 'Buiten het seizoen', rule: rules.winter.rule },
  ...(rules.guidance?.length ? [{ label: 'Ook van toepassing', rule: rules.guidance.join('\n\n') }] : []),
  ...(rules.special ? [{ label: 'Aanvullende regels', rule: rules.special }] : []),
  ...(rules.note ? [{ label: 'Toelichting bij de bronnen', rule: rules.note }] : []),
];
export const getAnnualBeachRuleText = (rules: CityRule) => getAnnualBeachRuleSections(rules).map(section => `${section.label}: ${section.rule}`).join('\n\n');

export const evaluateCityRuleStatus = (city: City, now: Date = new Date()): EvaluatedRuleStatus => {
  const parts = belgianDateTimeParts(now);
  const date = `${parts.month}-${parts.day}`;
  const seconds = Number(parts.hour) * 3600 + Number(parts.minute) * 60 + Number(parts.second);
  const toSeconds = (time: string) => { const [h, m] = time.split(':').map(Number); return h * 3600 + m * 60; };
  const period = city.rules.overrides?.find(p => inDates(date, p)) ?? (city.rules.summer && inDates(date, city.rules.summer) ? city.rules.summer : undefined);
  if (!period) return { ...city.rules.winter, label: city.rules.winter.start && city.rules.winter.end ? periodLabel({ ...city.rules.winter, start: city.rules.winter.start, end: city.rules.winter.end }) : 'Buiten het seizoen' };
  if (period.startTime && period.endTime && period.outsideHours) {
    const start = toSeconds(period.startTime), end = toSeconds(period.endTime);
    const beforeEnd = period.endInclusive ? seconds <= end : seconds < end;
    const active = start <= end ? seconds >= start && beforeEnd : seconds >= start || beforeEnd;
    return active
      ? { ...period, label: `${periodLabel(period)} · ${hoursLabel(period)}` }
      : { ...period.outsideHours, label: `${periodLabel(period)} · ${outsideHoursLabel(period)}` };
  }
  return { ...period, label: periodLabel(period) };
};
export const getCityMapStatus = (city: City, now: Date = new Date()): StatusValue => evaluateCityRuleStatus(city, now).status;

/** Interpret native date/time inputs in Belgium, independent of device timezone.
 * Explicitly reject impossible dates and the missing/repeated DST hour. */
export const parseBelgianVisit = (date: string, time: string): { date: Date | null; error?: string } => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return { date: null, error: 'Vul een geldige datum en een uur in.' };
  const [year, month, day] = date.split('-').map(Number), [hour, minute] = time.split(':').map(Number);
  if (year < 2000 || year > 2100 || hour > 23 || minute > 59) return { date: null, error: 'Kies een geldige datum (2000–2100) en een uur.' };
  const wall = Date.UTC(year, month - 1, day, hour, minute);
  const matches = [1, 2].map(offset => new Date(wall - offset * 3600000)).filter(candidate => belgianDateInput(candidate) === date && belgianTimeInput(candidate) === time);
  if (!matches.length) return { date: null, error: 'Deze datum of dit Belgische uur bestaat niet. Controleer de datum; bij de start van de zomertijd vervalt 02:00–02:59.' };
  if (matches.length > 1) return { date: null, error: 'Dit Belgische uur komt twee keer voor bij de overgang naar wintertijd. Kies een uur vóór 02:00 of vanaf 03:00.' };
  return { date: matches[0] };
};

const stateSignature = (state: EvaluatedRuleStatus) => JSON.stringify([state.status, state.rule]);
export interface BeachRuleChange { at: Date; state: EvaluatedRuleStatus; afterEndTime?: string }
/** Enumerate legal boundaries, then evaluate on both sides. A label/month change
 * with identical access and leash rules is deliberately not called a change. */
export const getNextBeachRuleChange = (city: City, now: Date): BeachRuleChange | null => {
  const parts = belgianDateTimeParts(now), year = Number(parts.year);
  const candidates: { at: Date; afterEndTime?: string }[] = [];
  const boundaryDays = new Set<string>();
  const periods = [...(city.rules.overrides ?? []), ...(city.rules.summer ? [city.rules.summer] : [])];
  const add = (date: string, time: string, afterEndTime?: string) => {
    const parsed = parseBelgianVisit(date, time).date;
    if (parsed) candidates.push({ at: new Date(parsed.getTime() + (afterEndTime ? 1000 : 0)), afterEndTime });
  };
  for (const candidateYear of [year, year + 1]) for (const period of periods) {
    const firstDay = `${candidateYear}-${period.start}`;
    boundaryDays.add(firstDay);
    add(firstDay, '00:00');
    const [m, d] = period.end.split('-').map(Number);
    const dayAfter = new Date(Date.UTC(candidateYear, m - 1, d + 1, 12));
    const nextDay = dayAfter.toISOString().slice(0, 10);
    boundaryDays.add(nextDay);
    add(nextDay, '00:00');
  }
  // Check the next daily boundaries AND the first day of future seasons.
  // Midnight may not change access, while 10:00 on that same day does.
  for (let delta = 0; delta <= 1; delta++) {
    const day = new Date(Date.UTC(year, Number(parts.month) - 1, Number(parts.day) + delta, 12)).toISOString().slice(0, 10);
    boundaryDays.add(day);
  }
  for (const day of boundaryDays) {
    for (const period of periods) if (period.startTime && period.endTime && inDates(day.slice(5), period)) {
      add(day, period.startTime);
      add(day, period.endTime, period.endInclusive ? period.endTime : undefined);
    }
  }
  candidates.sort((a, b) => a.at.getTime() - b.at.getTime());
  for (const candidate of candidates) {
    if (candidate.at <= now) continue;
    const before = evaluateCityRuleStatus(city, new Date(candidate.at.getTime() - 1));
    const after = evaluateCityRuleStatus(city, candidate.at);
    if (stateSignature(before) !== stateSignature(after)) return { ...candidate, state: after };
  }
  return null;
};

export interface BeachDayPeriod { label: string; state: EvaluatedRuleStatus }
export interface BeachRuleDay { date: Date; status: StatusValue; periods: BeachDayPeriod[] }
export interface BeachDayZoneVisit { zone: BeachZoneRule; variants: { zone: BeachZoneRule; label?: string }[] }
/** Project a whole-beach outside-hours permission onto the daytime zone
 * boundaries. Otherwise an unlabelled 'whole beach' card could falsely look
 * valid all day beside the restricted daytime cards. */
export const getBeachDayZoneVisits = (day: BeachRuleDay): BeachDayZoneVisit[] => {
  const reference = day.periods.reduce<BeachZoneRule[]>((largest, period) => (period.state.zones?.length ?? 0) > largest.length ? period.state.zones! : largest, []);
  const visits = new Map<string, { zone: BeachZoneRule; variants: Map<string, { zone: BeachZoneRule; labels: string[] }> }>();
  for (const period of day.periods) {
    const original = period.state.zones ?? [];
    const zones = original.length === 1 && original[0].id === 'all' && reference.length > 1
      ? reference.map(zone => ({ ...original[0], id: zone.id, name: zone.name, boundary: zone.boundary }))
      : original;
    for (const zone of zones) {
      const entry = visits.get(zone.id) ?? { zone, variants: new Map() };
      const key = JSON.stringify(zone);
      const variant = entry.variants.get(key) ?? { zone, labels: [] };
      variant.labels.push(period.label);
      entry.variants.set(key, variant);
      visits.set(zone.id, entry);
    }
  }
  return [...visits.values()].map(entry => ({ zone: entry.zone, variants: [...entry.variants.values()].map(variant => ({ zone: variant.zone, label: entry.variants.size > 1 || variant.labels.length < day.periods.length ? variant.labels.join(' · ') : undefined })) }));
};
export const getBeachDayAnswer = (day: BeachRuleDay): string => {
  if (day.periods.length === 1) return getBeachAnswer(day.periods[0].state);
  const forbidden = day.periods.find(period => period.state.status === 'NEE');
  if (forbidden && day.periods.every(period => period.state.status === 'NEE')) return getBeachAnswer(forbidden.state);
  if (forbidden) return `${forbidden.label}: honden verboden op het strand. Buiten die uren: ${getBeachAnswer(day.periods.find(period => period.state.status !== 'NEE')!.state)}`;
  const restricted = day.periods.find(period => period.state.status === 'DEELS');
  if (restricted && day.periods.some(period => period.state.status === 'JA')) return `${restricted.label}: ${getBeachAnswer(restricted.state)} Buiten die uren gelden ruimere toelatingsregels.`;
  return `${getBeachAnswer(day.periods[0].state)} De leibandregels veranderen doorheen de dag; de uren staan bij de betrokken zone.`;
};
/** A date-only visit covers the entire Belgian day, including any changes in
 * access or leash rules. Never substitute an arbitrary hour for a chosen date. */
export const getBeachRuleDay = (city: City, dateInput: string): { day: BeachRuleDay | null; error?: string } => {
  const start = parseBelgianVisit(dateInput, '00:00').date;
  if (!start) return { day: null, error: 'Kies een geldige datum tussen 2000 en 2100.' };
  const [year, month, date] = dateInput.split('-').map(Number);
  const tomorrow = new Date(Date.UTC(year, month - 1, date + 1, 12)).toISOString().slice(0, 10);
  // The last supported day can end in 2101; its length is 24 hours (January).
  const end = parseBelgianVisit(tomorrow, '00:00').date ?? new Date(start.getTime() + 86400000);
  const groups = new Map<string, { state: EvaluatedRuleStatus; labels: string[] }>();
  let cursor = start;
  let fromAfter: string | undefined;
  while (cursor < end) {
    const state = evaluateCityRuleStatus(city, cursor);
    const next = getNextBeachRuleChange(city, cursor);
    const boundary = next && next.at < end ? next : null;
    const label = cursor.getTime() === start.getTime()
      ? boundary ? `Vóór ${belgianTimeInput(boundary.at)}` : 'De hele dag'
      : boundary ? `${fromAfter ? `Na ${fromAfter}` : `Vanaf ${belgianTimeInput(cursor)}`} tot ${belgianTimeInput(boundary.at)}${boundary.afterEndTime ? ' (einduur inbegrepen)' : ' (einduur niet inbegrepen)'}`
      : fromAfter ? `Na ${fromAfter}` : `Vanaf ${belgianTimeInput(cursor)}`;
    const key = stateSignature(state);
    const group = groups.get(key);
    if (group) group.labels.push(label);
    else groups.set(key, { state, labels: [label] });
    if (!boundary) break;
    cursor = boundary.at;
    fromAfter = boundary.afterEndTime;
  }
  const periods = [...groups.values()].map(group => ({ state: group.state, label: group.labels.join(' · ') }));
  const statuses = new Set(periods.map(period => period.state.status));
  const status: StatusValue = statuses.has('INFO') ? 'INFO' : statuses.size === 1 ? periods[0].state.status : 'DEELS';
  return { day: { date: start, status, periods } };
};
