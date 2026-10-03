import React from 'react';
import type { City } from '../types.ts';
import { getAnnualBeachRuleSections } from '../utils/rules.ts';

export const BeachRuleSources = ({ city }: { city: City }) => (
  <div className="text-sm text-slate-600 space-y-2">
    <p>Gecontroleerd op {city.rules.lastVerifiedAt ? new Intl.DateTimeFormat('nl-BE', { dateStyle: 'long', timeZone: 'Europe/Brussels' }).format(new Date(`${city.rules.lastVerifiedAt}T12:00:00Z`)) : 'onbekende datum'}.</p>
    <ul className="space-y-1">
      {city.rules.sources?.map(source => <li key={source.url}><a className="underline underline-offset-2 hover:text-sky-700" href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a></li>)}
    </ul>
    <p>Volg de plaatselijke afbakening en tijdelijke maatregelen. Toegelaten betekent niet automatisch dat je hond los mag lopen.</p>
  </div>
);
export const BeachRulesOverview = ({ city }: { city: City }) => (
  <details className="city-disclosure" data-beach-annual-reference>
    <summary className="text-slate-800">Volledige jaarregeling voor {city.name}</summary>
    <p className="mt-3 text-sm leading-relaxed text-slate-600">Naslagwerk voor andere periodes. Bij overlappende datums geldt de specifiekere periode. Kies hierboven een datum voor de regels van die volledige dag. Uren verschijnen alleen bij zones waarvan de regels doorheen de dag veranderen.</p>
    <div className="mt-6 space-y-6">
      {getAnnualBeachRuleSections(city.rules).map((section, i) => <div key={i}><h3 className="font-bold mb-2">{section.label}</h3><p className="whitespace-pre-line text-sm leading-relaxed">{section.rule}</p></div>)}
    </div>
    <p className="mt-6 text-sm text-slate-600">De bronlinks en controledatum staan bij het antwoord hierboven.</p>
  </details>
);
