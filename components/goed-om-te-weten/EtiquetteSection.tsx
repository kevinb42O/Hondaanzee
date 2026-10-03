import { PENALTY_GUIDANCE } from '../../data/beachRules.ts';
import React from 'react';
import {
  HandHeart, Trash2, PawPrint, Scale, Dog, Shield, Eye,
  CheckCircle2
} from 'lucide-react';
import { AccordionItem, KeyTakeaway, SectionHeading } from './SharedComponents.tsx';

interface Props {
  readonly openSections: Set<string>;
  readonly toggleSection: (id: string) => void;
}

export default function EtiquetteSection({ openSections, toggleSection }: Props) {
  return (
    <>
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTIE 3: ETIQUETTE & DE CODE VAN DE GOEDE KUSTVRIEND
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div id="etiquette" className="scroll-mt-28 mb-8">
          <div className="flex flex-col items-center text-center bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 sm:p-7">
            <div className="p-3 sm:p-4 bg-amber-100 rounded-xl mb-3">
              <HandHeart size={28} className="text-amber-600" strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">De Code van de Goede Kustvriend</h2>
            <p className="text-amber-700/60 text-sm mt-1 font-medium">Etiquette & verantwoordelijkheid aan de kust</p>
          </div>
        </div>

        {/* Code Pledge Banner */}
        <div className="bg-gradient-to-br from-sky-600 to-cyan-700 rounded-3xl p-6 sm:p-8 text-white mb-6 shadow-xl shadow-sky-200/50">
          <div className="flex items-start gap-4">
            <div className="shrink-0 p-3 bg-white/15 rounded-2xl">
              <PawPrint size={28} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black mb-2">De Belofte</h3>
              <p className="text-sky-100 leading-relaxed text-sm sm:text-base">
                "Ik beloof het strand schoner achter te laten dan ik het vond, mijn hond altijd onder controle te houden, en respect te tonen voor de natuur, de dieren en de andere bezoekers aan de kust."
              </p>
              <p className="text-sky-200 text-xs mt-3 font-medium italic">— De Code van de Goede Kustvriend, HondAanZee.be</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-16">

          {/* ─── AFVAL ─── */}
          <AccordionItem
            id="afval"
            icon={<Trash2 size={24} className="text-teal-600" />}
            iconBg="bg-teal-50"
            title="Afval & het 'Take 3 for the Sea' Principe"
            subtitle="Laat het strand schoner achter dan je het vond"
            isOpen={openSections.has('afval')}
            onToggle={() => toggleSection('afval')}
          >
            <div className="space-y-6">
              <p className="text-slate-700 leading-relaxed">
                Het principe is simpel maar krachtig: <strong>neem bij elk bezoek minstens 3 stukken afval mee die niet van jou zijn</strong>. Als elke bezoeker dit zou doen, verdwijnt het strandafval als sneeuw voor de zon.
              </p>

              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border-2 border-teal-200 rounded-2xl p-6 text-center">
                <span className="text-5xl sm:text-6xl font-black text-teal-600">3</span>
                <p className="text-teal-800 font-bold text-lg mt-2">stukken afval meenemen</p>
                <p className="text-teal-600 text-sm mt-1">die niet van jou zijn — bij elk strandbezoek</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white border-2 border-slate-100 rounded-2xl p-5">
                  <h4 className="font-black text-slate-900 text-sm mb-3">🗑️ Wat neem je mee?</h4>
                  <ul className="space-y-1.5 text-sm text-slate-600">
                    <li>• Plastic doppen, flesjes en rietjes</li>
                    <li>• Sigarettenpeuken (de nr. 1 vervuiler!)</li>
                    <li>• Stukjes touw of visserslijn</li>
                    <li>• Piepschuim en verpakkingsmateriaal</li>
                  </ul>
                </div>
                <div className="bg-white border-2 border-slate-100 rounded-2xl p-5">
                  <h4 className="font-black text-slate-900 text-sm mb-3">🐾 Waarom is strandafval gevaarlijk voor honden?</h4>
                  <ul className="space-y-1.5 text-sm text-slate-600">
                    <li>• Honden bijten in plastic en verslikken zich</li>
                    <li>• Vishaakjes raken vast in poten of bek</li>
                    <li>• Glasscherven snijden in voetzolen</li>
                    <li>• Sigarettenfilters zijn giftig als ze ingeslikt worden</li>
                  </ul>
                </div>
              </div>

              <KeyTakeaway
                variant="info"
                items={[
                  'Neem altijd minstens 3 stukken afval mee die niet van jou zijn',
                  'Sigarettenpeuken zijn de nr. 1 strandvervuiler — ze bevatten giftige stoffen',
                  'Controleer regelmatig wat je hond opraapt of besnuffelt',
                ]}
              />
            </div>
          </AccordionItem>

          {/* ─── HONDENPOEP ─── */}
          <AccordionItem
            id="poep"
            icon={<span className="text-2xl">💩</span>}
            iconBg="bg-amber-50"
            title="De Drol — Altijd Opruimen"
            subtitle="Boetes, verantwoordelijkheid en waarom het écht uitmaakt"
            isOpen={openSections.has('poep')}
            onToggle={() => toggleSection('poep')}
          >
            <div className="space-y-6">
              <p className="text-slate-700 leading-relaxed">
                Het lijkt vanzelfsprekend, maar het blijft <strong>de nummer één klacht</strong> over honden op het strand. Hondenpoep opruimen is niet optioneel — het is <strong>wettelijk verplicht</strong> in alle Belgische kustgemeenten.
              </p>

              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 sm:p-6 text-center">
                <span className="text-3xl sm:text-4xl font-black text-red-600">Volgens lokaal reglement</span>
                <p className="text-red-800 font-bold mt-2">GAS-boete voor niet opruimen</p>
                <p className="text-red-600 text-sm mt-1">Gemeentelijke Administratieve Sanctie — varieert per gemeente</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <h4 className="font-black text-slate-900 text-sm mb-3">Waarom is het zó belangrijk?</h4>
                <ul className="space-y-2.5 text-sm text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span><strong>Parasietenoverdracht:</strong> Hondenpoep kan parasieten bevatten (spoelwormen, Giardia) die via het zand op andere honden en zelfs kinderen kunnen worden overgedragen.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span><strong>Watervervuiling:</strong> Regen spoelt hondenpoep richting zee. Het verhoogt het bacteriënniveau in het zwemwater en draagt bij aan eutrofiëring.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span><strong>Imago van hondeneigenaars:</strong> Elke niet-opgeruimde drol draagt bij aan het anti-hondensentiment en kan leiden tot strengere regels. We zijn elkaars ambassadeurs.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                <h4 className="font-black text-emerald-900 text-sm mb-3">✅ Praktische tips</h4>
                <ul className="space-y-2 text-sm text-emerald-800">
                  <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />Neem altijd meerdere zakjes mee — een reservezakje is goud waard</li>
                  <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />Gebruik een zakjeshouder aan de leiband — dan vergeet je ze nooit</li>
                  <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />Kies biologisch afbreekbare zakjes — beter voor het milieu</li>
                  <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />Geen zakje? Een servet, een blad, of desnoods een schelp als schepje werkt ook</li>
                </ul>
              </div>

              <KeyTakeaway
                variant="warning"
                items={[
                  PENALTY_GUIDANCE,
                  'Hondenpoep bevat parasieten die gevaarlijk zijn voor kinderen en andere honden',
                  'Neem altijd meerdere zakjes mee — bevestig een houder aan de leiband',
                  'Niet opruimen schaadt het imago van alle hondeneigenaars',
                ]}
              />
            </div>
          </AccordionItem>

          {/* ─── GRAVEN ─── */}
          <AccordionItem
            id="graven"
            icon={<span className="text-2xl">🕳️</span>}
            iconBg="bg-yellow-50"
            title="Gaten Graven — Altijd Dichtmaken"
            subtitle="Een open gat is een valstrik voor paarden, kinderen en wandelaars"
            isOpen={openSections.has('graven')}
            onToggle={() => toggleSection('graven')}
          >
            <div className="space-y-6">
              <p className="text-slate-700 leading-relaxed">
                Veel honden houden ervan om te graven in het zand — het is een natuurlijk gedrag dat prima is op het strand. Maar een <strong>open gat achterlaten is gevaarlijk</strong>. Langs de Belgische kust vinden regelmatig ongelukken plaats met paarden die in het donker of bij slecht zicht in gaten stappen.
              </p>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 text-center">
                  <span className="text-3xl block mb-2">🐴</span>
                  <h4 className="font-bold text-sm text-slate-900 mb-1">Paarden</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Strandpaarden en ruiters rijden vaak bij schemering of in de vroege ochtend. Een gat kan een gebroken been veroorzaken.
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 text-center">
                  <span className="text-3xl block mb-2">👶</span>
                  <h4 className="font-bold text-sm text-slate-900 mb-1">Kinderen</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Rennende kinderen trappen in gaten en verzwikken of breken hun enkel — vooral bij schemer.
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 text-center">
                  <span className="text-3xl block mb-2">♿</span>
                  <h4 className="font-bold text-sm text-slate-900 mb-1">Strandrolstoelen</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Gaten in het zand maken het strand ontoegankelijk voor rolstoelgebruikers en strandrolstoelen.
                  </p>
                </div>
              </div>

              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5 text-center">
                <p className="text-emerald-800 font-black text-lg">
                  🏖️ De regel is simpel: <span className="text-emerald-600">graaf het gat dicht voor je vertrekt</span>
                </p>
                <p className="text-emerald-600 text-sm mt-2">Het kost 30 seconden en kan een ernstig ongeluk voorkomen</p>
              </div>

              <KeyTakeaway
                variant="info"
                items={[
                  'Laat je hond gerust graven — maar maak het gat altijd dicht als je vertrekt',
                  'Open gaten zijn gevaarlijk voor paarden, kinderen en mindervaliden',
                  'Dit kost je 30 seconden en voorkomt ernstige blessures',
                ]}
              />
            </div>
          </AccordionItem>

          {/* ─── BOETES & WETGEVING ─── */}
          <AccordionItem
            id="boetes"
            icon={<Scale size={24} className="text-slate-700" />}
            iconBg="bg-slate-100"
            title="Boetes & Wetgeving — Het Kan Duur Uitvallen"
            subtitle="De sanctie hangt af van het toepasselijke reglement"
            badge="LOKALE REGELS"
            badgeColor="bg-red-100 text-red-700"
            isOpen={openSections.has('boetes')}
            onToggle={() => toggleSection('boetes')}
          >
            <div className="space-y-6">
              <p className="text-slate-700 leading-relaxed">{PENALTY_GUIDANCE}</p>
              <p className="text-sm text-slate-600">Controleer de gemeentelijke bronlinks op de stadspagina van je bestemming. Voor natuurgebieden gelden ook de toegangsregels van de beheerder.</p>

              <SectionHeading
                icon={<Eye size={20} className="text-slate-600" />}
                title="Waar controleren ze het meest?"
              />

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <h4 className="font-bold text-sm text-slate-900 mb-1">🏖️ Op het strand</h4>
                  <p className="text-xs text-slate-600">Respecteer de verboden zones en uren. De regels gelden ook buiten drukke stranddagen; raadpleeg de stadspagina voor de gemeentelijke bron.</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <h4 className="font-bold text-sm text-slate-900 mb-1">🌲 In de duinen & bossen</h4>
                  <p className="text-xs text-slate-600">In natuurgebieden gelden afzonderlijke toegangsregels en verboden. Een strandtoelating geeft geen toestemming om het natuurreservaat te betreden.</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <h4 className="font-bold text-sm text-slate-900 mb-1">🚶 Op de zeedijk</h4>
                  <p className="text-xs text-slate-600">Op de zeedijk gelden andere regels dan op het strand. Controleer de lokale leibandplicht en maximale lengte.</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <h4 className="font-bold text-sm text-slate-900 mb-1">🅿️ Aan losloopzones</h4>
                  <p className="text-xs text-slate-600">De weg van en naar de losloopzone = leiband verplicht. Sommige baasjes laten hun hond al loslopen op de parking — dat is een overtreding.</p>
                </div>
              </div>

              {/* DogID / Identificatieplicht */}
              <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <Dog size={20} className="text-sky-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-black text-sky-900 text-sm mb-1">Identificatieplicht: DogID is verplicht</h4>
                    <p className="text-sky-800 text-sm leading-relaxed">
                      In België moet elke hond <strong>gechipt</strong> (microchip) en <strong>geregistreerd</strong> zijn in de centrale databank <a href="https://www.dogid.be" target="_blank" rel="noopener noreferrer" className="font-bold text-sky-600 underline hover:text-sky-800">DogID.be</a>. Dit is verplicht vóór de leeftijd van 8 weken of vóór de eerste verkoop/weggave. Bij controle op straat of strand kan de politie de chip scannen. Geen registratie = boete + mogelijke inbeslagname.
                    </p>
                  </div>
                </div>
              </div>

              {/* Aansprakelijkheid */}
              <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <Shield size={20} className="text-violet-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-black text-violet-900 text-sm mb-1">Aansprakelijkheid: Jij bent verantwoordelijk</h4>
                    <p className="text-violet-800 text-sm leading-relaxed">
                      Als je hond schade veroorzaakt — een beet, een fietser die valt, een ander dier verwondt — ben <strong>jij als eigenaar burgerlijk aansprakelijk</strong> . Check vóór je naar de kust vertrekt of jouw <strong>familiale verzekering (BA Privé)</strong> schade door huisdieren dekt. De meeste polissen doen dit standaard, maar controleer de uitsluitingen (sommige rassen, niet-aangelijnd, etc.).
                    </p>
                  </div>
                </div>
              </div>

              <KeyTakeaway
                variant="danger"
                items={[
                  PENALTY_GUIDANCE,
                  'De strandregels geven geen toegang tot beschermde natuurgebieden',
                  'Geen poepzakje bij je? Dát alleen is al een overtreding',
                  'Je hond moet geregistreerd zijn in DogID — verplicht in heel België',
                ]}
              />
            </div>
          </AccordionItem>
        </div>
    </>
  );
}
