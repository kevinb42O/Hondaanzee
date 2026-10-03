import type { BeachRuleState, BeachZoneRule, CityRule } from '../types.ts';

/** Gecontroleerd tegen onderstaande gemeentelijke bronnen op deze datum.
 * Eén publicatiebron voor kaarten, zoekresultaten, pagina's, FAQ en AI-export.
 * De status zegt iets over toegang, niet over toestemming om los te lopen. */
export const BEACH_RULES_VERIFIED_AT = '2026-10-03';
type VerifiedBeachRule = CityRule & { summary: string; sources: { title: string; url: string }[]; lastVerifiedAt: string };
const source = (title: string, url: string) => ({ title, url });
const verified = (rule: Omit<VerifiedBeachRule, 'lastVerifiedAt'>): VerifiedBeachRule => ({ ...rule, lastVerifiedAt: BEACH_RULES_VERIFIED_AT });

// Zone access, leash and conditions generate both the current answer and annual text.
export const BEACH_LEASH_LABELS = {
  loose: 'Loslopen onder controle', leashed: 'Aan de leiband', short: 'Korte leiband',
  max2: 'Leiband maximaal 2 meter', max10: 'Leiband maximaal 10 meter', unknown: 'Controleer de voorwaarden',
} as const;

const zone = (id: string, name: string, boundary: string, access: BeachZoneRule['access'], leash: BeachZoneRule['leash'], detail?: string): BeachZoneRule => ({ id, name, boundary, access, leash, detail });

const state = (zones: BeachZoneRule[], conditions: string[] = [], accessExclusions: string[] = []): BeachRuleState => {
  if (!zones.length) throw new Error('A beach rule must describe at least one zone');
  const allowed = zones.filter(z => z.access === 'allowed').length;
  const conditional = zones.some(z => z.access === 'conditional');
  const status = conditional ? allowed > 0 ? 'DEELS' : 'INFO' : allowed === zones.length ? 'JA' : allowed === 0 ? 'NEE' : 'DEELS';
  const rule = zones.map(z => `${z.name.toUpperCase()}: ${z.boundary}. ${z.access === 'prohibited' ? 'Honden verboden' : z.access === 'conditional' ? 'Regeling volgens de hieronder genoemde periode' : 'Honden toegelaten'}.${z.access === 'prohibited' || z.leash === 'unknown' ? '' : ` ${BEACH_LEASH_LABELS[z.leash]}.`}${z.detail ? ` ${z.detail}` : ''}`).concat(accessExclusions, conditions).join('\n\n');
  return { status, rule, zones, conditions, accessExclusions };
};

const all = (leash: BeachZoneRule['leash'], detail?: string) => [zone('all', 'Volledige strand', 'Alle stranddelen van deze bestemming', 'allowed', leash, detail)];

const blankWest = zone('west', 'Zone west', 'Westerstaketsel richting Wenduine / Harendijke', 'allowed', 'loose');

const blankMiddle = (conditional = false) => zone('middle', 'Zone midden', 'Oosterstaketsel tot J. Gadeynehelling', conditional ? 'conditional' : 'allowed', conditional ? 'unknown' : 'leashed', conditional ? 'Vanaf de paasvakantie tot 15 september verboden; buiten die periode aan de leiband. Controleer de begindatum van de paasvakantie. De gemeente noemt 15 september zowel als einde van het verbod als begin van de toelating: vraag op die dag bevestiging.' : undefined);

const blankEast = (leash: BeachZoneRule['leash']) => zone('east', 'Zone oost', 'J. Gadeynehelling tot de grens met Zeebrugge', 'allowed', leash);

const bredeneConditions = ['In de duinen is loslopen niet toegestaan; houd je hond aan de leiband en volg de toegangsregels.'];

const oostendeZones = (restricted: boolean) => [
  zone('east', 'Oosteroever', 'Strandhoofd 5 tot de grens met Bredene', 'allowed', 'loose'),
  zone('small', 'Klein Strand', 'Westerstaketsel tot de Westelijke Strekdam', 'allowed', 'short'),
  zone('raversijde', 'Raversijde', 'Westlaan / strandhoofd 15bis tot de grens met Middelkerke tussen strandhoofden 19 en 20', 'allowed', 'short'),
  zone('sport', 'Sportstrand', 'Trap ten westen van strandhoofd 7 tot Vertigo, ten westen van het Beachhouse en ten oosten van strandhoofd 8', restricted ? 'prohibited' : 'allowed', 'short'),
  zone('other', 'Overige stranddelen', 'Alle stranddelen buiten bovenstaande zones', restricted ? 'prohibited' : 'allowed', 'loose'),
];

const middelkerkeZones = (restricted: boolean) => [
  zone('west', 'Westelijke zone', 'Strandhoofd MDK7 in het verlengde van de Idyllelaan tot de grens met Nieuwpoort', 'allowed', 'max10'),
  zone('sport', 'Sportstrand', 'Strandhoofden MDK8 tot MDK10, ter hoogte van de Louis Logierlaan', 'allowed', 'max10'),
  zone('east', 'Oostelijke zone', 'Ten oosten van de bewaakte zone Carlton, vanaf Sluisvaartstraat tot de grens met Oostende', 'allowed', 'loose'),
  zone('other', 'Overige stranddelen', 'Alle stranddelen buiten de drie uitzonderingszones', restricted ? 'prohibited' : 'allowed', 'max2'),
];

const koksijdeZones = (restricted: boolean) => [
  zone('west', 'Permanente zone bij De Panne', 'Grens met De Panne tot de grens van de bewaakte zone ter hoogte van Pieterlaan 10', 'allowed', 'max10', 'Deze toelating geldt buiten de actief bewaakte zwemzones.'),
  zone('andre', 'Permanente zone Sint-André', 'Elisabethplein tot G. Scottlaan', 'allowed', 'max10', 'Deze toelating geldt buiten de actief bewaakte zwemzones.'),
  zone('east', 'Permanente zone Oostduinkerke', 'F. Timmermanslaan tot Paardevissersweg', 'allowed', 'max10', 'Deze toelating geldt buiten de actief bewaakte zwemzones.'),
  zone('other', 'Overige stranddelen', 'Strand buiten de drie permanente hondenzones', restricted ? 'prohibited' : 'allowed', 'max10', restricted ? undefined : 'Deze toelating geldt buiten de actief bewaakte zwemzones.'),
];

const koksijdeConditions = ['Wandel langs of zo dicht mogelijk bij de waterlijn. Dit is een verplaatsingsvoorwaarde en geen algemene toelating tot een vierde hondenzone.'];
const koksijdeExclusions = ['Bewaakte zwemzones zijn verboden zolang de reddingsdienst actief is.'];

const depanneZones = (summer: boolean, day: boolean) => [
  zone('1', 'Zone 1', 'Canadezenplein tot de grens met Koksijde', 'allowed', 'leashed'),
  zone('2', 'Zone 2 en Planché', 'Canadezenplein tot de Rampe, met het Planché', summer ? 'prohibited' : 'allowed', 'leashed', summer ? 'Honden de hele dag verboden; de avonduren veranderen dit niet.' : undefined),
  zone('3', 'Zone 3', 'Rampe tot het zeilwagencentrum', 'allowed', 'leashed'),
  zone('4', 'Zone 4', 'Zeilwagencentrum tot de grens van het natuurreservaat ter hoogte van de slufter', 'allowed', summer && day ? 'leashed' : 'loose'),
];

const deHaan = verified({
  summary: "Onbewaakte stranddelen zijn toegankelijk; op bewaakte zones geldt van 15 juni tot en met 15 september een verbod van 10:00 tot 19:00.",
  summer: {
    ...state([zone('unwatched', 'Onbewaakte stranddelen', 'Buiten de aangeduide bewaakte badzones', 'allowed', 'loose'), zone('watched', 'Bewaakte stranddelen', 'Aangeduide bewaakte strandzones', 'prohibited', 'unknown', 'Het verbod geldt ook in de bijbehorende duinen en zee. In Vosseslag en Harendijke mag je uitsluitend aan een korte leiband passeren naar het toegelaten strand.')]),
    start: "06-15",
    end: "09-15",
    startTime: "10:00",
    endTime: "19:00",
    endInclusive: true,
    outsideHours: state(all('loose'))
  },
  winter: {
    ...state(all('loose')),
    start: "09-16",
    end: "06-14",
    label: "Strandregeling"
  },
  guidance: ["Op andere openbare plaatsen, inclusief de Duinbossen, is een leiband van maximaal 1,5 meter verplicht, behalve in aangeduide losloopzones.", "Bij zeehonden: hond aan de lijn en minstens 30 meter afstand.", "Assistentie- of blindengeleidehonden, politiehonden en vergunde bewakingsopdrachten: zie de uitzonderingen in het politiereglement."],
  note: "Op andere openbare plaatsen, inclusief de Duinbossen, geldt een leiband van maximaal 1,5 meter, behalve in aangeduide hondenlosloopzones. Bij zeehonden: hond aan de lijn en minstens 30 meter afstand. De plaatselijke afbakening van de bewaakte zones bepaalt waar het zomerverbod geldt.",
  sources: [
    source("Gemeente De Haan: honden en politieregels", "https://www.dehaan.be/Honden"),
  ],
});

export const BEACH_RULES: Record<string, VerifiedBeachRule> = {
  'blankenberge': verified({
    summary: "Westelijk van het Westerstaketsel mogen honden het hele jaar loslopen. Het middenstrand en het oostelijke strand hebben andere regels.",
    summer: {
      ...state([blankWest, blankMiddle(true), blankEast('leashed')]),
      start: "03-15",
      end: "10-15",
      label: "Zonevoorwaarden"
    },
    overrides: [
      {
        ...state([blankWest, blankMiddle(), blankEast('leashed')]),
        start: "09-16",
        end: "10-15",
        label: "Najaarsregeling"
      },
    ],
    winter: {
      ...state([blankWest, blankMiddle(), blankEast('loose')]),
      start: "10-16",
      end: "03-14",
      label: "Strandregeling"
    },
    guidance: ["De pier is geen zonegrens: het middenstrand begint aan het Oosterstaketsel, de westzone aan het Westerstaketsel.", "Assistentie- en diensthonden: zie de uitzonderingen in het politiereglement."],
    note: "De officiële gemeentepagina noemt 15 september zowel als einde van het verbod als begin van de toelating in zone midden. Controleer voor die overgangsdag de borden of vraag de gemeente om bevestiging. De paasvakantie is geen vaste jaarlijkse datum. Daarom geven we voor de periode 15 maart–15 september zone-informatie, zonder een automatisch oordeel over de toegang op het middenstrand. Het westelijke staketsel is de zonegrens; de pier is dat niet. Assistentiehonden en diensthonden vallen onder de uitzonderingen in het politiereglement.",
    sources: [
      source("Stad Blankenberge: honden op het strand", "https://www.blankenberge.be/honden-op-het-strand"),
      source("Algemene politieverordening (versie maart 2026)", "https://www.politie.be/5445/sites/5445/files/media/file/2026-06/APV%20Blankenberge_20190625_en%20latere%20wijzigingen_versie%20maart%202026.pdf"),
    ],
  }),
  'zeebrugge': verified({
    summary: "De groene zone richting Blankenberge laat honden los toe. Van 15 maart tot en met 15 oktober gelden overdag drie verschillende strandzones.",
    summer: {
      ...state([zone('green', 'Groene zone', 'Einde van de zeedijk bij de surfclub tot de grens met Blankenberge', 'allowed', 'loose'), zone('orange', 'Oranje zone', 'Strandcabines het dichtst bij de surfclub (kant Blankenberge) tot het einde van de zeedijk', 'allowed', 'leashed', 'Ook in het water is een leiband verplicht.'), zone('red', 'Rode zone', 'Strandcabines tot de St. Georges Day-wandeling', 'prohibited', 'unknown', 'Het verbod geldt ook in het water.')]),
      start: "03-15",
      end: "10-15",
      startTime: "10:00",
      endTime: "19:00",
      endInclusive: true,
      outsideHours: state(all('loose', 'Ook in het water toegelaten, onder toezicht.'))
    },
    winter: {
      ...state(all('loose', 'Ook in het water toegelaten, onder toezicht.')),
      start: "10-16",
      end: "03-14",
      label: "Strandregeling"
    },
    guidance: ["Op de zeedijk en in aangrenzende straten is een leiband verplicht.", "Bij aanwezigheid van een zeehond moeten honden op het strand altijd aan de lijn."],
    note: "Op de zeedijk en aangrenzende straten geldt een leibandplicht. Bij aanwezigheid van een zeehond moeten honden op het strand altijd aan de lijn.",
    sources: [
      source("Stad Brugge: honden op het strand van Zeebrugge", "https://www.brugge.be/klimaat-milieu-natuur/dieren-dierenwelzijn/honden/honden-op-het-strand-van-zeebrugge"),
      source("Strand- en duinverordening, 29 juni 2026", "https://www.brugge.be/sites/default/files/2026-07/Strand%20en%20duinen%20-%20verordening%20GR%2029%20juni%202026.pdf"),
    ],
  }),
  'knokke-heist': verified({
    summary: "Het strand ten oosten van Surfers Paradise tot de Nederlandse grens laat honden het hele jaar los toe onder toezicht. Elders geldt een seizoensgebonden dagverbod.",
    summer: {
      ...state([zone('zoute', 'Het Zoute: uitzonderingszone', 'Ten oosten van Surfers Paradise (Appelzakstraat) tot de Nederlandse grens', 'allowed', 'loose'), zone('other', 'Overige stranddelen', 'Alle stranddelen buiten de uitzonderingszone in Het Zoute', 'prohibited', 'unknown')]),
      start: "03-15",
      end: "10-15",
      startTime: "10:00",
      endTime: "20:00",
      outsideHours: state(all('loose', 'Op het toegelaten strand geldt geen leibandplicht; toezicht blijft verplicht.'))
    },
    winter: {
      ...state(all('loose', 'Op het toegelaten strand geldt geen leibandplicht; toezicht blijft verplicht.')),
      start: "10-16",
      end: "03-14",
      label: "Strandregeling"
    },
    guidance: ["Deze strandtoelating geldt niet voor het Zwin-natuurreservaat. In natuurgebieden en bossen gelden afzonderlijke toegangsregels en een leibandplicht.", "Op de Nieuwe Internationale Dijk is een leiband verplicht.", "Assistentie- en diensthonden: zie de uitzonderingen in het politiereglement."],
    note: "Deze toelating betreft het strand en geeft geen toestemming voor het Zwin-natuurreservaat. In natuurgebieden, bossen en op de Nieuwe Internationale Dijk gelden afzonderlijke regels; op die dijk is een leiband verplicht. Assistentiehonden en diensthonden hebben wettelijke uitzonderingen.",
    sources: [
      source("Gemeente Knokke-Heist: honden op het strand", "https://www.knokke-heist.be/honden-op-het-strand"),
      source("Algemene politieverordening, artikelen 62–64", "https://www.knokke-heist.be/sites/default/files/paragraph-file/Algemene%20Politieverordening%20-%20wijziging%20%20Algemene%20Politieverordening%20-%20consolidatie%20-%20versie%20ja_%20(409210)_.pdf"),
    ],
  }),
  'de-haan': deHaan,
  'wenduine': deHaan,
  'bredene': verified({
    summary: "In de duinen blijft een leiband verplicht. Van 15 oktober tot en met 15 maart mogen honden op strand en in zee loslopen, behalve in de surfzone Twins.",
    summer: {
      ...state([zone('twins-west', 'Uitzondering bij Twins', 'Voorbij de concessiezone van Twins richting Oostende', 'allowed', 'leashed'), zone('post6', 'Uitzondering strandpost 6', 'Het aangeduide toegelaten deel van strandpost 6', 'allowed', 'leashed', 'De gemeentelijke tekst geeft geen preciezere grens; volg de afbakening ter plaatse.'), zone('other', 'Overige stranddelen', 'Strand buiten de aangeduide uitzonderingszones en verharde paden', 'prohibited', 'unknown', 'Het verbod geldt ook in de duinen; verharde paden blijven uitgezonderd.')], ['Verharde paden zijn uitgezonderd van het verbod; houd je hond aan de leiband.']),
      start: "06-15",
      end: "09-15",
      startTime: "10:30",
      endTime: "18:30",
      endInclusive: true,
      outsideHours: state(all('leashed'), bredeneConditions)
    },
    overrides: [
      {
        ...state(all('leashed'), bredeneConditions),
        start: "03-16",
        end: "06-14",
        label: "Tussenseizoen: leiband"
      },
      {
        ...state(all('leashed'), bredeneConditions),
        start: "09-16",
        end: "10-14",
        label: "Tussenseizoen: leiband"
      },
    ],
    winter: {
      ...state([zone('other', 'Strand en zee buiten Twins', 'Alle stranddelen en zee buiten de surfzone Twins', 'allowed', 'loose'), zone('twins', 'Surfzone Twins', 'De aangeduide surfzone Twins', 'allowed', 'leashed')], bredeneConditions),
      start: "10-15",
      end: "03-15",
      label: "Strandregeling"
    },
    guidance: ["Assistentie- en blindengeleidehonden, politiehonden en goedgekeurde opdrachten: zie de volledige gemeentelijke uitzonderingen."],
    note: "Assistentie- en blindengeleidehonden, politiehonden en bepaalde door de gemeente goedgekeurde opdrachten vallen onder de uitzonderingen. Zie de gemeentelijke bron voor de volledige voorwaarden.",
    sources: [
      source("Gemeente Bredene: honden op het strand", "https://www.bredene.be/nl/wat-je-moet-weten/strandinfo/honden-op-het-strand"),
    ],
  }),
  'oostende': verified({
    summary: "Drie strandzones zijn het hele jaar toegankelijk: Oosteroever (los), Klein Strand en Raversijde (korte leiband). Op de andere stranden wisselen de verboden uren per maand.",
    summer: {
      ...state(oostendeZones(true)),
      start: "04-01",
      end: "09-30",
      startTime: "10:00",
      endTime: "18:30",
      endInclusive: true,
      label: "April, mei, juni en september",
      outsideHours: state(oostendeZones(false))
    },
    overrides: [
      {
        ...state(oostendeZones(true)),
        start: "07-01",
        end: "08-31",
        startTime: "10:00",
        endTime: "20:00",
        endInclusive: true,
        label: "Juli en augustus",
        outsideHours: state(oostendeZones(false))
      },
    ],
    winter: {
      ...state(oostendeZones(false)),
      start: "10-01",
      end: "03-31",
      label: "Strandregeling"
    },
    guidance: ["Op andere openbare plaatsen geldt een korte leiband, behalve in aangeduide losloopweides.", "Geattesteerde assistentiehonden en assistentiehonden in opleiding met hun begeleider zijn altijd toegelaten."],
    note: "Het Sportstrand is de zone van de trap ten westen van strandhoofd 7 tot Vertigo, ten westen van het Beachhouse en ten oosten van strandhoofd 8. Het is geen permanente uitzondering op het zomerverbod. Geattesteerde assistentiehonden en assistentiehonden in opleiding onder begeleiding zijn altijd toegelaten. De precieze grenzen staan in de zonebeschrijvingen.",
    sources: [
      source("Stad Oostende: honden", "https://www.oostende.be/honden"),
      source("Toerisme Oostende: honden op het strand", "https://www.visitoostende.be/nl/mag-ik-met-mijn-hond-op-het-strand"),
      source("Zomerregeling 2026", "https://www.oostende.be/nieuws/detail/6030/zomerregeling-honden-op-het-strand-opnieuw-van-start-in-april"),
    ],
  }),
  'middelkerke': verified({
    summary: "Van 15 juni tot en met 15 september zijn honden uitsluitend in drie strandzones toegelaten. Leibandregels verschillen per zone.",
    summer: {
      ...state(middelkerkeZones(true), ['Verharde paden en kleischelppaden die aansluiten op de zeedijkwandelweg zijn ook uitgezonderd van het verbod.']),
      start: "06-15",
      end: "09-15"
    },
    winter: {
      ...state(middelkerkeZones(false)),
      start: "09-16",
      end: "06-14",
      label: "Strandregeling"
    },
    guidance: ["Volg de officiële strandzonegrenzen en afbakening; een horecazaak bepaalt geen toegangsgrens.", "Assistentie- en diensthonden: zie de uitzonderingen in de politieverordening."],
    note: "Assistentiehonden en diensthonden vallen onder de uitzonderingen in de politieverordening. De verharde paden en kleischelppaden die aansluiten op de zeedijkwandelweg zijn eveneens uitgezonderd van het zomerverbod. Volg de officiële strandzonegrenzen, niet enkel een herkenningspunt zoals de naam van een horecazaak.",
    sources: [
      source("Gemeente Middelkerke: actuele reglementen", "https://publicaties.middelkerke.be/reglementen/overzicht.html"),
      source("Algemene politieverordening, artikel 96.21", "https://publicaties.middelkerke.be/reglementen/049-sec-sec-apv-08052024.pdf"),
    ],
  }),
  'nieuwpoort': verified({
    summary: "Van 15 juni tot en met 15 september geldt een strandverbod van 10:30 tot 18:30. Buiten die uren en buiten dat seizoen mag je hond mee aan een leiband van maximaal 10 meter.",
    summer: {
      ...state([zone('all', 'Volledige strand', 'Alle stranddelen van Nieuwpoort', 'prohibited', 'unknown')]),
      start: "06-15",
      end: "09-15",
      startTime: "10:30",
      endTime: "18:30",
      endInclusive: true,
      outsideHours: state(all('max10'))
    },
    winter: {
      ...state(all('max10')),
      start: "09-16",
      end: "06-14",
      label: "Strandregeling"
    },
    guidance: ["Op het openbaar domein geldt een leibandplicht, behalve in aangeduide hondenlosloopweides.", "Honden die mensen met een handicap begeleiden, zijn uitgezonderd van het strandverbod."],
    note: "De hondenverordening van 23 april 2026 verhoogde de maximale leibandlengte van 5 naar 10 meter. Honden die mensen met een handicap begeleiden, zijn uitgezonderd van het strandverbod. Op het openbaar domein geldt een leibandplicht, behalve in aangeduide hondenlosloopweides.",
    sources: [
      source("Stad Nieuwpoort: honden op het strand", "https://www.nieuwpoort.be/honden-op-het-strand"),
      source("Hondenverordening, 23 april 2026", "https://www.nieuwpoort.be/politieverordening-op-de-honden"),
    ],
  }),
  'koksijde': verified({
    summary: "Honden zijn toegelaten aan een leiband van maximaal 10 meter. Van 15 juni tot 15 september, 10:30–18:30, alleen in de drie hondenzones; anders op het hele strand. Zwemzones waar de reddingsdienst actief is, blijven verboden.",
    summer: {
      ...state(koksijdeZones(true), koksijdeConditions, koksijdeExclusions),
      start: "06-15",
      end: "09-15",
      startTime: "10:30",
      endTime: "18:30",
      endInclusive: true,
      outsideHours: state(koksijdeZones(false), koksijdeConditions, koksijdeExclusions)
    },
    winter: {
      ...state(koksijdeZones(false), koksijdeConditions, koksijdeExclusions),
      start: "09-16",
      end: "06-14",
      label: "Strandregeling"
    },
    guidance: ["Ook in de duinen is een leiband van maximaal 10 meter verplicht.", "Assistentie- en diensthonden: zie de uitzonderingen in het politiereglement."],
    note: "Het algemene politiereglement bepaalt 15 juni als begin van het badseizoen voor deze hondenregels. Een oudere gemeentelijke folder vermeldt 1 juni; hier volgen we het recentere reglement. De leibandplicht geldt ook in de duinen. Assistentiehonden en diensthonden hebben uitzonderingen volgens het reglement.",
    sources: [
      source("Gemeente Koksijde: politiereglement van 9 maart 2026, titel 5 hoofdstuk 2", "https://www.koksijde.be/sites/default/files/2025-03/algemeen-politiereglement.pdf"),
    ],
  }),
  'de-panne': verified({
    summary: "Vier strandzones met verschillende regels. Loslopen mag in zone 4 tot de slufter, in de winter op elk uur en in de zomer van 18:30 tot 10:30.",
    summer: {
      ...state(depanneZones(true, true)),
      start: "06-15",
      end: "09-15",
      startTime: "10:30",
      endTime: "18:30",
      endInclusive: false,
      label: "Zomer: leibanduren zone 4",
      outsideHours: state(depanneZones(true, false))
    },
    winter: {
      ...state(depanneZones(false, false)),
      start: "09-16",
      end: "06-14",
      label: "Strandregeling"
    },
    guidance: ["Op de betonnen duinvoetversterking tussen het zeilwagencentrum en de slufter is altijd een leiband verplicht.", "Zone 4 eindigt aan de slufter / natuurreservaatgrens. De toelating geldt niet automatisch tot Frankrijk of in het natuurreservaat."],
    note: "De betonnen duinversteviging vereist altijd een leiband. Zone 4 loopt tot de slufter; de toelating geldt niet automatisch tot de Franse grens of in het natuurreservaat.",
    sources: [
      source("Gemeente De Panne: wandelen met de hond", "https://www.depanne.be/nl/praktisch/honden/wandelen-met-de-hond"),
    ],
  }),
};

export const BEACH_ACCESS_GUIDANCE = 'Er is geen uniforme zomer- of winterregeling voor de Belgische kust. Toegang, uren, zonegrenzen en leibandplicht verschillen per gemeente. Bekijk vóór je vertrekt de volledige regeling en de gemeentelijke bronnen van je bestemming. Toegelaten betekent niet automatisch dat je hond los mag lopen.';
export const DUNE_GUIDANCE = 'Een toelating op het strand geldt niet automatisch in de duinen of in een natuurreservaat. Blijf op toegankelijke, aangeduide paden, houd je hond aan de lijn en controleer plaatselijke toegangsverboden en leibandregels. Er is geen uniforme maximale leibandlengte voor alle kustduinen.';
export const PENALTY_GUIDANCE = 'Een overtreding van de gemeentelijke hondenregels of het niet opruimen van hondenpoep kan worden bestraft. De sanctie hangt af van het toepasselijke reglement en de overtreding; er is geen vast bedrag voor de hele kust. Neem poepzakjes mee en ruim altijd op.';
