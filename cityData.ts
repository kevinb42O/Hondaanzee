
import { City } from './types.ts';

export const CITIES: City[] = [
  {
    slug: 'blankenberge',
    name: 'Blankenberge',
    description: 'Bruisende badstad - strand ten westen van de pier is 24/7 vrij voor honden.',
    image: '/blankenberge-new.webp',
    lat: 51.3126,
    lng: 3.1287,
    mapX: 441.6,
    mapY: 255.1,
    offLeashAreas: [
      {
        name: 'Hondenweide J. Vande Puttelaan',
        slug: 'blankenberge-vande-puttelaan',
        address: 'J. Vande Puttelaan 7, Blankenberge',
        lat: 51.30994,
        lng: 3.13734,
        description: 'Omheinde hondenweide op het grasveld tussen Oude Steenweg en J. Vande Puttelaan.',
        city: 'blankenberge'
      },
      {
        name: 'Hondenweide A. Van Ackersquare',
        slug: 'blankenberge-van-ackersquare',
        address: 'A. Van Ackersquare 1, Blankenberge',
        lat: 51.318202,
        lng: 3.144520,
        description: 'Omheinde hondenweide op de site van het voormalige zwembad/Nordzeebad.',
        city: 'blankenberge'
      }
    ],
    rules: {
      summer: {
        start: '03-15',
        end: '10-15',
        rule: '✅ ZONE WEST (24/7 vrij loslopen): Vanaf de westelijke strekdam richting Wenduine - honden steeds welkom zonder leiband, heel het jaar door! ⚠️ ZONE MIDDEN**: Tussen Oosterstaketsel en J. Gadeynehelling - honden niet toegelaten (paasvakantie t/m 15 sept)*, buiten deze periode aan leiband. ⚠️ ZONE OOST***: Vanaf J. Gadeynehelling richting Zeebrugge - aan leiband (15 maart - 15 okt), zonder leiband (16 okt - 14 maart).',
        status: 'DEELS'
      },
      winter: {
        rule: 'Zone West: Jaarrond vrij loslopen zonder leiband.\n\nZone Midden: Aan leiband toegelaten\n(16 sept - paasvakantie).\n\nZone Oost: Vrij loslopen zonder leiband (16 okt - 14 maart).',
        status: 'JA'
      },
      special: '*Zone West:\nStrand vanaf Westerstaketsel richting Wenduine.\n\n**Zone Midden:\nCentraal strand tussen het Oosterstaketsel & Pier.\n\n***Zone Oost:\nStrand richting Zeebrugge vanaf strandopgang J. Gadeynehelling.',
      note: 'Gecertificeerde assistentiehonden zijn altijd toegelaten.'
    }
  },
  {
    slug: 'zeebrugge',
    name: 'Zeebrugge',
    description: 'Breed strand met een jaarrond hondenzone richting Blankenberge.',
    image: '/zeebrugge.webp',
    lat: 51.3306,
    lng: 3.2056,
    mapX: 496.3,
    mapY: 284.5,
    labelOverride: { x: 490, y: 45 },
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
    slug: 'knokke-heist',
    name: 'Knokke-Heist',
    description: 'De mondaine badstad met luxe beachclubs en een unieke 24/7 losloopzone aan het Zwin.',
    image: '/knokke.webp',
    lat: 51.3486,
    lng: 3.2847,
    mapX: 552.5,
    mapY: 314.7,
    offLeashAreas: [
      {
        name: 'Losloopweide Heist',
        slug: 'knokke-heist-losloopweide-heist',
        address: 'Gustave Van Nieuwenhuysestraat, Heist',
        lat: 51.3419,
        lng: 3.2351,
        description: 'Nieuwe weide (geopend 2024) in de groene zone naast de parking en het bufferbekken.',
        city: 'knokke-heist'
      }
    ],
    rules: {
      summer: {
        start: '03-15',
        end: '10-15',
        startTime: '10:00',
        endTime: '20:00',
        rule: '🚫 HOOFDSTRANDEN (Knokke, Heist, Duinbergen): Verboden 10u-20u (15 maart - 15 okt). Vóór 10u en na 20u aan leiband toegelaten. ✅ HET ZOUTE - ALTIJD VRIJ LOSLOPEN: Vanaf ten oosten van watersportclub "Surfers Paradise" richting Nederlandse grens (Zwin) - honden mogen hier 24/7 vrij loslopen, het hele jaar door!',
        status: 'DEELS'
      },
      winter: {
        rule: 'Van 16 okt t/m 14 maart: Honden overal vrij loslopen op het volledige strand. Het Zoute blijft jaarrond vrij loslopen.',
        status: 'JA'
      },
      special: 'Honden mogen onder begeleiding loslopen buiten de bebouwde kom op openbaar domein waar geen verbod geldt. Assistentiehonden altijd toegelaten.'
    }
  },
  {
    slug: 'de-haan',
    name: 'De Haan',
    description: 'Eén van de meest hondvriendelijke badplaatsen - grote onbewaakte stranddelen altijd toegankelijk.',
    image: '/dehaan.webp',
    lat: 51.2727,
    lng: 3.0315,
    mapX: 368.2,
    mapY: 215.7,
    offLeashAreas: [
      {
        name: 'Losloopzone Vosseslag',
        slug: 'de-haan-vosseslag',
        address: 'Kennedyplein, Vosseslag',
        lat: 51.26066,
        lng: 3.0084,
        description: 'Omheinde zone naast de parking.',
        city: 'de-haan'
      },
      {
        name: 'Losloopzone Centrum/Sport',
        slug: 'de-haan-centrum-sport',
        address: 'Nieuwe Steenweg, De Haan',
        lat: 51.2687,
        lng: 3.036,
        description: 'Gelegen bij Sport- en Recreatiecentrum Haneveld.',
        city: 'de-haan'
      },
      {
        name: 'Losloopzone Haneveld',
        slug: 'de-haan-haneveld',
        address: 'Lindenlaan, De Haan',
        lat: 51.25942,
        lng: 3.0277,
        description: 'Zone nabij het sportcomplex Haneveld.',
        city: 'de-haan'
      },
      {
        name: 'Losloopzone Duinbossen',
        slug: 'de-haan-duinbossen',
        address: 'Zwarte Kiezel, De Haan',
        lat: 51.28507,
        lng: 3.059305,
        description: 'Grote omheinde boszone van 1,2 hectare. Bereikbaar via parking Zwarte Kiezel (ca. 100m wandelen).',
        city: 'de-haan'
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
      special: 'De Haan is één van de meest hondvriendelijke badplaatsen! Grote onbewaakte stranddelen zijn 365 dagen per jaar toegankelijk.'
    }
  },
  {
    slug: 'wenduine',
    name: 'Wenduine',
    description: 'Charmant kustdorpje met gezellige cafés en restaurants waar honden overal welkom zijn.',
    image: '/wenduine.webp',
    lat: 51.3025,
    lng: 3.0864,
    mapX: 395,
    mapY: 235,
    offLeashAreas: [
      {
        name: 'Losloopzone Wenduine - Manitobastraat',
        slug: 'wenduine-manitobastraat',
        address: 'Manitobastraat, Wenduine',
        lat: 51.3025,
        lng: 3.0864,
        description: 'Omheinde hondenweide in Wenduine.',
        city: 'wenduine'
      },
      {
        name: 'Losloopzone Wenduine - Westhinderlaan',
        slug: 'wenduine-westhinderlaan',
        address: 'Westhinderlaan / Wancourstraat, Wenduine',
        lat: 51.295,
        lng: 3.078,
        description: 'Gelegen op de hoek van Westhinderlaan en Wancourstraat.',
        city: 'wenduine'
      }
    ],
    rules: {
      summer: {
        start: '06-01',
        end: '09-15',
        startTime: '10:00',
        endTime: '19:00',
        rule: '🚫 BEWAAKTE ZWEMZONES (met redders): Verboden 10u-19u. ✅ ONBEWAAKTE STRANDDELEN (tussen de zwemzones): 24/7 vrij loslopen, het hele jaar door!',
        status: 'DEELS'
      },
      winter: {
        rule: 'Zeer hondvriendelijk! Overal toegelaten. Onbewaakte zones: vrij loslopen. Bewaakte zones: geen tijdsbeperkingen.',
        status: 'JA'
      },
      special: 'Wenduine deelt dezelfde hondvriendelijke regels als De Haan. Grote onbewaakte stranddelen zijn 365 dagen per jaar toegankelijk.'
    }
  },
  {
    slug: 'bredene',
    name: 'Bredene',
    description: 'Enige badplaats zonder zeedijk - in winter vrij loslopen op strand én in duinen.',
    image: '/bredene.webp',
    lat: 51.2468,
    lng: 2.9731,
    mapX: 323.7,
    mapY: 191.8,
    offLeashAreas: [
      {
        name: 'Hondenweide Brouwerijstraat',
        slug: 'bredene-brouwerijstraat',
        address: 'Brouwerijstraat, Bredene',
        lat: 51.2398,
        lng: 2.9715,
        description: 'Omheinde weide nabij de watertoren/schakelstation.',
        city: 'bredene'
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
    mapX: 285.9,
    mapY: 171.5,
    offLeashAreas: [
      {
        name: 'Maria Hendrikapark (Grootste)',
        slug: 'oostende-maria-hendrikapark',
        address: 'Iependreef / Cederdreef, Oostende',
        lat: 51.2089,
        lng: 2.9148,
        description: 'Grootste hondenweide, achter het Blauwe Kruis dierenasiel.',
        city: 'oostende'
      },
      {
        name: 'Losloopzone Raversijde',
        slug: 'oostende-raversijde',
        address: 'Westlaan 1, Raversijde',
        lat: 51.2056,
        lng: 2.8645,
        description: 'Nabij de luchthaven en Nieuwpoortsesteenweg.',
        city: 'oostende'
      },
      {
        name: 'Losloopzone Leffingestraat',
        slug: 'oostende-leffingestraat',
        address: 'Leffingestraat, Oostende',
        lat: 51.2185,
        lng: 2.9325,
        description: 'Achter de tennisclub.',
        city: 'oostende'
      },
      {
        name: 'Losloopzone Slachthuiskaai',
        slug: 'oostende-slachthuiskaai',
        address: 'Slachthuiskaai, Oostende',
        lat: 51.2245,
        lng: 2.9198,
        description: 'Nabij de kruising met Lijndraaiersstraat.',
        city: 'oostende'
      },
      {
        name: 'Losloopzone Ankerstraat',
        slug: 'oostende-ankerstraat',
        address: 'Ankerstraat, Oostende',
        lat: 51.2312,
        lng: 2.9285,
        description: 'Nabij tramhalte "Weg naar Vismijn".',
        city: 'oostende'
      },
      {
        name: 'Hondenbos',
        slug: 'oostende-hondenbos',
        address: 'Karperstraat / A10, Oostende',
        lat: 51.2125,
        lng: 2.9425,
        description: 'Bosstrook tussen Karperstraat en de A10 (nabij "Groene 62").',
        city: 'oostende'
      },
      {
        name: 'Losloopzone Schietbaanstraat',
        slug: 'oostende-schietbaanstraat',
        address: 'Schietbaanstraat, Oostende',
        lat: 51.2168,
        lng: 2.9385,
        description: 'Zone in de Schietbaanstraat.',
        city: 'oostende'
      },
      {
        name: 'Losloopzone Brigade Pironlaan',
        slug: 'oostende-brigade-pironlaan',
        address: 'Brigade Pironlaan, Oostende',
        lat: 51.2098,
        lng: 2.9215,
        description: 'Zone in de Brigade Pironlaan.',
        city: 'oostende'
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
    mapX: 210.1,
    mapY: 130.8,
    labelOverride: { x: 215, y: 210 },
    offLeashAreas: [
      {
        name: 'Hondenweide Middelkerke',
        slug: 'middelkerke-koninginnelaan',
        address: 'Koninginnelaan, Middelkerke',
        lat: 51.1832,
        lng: 2.8198,
        description: 'Direct tegenover WZC Haerlebout.',
        city: 'middelkerke'
      },
      {
        name: 'Hondenweide Westende',
        slug: 'middelkerke-westende',
        address: 'Hofstraat, Westende',
        lat: 51.1698,
        lng: 2.7856,
        description: 'Nabij de kruising met Voetbalstraat.',
        city: 'middelkerke'
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
    mapX: 150.8,
    mapY: 99.0,
    labelOverride: { x: 165, y: 245 },
    offLeashAreas: [
      {
        name: 'Hondenweide Prins Mauritspark',
        slug: 'nieuwpoort-prins-mauritspark',
        address: 'Louisweg / Dienstweg Havengeul, Nieuwpoort',
        lat: 51.1425,
        lng: 2.7312,
        description: 'Alternatief voor strand in de zomer! Omheinde losloopweide op de hoek van Louisweg en Dienstweg Havengeul.',
        city: 'nieuwpoort'
      },
      {
        name: 'Hondenweide Leopold II Park',
        slug: 'nieuwpoort-leopold-ii-park',
        address: 'Albert I Laan, Nieuwpoort',
        lat: 51.1285,
        lng: 2.7485,
        description: 'Kleinere omheinde zone binnen het park.',
        city: 'nieuwpoort'
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
    name: 'Koksijde - Oostduinkerke',
    description: 'Drie jaarrond hondenzones (±3km totaal) - maar altijd aan leiband (max 10m).',
    image: '/oostduinkerke.webp',
    lat: 51.1118,
    lng: 2.645,
    mapX: 76.2,
    mapY: 58.9,
    offLeashAreas: [
      {
        name: 'Losloopzone Sportpark Oostduinkerke',
        slug: 'koksijde-sportpark-oostduinkerke',
        address: 'Hazebeekstraat, Oostduinkerke',
        lat: 51.1185,
        lng: 2.6698,
        description: 'Gelegen bij Sportpark Oostduinkerke.',
        city: 'koksijde'
      },
      {
        name: 'Losloopzone Sint-Idesbald',
        slug: 'koksijde-sint-idesbald',
        address: 'Gladiolenlaan 17, Koksijde',
        lat: 51.0985,
        lng: 2.6125,
        description: 'Nabij het Abdijmuseum Ten Duinen.',
        city: 'koksijde'
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
        rule: '24/7 overal toegelaten aan leiband.\nLeiband van maximaal 10 meter toegelaten.',
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
    mapX: 36.3,
    mapY: 37.5,
    offLeashAreas: [
      {
        name: 'Hondenweide Kerkstraat',
        slug: 'de-panne-kerkstraat',
        address: 'Kerkstraat / Artiestenpad, De Panne',
        lat: 51.0998,
        lng: 2.5912,
        description: 'Nabij motorclub "t Motosiekeltje" en tramhalte "Moeder Lambik".',
        city: 'de-panne'
      },
      {
        name: 'Hondenweide Vijvers Markey',
        slug: 'de-panne-vijvers-markey',
        address: 'Doornstraat, Adinkerke',
        lat: 51.0785,
        lng: 2.5985,
        description: 'Gelegen op domein "Vijvers Markey".',
        city: 'de-panne'
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
