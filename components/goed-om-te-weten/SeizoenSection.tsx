import React from 'react';
import { Link } from 'react-router-dom';
import {
  Bug, Droplets, Waves, Shield, ShieldAlert, AlertTriangle,
  Search, CheckCircle2, Lightbulb
} from 'lucide-react';
import { AccordionItem, KeyTakeaway, SectionHeading, StepCard } from './SharedComponents.tsx';

interface Props {
  readonly openSections: Set<string>;
  readonly toggleSection: (id: string) => void;
}

export default function SeizoenSection({ openSections, toggleSection }: Props) {
  return (
    <>
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTIE 1B: SEIZOENSGEVAREN & PREVENTIE
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div id="seizoensgevaren" className="scroll-mt-28 mb-8">
          <div className="flex flex-col items-center text-center bg-violet-50 border-2 border-violet-200 rounded-2xl p-5 sm:p-7">
            <div className="p-3 sm:p-4 bg-violet-100 rounded-xl mb-3">
              <Shield size={28} className="text-violet-600" strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Seizoensgevaren & Preventie</h2>
            <p className="text-violet-700/60 text-sm mt-1 font-medium">Extra risico's waar weinig baasjes aan denken</p>
          </div>
        </div>

        <div className="space-y-4 mb-16">

          {/* ─── TEKEN ─── */}
          <AccordionItem
            id="teken"
            icon={<Bug size={24} className="text-rose-600" />}
            iconBg="bg-rose-50"
            title="Teken — De Onzichtbare Vijand in de Duinen"
            subtitle="Controle na elke wandeling door duin- en grasgebied"
            badge="MAART–NOV"
            badgeColor="bg-rose-100 text-rose-700"
            isOpen={openSections.has('teken')}
            onToggle={() => toggleSection('teken')}
          >
            <div className="space-y-6">
              <p className="text-slate-700 leading-relaxed">
                De kustduinen en aangrenzende graslanden zijn een <strong>hotspot voor teken</strong>. De schapenteek (<em>Ixodes ricinus</em>) is de meest voorkomende soort en kan de ziekte van Lyme, anaplasmose en babesiose overbrengen op je hond. Teken zijn actief van <strong>maart tot november</strong>, met pieken in het voorjaar en de herfst.
              </p>

              <SectionHeading
                icon={<Search size={20} className="text-rose-500" />}
                title="Waar controleer je je hond op teken?"
                description="Check deze plekken na elke duinwandeling"
              />

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { spot: '👂 Oren', detail: 'In en achter de oorschelpen' },
                  { spot: '🐾 Tussen de tenen', detail: 'Vaak over het hoofd gezien' },
                  { spot: '🦵 Oksels & liezen', detail: 'Warme, dunne huid' },
                  { spot: '👁️ Rond de ogen', detail: 'Langs de oogleden' },
                  { spot: '🐕 Halsband-area', detail: 'Onder de halsband/harnas' },
                  { spot: '🍑 Rond de staart', detail: 'Basis van de staart' },
                ].map((item) => (
                  <div key={item.spot} className="bg-rose-50 p-3 rounded-xl border border-rose-100 text-center">
                    <span className="text-sm font-bold text-slate-900 block">{item.spot}</span>
                    <span className="text-xs text-slate-500">{item.detail}</span>
                  </div>
                ))}
              </div>

              <SectionHeading
                icon={<ShieldAlert size={20} className="text-rose-500" />}
                title="Hoe verwijder je een teek correct?"
              />

              <div className="space-y-3">
                <StepCard step={1} title="Gebruik een tekentang of tekenlepel" description="Grijp de teek zo dicht mogelijk bij de huid van je hond. Gebruik nooit je blote vingers — je kunt de teek samendrukken waardoor infectieus speeksel in de wond wordt geperst." variant="danger" />
                <StepCard step={2} title="Draai langzaam en trek recht omhoog" description="Draai de teek een kwartslag en trek gelijkmatig omhoog. Niet rukken, knijpen of draaien aan het lichaam. Het doel is de kop mee te verwijderen." />
                <StepCard step={3} title="Desinfecteer de beet" description="Reinig de plek met ontsmettingsmiddel. Noteer de datum en locatie van de beet. Houd de plek de komende weken in de gaten." />
                <StepCard step={4} title="Let op alarmsignalen" description="Rode ring rond de beet (erythema migrans), koorts, gewrichtspijn, moeheid of verminderde eetlust in de weken na een tekenbeet? Ga naar de dierenarts — dit kunnen tekenen zijn van de ziekte van Lyme." variant="danger" />
              </div>

              <div className="bg-violet-50 border-2 border-violet-200 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <Lightbulb size={20} className="text-violet-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-black text-violet-900 text-sm mb-1">Preventie is beter dan genezen</h4>
                    <p className="text-violet-800 text-sm leading-relaxed">
                      Gebruik een <strong>tekenpreventief middel</strong> (spot-on, halsband of tablet) — raadpleeg je dierenarts voor het beste product voor jouw hond. Vooral als je regelmatig in de duinen wandelt, is dit essentieel. Op onze <Link to="/diensten" className="font-bold text-violet-600 underline hover:text-violet-800">dienstenpagina</Link> vind je dierenartsen aan de kust die je hierover kunnen adviseren.
                    </p>
                  </div>
                </div>
              </div>

              <KeyTakeaway
                variant="danger"
                items={[
                  'Controleer je hond na ELKE wandeling door duinen of hoog gras',
                  'Gebruik een tekentang — nooit blote vingers of vaseline',
                  'Rode ring rond de beet = mogelijke Lyme — direct naar de dierenarts',
                  'Preventie: raadpleeg je dierenarts over tekenbestrijding',
                ]}
              />
            </div>
          </AccordionItem>

          {/* ─── BLAUWALGEN ─── */}
          <AccordionItem
            id="blauwalgen"
            icon={<Droplets size={24} className="text-indigo-600" />}
            iconBg="bg-indigo-50"
            title="Blauwalgen (Cyanobacteriën)"
            subtitle="Potentieel dodelijk in stilstaand water nabij de kust"
            badge="DODELIJK"
            badgeColor="bg-red-100 text-red-700"
            isOpen={openSections.has('blauwalgen')}
            onToggle={() => toggleSection('blauwalgen')}
          >
            <div className="space-y-6">
              <p className="text-slate-700 leading-relaxed">
                Blauwalgen zijn <strong>geen algen maar cyanobacteriën</strong> die giftige stoffen produceren (microcystines, anatoxines). Ze komen vooral voor in stilstaand zoet water, maar bij warme zomers duiken ze steeds vaker op in <strong>brakke vijvers, duinmeertjes en waterpartijen nabij de kust</strong>. Voor honden kan contact <strong>dodelijk</strong> zijn — zelfs kleine hoeveelheden ingeslikt water.
              </p>

              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={20} className="text-red-600" />
                  <h4 className="font-black text-red-900">Herkenning: Hoe zien blauwalgen eruit?</h4>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 mt-3">
                  <div className="bg-white p-3 rounded-xl">
                    <p className="text-sm text-slate-700"><strong>Groenblauwe drijflaag</strong> — het water ziet eruit alsof er groene verf op drijft</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl">
                    <p className="text-sm text-slate-700"><strong>Schuim op de oever</strong> — lichtgroen, slijmerig schuim langs de waterlijn</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl">
                    <p className="text-sm text-slate-700"><strong>Vertroebeling</strong> — je kunt de bodem niet meer zien, ook in ondiep water</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl">
                    <p className="text-sm text-slate-700"><strong>Geur</strong> — een muf, aards luchtje, soms "rotte-eieren-achtig"</p>
                  </div>
                </div>
              </div>

              <SectionHeading
                icon={<AlertTriangle size={20} className="text-red-500" />}
                title="Symptomen bij honden — Dit is een NOODGEVAL"
              />

              <div className="bg-red-100 border-2 border-red-300 rounded-2xl p-5">
                <ul className="space-y-2 text-sm text-red-900">
                  <li className="flex items-start gap-2"><span className="text-red-600 font-bold">•</span>Overmatig kwijlen en braken (vaak binnen 15-30 minuten)</li>
                  <li className="flex items-start gap-2"><span className="text-red-600 font-bold">•</span>Bloederige diarree</li>
                  <li className="flex items-start gap-2"><span className="text-red-600 font-bold">•</span>Trillen, spierschokken, stuiptrekkingen</li>
                  <li className="flex items-start gap-2"><span className="text-red-600 font-bold">•</span>Ademhalingsproblemen</li>
                  <li className="flex items-start gap-2"><span className="text-red-600 font-bold">•</span>Blauwe verkleuring van tandvlees (zuurstofgebrek)</li>
                  <li className="flex items-start gap-2"><span className="text-red-600 font-bold">•</span>Leverfalen kan binnen <strong>24-72 uur</strong> optreden</li>
                </ul>
                <p className="text-red-900 font-black text-sm mt-3">⚠️ Bij vermoeden: GA ONMIDDELLIJK naar de dichtstbijzijnde dierenarts of spoedkliniek.</p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                <h4 className="font-black text-emerald-900 text-sm mb-3">✅ Preventie</h4>
                <ul className="space-y-2 text-sm text-emerald-800">
                  <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />Laat je hond <strong>nooit</strong> drinken uit stilstaand water nabij de kust</li>
                  <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />Vermijd vijvers en duinmeertjes met groenige verkleuring</li>
                  <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />Respecteer "zwemverbod"-borden altijd — ook voor je hond</li>
                  <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />Neem altijd eigen vers drinkwater mee</li>
                </ul>
              </div>

              <KeyTakeaway
                variant="danger"
                items={[
                  'Blauwalgen zijn potentieel DODELIJK voor honden — zelfs kleine hoeveelheden',
                  'Groenblauwe drijflaag of schuim = direct weg bij het water',
                  'Symptomen treden snel op (15-30 min) — onmiddellijk naar de dierenarts',
                  'Laat je hond nooit drinken uit stilstaande waterpartijen',
                ]}
              />
            </div>
          </AccordionItem>

          {/* ─── HONDENZWEMVEST & SCHERPE SCHELPEN ─── */}
          <AccordionItem
            id="zwemvest"
            icon={<Waves size={24} className="text-sky-600" />}
            iconBg="bg-sky-50"
            title="Hondenzwemvest & Scherpe Schelpen"
            subtitle="Bescherming in het water en op het strand"
            isOpen={openSections.has('zwemvest')}
            onToggle={() => toggleSection('zwemvest')}
          >
            <div className="space-y-6">
              <SectionHeading
                icon={<Shield size={20} className="text-sky-600" />}
                title="Wanneer heb je een hondenzwemvest nodig?"
              />

              <p className="text-slate-700 leading-relaxed">
                De Noordzee is <strong>geen zwembad</strong>. Sterke stroming, golfslag en muistromen kunnen zelfs uitstekende hondenzwemmers verrassen. Een hondenzwemvest is geen luxe — het is een veiligheidsmiddel dat levens redt.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-sky-50 p-5 rounded-2xl border border-sky-100">
                  <h4 className="font-black text-slate-900 text-sm mb-2">🐕 Wanneer verplicht aanbevolen?</h4>
                  <ul className="space-y-1.5 text-sm text-slate-600">
                    <li>• Kleine rassen (Chihuahua, Maltezer, etc.)</li>
                    <li>• Brachycefale rassen (Bulldog, Mops, Boxer)</li>
                    <li>• Oudere honden met verminderde conditie</li>
                    <li>• Honden die niet dagelijks zwemmen</li>
                    <li>• Bij sterke golfslag of aflandige wind</li>
                  </ul>
                </div>
                <div className="bg-sky-50 p-5 rounded-2xl border border-sky-100">
                  <h4 className="font-black text-slate-900 text-sm mb-2">✅ Waar op letten bij aankoop?</h4>
                  <ul className="space-y-1.5 text-sm text-slate-600">
                    <li>• <strong>Handvat op de rug</strong> — om je hond uit het water te tillen</li>
                    <li>• Reflecterende strips voor zichtbaarheid</li>
                    <li>• Goede pasvorm — niet te strak, niet te los</li>
                    <li>• D-ring voor de lijn</li>
                    <li>• Felgekleurde opvallende kleur (geen blauw!)</li>
                  </ul>
                </div>
              </div>

              <SectionHeading
                icon={<AlertTriangle size={20} className="text-amber-500" />}
                title="Scherpe schelpen & zeeglas"
              />

              <p className="text-slate-700 leading-relaxed">
                Mosselfragmenten, oesterschelpen en zeeglas kunnen <strong>diepe snijwonden</strong> veroorzaken aan de voetzolen van je hond. Vooral bij eb, wanneer schelpenbedden blootliggen, is het risico groot. Gebieden rond golfbrekers en strandhoofden zijn bijzonder gevaarlijk.
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <h4 className="font-black text-amber-900 text-sm mb-3">💡 Tips tegen pootblessures</h4>
                <ul className="space-y-2 text-sm text-amber-800">
                  <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-amber-500 mt-0.5 shrink-0" />Vermijd gebieden met zichtbare schelpenbedden — loop om golfbrekers heen</li>
                  <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-amber-500 mt-0.5 shrink-0" />Overweeg <strong>hondenschoentjes</strong> bij gevoelige poten of bekende schelpenstranden</li>
                  <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-amber-500 mt-0.5 shrink-0" />Controleer de poten na elke strandwandeling op kleine sneetjes</li>
                  <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-amber-500 mt-0.5 shrink-0" />Neem een <strong>mini-EHBO-setje</strong> mee: verband, desinfectans en pincet</li>
                </ul>
              </div>

              <KeyTakeaway
                variant="info"
                items={[
                  'Een hondenzwemvest is essentieel bij sterke golfslag of voor kwetsbare rassen',
                  'Let op scherpe schelpen bij eb en rond golfbrekers',
                  'Controleer de poten na elke strandwandeling op snijwonden',
                  'Neem een mini-EHBO-setje mee voor pootblessures',
                ]}
              />
            </div>
          </AccordionItem>
        </div>
    </>
  );
}
