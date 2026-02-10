import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert, Phone, CheckCircle2,
  ArrowRight, Lightbulb, BookOpen,
  Calendar, Fence, Search, Leaf, HandHeart
} from 'lucide-react';
import { useSEO } from '../utils/seo.ts';
import { FAQItem } from '../components/goed-om-te-weten/SharedComponents.tsx';
import MedischSection from '../components/goed-om-te-weten/MedischSection.tsx';
import SeizoenSection from '../components/goed-om-te-weten/SeizoenSection.tsx';
import NatuurSection from '../components/goed-om-te-weten/NatuurSection.tsx';
import EtiquetteSection from '../components/goed-om-te-weten/EtiquetteSection.tsx';
import LosloopSection from '../components/goed-om-te-weten/LosloopSection.tsx';

/* ─── Main Page Component ─── */

const GoedOmTeWeten: React.FC = () => {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Combined structured data: FAQPage + HowTo (pieterman) + HowTo (kwallen) + BreadcrumbList + MedicalWebPage
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Wat moet ik doen als mijn hond in een kwal trapt op het strand?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Spoel de getroffen plek onmiddellijk met zeewater (NOOIT zoet water). Verwijder eventuele tentakels voorzichtig met een bankkaart of schelp. Gebruik eventueel huishoudazijn (5%) om resterende netelcellen te deactiveren. Ga naar de dierenarts als je hond hevig reageert, veel zwelling vertoont of tekenen van een allergische reactie laat zien."
          }
        },
        {
          "@type": "Question",
          "name": "Hoe herken ik een pietermansteek bij mijn hond?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Je hond zal plotseling hevig janken, de poot optillen en er obsessief aan likken. De poot zwelt snel op en wordt rood. De oplossing: dompel de poot zo snel mogelijk in heet water (40-45°C) gedurende minstens 20 minuten. De hitte breekt het gif af. Bezoek daarna altijd de dierenarts."
          }
        },
        {
          "@type": "Question",
          "name": "Mag ik een zeehond op het strand benaderen met mijn hond?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Nee, houd altijd minstens 30 meter afstand en neem je hond onmiddellijk aan de lijn. Zeehonden die op het strand liggen zijn meestal niet in nood, maar rusten uit. Een hond kan extreme stress veroorzaken bij een zeehond. Meld gewonde zeehonden op 0800 99 899."
          }
        },
        {
          "@type": "Question",
          "name": "Wat als mijn hond te veel zeewater drinkt?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Symptomen van zoutwatervergiftiging zijn overgeven, diarree, lethargie en overmatige dorst. Bied onmiddellijk vers drinkwater aan en beperk het spelen in de branding. Bij ernstige symptomen zoals trillen, stuiptrekkingen of verwardheid, ga direct naar de dierenarts."
          }
        },
        {
          "@type": "Question",
          "name": "Waarom mogen honden niet los in de duinen?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "De duinen zijn beschermd natuurgebied. Loslopende honden verstoren broedende vogels (strandplevieren, dwergsternen), beschadigen kwetsbaar helmgras dat erosie tegengaat, en kunnen nesten van grondbroeders vertrappen. Honden moeten in duingebieden altijd aan de lijn."
          }
        },
        {
          "@type": "Question",
          "name": "Hoe hoog zijn de boetes voor hondenpoep niet opruimen op het strand?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "In de Belgische kustgemeenten riskeer je een GAS-boete (Gemeentelijke Administratieve Sanctie) van €75 tot €350, afhankelijk van de gemeente. Gemeentelijke vaststellers controleren actief, ook in de winter."
          }
        },
        {
          "@type": "Question",
          "name": "Hoe test ik of het zand te heet is voor mijn hond?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Gebruik de 5-seconden regel: leg de rug van je hand op het zand of asfalt. Kun je dit 5 seconden volhouden? Dan is het veilig. Is het te heet voor jouw hand, dan is het te heet voor de poten van je hond."
          }
        },
        {
          "@type": "Question",
          "name": "Moet ik een hondenzwemvest gebruiken in de Noordzee?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Een hondenzwemvest wordt sterk aanbevolen bij sterke stroming, golfslag of als je hond niet dagelijks zwemt. Vooral voor kleine rassen, oudere honden en brachycefale rassen is het een essentieel veiligheidsmiddel. De Noordzee heeft verraderlijke stroming die zelfs sterke zwemmende honden kan verrassen."
          }
        },
        {
          "@type": "Question",
          "name": "Moet ik mijn hond controleren op teken na een duinwandeling?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Ja, controleer je hond altijd na een wandeling in de duinen of door hoog gras. Teken zijn actief van maart tot november. Controleer vooral oren, oksels, liezen en tussen de tenen. Verwijder een teek met een tekentang in een draaiende beweging. Raadpleeg de dierenarts bij een rode ring rond de beet."
          }
        },
        {
          "@type": "Question",
          "name": "Wat is blauwalg en is het gevaarlijk voor mijn hond aan zee?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Blauwalgen (cyanobacteriën) komen voornamelijk voor in stilstaand zoet water, maar kunnen ook in brakke kustwaters opduiken bij warme zomers. Ze zijn potentieel dodelijk voor honden. Symptomen zijn braken, diarree, trillen en spierzwakte. Bij vermoeden onmiddellijk naar de dierenarts."
          }
        },
        {
          "@type": "Question",
          "name": "Welke regels gelden er in losloopweides aan de Belgische kust?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Ruim altijd de hondenpoep op, houd je hond in het oog, controleer het terrein op gevaren en communiceer met andere baasjes. Loopse teven horen niet in de losloopweide. Gebruik het dubbele poortsysteem correct om ontsnappingen te voorkomen."
          }
        },
        {
          "@type": "Question",
          "name": "Wanneer mag een puppy voor het eerst naar de losloopweide?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Wacht tot alle vaccinaties voltooid zijn (rond 16 weken). Kies rustige momenten met maximaal 2-3 kalme, volwassen honden. Houd sessies kort (10-15 minuten) en stop altijd op een positief moment."
          }
        },
        {
          "@type": "Question",
          "name": "Hoe hoog zijn de boetes als mijn hond losloopt waar het niet mag?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Via GAS-boetes riskeer je €50 tot €350 afhankelijk van de gemeente. Hond op strand in verboden zone, loslopend op de zeedijk, of hondenpoep niet opruimen wordt actief gecontroleerd. In natuurgebieden kan het ANB boetes tot meer dan €500 opleggen."
          }
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "Eerste hulp bij een pietermansteek bij je hond",
      "description": "Stappenplan voor wanneer je hond gestoken wordt door een pieterman (weever fish) aan de Belgische kust",
      "totalTime": "PT30M",
      "supply": [
        { "@type": "HowToSupply", "name": "Heet water (40-45°C)" },
        { "@type": "HowToSupply", "name": "Emmer of teil" },
        { "@type": "HowToSupply", "name": "Thermosfles (optioneel)" }
      ],
      "step": [
        {
          "@type": "HowToStep",
          "name": "Verwarm water tot 40-45°C",
          "text": "Verwarm water tot 40-45°C. Zo heet als mogelijk zonder te verbranden. Test op je eigen pols. Een strandbar of reddingspost kan warm water voorzien."
        },
        {
          "@type": "HowToStep",
          "name": "Dompel de poot 20-30 minuten",
          "text": "Dompel de getroffen poot 20-30 minuten in het hete water. Gebruik een emmer, teil of plastic zak. Houd het water op temperatuur door regelmatig bij te vullen."
        },
        {
          "@type": "HowToStep",
          "name": "Bezoek de dierenarts",
          "text": "Bezoek daarna de dierenarts. Er kan nog een stukje stekel in de poot zitten. De dierenarts kan dit verwijderen en preventief antibiotica voorschrijven."
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "Eerste hulp bij een kwallensteek bij je hond",
      "description": "Wat te doen als je hond in contact komt met een kwal op het strand aan de Belgische kust",
      "step": [
        {
          "@type": "HowToStep",
          "name": "Verwijder je hond uit het water",
          "text": "Trek je hond weg van de kwal of aangespoelde tentakels. Raak de tentakels niet met blote handen aan."
        },
        {
          "@type": "HowToStep",
          "name": "Spoel met zeewater",
          "text": "Spoel de getroffen plek uitsluitend met zeewater. Gebruik NOOIT zoet water — dit activeert de netelcellen."
        },
        {
          "@type": "HowToStep",
          "name": "Verwijder tentakels",
          "text": "Gebruik een bankkaart of schelp om tentakelresten weg te schrapen. Schraap in één richting, wrijf niet."
        },
        {
          "@type": "HowToStep",
          "name": "Azijn of koude compres",
          "text": "Bij kompaskwal of haarkwal kan huishoudazijn (5%) helpen om resterende netelcellen te deactiveren."
        },
        {
          "@type": "HowToStep",
          "name": "Observeer en consulteer dierenarts",
          "text": "Ga naar de dierenarts bij extreme zwelling, ademhalingsproblemen, hevig braken of als je hond tentakels heeft ingeslikt."
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://hondaanzee.be/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Goed om te Weten",
          "item": "https://hondaanzee.be/goed-om-te-weten"
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "MedicalWebPage",
      "name": "Veiligheid & EHBO voor Honden aan de Belgische Kust",
      "description": "Uitgebreide gids over kwallenbeten, pietermansteken, zoutwatervergiftiging, oververhitting en strandetiquette voor hondenbezitters aan de Belgische kust.",
      "url": "https://hondaanzee.be/goed-om-te-weten",
      "datePublished": "2026-02-10",
      "dateModified": "2026-02-10",
      "publisher": {
        "@type": "Organization",
        "name": "HondAanZee.be",
        "url": "https://hondaanzee.be"
      },
      "about": [
        { "@type": "MedicalCondition", "name": "Kwallensteek bij honden" },
        { "@type": "MedicalCondition", "name": "Pietermansteek bij honden" },
        { "@type": "MedicalCondition", "name": "Zoutwatervergiftiging bij honden" },
        { "@type": "MedicalCondition", "name": "Hittestress bij honden" }
      ],
      "audience": {
        "@type": "PeopleAudience",
        "audienceType": "Hondeneigenaren"
      },
      "specialty": "Veterinary Medicine",
      "lastReviewed": "2026-02-10"
    }
  ];

  useSEO({
    title: 'Goed om te Weten | Veiligheid, EHBO & Etiquette voor Honden aan het Strand – HondAanZee.be',
    description: '🐾 Alles over veiligheid met je hond aan de Belgische kust: kwallenbeten, pietermansteken, zeehonden, zoutwatervergiftiging, teken, blauwalgen, duinetiquette & de Code van de Goede Kustvriend.',
    keywords: 'hond in kwal getrapt, pieterman steek hond, zeehond op strand, veiligheid honden strand, hond zeewater drinken, hond heet zand, kwallen belgische kust hond, hond duinen loslopend, strandregels honden belgie, honden ehbo strand, teken hond duinen, blauwalgen hond gevaarlijk, hondenzwemvest noordzee, scherpe schelpen hondenpoten, losloopweide kust, losloopzone regels hond, puppy socialisatie losloopweide, hondenspeelweide belgische kust, bijtincident losloopweide, etiquette losloopweide, GAS boete hond strand, hond loslopend boete belgie, DogID registratie hond, aansprakelijkheid hond belgie, familiale verzekering hond',
    structuredData
  });

  const toggleSection = (id: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50" itemScope itemType="https://schema.org/FAQPage">
      {/* ─── Hero Section ─── */}
      <section className="relative pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-100/80 via-white to-cyan-50/60 -z-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-200/20 rounded-full blur-3xl -z-10 -translate-x-1/3 translate-y-1/3"></div>

        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white border-2 border-sky-100 text-sky-700 px-5 py-2.5 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.15em] mb-4 shadow-lg rounded-full">
            <BookOpen size={14} strokeWidth={2.5} />
            <span>De Ultieme Kustgids</span>
          </div>

          {/* Freshness Signal */}
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider mb-6 rounded-full">
            <Calendar size={12} strokeWidth={2.5} />
            <span>Laatst bijgewerkt: februari 2026</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-[1.1]">
            Goed om te{' '}
            <span className="text-sky-600 relative inline-block">
              Weten
              <svg className="absolute -bottom-1 sm:-bottom-2 md:-bottom-3 left-0 w-full h-3 sm:h-4 text-sky-600/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 25 0 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="8" />
              </svg>
            </span>
          </h1>
          <p className="text-slate-600 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            Van kwallenbeten tot pietermansteken, van zeehonden tot teken in de duinen.
            Alles wat je moet weten voor een <strong className="text-slate-800">veilig en respectvol</strong> dagje strand met je viervoeter.
          </p>

          {/* Quick Navigation Bento */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 max-w-4xl mx-auto">
            <a href="#medisch" className="group flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border-2 border-red-100 hover:border-red-300 hover:shadow-lg transition-all">
              <div className="p-2.5 bg-red-50 rounded-xl group-hover:bg-red-100 transition-colors">
                <ShieldAlert size={22} className="text-red-500" />
              </div>
              <span className="text-xs font-bold text-slate-700">EHBO</span>
            </a>
            <a href="#seizoensgevaren" className="group flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border-2 border-violet-100 hover:border-violet-300 hover:shadow-lg transition-all">
              <div className="p-2.5 bg-violet-50 rounded-xl group-hover:bg-violet-100 transition-colors">
                <Search size={22} className="text-violet-500" />
              </div>
              <span className="text-xs font-bold text-slate-700">Seizoens</span>
            </a>
            <a href="#natuur" className="group flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border-2 border-emerald-100 hover:border-emerald-300 hover:shadow-lg transition-all">
              <div className="p-2.5 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
                <Leaf size={22} className="text-emerald-500" />
              </div>
              <span className="text-xs font-bold text-slate-700">Wildlife</span>
            </a>
            <a href="#etiquette" className="group flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border-2 border-amber-100 hover:border-amber-300 hover:shadow-lg transition-all">
              <div className="p-2.5 bg-amber-50 rounded-xl group-hover:bg-amber-100 transition-colors">
                <HandHeart size={22} className="text-amber-500" />
              </div>
              <span className="text-xs font-bold text-slate-700">Etiquette</span>
            </a>
            <a href="#losloopweides" className="group flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border-2 border-teal-100 hover:border-teal-300 hover:shadow-lg transition-all">
              <div className="p-2.5 bg-teal-50 rounded-xl group-hover:bg-teal-100 transition-colors">
                <Fence size={22} className="text-teal-500" />
              </div>
              <span className="text-xs font-bold text-slate-700">Losloop</span>
            </a>
            <a href="#faq" className="group flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border-2 border-sky-100 hover:border-sky-300 hover:shadow-lg transition-all">
              <div className="p-2.5 bg-sky-50 rounded-xl group-hover:bg-sky-100 transition-colors">
                <Lightbulb size={22} className="text-sky-500" />
              </div>
              <span className="text-xs font-bold text-slate-700">FAQ</span>
            </a>
          </div>
        </div>
      </section>

      {/* ─── Main Content ─── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-20 sm:pb-28">


        {/*  Section Components  */}
        <MedischSection openSections={openSections} toggleSection={toggleSection} />
        <SeizoenSection openSections={openSections} toggleSection={toggleSection} />
        <NatuurSection openSections={openSections} toggleSection={toggleSection} />
        <EtiquetteSection openSections={openSections} toggleSection={toggleSection} />
        <LosloopSection openSections={openSections} toggleSection={toggleSection} />

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTIE 5: VEELGESTELDE VRAGEN (FAQ)
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div id="faq" className="scroll-mt-28 mb-8">
          <div className="flex flex-col items-center text-center bg-sky-50 border-2 border-sky-200 rounded-2xl p-5 sm:p-7">
            <div className="p-3 sm:p-4 bg-sky-100 rounded-xl mb-3">
              <Lightbulb size={28} className="text-sky-600" strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Veelgestelde Vragen</h2>
            <p className="text-sky-700/60 text-sm mt-1 font-medium">Snelle antwoorden op jouw belangrijkste vragen</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-lg p-5 sm:p-8 mb-16">
          <FAQItem
            question="Wat moet ik doen als mijn hond in een kwal trapt op het strand?"
            answer="Spoel de getroffen plek onmiddellijk met zeewater (NOOIT zoet water of urine). Verwijder eventuele tentakels voorzichtig met een bankkaart of schelp, schraap in één richting. Gebruik eventueel huishoudazijn (5%) om resterende netelcellen te deactiveren. Ga naar de dierenarts als je hond hevig reageert, veel zwelling vertoont of tekenen van een allergische reactie laat zien (ademhalingsproblemen, extreem braken)."
          />
          <FAQItem
            question="Hoe herken ik een pietermansteek bij mijn hond?"
            answer="Je hond zal plotseling hevig janken, de poot optillen en er obsessief aan likken. De poot zwelt snel op en wordt vuurrood. De oplossing: dompel de poot zo snel mogelijk in heet water (40-45°C, test op je eigen pols) gedurende minstens 20 minuten. Het gif van de pieterman is thermolabiel — hitte breekt het af. Neem daarna altijd contact op met de dierenarts, want er kan een stukje stekel achterblijven."
          />
          <FAQItem
            question="Mag ik een zeehond op het strand benaderen met mijn hond?"
            answer="Nee, houd altijd minstens 30 meter afstand en neem je hond onmiddellijk aan de lijn. Zeehonden die op het strand liggen rusten meestal gewoon uit of ruien. Een hond kan extreme stress veroorzaken bij de zeehond. Meld gewonde zeehonden op 0800 99 899 (Sea Life Blankenberge) of 059 34 21 41 (KBIN). Raak het dier nooit zelf aan."
          />
          <FAQItem
            question="Wat als mijn hond te veel zeewater drinkt?"
            answer="Symptomen van zoutwatervergiftiging zijn overmatige dorst, waterige diarree, braken en lethargie. Bied onmiddellijk kleine hoeveelheden vers drinkwater aan en stop het spelen in zee. Bij ernstige symptomen (trillen, stuiptrekkingen, desoriëntatie, bewusteloosheid) ga direct naar de dierenarts. Preventie: neem altijd vers water mee en beperk zeewaterspelen tot sessies van 20 minuten."
          />
          <FAQItem
            question="Waarom mogen honden niet los in de duinen?"
            answer="De duinen zijn beschermd natuurgebied. Loslopende honden verstoren broedende grondvogels (strandplevier, dwergsternen), beschadigen kwetsbaar helmgras dat erosie tegengaat, en kunnen nesten vertrappen. Slechts 3,3% van de oorspronkelijke Belgische kustduinen is nog intact. Wandelen met je hond aan de lijn (max. 2 meter) op aangeduide paden is wél toegestaan."
          />
          <FAQItem
            question="Hoe hoog zijn de boetes voor hondenpoep niet opruimen?"
            answer="In de Belgische kustgemeenten riskeer je een GAS-boete (Gemeentelijke Administratieve Sanctie) van €75 tot €350, afhankelijk van de gemeente. Gemeentelijke vaststellers controleren actief, ook in de winter. Neem altijd meerdere zakjes mee en bevestig een houder aan de leiband."
          />
          <FAQItem
            question="Hoe test ik of het zand te heet is voor mijn hond?"
            answer="Gebruik de 5-seconden regel: leg de rug van je hand op het zand of asfalt. Kun je dit 5 seconden volhouden? Dan is het veilig. Is het te heet voor jouw hand, dan is het te heet voor de poten van je hond. Wandel in de zomer bij voorkeur vóór 10u of na 18u, en loop via het natte zand aan de waterlijn."
          />
          <FAQItem
            question="Wat is het 'Take 3 for the Sea' principe?"
            answer="Een simpel maar krachtig principe: neem bij elk strandbezoek minstens 3 stukken afval mee die niet van jou zijn. Sigarettenpeuken zijn de nummer één strandvervuiler. Strandafval is ook gevaarlijk voor honden — ze bijten in plastic, verslikken zich in resten, en vishaakjes kunnen vastraken in poten of bek."
          />
          <FAQItem
            question="Hoe bescherm ik mijn hond tegen teken in de duinen?"
            answer="Gebruik een tekenpreventief middel (spot-on, halsband of tablet) op advies van je dierenarts. Controleer je hond na élke duinwandeling, met speciale aandacht voor oren, oksels, liezen, tussen de tenen en rond de staart. Verwijder een teek met een tekentang, draai een kwartslag en trek recht omhoog. Rode ring rond de beet? Direct naar de dierenarts — dit kan de ziekte van Lyme zijn."
          />
          <FAQItem
            question="Zijn blauwalgen gevaarlijk voor honden aan de Belgische kust?"
            answer="Ja, blauwalgen (cyanobacteriën) zijn potentieel dodelijk voor honden. Ze komen voor in stilstaande waterpartijen, duinmeertjes en brakke vijvers, vooral bij warm weer. Het water heeft een groenblauwe kleur of drijflaag. Laat je hond nooit drinken uit stilstaand water nabij de kust. Symptomen (braken, diarree, trillen) treden snel op — ga onmiddellijk naar de dierenarts."
          />
          <FAQItem
            question="Heeft mijn hond een zwemvest nodig in de Noordzee?"
            answer="Een hondenzwemvest wordt sterk aanbevolen voor kleine rassen, brachycefale rassen (Bulldog, Mops), oudere honden en bij sterke golfslag. De Noordzee heeft sterke stromingen en muistromen die zelfs goede zwemmers kunnen verrassen. Let bij aankoop op een handvat op de rug, reflecterende strips en een felle kleur (geen blauw)."
          />
          <FAQItem
            question="Welke regels gelden er in losloopweides aan de Belgische kust?"
            answer="Ruim altijd de hondenpoep op (pas het +1 principe toe: raap je eigen poep op + minstens één extra). Houd je hond altijd in het oog, controleer het terrein op gevaren vóór je je hond loslaat, en communiceer met andere baasjes. Loopse teven horen niet in de losloopweide. Gebruik het dubbele poortsysteem correct om ontsnappingen te voorkomen."
          />
          <FAQItem
            question="Wanneer mag een puppy voor het eerst naar de losloopweide?"
            answer="Wacht tot alle vaccinaties voltooid zijn (rond 16 weken). Kies rustige momenten met maximaal 2-3 kalme, volwassen honden. Houd sessies kort (10-15 minuten) en stop altijd op een positief moment. Eén traumatische ervaring kan een levenslange angst voor andere honden veroorzaken. Kies goede 'mentor-honden' die subtiel corrigeren."
          />
          <FAQItem
            question="Hoe hoog zijn de boetes als mijn hond loslopen waar het niet mag?"
            answer="Via GAS-boetes (Gemeentelijke Administratieve Sancties) riskeer je €50 tot €350, afhankelijk van de gemeente en het type overtreding. Hond op strand in verboden zone, loslopend op de zeedijk, of hondenpoep niet opruimen — het wordt allemaal actief gecontroleerd. In natuurgebieden (duinen, bossen) kan het Agentschap voor Natuur en Bos boetes tot meer dan €500 opleggen via het Natuurdecreet. Knokke-Heist en Oostende staan bekend als bijzonder streng."
          />
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            NOODCONTACTEN BENTO
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="mb-16">
          <div className="flex flex-col items-center text-center bg-red-50 border-2 border-red-200 rounded-2xl p-5 sm:p-7 mb-8">
            <div className="p-3 sm:p-4 bg-red-100 rounded-xl mb-3">
              <Phone size={28} className="text-red-600" strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Noodcontacten</h2>
            <p className="text-red-700/60 text-sm mt-1 font-medium">Sla deze nummers op in je telefoon vóór je vertrekt</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-200 rounded-lg">
                  <Phone size={18} className="text-red-700" />
                </div>
                <div>
                  <h3 className="font-black text-red-900 text-sm">Noodgevallen</h3>
                  <p className="text-red-600 text-xs">Algemeen noodoproepnummer</p>
                </div>
              </div>
              <a href="tel:112" className="text-2xl font-black text-red-700 hover:text-red-800 transition-colors">112</a>
            </div>
            <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-sky-200 rounded-lg">
                  <Phone size={18} className="text-sky-700" />
                </div>
                <div>
                  <h3 className="font-black text-sky-900 text-sm">Antigifcentrum</h3>
                  <p className="text-sky-600 text-xs">Vergiftiging mens & dier</p>
                </div>
              </div>
              <a href="tel:070245245" className="text-2xl font-black text-sky-700 hover:text-sky-800 transition-colors">070 245 245</a>
            </div>
            <div className="bg-cyan-50 border-2 border-cyan-200 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-cyan-200 rounded-lg">
                  <span className="text-lg">🦭</span>
                </div>
                <div>
                  <h3 className="font-black text-cyan-900 text-sm">Zeehondenmeldpunt</h3>
                  <p className="text-cyan-600 text-xs">Sea Life Blankenberge</p>
                </div>
              </div>
              <a href="tel:080099899" className="text-2xl font-black text-cyan-700 hover:text-cyan-800 transition-colors">0800 99 899</a>
            </div>
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-200 rounded-lg">
                  <span className="text-lg">🔬</span>
                </div>
                <div>
                  <h3 className="font-black text-emerald-900 text-sm">KBIN — Natuurwetenschappen</h3>
                  <p className="text-emerald-600 text-xs">Zeezoogdieren & stormschade</p>
                </div>
              </div>
              <a href="tel:059342141" className="text-2xl font-black text-emerald-700 hover:text-emerald-800 transition-colors">059 34 21 41</a>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            CTA — CHECKLIST
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="bg-gradient-to-br from-sky-600 via-cyan-600 to-teal-600 rounded-3xl p-6 sm:p-10 text-white shadow-2xl shadow-sky-200/50 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black mb-3">🎒 De Strand-Checklist</h2>
            <p className="text-sky-100 text-sm sm:text-base max-w-lg mx-auto">Neem dit mee en je bent voorbereid op (bijna) alles</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
            {[
              'Vers drinkwater + opvouwbare bak',
              'Poepzakjes (meerdere!) + houder',
              'Thermosfles warm water (zomer)',
              'Leiband (voor duinen en noodgevallen)',
              'Handdoek om af te drogen',
              'Schaduwplek (parasol of tent)',
              'Koelmat voor hete dagen',
              'Telefoonnr. lokale dierenarts opgeslagen',
            ].map((item, i) => (
              <div key={`checklist-${item.substring(0, 15)}`} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3.5 rounded-xl border border-white/10">
                <div className="shrink-0 w-6 h-6 rounded-md bg-white/20 flex items-center justify-center">
                  <CheckCircle2 size={14} className="text-white" />
                </div>
                <span className="text-sm font-medium text-white">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            CTA — ONTDEK STEDEN
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="text-center">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-3">Klaar voor de kust?</h2>
          <p className="text-slate-500 text-sm sm:text-base mb-6 max-w-lg mx-auto">
            Nu je weet hoe je veilig en respectvol van het strand geniet, ontdek de actuele strandregels per stad.
          </p>
          <Link
            to="/#steden"
            className="inline-flex items-center gap-2 bg-sky-600 text-white px-6 py-3.5 rounded-full font-bold text-sm hover:bg-sky-700 shadow-lg shadow-sky-200/50 hover:shadow-sky-300/50 transition-all transform hover:-translate-y-0.5 group"
          >
            <span>Ontdek alle kuststeden</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </section>

      </div>
    </div>
  );
};

export default GoedOmTeWeten;
