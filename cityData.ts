
import { City } from './types.ts';

export const CITIES: City[] = [
  {
    slug: 'knokke-heist',
    name: 'Knokke-Heist',
    description: 'De mondaine badstad met luxe beachclubs en een unieke 24/7 losloopzone aan het Zwin.',
    image: '/knokke.webp',
    lat: 51.3486,
    lng: 3.2847,
    offLeashAreas: [
      { 
        name: 'Losloopweide Heist', 
        address: 'Gustave Van Nieuwenhuysestraat, Heist', 
        lat: 51.3419, 
        lng: 3.2351,
        description: 'Nieuwe weide (geopend 2024) in de groene zone naast de parking en het bufferbekken.'
      }
    ],
    rules: {
      summer: {
        start: '03-15',
        end: '10-15',
        startTime: '10:00',
        endTime: '20:00',
        rule: '🚫 HOOFDSTRANDEN (Knokke, Heist, Duinbergen): Verboden 10u-20u. Vóór 10u en na 20u aan leiband toegelaten. ✅ ALTIJD VRIJ: Strand Het Zoute vanaf watersportclub "Surfers Paradise" richting Nederlandse grens (Zwin) - hier mag je hond 24/7 vrij loslopen, het hele jaar door!',
        status: 'DEELS'
      },
      winter: {
        rule: 'Van 16 okt t/m 14 maart: Honden overal vrij loslopen op het volledige strand (mits onder controle).',
        status: 'JA'
      },
      special: 'Assistentiehonden altijd toegelaten. Hondenpoepzakjes verplicht!'
    }
  },
  {
    slug: 'zeebrugge',
    name: 'Zeebrugge',
    description: 'Breed strand met een jaarrond hondenzone richting Blankenberge.',
    image: '/zeebrugge.webp',
    lat: 51.3306,
    lng: 3.2056,
    offLeashAreas: [],
    rules: {
      summer: {
        start: '03-15',
        end: '10-15',
        startTime: '10:00',
        endTime: '20:00',
        rule: '✅ GROENE ZONE (altijd toegelaten): Vanaf einde Zeedijk bij Surfclub Icarus richting Blankenberge - vrij loslopen het hele jaar! 🚫 RODE ZONE (hoofdstrand): Vanaf Surfclub Icarus tot aan de St. George\'s Day-wandeling (pier) - verboden 10u-20u, vóór 10u en na 20u aan leiband.',
        status: 'DEELS'
      },
      winter: {
        rule: 'Van 16 okt t/m 14 maart: Honden overal vrij loslopen op het volledige strand.',
        status: 'JA'
      },
      special: 'Nieuwe politieverordening februari 2025. Let op de borden!'
    }
  },
  {
    slug: 'blankenberge',
    name: 'Blankenberge',
    description: 'Bruisende badstad - strand ten westen van de pier is 24/7 vrij voor honden.',
    image: '/blankenberge-new.webp',
    lat: 51.3126,
    lng: 3.1287,
    offLeashAreas: [
      { 
        name: 'Hondenweide J. Vande Puttelaan', 
        address: 'J. Vande Puttelaan 7, Blankenberge', 
        lat: 51.3078, 
        lng: 3.1298,
        description: 'Omheinde hondenweide op het grasveld tussen Oude Steenweg en J. Vande Puttelaan.'
      },
      { 
        name: 'Hondenweide A. Van Ackersquare', 
        address: 'A. Van Ackersquare 1, Blankenberge', 
        lat: 51.3142, 
        lng: 3.1365,
        description: 'Omheinde hondenweide op de site van het voormalige zwembad/Nordzeebad.'
      }
    ],
    rules: {
      summer: {
        start: '03-15',
        end: '09-15',
        rule: '✅ ZONE WEST (24/7 vrij loslopen): Vanaf de Westelijke Pier richting De Haan/Wenduine - altijd toegelaten! 🚫 CENTRUM (verboden): Tussen de Oostelijke en Westelijke Pier (paasvakantie t/m 15 sept). ⚠️ ZONE OOST: Vanaf strandopgang J. Gadeynehelling richting Zeebrugge - aan leiband.',
        status: 'DEELS'
      },
      winter: {
        rule: 'Zone West: Jaarrond vrij loslopen. Zone Oost: Vrij loslopen (16 sept - paasvakantie). Centrum: Aan leiband toegelaten.',
        status: 'JA'
      },
      special: 'Drie duidelijke zones - herkenbaar aan de pieren (staketsels). Zone West is de hondenvriendelijkste!'
    }
  },
  {
    slug: 'de-haan',
    name: 'De Haan - Wenduine',
    description: 'Eén van de meest hondvriendelijke badplaatsen - grote onbewaakte stranddelen altijd toegankelijk.',
    image: '/wenduine.webp',
    lat: 51.2727,
    lng: 3.0315,
    offLeashAreas: [
      { 
        name: 'Losloopzone Vosseslag', 
        address: 'Kennedyplein, Vosseslag', 
        lat: 51.2612, 
        lng: 3.0058,
        description: 'Omheinde zone naast de parking.'
      },
      { 
        name: 'Losloopzone Centrum/Sport', 
        address: 'Nieuwe Steenweg, De Haan', 
        lat: 51.2756, 
        lng: 3.0248,
        description: 'Gelegen bij Sport- en Recreatiecentrum Haneveld.'
      },
      { 
        name: 'Losloopzone Haneveld', 
        address: 'Lindenlaan, De Haan', 
        lat: 51.2742, 
        lng: 3.0212,
        description: 'Zone nabij het sportcomplex Haneveld.'
      },
      { 
        name: 'Losloopzone Duinbossen', 
        address: 'Zwarte Kiezel, De Haan', 
        lat: 51.2685, 
        lng: 3.0385,
        description: 'Grote omheinde boszone van 1,2 hectare. Bereikbaar via parking Zwarte Kiezel (ca. 100m wandelen).'
      },
      { 
        name: 'Losloopzone Wenduine - Manitobastraat', 
        address: 'Manitobastraat, Wenduine', 
        lat: 51.2948, 
        lng: 3.0712,
        description: 'Omheinde hondenweide in Wenduine.'
      },
      { 
        name: 'Losloopzone Wenduine - Westhinderlaan', 
        address: 'Westhinderlaan / Wancourstraat, Wenduine', 
        lat: 51.2935, 
        lng: 3.0685,
        description: 'Gelegen op de hoek van Westhinderlaan en Wancourstraat.'
      }
    ],
    rules: {
      summer: {
        start: '06-01',
        end: '09-15',
        startTime: '10:00',
        endTime: '19:00',
        rule: '🚫 BEWAAKTE ZWEMZONES (met redders): Verboden 10u-19u. ✅ ONBEWAAKTE STRANDDELEN (tussen de zwemzones): 24/7 vrij loslopen, het hele jaar door! 💡 TIP: Bij Vosseslag en Harendijke mag je aan korte leiband door de bewaakte zone lopen om de hondenzone te bereiken.',
        status: 'DEELS'
      },
      winter: {
        rule: 'Zeer hondvriendelijk! Overal toegelaten. Onbewaakte zones: vrij loslopen. Bewaakte zones: geen tijdsbeperkingen.',
        status: 'JA'
      },
      special: 'De Haan-Wenduine is één van de meest hondvriendelijke badplaatsen! Grote onbewaakte stranddelen zijn 365 dagen per jaar toegankelijk.'
    }
  },
  {
    slug: 'bredene',
    name: 'Bredene',
    description: 'Enige badplaats zonder zeedijk - in winter vrij loslopen op strand én in duinen.',
    image: '/bredene.webp',
    lat: 51.2468,
    lng: 2.9731,
    offLeashAreas: [
      { 
        name: 'Hondenweide Brouwerijstraat', 
        address: 'Brouwerijstraat, Bredene', 
        lat: 51.2398, 
        lng: 2.9715,
        description: 'Omheinde weide nabij de watertoren/schakelstation.'
      }
    ],
    rules: {
      summer: {
        start: '07-01',
        end: '08-31',
        startTime: '10:30',
        endTime: '18:30',
        rule: '🚫 JULI & AUGUSTUS: Verboden 10u30-18u30 op strand én in duinen. Vóór 10u30 en na 18u30 aan leiband toegelaten. ⚠️ TUSSENSEIZOEN (16 maart - 30 juni & 1 sept - 14 okt): Overal aan leiband toegelaten.',
        status: 'DEELS'
      },
      winter: {
        rule: 'Van 15 okt t/m 15 maart: Overal vrij loslopen op strand en in duinen!',
        status: 'JA'
      },
      special: 'Let op: Bij surfzone Twins Club (nabij strandpost Bredene) moet je hond het hele jaar aan de leiband.'
    }
  },
  {
    slug: 'oostende',
    name: 'Oostende',
    description: 'Koningin der Badsteden met 3 jaarrond hondenzones: Oosteroever, Klein Strand en Raversijde.',
    image: '/oostende.webp',
    lat: 51.2154,
    lng: 2.927,
    offLeashAreas: [
      { 
        name: 'Maria Hendrikapark (Grootste)', 
        address: 'Iependreef / Cederdreef, Oostende', 
        lat: 51.2089, 
        lng: 2.9148,
        description: 'Grootste hondenweide, achter het Blauwe Kruis dierenasiel.'
      },
      { 
        name: 'Losloopzone Raversijde', 
        address: 'Westlaan 1, Raversijde', 
        lat: 51.2056, 
        lng: 2.8645,
        description: 'Nabij de luchthaven en Nieuwpoortsesteenweg.'
      },
      { 
        name: 'Losloopzone Leffingestraat', 
        address: 'Leffingestraat, Oostende', 
        lat: 51.2185, 
        lng: 2.9325,
        description: 'Achter de tennisclub.'
      },
      { 
        name: 'Losloopzone Slachthuiskaai', 
        address: 'Slachthuiskaai, Oostende', 
        lat: 51.2245, 
        lng: 2.9198,
        description: 'Nabij de kruising met Lijndraaiersstraat.'
      },
      { 
        name: 'Losloopzone Ankerstraat', 
        address: 'Ankerstraat, Oostende', 
        lat: 51.2312, 
        lng: 2.9285,
        description: 'Nabij tramhalte "Weg naar Vismijn".'
      },
      { 
        name: 'Hondenbos', 
        address: 'Karperstraat / A10, Oostende', 
        lat: 51.2125, 
        lng: 2.9425,
        description: 'Bosstrook tussen Karperstraat en de A10 (nabij "Groene 62").'
      },
      { 
        name: 'Losloopzone Schietbaanstraat', 
        address: 'Schietbaanstraat, Oostende', 
        lat: 51.2168, 
        lng: 2.9385
      },
      { 
        name: 'Losloopzone Brigade Pironlaan', 
        address: 'Brigade Pironlaan, Oostende', 
        lat: 51.2098, 
        lng: 2.9215
      }
    ],
    rules: {
      summer: {
        start: '04-01',
        end: '09-30',
        startTime: '10:00',
        endTime: '18:30',
        rule: '🚫 HOOFDSTRAND: Verboden 10u-18u30 (april, mei, juni, sept) of 10u-20u (juli-aug). ✅ JAARROND VRIJ (24/7): Oosteroever - vanaf strandhoofd 5 (Halve Maan) tot grens Bredene. ⚠️ JAARROND AAN LEIBAND (24/7): Klein Strand (tussen Westerstaketsel en Strekdam) én Raversijde (strandhoofd 15bis tot grens Middelkerke).',
        status: 'DEELS'
      },
      winter: {
        rule: 'Van 1 okt t/m 31 maart: Overal vrij loslopen op het hoofdstrand. De permanente zones blijven ongewijzigd.',
        status: 'JA'
      },
      special: 'Oostende heeft 3 strandzones die het hele jaar door toegankelijk zijn! Sportstrand (bij Beachhouse) altijd aan leiband.'
    }
  },
  {
    slug: 'middelkerke',
    name: 'Middelkerke - Westende',
    description: 'Strenge zomerregels, maar 3 uitzonderingszones (Carlton, Sportstrand, Cristal Palace) zijn jaarrond toegankelijk.',
    image: '/middelkerke.webp',
    lat: 51.1852,
    lng: 2.8224,
    offLeashAreas: [
      { 
        name: 'Hondenweide Middelkerke', 
        address: 'Koninginnelaan, Middelkerke', 
        lat: 51.1832, 
        lng: 2.8198,
        description: 'Direct tegenover WZC Haerlebout.'
      },
      { 
        name: 'Hondenweide Westende', 
        address: 'Hofstraat, Westende', 
        lat: 51.1698, 
        lng: 2.7856,
        description: 'Nabij de kruising met Voetbalstraat.'
      }
    ],
    rules: {
      summer: {
        start: '06-15',
        end: '09-15',
        rule: '🚫 ALGEMEEN STRAND: Verboden (15 juni - 15 sept). ✅ DRIE UITZONDERINGEN (jaarrond toegelaten): 1️⃣ VRIJ LOSLOPEN: Vanaf Residentie Carlton (Sluisvaartstraat, Westende) richting Oostende. 2️⃣ LEIBAND 10M: Ten westen van het Sportstrand (Louis Logierlaan). 3️⃣ LEIBAND 10M: Ten westen van Residentie Cristal Palace (Idyllelaan) richting Nieuwpoort.',
        status: 'DEELS'
      },
      winter: {
        rule: 'Van 16 sept t/m 14 juni: Overal toegelaten aan korte leiband (max 2m). Carlton-zone blijft vrij loslopen. Sportstrand en Cristal Palace zones: leiband max 10m.',
        status: 'JA'
      },
      special: 'Strenge zomerregels! Maar de 3 uitzonderingszones zijn het hele jaar toegankelijk - zoek de gebouwen Carlton, Sportstrand of Cristal Palace.'
    }
  },
  {
    slug: 'nieuwpoort',
    name: 'Nieuwpoort',
    description: 'Let op: strengste regels van de kust! In zomer volledig verboden, geen uitzonderingen.',
    image: '/nieuwpoort.webp',
    lat: 51.1301,
    lng: 2.752,
    offLeashAreas: [
      { 
        name: 'Hondenweide Prins Mauritspark', 
        address: 'Louisweg / Dienstweg Havengeul, Nieuwpoort', 
        lat: 51.1425, 
        lng: 2.7312,
        description: 'Alternatief voor strand in de zomer! Omheinde losloopweide op de hoek van Louisweg en Dienstweg Havengeul.'
      },
      { 
        name: 'Hondenweide Leopold II Park', 
        address: 'Albert I Laan, Nieuwpoort', 
        lat: 51.1285, 
        lng: 2.7485,
        description: 'Kleinere omheinde zone binnen het park.'
      }
    ],
    rules: {
      summer: {
        start: '06-15',
        end: '09-15',
        rule: '🚫 STRIKT VERBODEN: Van 15 juni t/m 15 september zijn honden op het VOLLEDIGE strand verboden - 24 uur per dag, 7 dagen per week. Er zijn GEEN uitzonderingen of hondenzones!',
        status: 'NEE'
      },
      winter: {
        rule: 'Van 16 sept t/m 14 juni: Toegelaten op het volledige strand, verplicht aan leiband.',
        status: 'JA'
      },
      special: 'Nieuwpoort heeft de strengste regels aan de kust! Geen losloopstrand. Tip: Gebruik de hondenloopweide in Prins Mauritspark als alternatief in de zomer.'
    }
  },
  {
    slug: 'koksijde',
    name: 'Koksijde - Oostduinkerke - Sint-Idesbald',
    description: 'Drie jaarrond hondenzones (±3km totaal) - maar altijd aan leiband (max 10m).',
    image: '/oostduinkerke.webp',
    lat: 51.1118,
    lng: 2.645,
    offLeashAreas: [
      { 
        name: 'Losloopzone Sportpark Oostduinkerke', 
        address: 'Hazebeekstraat, Oostduinkerke', 
        lat: 51.1185, 
        lng: 2.6698,
        description: 'Gelegen bij Sportpark Oostduinkerke.'
      },
      { 
        name: 'Losloopzone Sint-Idesbald', 
        address: 'Gladiolenlaan 17, Koksijde', 
        lat: 51.0985, 
        lng: 2.6125,
        description: 'Nabij het Abdijmuseum Ten Duinen.'
      }
    ],
    rules: {
      summer: {
        start: '06-01',
        end: '09-15',
        startTime: '10:30',
        endTime: '18:30',
        rule: '🚫 BEWAAKTE ZWEMZONES: Verboden 10u30-18u30. ✅ DRIE HONDENZONES (24/7, aan leiband max 10m): 1️⃣ SINT-IDESBALD: Van grens De Panne tot ter hoogte van Pieterlaan (±350m). 2️⃣ KOKSIJDE-BAD: Tussen Elisabethplein en Sint-André/G. Scottlaan (±1,2km). 3️⃣ OOSTDUINKERKE: Tussen Felix Timmermanslaan en Paardevissersweg/Groenendijk (±1,6km). Herkenbaar aan wit-blauwe borden.',
        status: 'DEELS'
      },
      winter: {
        rule: 'Vóór 10u30 en na 18u30 overal toegelaten. Altijd aan leiband (max 10m).',
        status: 'JA'
      },
      special: 'Let op: Honden mogen NIET vrij loslopen op het strand, ook niet in de hondenzones. Altijd aan leiband (max 10m). Zoek de wit-blauwe borden!'
    }
  },
  {
    slug: 'de-panne',
    name: 'De Panne',
    description: 'Zone 4 (richting Frankrijk) is dé losloopzone - in winter 24/7 vrij, in zomer \'s avonds en \'s ochtends.',
    image: '/depanne.webp',
    lat: 51.0963,
    lng: 2.5898,
    offLeashAreas: [
      { 
        name: 'Hondenweide Kerkstraat', 
        address: 'Kerkstraat / Artiestenpad, De Panne', 
        lat: 51.0998, 
        lng: 2.5912,
        description: 'Nabij motorclub "t Motosiekeltje" en tramhalte "Moeder Lambik".'
      },
      { 
        name: 'Hondenweide Vijvers Markey', 
        address: 'Doornstraat, Adinkerke', 
        lat: 51.0785, 
        lng: 2.5985,
        description: 'Gelegen op domein "Vijvers Markey".'
      }
    ],
    rules: {
      summer: {
        start: '05-15',
        end: '09-30',
        startTime: '07:00',
        endTime: '19:00',
        rule: '4 STRANDZONES (zomer = 15 mei - 30 sept): 1️⃣ ZONE 1 (Canadezenplein → Koksijde): Aan leiband. 2️⃣ ZONE 2 (Canadezenplein → De Rampe/centrum): 🚫 VERBODEN. 3️⃣ ZONE 3 (De Rampe → Zeilwagencentrum): Aan leiband. 4️⃣ ZONE 4 (Zeilwagencentrum → Franse grens): ✅ Vrij loslopen 19u-7u, overdag aan leiband.',
        status: 'DEELS'
      },
      winter: {
        rule: 'Van 1 okt t/m 14 mei (winter): Zones 1, 2, 3 aan leiband. Zone 4 (richting Frankrijk): 24/7 vrij loslopen!',
        status: 'JA'
      },
      special: 'Zone 4 (vanaf Zeilwagencentrum richting Frankrijk) is dé losloopzone! Op de betonnen duinvoetversterking moet je hond altijd aangelijnd zijn.'
    }
  }
];
