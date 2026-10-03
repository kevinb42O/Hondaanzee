import React, { useMemo, useState } from 'react';
import { CalendarDays, Clock, Info, MapPin, ShieldCheck, CheckCircle2, AlertCircle, XCircle, ArrowDown, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Breadcrumb from './Breadcrumb.tsx';
import type { BeachZoneRule, City, StatusValue } from '../types.ts';
import { BEACH_LEASH_LABELS } from '../data/beachRules.ts';
import { belgianDateInput, belgianTimeInput, evaluateCityRuleStatus, getBeachAnswer, getBeachDayAnswer, getBeachDayZoneVisits, getBeachRuleDay, getNextBeachRuleChange, type BeachRuleDay } from '../utils/rules.ts';
import { useRuleClock } from '../utils/useRuleClock.ts';
import { BeachRulesOverview, BeachRuleSources } from './BeachRulesOverview.tsx';
import { WeatherWidget } from './WeatherWidget.tsx';

const dateFormat = new Intl.DateTimeFormat('nl-BE', { dateStyle: 'full', timeZone: 'Europe/Brussels' });
const changeDateFormat = new Intl.DateTimeFormat('nl-BE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Brussels' });
const ACCESS = {
  allowed: { label: 'Toegestaan', style: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  prohibited: { label: 'Verboden', style: 'bg-rose-50 text-rose-800 border-rose-200' },
  conditional: { label: 'Seizoensregeling hieronder', style: 'bg-amber-50 text-amber-900 border-amber-200' },
};
const THEME = {
  JA: { card: 'text-emerald-700 bg-emerald-50 border-emerald-200', glow: 'bg-emerald-400/25', Icon: CheckCircle2 },
  DEELS: { card: 'text-orange-700 bg-orange-50 border-orange-200', glow: 'bg-orange-400/25', Icon: AlertCircle },
  NEE: { card: 'text-rose-700 bg-rose-50 border-rose-200', glow: 'bg-rose-400/25', Icon: XCircle },
  INFO: { card: 'text-sky-800 bg-sky-50 border-sky-200', glow: 'bg-sky-400/20', Icon: Info },
};
type ZoneVisit = { zone: BeachZoneRule; variants: { zone: BeachZoneRule; label?: string }[] };
// If the complete beach has one identical rule, named summer subdivisions add
// no information to this visit. Keep them in the annual reference instead.
const compactZones = (zones: BeachZoneRule[]): BeachZoneRule[] => {
  const first = zones[0];
  if (first && zones.length > 1 && zones.some(zone => zone.id === 'other') && zones.every(zone => zone.access === 'allowed' && zone.leash === first.leash && zone.detail === first.detail)) {
    return [{ ...first, id: 'all', name: 'Volledige strand', boundary: 'Alle stranddelen van deze bestemming' }];
  }
  return zones;
};
// Unchanged zones are shown once. Only the zones whose rules vary need hours.
const dayZones = (day: BeachRuleDay): ZoneVisit[] => {
  if (day.periods.length === 1) return compactZones(day.periods[0].state.zones ?? []).map(zone => ({ zone, variants: [{ zone }] }));
  return getBeachDayZoneVisits(day);
};
const ZoneRow = ({ visit, index }: { visit: ZoneVisit; index: number }) => (
  <article className="city-zone-row">
    <div className="city-zone-heading">
      <span aria-hidden="true" className="city-zone-number">{String(index + 1).padStart(2, '0')}</span>
      <div>
        <h3>{visit.zone.name}</h3>
        <p>{visit.zone.boundary}</p>
      </div>
    </div>
    <div className="city-zone-rules">
      {visit.variants.map(({ zone, label }, variantIndex) => (
        <div key={variantIndex} className={variantIndex ? 'city-zone-variant' : undefined}>
          {label && <p className="city-zone-hours"><Clock size={14} aria-hidden="true" />{label}</p>}
          <div className="flex flex-wrap gap-2">
            <span className={`city-rule-label ${ACCESS[zone.access].style}`}>{ACCESS[zone.access].label}</span>
            {zone.access !== 'prohibited' && zone.leash !== 'unknown' && <span className="city-rule-label bg-sky-50 text-sky-900 border-sky-200">{BEACH_LEASH_LABELS[zone.leash]}</span>}
          </div>
          {zone.detail && <p className="city-zone-detail">{zone.detail}</p>}
        </div>
      ))}
    </div>
  </article>
);

const AnswerCard = ({ status, planning, momentLabel, summary, city }: { status: StatusValue | null; planning: boolean; momentLabel: string; summary: string; city: City }) => {
  const theme = THEME[status ?? 'INFO'];
  const Icon = theme.Icon;
  return (
    <div className="city-answer-wrap">
      <div aria-hidden="true" className={`city-answer-glow ${theme.glow}`} />
      <div className={`city-answer ${theme.card}`} data-beach-answer>
        <Icon className="city-answer-icon" aria-hidden="true" />
        <p className="city-answer-eyebrow">{planning ? 'Op jouw gekozen datum' : 'Op dit moment'}</p>
        <div aria-live="polite" aria-atomic="true">
          <p className={`city-answer-value ${status === 'INFO' ? 'city-answer-value-info' : ''}`}>{status === 'INFO' ? 'ONBEKEND' : status === 'DEELS' ? 'JA' : status ?? '…'}</p>
          {status === 'DEELS' && <p className="city-answer-condition">{planning ? 'Beperkt tot bepaalde zones of uren' : 'Alleen in de toegelaten zones'}</p>}
          <h2 className="city-answer-summary">{summary}</h2>
          <p className="city-answer-moment">{momentLabel}</p>
        </div>
        {status && <a href={`#strandzones-${city.slug}`} className="city-answer-link"><ArrowDown size={16} aria-hidden="true" />{planning ? 'Bekijk de regels voor je bezoek' : 'Bekijk de zones en leibandregels'}</a>}
        <p className="city-answer-note">Toegang betekent niet automatisch loslopen. Controleer ook de borden en eventuele tijdelijke maatregelen ter plaatse.</p>
      </div>
    </div>
  );
};

const StatusCheck: React.FC<{ city: City }> = ({ city }) => {
  const now = useRuleClock();
  const [planning, setPlanning] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const planned = useMemo(() => planning ? getBeachRuleDay(city, visitDate) : { day: null }, [city, planning, visitDate]);
  const current = useMemo(() => now ? evaluateCityRuleStatus(city, now) : null, [city, now]);
  const nextChange = useMemo(() => !planning && now ? getNextBeachRuleChange(city, now) : null, [city, planning, now]);
  const day = planned.day;
  const status = planning ? day?.status ?? null : current?.status ?? null;
  const moment = planning ? day?.date ?? null : now;
  const visits = useMemo(() => planning ? day ? dayZones(day) : [] : compactZones(current?.zones ?? []).map(zone => ({ zone, variants: [{ zone }] })), [planning, day, current]);
  const conditions = [...new Set(planning ? day?.periods.flatMap(period => [...(period.state.accessExclusions ?? []), ...(period.state.conditions ?? [])]) ?? [] : [...(current?.accessExclusions ?? []), ...(current?.conditions ?? [])])];
  const hoursVary = planning && day && day.periods.length > 1;
  const summary = planning ? day ? getBeachDayAnswer(day) : 'Kies een datum voor de regels van die dag.' : current ? getBeachAnswer(current) : 'We bekijken de regels voor jouw strandbezoek.';
  const momentLabel = moment ? `${dateFormat.format(moment)}${planning ? ' · de volledige dag' : ` · ${belgianTimeInput(moment)} Belgische tijd`}` : planning ? 'Geen berekening: kies een geldige datum.' : 'De actuele status wordt in je browser berekend.';
  return (
    <div className="city-status">
      <section className="city-hero" aria-labelledby="city-hero-title">
        <div aria-hidden="true" className="city-hero-backdrop">
          <img src={city.image} alt="" loading="eager" decoding="async" fetchPriority="high" />
        </div>
        <div className="city-shell">
          <div className="city-hero-nav">
            <Link to="/" className="city-back-link"><ArrowLeft size={17} aria-hidden="true" />Terug naar overzicht</Link>
            <Breadcrumb className="city-breadcrumb" items={[{ label: 'Home', to: '/' }, { label: city.name }]} />
          </div>
          <div className="city-hero-grid">
            <div className="city-hero-copy">
              <p className="city-eyebrow"><MapPin size={16} aria-hidden="true" />{city.name}, België</p>
              <h1 id="city-hero-title">Mag mijn hond <span className="text-sky-600">{planning ? 'dan' : 'nu'}</span> op het strand in <span className="city-hero-name">{city.name.includes(' - ') ? <><span className="whitespace-nowrap">{city.name.split(' - ')[0]} -</span>{' '}{city.name.split(' - ')[1]}?</> : `${city.name}?`}</span></h1>
              <p className="city-hero-description">Een frisse neus, zand tussen de poten. Ontdek waar je hond welkom is tijdens jouw strandbezoek.</p>
              <div className="city-visit-controls">
                <div className="city-visit-switch" role="group" aria-label="Wanneer ga je naar het strand?">
                  <button type="button" aria-pressed={!planning} onClick={() => setPlanning(false)}><Clock size={16} aria-hidden="true" />Nu</button>
                  <button type="button" aria-pressed={planning} onClick={() => { if (!planning) { setVisitDate(belgianDateInput(now ?? new Date())); setPlanning(true); } }}><CalendarDays size={16} aria-hidden="true" />Plan je bezoek</button>
                </div>
                {planning && <div className="city-date-picker">
                  <label htmlFor="city-visit-date">Op welke datum?</label>
                  <input id="city-visit-date" type="date" min="2000-01-01" max="2100-12-31" value={visitDate} onChange={event => setVisitDate(event.target.value)} aria-invalid={Boolean(planned.error)} aria-describedby={planned.error ? 'visit-help visit-error' : 'visit-help'} />
                  <p id="visit-help">Als regels doorheen de dag veranderen, tonen we de uren bij de betrokken zone.</p>
                  {planned.error && <p id="visit-error" role="alert">{planned.error}</p>}
                </div>}
              </div>
              <p className="city-hero-verified">Regels gecontroleerd op {city.rules.lastVerifiedAt ? changeDateFormat.format(new Date(`${city.rules.lastVerifiedAt}T12:00:00Z`)) : 'onbekende datum'}.</p>
            </div>
            <AnswerCard status={status} planning={planning} momentLabel={momentLabel} summary={summary} city={city} />
          </div>
        </div>
      </section>

      <section className="city-section city-beach-section" aria-label="Strandregels en praktische informatie">
        <div className="city-shell">
          {status && <div id={`strandzones-${city.slug}`} className="city-beach-zones" aria-labelledby="beach-zones-title">
            <div className="city-section-heading">
              <p className="city-eyebrow">{planning ? 'Jouw dag aan zee' : 'Jouw strandbezoek'}</p>
              <h2 id="beach-zones-title" className="city-section-title">Waar mag je hond mee?</h2>
              <p className="city-body-copy">{planning ? 'Alleen de regels voor je gekozen datum.' : 'Dit geldt nu voor de strandzones.'}{hoursVary ? ' Bij zones die veranderen, staan de uren erbij. Alle uren zijn Belgische tijd.' : ''}</p>
              {planning && moment && now && belgianDateInput(moment) !== belgianDateInput(now) && <p className="mt-3 max-w-2xl text-xs leading-relaxed text-slate-600">Gebaseerd op de laatst gecontroleerde regeling. Controleer de gemeentelijke bron opnieuw vóór je bezoek: tijdelijke of nieuwe maatregelen kunnen hiervan afwijken.</p>}
            </div>
            {conditions.length > 0 && <aside className="city-rule-notice" aria-label="Voorwaarden die de toegang beperken">
              <h3><Info size={18} aria-hidden="true" />Let hier op vóór je het strand op gaat</h3>
              <ul>{conditions.map(condition => <li key={condition}>{condition}</li>)}</ul>
            </aside>}
            <div className="city-zone-list" aria-label="Strandzones voor je bezoek">{visits.map((visit, index) => <ZoneRow key={visit.zone.id} visit={visit} index={index} />)}</div>
            {!!city.rules.guidance?.length && <aside className="city-rule-guidance" aria-label="Aanvullende plaatselijke regels">
              <h3>Ook goed om te weten</h3>
              <ul>{city.rules.guidance.map(guidance => <li key={guidance}>{guidance}</li>)}</ul>
            </aside>}
            {nextChange && <details className="city-disclosure city-next-change">
              <summary>Volgende verandering · {changeDateFormat.format(nextChange.at)} · {nextChange.afterEndTime ? `na ${nextChange.afterEndTime}` : belgianTimeInput(nextChange.at)}</summary>
              <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600">{nextChange.state.zones?.filter(zone => JSON.stringify(current?.zones?.find(previous => previous.id === zone.id)) !== JSON.stringify(zone)).map(zone => <li key={zone.id}>{zone.name}: {ACCESS[zone.access].label.toLowerCase()}{zone.access !== 'prohibited' && zone.leash !== 'unknown' ? ` · ${BEACH_LEASH_LABELS[zone.leash].toLowerCase()}` : ''}. {zone.detail}</li>)}</ul>
            </details>}
          </div>}
          <div className="city-beach-reference">
            <div className="city-rule-sources">
              <h2><ShieldCheck size={18} aria-hidden="true" />Bronnen en laatste controle</h2>
              <BeachRuleSources city={city} />
            </div>
            <div className="city-reference-disclosures">
              <BeachRulesOverview city={city} />
              <details className="city-disclosure"><summary>Het weer aan zee vandaag</summary><div className="pt-4"><WeatherWidget city={city} /></div></details>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
export default StatusCheck;
