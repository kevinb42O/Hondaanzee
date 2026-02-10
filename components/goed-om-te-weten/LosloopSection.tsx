import React from 'react';
import { Link } from 'react-router-dom';
import {
  Fence, Dog, HandHeart, ShieldAlert, Eye, Siren, Sparkles, Heart,
  AlertTriangle, CheckCircle2, Lightbulb, ArrowRight, Users
} from 'lucide-react';
import { AccordionItem, KeyTakeaway, SectionHeading, StepCard } from './SharedComponents.tsx';

interface Props {
  readonly openSections: Set<string>;
  readonly toggleSection: (id: string) => void;
}

export default function LosloopSection({ openSections, toggleSection }: Props) {
  return (
    <>
        <div id="losloopweides" className="scroll-mt-28 mb-8">
          <div className="flex flex-col items-center text-center bg-teal-50 border-2 border-teal-200 rounded-2xl p-5 sm:p-7">
            <div className="p-3 sm:p-4 bg-teal-100 rounded-xl mb-3">
              <Fence size={28} className="text-teal-600" strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Losloopweides aan de Kust</h2>
            <p className="text-teal-700/60 text-sm mt-1 font-medium">Veiligheid, etiquette & je verantwoordelijkheid</p>
          </div>
        </div>

        {/* Intro Block */}
        <div className="bg-gradient-to-br from-teal-600 to-emerald-700 rounded-3xl p-6 sm:p-8 text-white mb-6 shadow-xl shadow-teal-200/50">
          <div className="flex items-start gap-4">
            <div className="shrink-0 p-3 bg-white/15 rounded-2xl">
              <Dog size={28} className="text-white" />
            </div>
            <div>
              <h3 className="font-black text-xl mb-2">De losloopweide is een privilege, geen recht</h3>
              <p className="text-teal-100 leading-relaxed text-sm sm:text-base">
                Langs de Belgische kust zijn losloopweides <strong className="text-white">schaarse pareltjes</strong> — omheinde zones waar je hond vrij kan rennen en socialiseren. Ze bestaan dankzij de goodwill van gemeenten en omwonenden. Jouw gedrag bepaalt of ze <strong className="text-white">blijven bestaan</strong>. Eén slechte ervaring kan leiden tot sluiting. Behandel daarom elke losloopweide alsof het je eigen tuin is.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-16">

          {/* ─── ETIQUETTE IN DE LOSLOOPWEIDE ─── */}
          <AccordionItem
            id="losloop-etiquette"
            icon={<HandHeart size={24} className="text-teal-600" />}
            iconBg="bg-teal-50"
            title="Etiquette — De Ongeschreven Regels"
            subtitle="Hoe je zorgt dat iedereen het naar zijn zin heeft"
            isOpen={openSections.has('losloop-etiquette')}
            onToggle={() => toggleSection('losloop-etiquette')}
          >
            <div className="space-y-6">
              <SectionHeading
                icon={<Users size={20} className="text-teal-500" />}
                title="De gouden regels van de losloopweide"
                description="Volg deze basisregels en je bent een held"
              />

              <div className="grid gap-3">
                {[
                  {
                    emoji: '👀',
                    title: 'Houd je hond ALTIJD in het oog',
                    desc: 'Een losloopweide is geen oppasplek. Je hoort je hond te zien, te horen en binnen 5 seconden te bereiken. Leg je telefoon neer.',
                  },
                  {
                    emoji: '🐕',
                    title: 'Controleer het terrein voordat je de poort opent',
                    desc: 'Kijk wie er al binnen is. Is er een angstige hond of een piepkleine puppy? Vraag de eigenaar of het oké is om binnen te komen.',
                  },
                  {
                    emoji: '🚪',
                    title: 'Dubbele poort? Gebruik ze allebei!',
                    desc: 'Veel losloopweides hebben een dubbele poort (sas-systeem). Doe de eerste poort dicht voordat je de tweede opent. Dit voorkomt ontsnappingen.',
                  },
                  {
                    emoji: '💩',
                    title: 'Ruim OP — altijd, overal, elke keer',
                    desc: 'Dit is dé nummer-één klacht over losloopweides. Draag altijd zakjes bij je. Geen excuses. Geen "het was in het gras". Raap het op.',
                  },
                  {
                    emoji: '🦴',
                    title: 'Speelgoed & snacks: voorzichtig',
                    desc: 'Niet elke hond deelt graag. Speelgoed kan conflicten veroorzaken. Gebruik het alleen als er weinig andere honden zijn, en berg het op als er spanning ontstaat.',
                  },
                  {
                    emoji: '🤝',
                    title: 'Communiceer met andere baasjes',
                    desc: 'Zeg gedag, vertel of je hond gecastreerd/gesteriliseerd is, en wees eerlijk over het karakter van je hond. "Hij is altijd lief" is geen garantie.',
                  },
                ].map((rule) => (
                  <div key={rule.title} className="bg-teal-50 border border-teal-100 rounded-2xl p-4 flex gap-4 items-start">
                    <span className="text-2xl shrink-0 mt-0.5">{rule.emoji}</span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{rule.title}</h4>
                      <p className="text-slate-600 text-sm leading-relaxed mt-0.5">{rule.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-black text-amber-900 text-sm mb-1">Loops of ongecastreerd?</h4>
                    <p className="text-amber-800 text-sm leading-relaxed">
                      Een loopse teef hoort <strong>niet</strong> in de losloopweide — ze trekt alle reuen aan en veroorzaakt onrust en mogelijke vechtpartijen. Wacht tot de loopsheid voorbij is. Ongecastreerde reuen die dominant gedrag vertonen, zijn ook geen ideale kandidaten voor een drukke losloopweide.
                    </p>
                  </div>
                </div>
              </div>

              <KeyTakeaway
                variant="info"
                items={[
                  'Houd je hond altijd in het oog — telefoon weg, ogen op je hond',
                  'Ruim ALTIJD op — geen excuses, geen uitzonderingen',
                  'Vraag toestemming voor je binnengaat als er spanningsgevoelige honden zijn',
                  'Loop weg als de sfeer omslaat — beter safe dan sorry',
                ]}
              />
            </div>
          </AccordionItem>

          {/* ─── VEILIGHEID IN DE LOSLOOPWEIDE ─── */}
          <AccordionItem
            id="losloop-veiligheid"
            icon={<ShieldAlert size={24} className="text-red-500" />}
            iconBg="bg-red-50"
            title="Veiligheid — Voorkomen is Beter dan Genezen"
            subtitle="Herken gevaar voordat het escaleert"
            badge="BELANGRIJK"
            badgeColor="bg-red-100 text-red-700"
            isOpen={openSections.has('losloop-veiligheid')}
            onToggle={() => toggleSection('losloop-veiligheid')}
          >
            <div className="space-y-6">
              <p className="text-slate-700 leading-relaxed">
                De meeste incidenten in losloopweides zijn <strong>voorspelbaar en vermijdbaar</strong>. Leer de lichaamstaal van honden lezen, ken de risico's en weet wanneer je moet ingrijpen — of wanneer je beter kunt vertrekken.
              </p>

              <SectionHeading
                icon={<Eye size={20} className="text-red-500" />}
                title="Lichaamstaal: Wanneer is het spel en wanneer is het ernst?"
              />

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5">
                  <h4 className="font-black text-emerald-900 text-sm mb-3">✅ Gezond spel</h4>
                  <ul className="space-y-2 text-sm text-emerald-800">
                    <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />Speelboog (voorpoten laag, achterwerk omhoog)</li>
                    <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />Rolverwisseling — beide honden jagen om de beurt</li>
                    <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />Losse, wiebelende lichaamstaal</li>
                    <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />Zelfonderbreking — ze pauzeren spontaan</li>
                    <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />Open bek, ontspannen oren</li>
                  </ul>
                </div>
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
                  <h4 className="font-black text-red-900 text-sm mb-3">🚨 Waarschuwingssignalen</h4>
                  <ul className="space-y-2 text-sm text-red-800">
                    <li className="flex items-start gap-2"><AlertTriangle size={14} className="text-red-500 mt-0.5 shrink-0" />Stijf, gespannen lichaam — hond &quot;bevriest&quot;</li>
                    <li className="flex items-start gap-2"><AlertTriangle size={14} className="text-red-500 mt-0.5 shrink-0" />Direct staren zonder te knipperen</li>
                    <li className="flex items-start gap-2"><AlertTriangle size={14} className="text-red-500 mt-0.5 shrink-0" />Grommen met gesloten bek en strakke lippen</li>
                    <li className="flex items-start gap-2"><AlertTriangle size={14} className="text-red-500 mt-0.5 shrink-0" />Opgerichte haren (piloerectie) langs rug en nek</li>
                    <li className="flex items-start gap-2"><AlertTriangle size={14} className="text-red-500 mt-0.5 shrink-0" />Eén hond jaagt constant zonder rolverwisseling</li>
                  </ul>
                </div>
              </div>

              <SectionHeading
                icon={<Siren size={20} className="text-red-500" />}
                title="Wat doe je bij een bijtincident?"
              />

              <div className="space-y-3">
                <StepCard step={1} title="Schreeuw niet en raak niet in paniek" description="Schreeuwen verhoogt de spanning. Gebruik een diepe, kalme stem. Probeer NOOIT een vechtende hond met je handen te scheiden — je wordt gebeten." variant="danger" />
                <StepCard step={2} title="Scheidingtechniek: Achterpoten" description="Pak beide achterpoten van de agressor op (als een kruiwagen) en beweeg achteruit. Dit is de veiligste manier. Laat de eigenaar van de andere hond hetzelfde doen." />
                <StepCard step={3} title="Afleiding als dat mogelijk is" description="Een luide claxon, een emmer water of een jas over de kop van de hond kan de beet onderbreken. Houd altijd een 'afleider' bij de hand." />
                <StepCard step={4} title="Na het incident" description="Controleer beide honden op verwondingen. Wissel contactgegevens uit met de andere eigenaar. Documenteer alles — foto's van verwondingen, tijdstip, getuigen. Ga naar de dierenarts, ook als de wond oppervlakkig lijkt." variant="danger" />
              </div>

              <div className="bg-violet-50 border-2 border-violet-200 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <Lightbulb size={20} className="text-violet-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-black text-violet-900 text-sm mb-1">Wanneer hoort je hond NIET in een losloopweide?</h4>
                    <ul className="mt-2 space-y-1.5 text-sm text-violet-800">
                      <li>• Je hond is <strong>reactief</strong> naar andere honden (blaft, lungt, gromt bij het zien van soortgenoten)</li>
                      <li>• Je hond heeft de <strong>recall nog niet onder de knie</strong> (hij komt niet terug als je roept)</li>
                      <li>• Je hond vertoont <strong>bezitsagressie</strong> bij voorwerpen (speelgoed, stokken, water)</li>
                      <li>• Je hond is <strong>pas geopereerd</strong> of heeft een blessure</li>
                      <li>• Je hond is een <strong>puppy onder 16 weken</strong> die nog niet alle vaccinaties heeft</li>
                    </ul>
                    <p className="text-violet-700 text-xs mt-3 italic">Geen schande — werk met een gedragstherapeut en probeer het later opnieuw. Het is verstandig, niet zwak.</p>
                  </div>
                </div>
              </div>

              <KeyTakeaway
                variant="danger"
                items={[
                  'Leer lichaamstaal lezen — stijf lichaam + staren = gevaar',
                  'Scheid vechtende honden via de achterpoten, nooit met je handen',
                  'Laat reactieve of ongetrainde honden niet los in een losloopweide',
                  'Na een bijtincident: altijd naar de dierenarts, ook bij kleine wonden',
                ]}
              />
            </div>
          </AccordionItem>

          {/* ─── PROPERHEID & ONDERHOUD ─── */}
          <AccordionItem
            id="losloop-properheid"
            icon={<Sparkles size={24} className="text-emerald-600" />}
            iconBg="bg-emerald-50"
            title="Properheid — Laat het Properder Achter dan Je het Aantrof"
            subtitle="De standaard die elke losloopweide verdient"
            isOpen={openSections.has('losloop-properheid')}
            onToggle={() => toggleSection('losloop-properheid')}
          >
            <div className="space-y-6">
              <p className="text-slate-700 leading-relaxed">
                Vuile losloopweides zijn de <strong>nummer-één reden</strong> waarom gemeenten overwegen ze te sluiten of strengere regels op te leggen. Een hoopje dat je niet opraapt, is een stap dichter bij het verdwijnen van de zone. <strong>Jij maakt het verschil.</strong>
              </p>

              <SectionHeading
                icon={<Sparkles size={20} className="text-emerald-500" />}
                title="Het +1 Principe"
                description="Maak het beter dan je het vond"
              />

              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-5 sm:p-6">
                <div className="text-center mb-4">
                  <p className="text-emerald-900 font-black text-lg">Raap je eigen hondenpoep op <span className="text-emerald-500">+</span> minstens 1 extra hoopje</p>
                  <p className="text-emerald-600 text-sm mt-1">Als iedere bezoeker dit doet, is de weide in één dag schoon</p>
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="bg-white p-3 rounded-xl text-center">
                    <span className="text-2xl block mb-1">🧹</span>
                    <span className="text-xs font-bold text-slate-700">Raap zwerfvuil op</span>
                    <p className="text-xs text-slate-500 mt-0.5">Plastic, blikjes, sigaretten</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl text-center">
                    <span className="text-2xl block mb-1">🚰</span>
                    <span className="text-xs font-bold text-slate-700">Waterbak? Ververs hem</span>
                    <p className="text-xs text-slate-500 mt-0.5">Stilstaand water = bacteriën</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl text-center">
                    <span className="text-2xl block mb-1">🔧</span>
                    <span className="text-xs font-bold text-slate-700">Meld defecten</span>
                    <p className="text-xs text-slate-500 mt-0.5">Kapot hek? Bel de gemeente</p>
                  </div>
                </div>
              </div>

              <SectionHeading
                icon={<AlertTriangle size={20} className="text-amber-500" />}
                title="Gevaren op de losloopweide"
                description="Controleer het terrein voor je je hond loslaat"
              />

              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { icon: '🍫', danger: 'Chocolade & voedselresten', tip: 'Sommige mensen dumpen etensresten — dodelijk als je hond ze vindt' },
                  { icon: '🦴', danger: 'Gekookte botten', tip: 'Versplinteren en kunnen de darmen perforeren' },
                  { icon: '🪟', danger: 'Glas & scherpe objecten', tip: 'Check de grond bij je aankomst, zeker na het weekend' },
                  { icon: '🌿', danger: 'Giftige planten', tip: 'Taxus, oleander en herfstcrocus komen voor in begroeiing' },
                  { icon: '🐀', danger: 'Rattengif & lokdozen', tip: 'Soms geplaatst door omwonenden — meld het meteen aan de gemeente' },
                  { icon: '👕', danger: 'Achtergelaten speelgoed', tip: 'Kapotte ballen en touwen zijn verstikkingsgevaar' },
                ].map((item) => (
                  <div key={item.danger} className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3 items-start">
                    <span className="text-xl shrink-0">{item.icon}</span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{item.danger}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{item.tip}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5">
                <h4 className="font-black text-sky-900 text-sm mb-3">🎒 Losloopweide-kit: Neem dit altijd mee</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { item: 'Poepzakjes', icon: '💩' },
                    { item: 'Vers drinkwater', icon: '💧' },
                    { item: 'Opvouwbare bak', icon: '🥣' },
                    { item: 'Lijn (voor noodgeval)', icon: '🔗' },
                    { item: 'Hoog-waardige snacks', icon: '🦴' },
                    { item: 'Desinfectans', icon: '🧴' },
                    { item: 'Handdoek', icon: '🧺' },
                    { item: 'Tennisbal', icon: '🎾' },
                  ].map((kit) => (
                    <div key={kit.item} className="bg-white p-2.5 rounded-xl text-center border border-sky-100">
                      <span className="text-lg block">{kit.icon}</span>
                      <span className="text-xs font-bold text-slate-700">{kit.item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <KeyTakeaway
                variant="info"
                items={[
                  'Pas het +1 principe toe: raap je eigen poep op + minstens één extra',
                  'Check de grond op glas, rattengif en voedselresten voor je je hond loslaat',
                  'Meld defecten aan hekwerk of infrastructuur bij de gemeente',
                  'Ververs gemeenschappelijke waterbakken — stilstaand water maakt honden ziek',
                ]}
              />
            </div>
          </AccordionItem>

          {/* ─── KLEINE & GROTE HONDEN ─── */}
          <AccordionItem
            id="losloop-grootte"
            icon={<Dog size={24} className="text-indigo-600" />}
            iconBg="bg-indigo-50"
            title="Kleine Honden, Grote Honden — De Dynamiek"
            subtitle="Hoe je omgaat met grootteverschillen in de losloopweide"
            isOpen={openSections.has('losloop-grootte')}
            onToggle={() => toggleSection('losloop-grootte')}
          >
            <div className="space-y-6">
              <p className="text-slate-700 leading-relaxed">
                Een van de meest onderschatte risico's in losloopweides is het <strong>grootteverschil</strong> tussen honden. Een speelse Labrador van 35 kg kan een Chihuahua van 2 kg onbedoeld ernstig verwonden — zelfs zonder agressie. <strong>Grootte-bewustzijn</strong> is essentieel.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5">
                  <h4 className="font-black text-indigo-900 text-sm mb-3">🐕‍🦺 Als jij de grote hond hebt</h4>
                  <ul className="space-y-2 text-sm text-indigo-800">
                    <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-indigo-500 mt-0.5 shrink-0" />Sta niet toe dat je hond kleine honden &quot;omver bowlt&quot; — ook niet tijdens het spelen</li>
                    <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-indigo-500 mt-0.5 shrink-0" />Roep je hond terug als de kleine hond angstsignalen toont (wegkruipen, piepen)</li>
                    <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-indigo-500 mt-0.5 shrink-0" />&quot;Hij wil alleen maar spelen&quot; is geen excuus als de andere hond bang is</li>
                    <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-indigo-500 mt-0.5 shrink-0" />Overweeg rustigere uren als je hond erg wild speelt</li>
                  </ul>
                </div>
                <div className="bg-pink-50 border border-pink-200 rounded-2xl p-5">
                  <h4 className="font-black text-pink-900 text-sm mb-3">🐕 Als jij de kleine hond hebt</h4>
                  <ul className="space-y-2 text-sm text-pink-800">
                    <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-pink-500 mt-0.5 shrink-0" />Til je hond niet op bij nadering van grote honden — dit veroorzaakt prooidrift</li>
                    <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-pink-500 mt-0.5 shrink-0" />Ken je limiet: sommige losloopweides zijn te druk voor kleine rassen</li>
                    <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-pink-500 mt-0.5 shrink-0" />Kies rustige momenten (vroege ochtend, doordeweeks)</li>
                    <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-pink-500 mt-0.5 shrink-0" />Spreek andere baasjes aan als je je onveilig voelt — duidelijke communicatie voorkomt incidenten</li>
                  </ul>
                </div>
              </div>

              <KeyTakeaway
                variant="warning"
                items={[
                  'Grootteverschillen zijn de #1 oorzaak van ongelukken in losloopweides',
                  'Til kleine honden NIET op — dit triggert prooidrift bij grote honden',
                  '"Hij wil alleen maar spelen" is geen excuus als de andere hond bang is',
                  'Kies rustige momenten als jouw hond moeite heeft met groepsdynamiek',
                ]}
              />
            </div>
          </AccordionItem>

          {/* ─── PUPPY'S IN DE LOSLOOPWEIDE ─── */}
          <AccordionItem
            id="losloop-puppys"
            icon={<Heart size={24} className="text-pink-500" />}
            iconBg="bg-pink-50"
            title="Puppy's & Socialisatie"
            subtitle="Wanneer is je puppy klaar voor de losloopweide?"
            isOpen={openSections.has('losloop-puppys')}
            onToggle={() => toggleSection('losloop-puppys')}
          >
            <div className="space-y-6">
              <p className="text-slate-700 leading-relaxed">
                Socialisatie is cruciaal voor puppy's, maar een drukke losloopweide is <strong>niet altijd de juiste plek</strong>. Eén traumatische ervaring kan een levenslange angst voor andere honden veroorzaken. Timing, dosering en de juiste honden zijn alles.
              </p>

              <div className="bg-gradient-to-r from-pink-50 to-rose-50 border-2 border-pink-200 rounded-2xl p-5 sm:p-6">
                <h4 className="font-black text-pink-900 mb-4">🐾 Socialisatievenster: 3 tot 16 weken</h4>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-xl">
                    <p className="text-sm text-slate-700"><strong className="text-pink-700">Vóór alle vaccinaties (8-12 weken):</strong> Alleen intro met bekende, gevaccineerde honden in een controleerbare omgeving. Geen losloopweide.</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl">
                    <p className="text-sm text-slate-700"><strong className="text-pink-700">Na volledige vaccinatie (±16 weken):</strong> Korte bezoeken (max 10-15 minuten) op rustige momenten. Liefst met maximaal 2-3 kalme, volwassen honden die goede spelmanieren hebben.</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl">
                    <p className="text-sm text-slate-700"><strong className="text-emerald-700">Gouden regel:</strong> Stop altijd terwijl het nog leuk is. Beter 5 positieve minuten dan 30 minuten met een nare afsluiting.</p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-black text-amber-900 text-sm mb-1">Let op: Niet elke hond is een goede socialisatiepartner</h4>
                    <p className="text-amber-800 text-sm leading-relaxed">
                      Honden die over een puppy heen walsen, constant pinapparaten uitdelen (nekbeten), of de puppy niet laten ontsnappen zijn <strong>geen goede leermeesters</strong>. Een goede 'mentor-hond' corrigeert met subtiele signalen (growl, wegkijken) en laat de puppy altijd een uitweg.
                    </p>
                  </div>
                </div>
              </div>

              <KeyTakeaway
                variant="info"
                items={[
                  'Wacht tot alle vaccinaties voltooid zijn (±16 weken) voor de losloopweide',
                  'Korte, positieve sessies zijn beter dan lange, overweldigende bezoeken',
                  'Stop terwijl het nog leuk is — eindig altijd op een positieve noot',
                  'Kies kalme mentor-honden, niet elke hond is een goede socialisatiepartner',
                ]}
              />
            </div>
          </AccordionItem>
        </div>

        {/* CTA naar losloopzones pagina */}
        <Link to="/losloopzones" className="flex items-center gap-4 bg-teal-50 border-2 border-teal-200 rounded-3xl p-5 sm:p-6 mb-16 hover:bg-teal-100 hover:border-teal-300 transition-all group">
          <div className="p-3 bg-teal-100 rounded-2xl group-hover:bg-teal-200 transition-colors shrink-0">
            <Fence size={24} className="text-teal-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-black text-teal-900 text-lg">Alle losloopzones aan de Belgische kust</h3>
            <p className="text-teal-600 text-sm mt-0.5">Bekijk ons interactief kaartoverzicht met openingsuren, locaties en reviews →</p>
          </div>
          <ArrowRight size={20} className="text-teal-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all shrink-0" />
        </Link>
    </>
  );
}
