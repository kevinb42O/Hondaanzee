import React, { useMemo, useState } from 'react';
import { CalendarDays, Clock, Info, MapPin, ShieldCheck, CheckCircle2, AlertCircle, XCircle, ArrowDown } from 'lucide-react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
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
const ZoneCard = ({ visit, index }: { visit: ZoneVisit; index: number }) => (
  <article className="rounded-[1.5rem] border border-slate-200/90 bg-white p-5 shadow-sm sm:rounded-[2rem] sm:p-6">
    <div className="flex items-start gap-3">
      <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-50 text-xs font-black text-sky-700">{String(index + 1).padStart(2, '0')}</span>
      <div><h3 className="text-base font-extrabold leading-snug text-slate-900">{visit.zone.name}</h3><p className="mt-1 text-sm leading-relaxed text-slate-500">{visit.zone.boundary}</p></div>
    </div>
    <div className="mt-4 space-y-4">
      {visit.variants.map(({ zone, label }, variantIndex) => <div key={variantIndex} className={variantIndex ? 'border-t border-slate-100 pt-4' : ''}>
        {label && <p className="mb-2 flex items-start gap-1.5 text-xs font-bold leading-relaxed text-slate-600"><Clock size={13} className="mt-0.5 shrink-0" aria-hidden="true" />{label}</p>}
        <div className="flex flex-wrap gap-2">
          <span className={`rounded-lg border px-2.5 py-1 text-xs font-bold ${ACCESS[zone.access].style}`}>{ACCESS[zone.access].label}</span>
          {zone.access !== 'prohibited' && zone.leash !== 'unknown' && <span className="rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-900">{BEACH_LEASH_LABELS[zone.leash]}</span>}
        </div>
        {zone.detail && <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700">{zone.detail}</p>}
      </div>)}
    </div>
  </article>
);

const AnswerCard = ({ status, planning, momentLabel, summary, city }: { status: StatusValue | null; planning: boolean; momentLabel: string; summary: string; city: City }) => {
  const reducedMotion = useReducedMotion();
  const mx = useMotionValue(0), my = useMotionValue(0);
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-4, 4]), { stiffness: 160, damping: 20 });
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [3, -3]), { stiffness: 160, damping: 20 });
  const theme = THEME[status ?? 'INFO'];
  const Icon = theme.Icon;
  return <div className="relative self-start lg:pt-3" style={{ perspective: 1200 }} onMouseMove={event => {
    if (reducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    mx.set((event.clientX - rect.left) / rect.width - 0.5);
    my.set((event.clientY - rect.top) / rect.height - 0.5);
  }} onMouseLeave={() => { mx.set(0); my.set(0); }}>
    <div aria-hidden="true" className={`pointer-events-none absolute -inset-4 rounded-[3rem] blur-3xl ${theme.glow}`} />
    <motion.div initial={false} animate={{ opacity: 1 }} style={reducedMotion ? undefined : { rotateX, rotateY }} className={`relative rounded-[2rem] border-2 px-6 py-7 text-center shadow-2xl shadow-slate-950/20 sm:p-9 lg:rounded-[3rem] lg:px-8 lg:py-12 xl:p-12 ${theme.card}`}>
      <Icon className="mx-auto mb-4 h-10 w-10 lg:mb-6 lg:h-14 lg:w-14" aria-hidden="true" />
      <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{planning ? 'Op jouw gekozen datum' : 'Op dit moment'}</p>
      <div aria-live="polite" aria-atomic="true">
        <p className={`my-3 font-black leading-none tracking-tighter lg:my-5 ${status === 'INFO' ? 'text-4xl lg:text-6xl' : 'text-7xl lg:text-9xl'}`}>{status === 'INFO' ? 'ONBEKEND' : status === 'DEELS' ? 'JA' : status ?? '…'}</p>
        {status === 'DEELS' && <p className="mb-3 text-xs font-black uppercase tracking-wider">{planning ? 'Beperkt tot bepaalde zones of uren' : 'Alleen in de toegelaten zones'}</p>}
        <h2 className="mx-auto max-w-md text-lg font-bold leading-relaxed text-slate-800 lg:text-xl">{summary}</h2>
        <p className="mt-4 text-xs font-semibold leading-relaxed text-slate-600">{momentLabel}</p>
      </div>
      {status && <a href={`#strandzones-${city.slug}`} className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-current/15 bg-white/70 px-4 py-2 text-xs font-extrabold transition-colors hover:bg-white"><ArrowDown size={14} aria-hidden="true" />{planning ? 'Bekijk de regels voor je bezoek' : 'Bekijk de zones en leibandregels'}</a>}
      <p className="mt-5 border-t border-current/10 pt-4 text-[11px] font-medium leading-relaxed text-slate-600">Toegang betekent niet automatisch loslopen. Controleer ook de borden en eventuele tijdelijke maatregelen ter plaatse.</p>
    </motion.div>
  </div>;
};

const StatusCheck: React.FC<{ city: City }> = ({ city }) => {
  const now = useRuleClock();
  const reducedMotion = useReducedMotion();
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
  const fadeUp = { initial: reducedMotion ? false as const : { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.65 } };

  return <div className="mx-auto max-w-3xl text-slate-900 lg:max-w-7xl">
    <div className="grid items-start gap-5 sm:gap-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12 xl:gap-20">
      <motion.div {...fadeUp} className="min-w-0 rounded-[2rem] border border-slate-200 bg-white p-6 text-center shadow-xl sm:p-8 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:text-left lg:shadow-none">
        <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-600 shadow-sm"><MapPin size={14} className="text-sky-600" aria-hidden="true" />{city.name}, België</p>
        <h1 className="text-[1.8rem] font-black leading-[1.12] tracking-tight text-slate-900 sm:text-4xl lg:text-5xl xl:text-6xl">
          <span className="lg:block">Mag mijn hond</span>{' '}<span className="text-sky-600">{planning ? 'dan' : 'nu'}</span>{' '}<span>op het </span><span className="lg:block">strand in{' '}</span>
          <span className={`relative inline-block text-sky-600 ${city.name.length > 17 ? 'text-[1.65rem] sm:text-3xl lg:text-4xl xl:text-5xl' : ''}`}>{`${city.name}?`}<svg className="absolute -bottom-2 left-0 h-3 w-full text-sky-300/50 lg:-bottom-3 lg:h-4" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true"><motion.path initial={reducedMotion ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, delay: 0.4 }} d="M0 5 Q 25 0 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" /></svg></span>
        </h1>
        <p className="mx-auto mt-6 hidden max-w-sm sm:block text-sm font-medium leading-relaxed text-slate-500 lg:mx-0 lg:mt-8 lg:text-base">Een frisse neus, zand tussen de poten. Ontdek waar je hond welkom is tijdens jouw strandbezoek.</p>
        <div className="mt-6 lg:mt-8">
          <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm" aria-label="Wanneer ga je naar het strand?">
            <button type="button" aria-pressed={!planning} onClick={() => setPlanning(false)} className={`inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors ${!planning ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}><Clock size={15} aria-hidden="true" />Nu</button>
            <button type="button" aria-pressed={planning} onClick={() => { if (!planning) { setVisitDate(belgianDateInput(now ?? new Date())); setPlanning(true); } }} className={`inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors ${planning ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}><CalendarDays size={15} aria-hidden="true" />Plan je bezoek</button>
          </div>
          {planning && <div className="mx-auto mt-4 max-w-xs text-left lg:mx-0">
            <label className="text-xs font-bold text-slate-700">Op welke datum?<input type="date" min="2000-01-01" max="2100-12-31" value={visitDate} onInput={event => setVisitDate(event.currentTarget.value)} onChange={event => setVisitDate(event.target.value)} aria-describedby="visit-help visit-error" className="mt-2 block min-h-[48px] w-full min-w-0 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm" /></label>
            <p id="visit-help" className="mt-2 text-xs leading-relaxed text-slate-500">Je kiest alleen een datum. Als regels doorheen de dag veranderen, tonen we de uren bij de betrokken zone.</p>
            {planned.error && <p id="visit-error" role="alert" className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-800">{planned.error}</p>}
          </div>}
        </div>
        <p className="mt-5 text-xs leading-relaxed text-slate-500">Regels gecontroleerd op {city.rules.lastVerifiedAt ? changeDateFormat.format(new Date(`${city.rules.lastVerifiedAt}T12:00:00Z`)) : 'onbekende datum'}.</p>
      </motion.div>
      <motion.div {...fadeUp} transition={{ duration: 0.7, delay: reducedMotion ? 0 : 0.1 }} className="min-w-0"><AnswerCard status={status} planning={planning} momentLabel={momentLabel} summary={summary} city={city} /></motion.div>
    </div>

    {status && <section id={`strandzones-${city.slug}`} className="mt-8 scroll-mt-28 sm:mt-10 lg:mt-14" aria-labelledby="beach-zones-title">
      <div className="mb-4 rounded-[1.5rem] bg-white px-5 py-5 shadow-sm sm:rounded-[2rem] sm:px-7">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-sky-600">{planning ? 'Jouw dag aan zee' : 'Jouw strandbezoek'}</p>
        <h2 id="beach-zones-title" className="text-xl font-black tracking-tight sm:text-2xl">Waar mag je hond mee?</h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">{planning ? 'Alleen de regels voor je gekozen datum.' : 'Dit geldt nu voor de strandzones.'}{hoursVary ? ' Bij zones die veranderen, staan de uren erbij. Alle uren zijn Belgische tijd.' : ''}</p>
        {planning && moment && now && belgianDateInput(moment) !== belgianDateInput(now) && <p className="mt-3 text-xs leading-relaxed text-slate-600">Gebaseerd op de laatst gecontroleerde regeling. Controleer de gemeentelijke bron opnieuw vóór je bezoek: tijdelijke of nieuwe maatregelen kunnen hiervan afwijken.</p>}
      </div>
      {conditions.length > 0 && <aside className="mb-4 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 sm:p-6" aria-label="Voorwaarden die de toegang beperken">
        <h3 className="flex items-start gap-2 text-sm font-extrabold text-amber-950"><Info size={18} className="shrink-0" aria-hidden="true" />Let hier op vóór je het strand op gaat</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm font-medium leading-relaxed text-amber-950">{conditions.map(condition => <li key={condition}>{condition}</li>)}</ul>
      </aside>}
      <div className={`grid gap-4 ${visits.length > 1 ? 'sm:grid-cols-2' : ''}`} aria-label="Strandzones voor je bezoek">{visits.map((visit, index) => <ZoneCard key={visit.zone.id} visit={visit} index={index} />)}</div>
      {!!city.rules.guidance?.length && <aside className="mt-4 rounded-[1.5rem] border border-slate-200 bg-white p-5 sm:p-6" aria-label="Aanvullende plaatselijke regels">
        <h3 className="text-sm font-extrabold">Ook goed om te weten</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600">{city.rules.guidance.map(guidance => <li key={guidance}>{guidance}</li>)}</ul>
      </aside>}
      {nextChange && <details className="mt-4 rounded-[1.5rem] border border-slate-200 bg-white px-5 py-3 text-sm sm:px-6">
        <summary className="min-h-[44px] cursor-pointer py-3 font-bold text-slate-700">Volgende verandering · {changeDateFormat.format(nextChange.at)} · {nextChange.afterEndTime ? `na ${nextChange.afterEndTime}` : belgianTimeInput(nextChange.at)}</summary>
        <ul className="mb-3 list-disc space-y-2 pl-5 leading-relaxed text-slate-600">{nextChange.state.zones?.filter(zone => JSON.stringify(current?.zones?.find(previous => previous.id === zone.id)) !== JSON.stringify(zone)).map(zone => <li key={zone.id}>{zone.name}: {ACCESS[zone.access].label.toLowerCase()}{zone.access !== 'prohibited' && zone.leash !== 'unknown' ? ` · ${BEACH_LEASH_LABELS[zone.leash].toLowerCase()}` : ''}. {zone.detail}</li>)}</ul>
      </details>}
    </section>}
    <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-white p-5 sm:mt-6 sm:rounded-[2rem] sm:p-6">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-extrabold"><ShieldCheck size={17} className="text-sky-600" aria-hidden="true" />Bronnen en laatste controle</h2><BeachRuleSources city={city} />
    </div>
    <BeachRulesOverview city={city} />
    <details className="mt-5 rounded-[1.5rem] border border-slate-200 bg-white p-5 sm:rounded-[2rem] sm:p-6"><summary className="min-h-[44px] cursor-pointer py-2 text-sm font-bold">Het weer aan zee vandaag</summary><div className="pt-3"><WeatherWidget city={city} /></div></details>
  </div>;
};
export default StatusCheck;
