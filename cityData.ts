import { BEACH_RULES } from './data/beachRules.ts';

import type { City } from './types.ts';

export const CITIES: City[] = [
  {
    slug: 'blankenberge',
    name: 'Blankenberge',
    description: BEACH_RULES['blankenberge'].summary,
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
        lng: 3.14452,
        description: 'Omheinde hondenweide op de site van het voormalige zwembad/Nordzeebad.',
        city: 'blankenberge'
      }
    ],
    rules: BEACH_RULES['blankenberge']
  },
  {
    slug: 'zeebrugge',
    name: 'Zeebrugge',
    description: BEACH_RULES['zeebrugge'].summary,
    image: '/zeebrugge.webp',
    lat: 51.3306,
    lng: 3.2056,
    mapX: 496.3,
    mapY: 284.5,
    labelOverride: { x: 490, y: 45 },
    offLeashAreas: [],
    rules: BEACH_RULES['zeebrugge']
  },
  {
    slug: 'knokke-heist',
    name: 'Knokke-Heist',
    description: BEACH_RULES['knokke-heist'].summary,
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
    rules: BEACH_RULES['knokke-heist']
  },
  {
    slug: 'de-haan',
    name: 'De Haan',
    description: BEACH_RULES['de-haan'].summary,
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
    rules: BEACH_RULES['de-haan']
  },
  {
    slug: 'wenduine',
    name: 'Wenduine',
    description: BEACH_RULES['wenduine'].summary,
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
    rules: BEACH_RULES['wenduine']
  },
  {
    slug: 'bredene',
    name: 'Bredene',
    description: BEACH_RULES['bredene'].summary,
    image: '/bredene.webp',
    lat: 51.2468,
    lng: 2.9731,
    mapX: 323.7,
    mapY: 191.8,
    offLeashAreas: [
      {
        name: 'Hondenweide Kerkstraat',
        slug: 'bredene-kerkstraat',
        address: 'Kerkstraat, Bredene',
        lat: 51.2398,
        lng: 2.9715,
        description: 'Omheinde weide naast jeugdhuis Creatuur.',
        city: 'bredene'
      }
    ],
    rules: BEACH_RULES['bredene']
  },
  {
    slug: 'oostende',
    name: 'Oostende',
    description: BEACH_RULES['oostende'].summary,
    image: '/oostende.webp',
    lat: 51.2154,
    lng: 2.927,
    mapX: 285.9,
    mapY: 171.5,
    offLeashAreas: [
      {
        name: 'Maria Hendrikapark',
        slug: 'oostende-maria-hendrikapark',
        address: 'Iependreef / Cederdreef, Oostende',
        lat: 51.2089,
        lng: 2.9148,
        description: 'Grootste hondenweide, achter het Blauwe Kruis dierenasiel.',
        city: 'oostende',
        image: '/hendrikapark.webp'
      },
      {
        name: 'Losloopzone Raversijde',
        slug: 'oostende-raversijde',
        address: 'Westlaan 1, Raversijde',
        lat: 51.2056,
        lng: 2.8645,
        description: 'Ruime losloopzone nabij de luchthaven en Nieuwpoortsesteenweg. Gelegen aan de rand van het Provinciedomein Raversijde, met veel open ruimte om te rennen en te spelen.',
        city: 'oostende',
        image: '/raversijde.webp'
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
        name: 'Losloopzone Ankerstraat',
        slug: 'oostende-ankerstraat',
        address: 'Ankerstraat, Oostende',
        lat: 51.2312,
        lng: 2.9285,
        description: 'Nabij tramhalte "Weg naar Vismijn".',
        city: 'oostende',
        image: '/ankerstraat.webp'
      },
      {
        name: 'Hondenbos',
        slug: 'oostende-hondenbos',
        address: 'Karperstraat / A10, Oostende',
        lat: 51.2125,
        lng: 2.9425,
        description: 'Bosstrook tussen Karperstraat en de A10 (nabij "Groene 62").',
        city: 'oostende',
        image: '/hondenbos.webp'
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
        city: 'oostende',
        image: '/pironlaan.webp'
      }
    ],
    rules: BEACH_RULES['oostende']
  },
  {
    slug: 'middelkerke',
    name: 'Middelkerke - Westende',
    description: BEACH_RULES['middelkerke'].summary,
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
    rules: BEACH_RULES['middelkerke']
  },
  {
    slug: 'nieuwpoort',
    name: 'Nieuwpoort',
    description: BEACH_RULES['nieuwpoort'].summary,
    image: '/nieuwpoort.webp',
    lat: 51.1301,
    lng: 2.752,
    mapX: 150.8,
    mapY: 99,
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
    rules: BEACH_RULES['nieuwpoort']
  },
  {
    slug: 'koksijde',
    name: 'Koksijde - Oostduinkerke',
    description: BEACH_RULES['koksijde'].summary,
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
    rules: BEACH_RULES['koksijde']
  },
  {
    slug: 'de-panne',
    name: 'De Panne',
    description: BEACH_RULES['de-panne'].summary,
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
    rules: BEACH_RULES['de-panne']
  }
];
