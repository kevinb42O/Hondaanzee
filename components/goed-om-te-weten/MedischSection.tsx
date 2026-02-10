import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert, Thermometer, Droplets, Bug, Fish, Sun,
  AlertTriangle, Heart, Eye, CheckCircle2, Waves, Lightbulb, Stethoscope
} from 'lucide-react';
import { AccordionItem, KeyTakeaway, SectionHeading, StepCard } from './SharedComponents.tsx';

interface Props {
  openSections: Set<string>;
  toggleSection: (id: string) => void;
}

const MedischSection: React.FC<Props> = ({ openSections, toggleSection }) => (
  <>
    <div id="medisch" className="scroll-mt-28 mb-8">
      <div className="flex flex-col items-center text-center bg-red-50 border-2 border-red-200 rounded-2xl p-5 sm:p-7">
        <div className="p-3 sm:p-4 bg-red-100 rounded-xl mb-3">
          <ShieldAlert size={28} className="text-red-600" strokeWidth={2.5} />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Medische Veiligheid & EHBO</h2>
        <p className="text-red-700/60 text-sm mt-1 font-medium">Essentiële kennis die het verschil kan maken</p>
      </div>
    </div>

    <div className="space-y-4 mb-16">

      {/* ─── KWALLEN ─── */}
      <AccordionItem
        id="kwallen"
        icon={<Waves size={24} className="text-purple-600" />}
        iconBg="bg-purple-50"
        title="Kwallenbeten – Wat te doen?"
        subtitle="Hoe je reageert op contact met kwallen aan de Noordzee"
        badge="EHBO"
        badgeColor="bg-red-100 text-red-700"
        isOpen={openSections.has('kwallen')}
        onToggle={() => toggleSection('kwallen')}
      >
        <div className="space-y-6">
          <p className="text-slate-700 leading-relaxed">
            Kwallen worden steeds vaker aangespoeld aan de Belgische kust, vooral in de late zomer en herfst. Hoewel de meeste soorten aan onze Noordzee relatief onschuldig zijn, kan contact met tentakels voor je hond bijzonder pijnlijk zijn — vooral aan de poten, buik en snuit.
          </p>

          <SectionHeading
            icon={<Bug size={20} className="text-purple-500" />}
            title="Kwallen aan de Belgische kust"
            description="Niet alle kwallen steken, maar ken het verschil"
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
              <h4 className="font-black text-slate-900 text-sm mb-2">🔵 Kompaskwal (Chrysaora hysoscella)</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                De meest voorkomende stekende kwal aan onze kust. Herkenbaar aan het bruine kompaspatroon op de klokvormige hoed. De tentakels kunnen tot 2 meter lang zijn en veroorzaken een <strong>brandende, jeukende pijn</strong>. Niet levensbedreigend, maar zeer oncomfortabel.
              </p>
            </div>
            <div className="bg-sky-50 p-5 rounded-2xl border border-sky-100">
              <h4 className="font-black text-slate-900 text-sm mb-2">⚪ Oorkwal (Aurelia aurita)</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                De klassieke doorzichtige kwal met vier paarse ringen. Deze kwal is <strong>vrijwel onschadelijk</strong> — de netelcellen zijn te zwak om door hondenhuid te dringen. Toch kan een natte neus of lippen gevoelig zijn. Je hond zal er meestal mee spelen alsof het een bal is.
              </p>
            </div>
            <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100">
              <h4 className="font-black text-slate-900 text-sm mb-2">🟡 Haarkwal (Cyanea capillata)</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                De "leeuwenmaan" — een flinke, roodbruine kwal met <strong>lange slierten tentakels</strong>. Deze kwal steekt stevig en de tentakels blijven zelfs na de dood van de kwal actief. Voorkom dat je hond aangespoelde exemplaren besnuffelt of erin bijt.
              </p>
            </div>
            <div className="bg-violet-50 p-5 rounded-2xl border border-violet-100">
              <h4 className="font-black text-slate-900 text-sm mb-2">🟣 Zeepaddenstoel (Rhizostoma pulmo)</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Een grote, stevige kwal (tot 60 cm diameter) met een blauwwitte kleur en paarse rand. <strong>Steekt nauwelijks</strong> en heeft geen lange tentakels. Wel kan het slijm lichte irritatie veroorzaken bij contact met de slijmvliezen van je hond.
              </p>
            </div>
          </div>

          <SectionHeading
            icon={<ShieldAlert size={20} className="text-red-500" />}
            title="Stappenplan bij een kwallensteek"
          />

          <div className="space-y-3">
            <StepCard step={1} title="STOP — Verwijder je hond uit het water" description="Trek je hond weg van de kwal of aangespoelde tentakels. Raak de tentakels niet met blote handen aan — gebruik een stok, zakje of schelp." variant="danger" />
            <StepCard step={2} title="Spoel met ZEEWATER — Nooit zoet water!" description="Dit is cruciaal: zoet water (ook fleswater) verandert de osmotische druk op de netelcellen, waardoor ze juist méér gif afvuren. Spoel de getroffen plek uitsluitend met zeewater om resterend gif weg te spoelen." variant="danger" />
            <StepCard step={3} title="Verwijder tentakels voorzichtig" description="Gebruik een bankkaart, een platte schelp of een pincet om tentakelresten van de huid/vacht te schrapen. Schraap altijd in één richting. Wrijf niet — dat activeert meer netelcellen." variant="warning" />
            <StepCard step={4} title="Azijn of koude compres" description="Bij steken van de kompaskwal of haarkwal kan huishoudazijn (5%) helpen om resterende netelcellen te deactiveren. Dompel een doekje in azijn en leg het voorzichtig op de plek. Geen azijn bij je? Een koude, natte handdoek (met zeewater) kan de pijn verlichten." variant="warning" />
            <StepCard step={5} title="Observeer je hond — Dierenarts bij alarmsignalen" description="Bij lichte steken: roodheid en ongemak verdwijnen na enkele uren. Ga naar de dierenarts bij: extreme zwelling, ademhalingsproblemen, hevig braken, slaperigheid of als je hond kwallententakels heeft ingeslikt." variant="danger" />
          </div>

          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 mt-4">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-red-500 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-black text-red-900 text-sm mb-1">Mythbusting: Urine helpt NIET</h4>
                <p className="text-red-800 text-sm leading-relaxed">
                  Het populaire advies om op een kwallensteek te plassen is een hardnekkige mythe. Urine kan — net als zoet water — de netelcellen activeren en de pijn verergeren. Gebruik <strong>altijd zeewater en eventueel azijn</strong>.
                </p>
              </div>
            </div>
          </div>

          <KeyTakeaway
            variant="danger"
            items={[
              'Spoel altijd met zeewater — NOOIT zoet water of urine',
              'Schraap tentakels weg met een bankkaart, wrijf niet',
              'Dode kwallen op het strand steken nog steeds',
              'Bij ademhalingsproblemen of inslikken: onmiddellijk naar de dierenarts',
            ]}
          />

          <Link to="/diensten" className="flex items-center gap-3 bg-sky-50 border border-sky-200 rounded-2xl p-4 hover:bg-sky-100 transition-colors group">
            <div className="p-2 bg-sky-100 rounded-xl group-hover:bg-sky-200 transition-colors">
              <Stethoscope size={18} className="text-sky-600" />
            </div>
            <div>
              <span className="font-bold text-sky-900 text-sm">Dierenarts nodig aan de kust?</span>
              <span className="text-sky-600 text-xs block">Bekijk ons overzicht van dierenartsen →</span>
            </div>
          </Link>
        </div>
      </AccordionItem>

      {/* ─── PIETERMAN ─── */}
      <AccordionItem
        id="pieterman"
        icon={<Fish size={24} className="text-orange-600" />}
        iconBg="bg-orange-50"
        title="De Pieterman (Weever Fish) — Het Grootste Gevaar"
        subtitle="De giftigste vis van de Noordzee verstopt zich in het ondiepe zand"
        badge="GEVAARLIJK"
        badgeColor="bg-red-100 text-red-700"
        isOpen={openSections.has('pieterman')}
        onToggle={() => toggleSection('pieterman')}
      >
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-2xl p-5 sm:p-6">
            <p className="text-slate-800 leading-relaxed font-medium">
              De kleine pieterman (<em>Echiichthys vipera</em>) is misschien wel <strong>het meest onderschatte gevaar aan de Belgische kust</strong>. Dit visje van slechts 10-15 cm graaft zich in het ondiepe, warme zand in — precies waar jouw hond door de golven rent. Op de rugvin zitten giftige stekels die een <strong>ongelofelijk pijnlijke steek</strong> veroorzaken.
            </p>
          </div>

          <SectionHeading icon={<Eye size={20} className="text-orange-500" />} title="Hoe herken je een pietermansteek bij je hond?" />

          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { emoji: '😖', title: 'Plotseling hevig janken', desc: 'Je hond schreeuwt het uit van de pijn — dit is een steek van een totaal ander niveau dan op iets trappen' },
              { emoji: '🦶', title: 'Poot optillen & likken', desc: 'Je hond weigert de poot neer te zetten en likt er obsessief aan' },
              { emoji: '🫧', title: 'Snelle zwelling', desc: 'De poot zwelt binnen minuten op — soms tot het dubbele van de normale dikte' },
              { emoji: '🌡️', title: 'Lokale roodheid & warmte', desc: 'Het getroffen gebied voelt heet aan en wordt vuurrood' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl">
                <span className="text-lg">{item.emoji}</span>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                  <p className="text-slate-600 text-xs mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <SectionHeading
            icon={<Thermometer size={20} className="text-red-500" />}
            title="DE Oplossing: Heet water"
            description="Het gif van de pieterman is thermolabiel — hitte breekt het af"
          />

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 size={20} className="text-emerald-600" />
              <h4 className="font-black text-emerald-900">De Gouden Regel: 40-45°C gedurende 20+ minuten</h4>
            </div>
            <div className="space-y-3">
              <StepCard step={1} title="Verwarm water tot 40-45°C" description="Zo heet als mogelijk zonder te verbranden. Test het water altijd eerst op je eigen pols. Het moet voelen als een heet bad — oncomfortabel warm, maar niet brandend. Een strandbar of restaurant kan warm water voorzien." />
              <StepCard step={2} title="Dompel de getroffen poot 20-30 minuten" description="Gebruik een emmer, teil of zelfs een plastic zak. Houd het water op temperatuur door regelmatig heet water bij te vullen. De pijn zal na 5-10 minuten dramatisch afnemen — dat is een goed teken." />
              <StepCard step={3} title="Bezoek daarna de dierenarts" description="Hoewel de hitte het gif neutraliseert, kan er nog steeds een stukje stekel in de poot zitten. De dierenarts kan dit verwijderen en preventief antibiotica voorschrijven tegen infectie." />
            </div>
          </div>

          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <Lightbulb size={20} className="text-amber-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-black text-amber-900 text-sm mb-1">Pro Tip: Neem een thermosfles mee</h4>
                <p className="text-amber-800 text-sm leading-relaxed">
                  Vul thuis een thermosfles met warm water (circa 50°C, het koelt af onderweg). Pietermannen zijn het meest actief van <strong>juni tot september</strong> in ondiep, warm water. Met een thermosfles heb je altijd een eerstehulpoplossing bij de hand. Reddingsposten hebben ook warm water — aarzel niet om het te vragen!
                </p>
              </div>
            </div>
          </div>

          <KeyTakeaway
            variant="danger"
            items={[
              'Dompel de poot in heet water (40-45°C) gedurende minstens 20 minuten',
              'Het gif is thermolabiel: hitte is het enige effectieve middel',
              'Pietermannen zitten in ondiep, warm water — precies waar honden spelen',
              'Neem een thermosfles warm water mee in de zomer',
              'Bezoek altijd de dierenarts na een steek (stekels kunnen achterblijven)',
            ]}
          />

          <Link to="/diensten" className="flex items-center gap-3 bg-sky-50 border border-sky-200 rounded-2xl p-4 hover:bg-sky-100 transition-colors group">
            <div className="p-2 bg-sky-100 rounded-xl group-hover:bg-sky-200 transition-colors">
              <Stethoscope size={18} className="text-sky-600" />
            </div>
            <div>
              <span className="font-bold text-sky-900 text-sm">Zoek een dierenarts in jouw kustgemeente</span>
              <span className="text-sky-600 text-xs block">Bekijk ons overzicht van dierenartsen aan de kust →</span>
            </div>
          </Link>
        </div>
      </AccordionItem>

      {/* ─── ZOUTWATERVERGIFTIGING ─── */}
      <AccordionItem
        id="zoutwater"
        icon={<Droplets size={24} className="text-blue-600" />}
        iconBg="bg-blue-50"
        title="Zoutwatervergiftiging"
        subtitle="Wanneer je hond te veel zeewater drinkt"
        badge="WAARSCHUWING"
        badgeColor="bg-amber-100 text-amber-700"
        isOpen={openSections.has('zoutwater')}
        onToggle={() => toggleSection('zoutwater')}
      >
        <div className="space-y-6">
          <p className="text-slate-700 leading-relaxed">
            Veel honden slikken onbewust zeewater in terwijl ze ballen apporteren uit de branding of gewoon enthousiast in de golven happen. Het zoutgehalte van de Noordzee is circa <strong>35 gram per liter</strong> — dat is enorm voor een hondenlichaam. Een kleine hoeveelheid is onschuldig, maar bij langdurig spelen in zee kan de natriumconcentratie in het bloed gevaarlijk stijgen.
          </p>

          <SectionHeading icon={<AlertTriangle size={20} className="text-amber-500" />} title="Symptomen — Herken ze vroeg" />

          <div className="grid gap-3">
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <h4 className="font-bold text-sm text-slate-900 mb-2">🟡 Milde symptomen (vroeg stadium)</h4>
              <ul className="space-y-1.5 text-sm text-slate-600">
                <li className="flex items-start gap-2"><span className="text-amber-500 mt-1">•</span>Overmatige dorst & overdreven veel drinken van zoet water</li>
                <li className="flex items-start gap-2"><span className="text-amber-500 mt-1">•</span>Waterige diarree (soms met bloed)</li>
                <li className="flex items-start gap-2"><span className="text-amber-500 mt-1">•</span>Braken of misselijkheid</li>
                <li className="flex items-start gap-2"><span className="text-amber-500 mt-1">•</span>Opgezette buik & ongemak</li>
                <li className="flex items-start gap-2"><span className="text-amber-500 mt-1">•</span>Lusteloosheid / minder actief dan normaal</li>
              </ul>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
              <h4 className="font-bold text-sm text-slate-900 mb-2">🔴 Ernstige symptomen (direct naar dierenarts!)</h4>
              <ul className="space-y-1.5 text-sm text-slate-600">
                <li className="flex items-start gap-2"><span className="text-red-500 mt-1">•</span>Trillen, spierschokken of stuiptrekkingen</li>
                <li className="flex items-start gap-2"><span className="text-red-500 mt-1">•</span>Desoriëntatie, wankelen, rondjes draaien</li>
                <li className="flex items-start gap-2"><span className="text-red-500 mt-1">•</span>Extreme slaperigheid of bewusteloosheid</li>
                <li className="flex items-start gap-2"><span className="text-red-500 mt-1">•</span>Ademhalingsproblemen of ongewoon hijgen</li>
              </ul>
            </div>
          </div>

          <SectionHeading icon={<Heart size={20} className="text-emerald-500" />} title="Wat te doen — Preventie & Actie" />

          <div className="space-y-3">
            <StepCard step={1} title="Bied regelmatig vers drinkwater aan" description="Neem altijd een opvouwbare drinkbak en voldoende zoet water mee naar het strand. Bied je hond om de 15-20 minuten water aan, vooral als hij actief in zee speelt." />
            <StepCard step={2} title="Beperk speeltijd in de branding" description="Laat je hond niet urenlang onafgebroken in de golven spelen. Wissel af: 20 minuten spelen in zee, dan een pauze op het strand met vers water." />
            <StepCard step={3} title="Gebruik een bal-werper, geen losse bal" description="Ballen die in zee drijven zorgen ervoor dat honden grote hoeveelheden zeewater inslikken. Gooi de bal liever op het strand of gebruik een frisbee op het droge." variant="warning" />
            <StepCard step={4} title="Bij symptomen: vers water + dierenarts" description="Bied onmiddellijk kleine hoeveelheden vers water aan (niet té veel ineens — dat kan opnieuw braken veroorzaken). Bij ernstige symptomen: ga rechtstreeks naar de dierenarts." variant="danger" />
          </div>

          <KeyTakeaway
            variant="warning"
            items={[
              'Neem altijd vers drinkwater en een opvouwbare bak mee naar het strand',
              'Beperk zeewaterspelen tot sessies van 20 minuten',
              'Waterige diarree na strandbezoek is het eerste waarschuwingssignaal',
              'Bij trillen, stuiptrekkingen of desoriëntatie: onmiddellijk naar de dierenarts',
            ]}
          />
        </div>
      </AccordionItem>

      {/* ─── OVERVERHITTING & ASFALT ─── */}
      <AccordionItem
        id="hitte"
        icon={<Sun size={24} className="text-yellow-600" />}
        iconBg="bg-yellow-50"
        title="Oververhitting, Heet Zand & Asfalt"
        subtitle="De 5-seconden regel en hoe je hittestress voorkomt"
        badge="ZOMERGEVAAR"
        badgeColor="bg-amber-100 text-amber-700"
        isOpen={openSections.has('hitte')}
        onToggle={() => toggleSection('hitte')}
      >
        <div className="space-y-6">
          <p className="text-slate-700 leading-relaxed">
            Op een zonnige zomerdag kan het zand op het strand makkelijk <strong>60-70°C</strong> bereiken. Asfalt op de zeedijk wordt nog heter. Honden reguleren hun temperatuur via hun poten en door te hijgen — dus verbrande voetzolen zijn niet alleen pijnlijk, maar belemmeren ook hun hele koelsysteem.
          </p>

          <SectionHeading
            icon={<Thermometer size={20} className="text-yellow-600" />}
            title="De 5-Seconden Regel"
            description="Een simpele test die elke hondenbezitter moet kennen"
          />

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-5 sm:p-6">
            <div className="text-center mb-4">
              <span className="text-4xl sm:text-5xl font-black text-yellow-600">5 sec</span>
              <p className="text-slate-700 font-bold mt-2">Leg de rug van je hand op het zand of asfalt</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="bg-white p-4 rounded-xl text-center">
                <span className="text-2xl">✅</span>
                <p className="font-bold text-sm text-slate-900 mt-2">Kun je 5 seconden vasthouden?</p>
                <p className="text-slate-500 text-xs mt-1">De grond is veilig voor je hond</p>
              </div>
              <div className="bg-white p-4 rounded-xl text-center">
                <span className="text-2xl">⛔</span>
                <p className="font-bold text-sm text-slate-900 mt-2">Te heet om aan te raken?</p>
                <p className="text-slate-500 text-xs mt-1">Te heet voor de poten van je hond. Loop via nat zand of gras.</p>
              </div>
            </div>
          </div>

          <SectionHeading icon={<AlertTriangle size={20} className="text-red-500" />} title="Tekenen van hittestress bij honden" />

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
              <h4 className="font-bold text-sm text-red-900 mb-2">Vroege signalen</h4>
              <ul className="space-y-1 text-sm text-red-800">
                <li>• Overdreven hijgen met open bek</li>
                <li>• Overdadig kwijlen</li>
                <li>• Rode tong en tandvlees</li>
                <li>• Trager worden / achterop raken</li>
              </ul>
            </div>
            <div className="p-4 bg-red-100 rounded-xl border border-red-200">
              <h4 className="font-bold text-sm text-red-900 mb-2">Noodsignalen (112!)</h4>
              <ul className="space-y-1 text-sm text-red-800">
                <li>• Wankelen, struikelen, vallen</li>
                <li>• Braken of diarree</li>
                <li>• Bleke of grijze tandvlees</li>
                <li>• Bewusteloosheid of stuiptrekkingen</li>
              </ul>
            </div>
          </div>

          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5">
            <h4 className="font-black text-sky-900 text-sm mb-3">💡 Slimme tips voor warme dagen</h4>
            <ul className="space-y-2 text-sm text-sky-800">
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-sky-500 mt-0.5 shrink-0" />Wandel vroeg (vóór 10u) of laat (na 18u) — vermijd de middaghitte</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-sky-500 mt-0.5 shrink-0" />Loop via het natte zand aan de waterlijn — dat is aanzienlijk koeler</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-sky-500 mt-0.5 shrink-0" />Neem een koelmat of natte handdoek mee voor pauzes</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-sky-500 mt-0.5 shrink-0" />Honden met een platte neus (brachycefaal) zijn extra kwetsbaar — wees voorzichtiger</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-sky-500 mt-0.5 shrink-0" />Laat je hond NOOIT achter in een geparkeerde auto, ook niet met een raam open</li>
            </ul>
          </div>

          <KeyTakeaway
            variant="warning"
            items={[
              'Gebruik de 5-seconden test: leg je handrug op het zand/asfalt',
              'Wandel in de zomer vóór 10u of na 18u',
              'Nat zand aan de waterlijn is altijd koeler',
              'Overdreven hijgen + rode tong = onmiddellijk afkoelen in de schaduw',
            ]}
          />
        </div>
      </AccordionItem>
    </div>
  </>
);

export default MedischSection;
