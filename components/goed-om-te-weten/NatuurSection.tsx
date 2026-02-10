import React from 'react';
import {
  Leaf, Bird, Dog, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { AccordionItem, KeyTakeaway, SectionHeading } from './SharedComponents.tsx';

interface Props {
  readonly openSections: Set<string>;
  readonly toggleSection: (id: string) => void;
}

export default function NatuurSection({ openSections, toggleSection }: Props) {
  return (
    <>
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTIE 2: WILDLIFE & NATUUR
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div id="natuur" className="scroll-mt-28 mb-8">
          <div className="flex flex-col items-center text-center bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5 sm:p-7">
            <div className="p-3 sm:p-4 bg-emerald-100 rounded-xl mb-3">
              <Leaf size={28} className="text-emerald-600" strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Wildlife & Natuur</h2>
            <p className="text-emerald-700/60 text-sm mt-1 font-medium">We zijn te gast in hun leefgebied</p>
          </div>
        </div>

        <div className="space-y-4 mb-16">

          {/* ─── ZEEHONDEN ─── */}
          <AccordionItem
            id="zeehonden"
            icon={<span className="text-2xl">🦭</span>}
            iconBg="bg-cyan-50"
            title="Zeehonden op het Strand"
            subtitle="Hoe je reageert als je een zeehond tegenkomt"
            badge="BESCHERMD"
            badgeColor="bg-emerald-100 text-emerald-700"
            isOpen={openSections.has('zeehonden')}
            onToggle={() => toggleSection('zeehonden')}
          >
            <div className="space-y-6">
              <p className="text-slate-700 leading-relaxed">
                De populatie zeehonden aan de Belgische kust groeit gestaag — en dat is fantastisch nieuws! Zowel de <strong>gewone zeehond</strong> (<em>Phoca vitulina</em>) als de <strong>grijze zeehond</strong> (<em>Halichoerus grypus</em>) worden steeds vaker gespot op onze stranden. Maar een ontmoeting tussen je hond en een zeehond kan gevaarlijk zijn — voor beide dieren.
              </p>

              <div className="bg-cyan-50 border-2 border-cyan-200 rounded-2xl p-5 sm:p-6">
                <h4 className="font-black text-cyan-900 mb-3">🦭 Een zeehond op het strand is meestal NIET in nood</h4>
                <p className="text-cyan-800 text-sm leading-relaxed mb-4">
                  Zeehonden komen regelmatig aan land om te <strong>rusten, op te warmen of te ruien</strong> (hun vacht te vervellen). Een zeehond die op het strand ligt is in de meeste gevallen gewoon even aan het uitrusten. Jonge zeehonden worden door hun moeder tijdelijk achtergelaten terwijl zij gaat jagen — dit is <strong>volkomen normaal</strong>.
                </p>
                <p className="text-cyan-800 text-sm leading-relaxed">
                  Goedbedoelende voorbijgangers die een "verlaten" zeehondenpup proberen te helpen, doen vaak meer kwaad dan goed. De moeder durft niet meer terug te komen als er mensen (of honden) in de buurt zijn.
                </p>
              </div>

              <SectionHeading
                icon={<Dog size={20} className="text-cyan-600" />}
                title="De regels bij een zeehond op het strand"
              />

              <div className="space-y-3">
                <div className="flex items-start gap-4 p-4 bg-cyan-50 rounded-xl">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center text-xl font-black text-cyan-700">30m</div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Houd minstens 30 meter afstand</h4>
                    <p className="text-slate-600 text-sm mt-1 leading-relaxed">Dit is de officiële richtlijn van het Koninklijk Belgisch Instituut voor Natuurwetenschappen (KBIN). Op 30 meter voelt een zeehond zich niet bedreigd.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-cyan-50 rounded-xl">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center">🐕‍🦺</div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Neem je hond onmiddellijk aan de lijn</h4>
                    <p className="text-slate-600 text-sm mt-1 leading-relaxed">Zelfs de braafste hond kan niet weerstaan aan een zeehond. Een loslopende hond veroorzaakt extreme stress, kan de zeehond bijten (en andersom — zeehonden hebben scherpe tanden!), of een zeehondenpup van de moeder wegjagen.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-cyan-50 rounded-xl">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center">📞</div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Bel het zeehondenmeldpunt als het dier gewond is</h4>
                    <p className="text-slate-600 text-sm mt-1 leading-relaxed">Denk je dat de zeehond wél in nood is? (zichtbare wonden, mager, vissersnetten verstrikt?) Bel het zeehondennoodlijn op <strong>0800 99 899</strong> (Sea Life Blankenberge) of <strong>059 34 21 41</strong> (KBIN). Raak het dier nooit aan.</p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={18} className="text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-black text-amber-900 text-sm mb-1">Waarom is stress zo schadelijk voor zeehonden?</h4>
                    <p className="text-amber-800 text-sm leading-relaxed">
                      Een gestresste zeehond verhoogt zijn hartslag drastisch en verbruikt kostbare energiereserves. Bij zeehondenpups kan stress door verstoring ertoe leiden dat ze niet meer drinken bij de moeder, wat <strong>dodelijk</strong> kan zijn. Grijze zeehondenmoeders verlaten hun jong bij herhaalde verstoring — het jong verhongert zonder menselijke tussenkomst.
                    </p>
                  </div>
                </div>
              </div>

              <KeyTakeaway
                variant="info"
                items={[
                  'Houd altijd minstens 30 meter afstand — neem je hond aan de lijn',
                  'Een zeehond op het strand is meestal gewoon aan het rusten',
                  'Raak een zeehond nooit aan, ook niet om te "helpen"',
                  'Meld gewonde zeehonden op 0800 99 899 (Sea Life) of 059 34 21 41 (KBIN)',
                ]}
              />
            </div>
          </AccordionItem>

          {/* ─── DUINEN ─── */}
          <AccordionItem
            id="duinen"
            icon={<Leaf size={24} className="text-green-600" />}
            iconBg="bg-green-50"
            title="De Duinen — Beschermd Natuurgebied"
            subtitle="Waarom honden hier niet los mogen en wat je als baasje moet weten"
            badge="BESCHERMD"
            badgeColor="bg-emerald-100 text-emerald-700"
            isOpen={openSections.has('duinen')}
            onToggle={() => toggleSection('duinen')}
          >
            <div className="space-y-6">
              <p className="text-slate-700 leading-relaxed">
                De duinen langs de Belgische kust zijn <strong>onvervangbaar</strong>. Ze beschermen het achterland tegen overstromingen, herbergen zeldzame flora en fauna, en zijn een van de meest bedreigde ecosystemen van Europa. Slechts <strong>3,3% van de oorspronkelijke Belgische kustduinen</strong> is nog intact. Elke vierkante meter telt.
              </p>

              <SectionHeading
                icon={<Bird size={20} className="text-green-600" />}
                title="Waarom mogen honden niet los in de duinen?"
              />

              <div className="grid gap-4">
                <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
                  <h4 className="font-black text-slate-900 text-sm mb-2">🐣 Broedvogels op de grond</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    De duinen zijn het broedgebied van zeldzame vogels als de <strong>strandplevier</strong>, <strong>dwergsternen</strong> en <strong>kuifleeuweriken</strong>. Deze vogels nestelen direct op de grond — een loslopende hond ziet een nest niet en kan eieren of kuikens vertrappen zonder dat je het doorhebt. Zelfs de <em>geur</em> van een hond in de buurt kan broedende vogels doen vluchten, waardoor eieren afkoelen en afsterven.
                  </p>
                </div>

                <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
                  <h4 className="font-black text-slate-900 text-sm mb-2">🌱 Erosie & Helmgras</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    <strong>Helmgras</strong> (<em>Ammophila arenaria</em>) is de superheld van de duinen — het uitgebreide wortelstelsel houdt het zand vast en voorkomt erosie. Loslopende honden die door de duinen rennen, graven en wroeten, beschadigen deze wortels. Eén beschadigd stuk helmgras kan leiden tot een <strong>"blow-out"</strong> — een gat in de duin waar de wind steeds meer zand wegblaast.
                  </p>
                </div>

                <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
                  <h4 className="font-black text-slate-900 text-sm mb-2">🦎 Kwetsbare dieren</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    De duinen herbergen ook <strong>hagedissen, konijnen, egels en zeldzame insecten</strong>. Een jagende hond (en zelfs een speels snuffelende hond) verstoort dit fragiele ecosysteem. De zandhagedis, een beschermde Europese soort, komt in België vrijwel uitsluitend nog voor in de kustduinen.
                  </p>
                </div>
              </div>

              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5">
                <h4 className="font-black text-emerald-900 text-sm mb-3">✅ Wat mag wél?</h4>
                <ul className="space-y-2 text-sm text-emerald-800">
                  <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />Wandelen op de aangeduide paden met je hond <strong>aan de lijn</strong> (max. 2 meter)</li>
                  <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />Genieten van de natuur vanaf de wandelplanken en uitkijkpunten</li>
                  <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />Afval opruimen dat je tegenkomt (wees een held!)</li>
                </ul>
              </div>

              <KeyTakeaway
                variant="info"
                items={[
                  'Honden moeten in de duinen ALTIJD aan de lijn (max. 2 meter)',
                  'Blijf op de aangeduide paden — verlaat deze nooit',
                  'Grondbroeders nestelen onzichtbaar — een loslopende hond ziet nesten niet',
                  'Beschadiging van helmgras kan tot duinerosie leiden',
                ]}
              />
            </div>
          </AccordionItem>

          {/* ─── MEEUWEN ─── */}
          <AccordionItem
            id="meeuwen"
            icon={<Bird size={24} className="text-slate-600" />}
            iconBg="bg-slate-100"
            title="Meeuwen — Niet Voeren!"
            subtitle="Waarom voeren leidt tot agressie en hoe je conflicten vermijdt"
            isOpen={openSections.has('meeuwen')}
            onToggle={() => toggleSection('meeuwen')}
          >
            <div className="space-y-6">
              <p className="text-slate-700 leading-relaxed">
                De <strong>zilvermeeuw</strong> en <strong>kleine mantelmeeuw</strong> zijn de dominante meeuwen aan onze kust. Ze zijn intelligent, opportunistisch en — als ze getraind zijn door toeristen — <strong>brutaal</strong>. Het voeren van meeuwen lijkt onschuldig, maar het veroorzaakt een keten van problemen.
              </p>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <span className="text-3xl block mb-2">🍟</span>
                  <h4 className="font-bold text-sm text-slate-900 mb-1">Voedselconditionering</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">Meeuwen leren dat mensen = voedsel. Ze worden steeds driester en pikken eten uit handen van kinderen.</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <span className="text-3xl block mb-2">⚔️</span>
                  <h4 className="font-bold text-sm text-slate-900 mb-1">Agressie naar honden</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">Geconditioneerde meeuwen vallen honden aan die in de buurt van "hun" voedselgebied komen, vooral tijdens het broedseizoen.</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <span className="text-3xl block mb-2">🏥</span>
                  <h4 className="font-bold text-sm text-slate-900 mb-1">Ongezond voedsel</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">Brood, frietjes en chips zijn schadelijk voor meeuwen. Het leidt tot "angel wing" — een permanente vleugelmisvorming.</p>
                </div>
              </div>

              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5">
                <h4 className="font-black text-sky-900 text-sm mb-3">Praktische tips</h4>
                <ul className="space-y-2 text-sm text-sky-800">
                  <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-sky-500 mt-0.5 shrink-0" />Eet op het strand met dichte tassen en containers — niet in het open</li>
                  <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-sky-500 mt-0.5 shrink-0" />Berg hondenvoer goed op — meeuwen vinden het net zo lekker</li>
                  <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-sky-500 mt-0.5 shrink-0" />Gooi nooit voedselresten op het strand — gebruik een vuilnisbak</li>
                  <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-sky-500 mt-0.5 shrink-0" />Lukt het niet? Draai je rug naar de meeuw en loop rustig weg</li>
                </ul>
              </div>

              <KeyTakeaway
                variant="info"
                items={[
                  'Voer nooit meeuwen — het maakt ze agressief naar mensen en honden',
                  'Eet op het strand met afgedekte tassen en containers',
                  'Geconditioneerde meeuwen kunnen honden aanvallen',
                ]}
              />
            </div>
          </AccordionItem>
        </div>
    </>
  );
}
