import { OffLeashArea } from '../types';

// Off-Leash Dog Areas / Losloopzones
export const OFF_LEASH_AREAS: OffLeashArea[] = [
  // Blankenberge
  {
    name: 'Hondenweide J. Vande Puttelaan',
    slug: 'blankenberge-vande-puttelaan',
    address: 'J. Vande Puttelaan 7, Blankenberge',
    lat: 51.30994,
    lng: 3.13734,
    city: 'blankenberge',
    description: 'Omheinde hondenweide op het grasveld tussen Oude Steenweg en J. Vande Puttelaan.',
    image: '/vandeputtelaan.webp',
    rating: 4
  },
  {
    name: 'Hondenweide A. Van Ackersquare',
    slug: 'blankenberge-van-ackersquare',
    address: 'A. Van Ackersquare 1, Blankenberge',
    lat: 51.318202,
    lng: 3.14452,
    city: 'blankenberge',
    description: 'Omheinde hondenweide op de site van het voormalige zwembad/Nordzeebad.',
    image: '/noordzeebad.webp',
    rating: 4
  },
  // Knokke-Heist
  {
    name: 'Losloopweide Heist',
    slug: 'knokke-heist-losloopweide-heist',
    address: 'Gustave Van Nieuwenhuysestraat, Heist',
    lat: 51.3419,
    lng: 3.2351,
    city: 'knokke-heist',
    description: 'Nieuwe weide (geopend 2024) in de groene zone naast de parking en het bufferbekken.',
    image: '/weideheist.webp',
    rating: 5
  },
  // De Haan - Wenduine
  {
    name: 'Losloopzone Vosseslag',
    slug: 'de-haan-vosseslag',
    address: 'Kennedyplein, Vosseslag',
    lat: 51.26066,
    lng: 3.0084,
    city: 'de-haan',
    description: 'Omheinde zone naast de parking.',
    image: '/losloopzonevosseslag.webp',
    rating: 4
  },
  {
    name: 'Losloopzone Centrum/Sport',
    slug: 'de-haan-centrum-sport',
    address: 'Nieuwe Steenweg, De Haan',
    lat: 51.2687,
    lng: 3.036,
    city: 'de-haan',
    description: 'Gelegen bij Sport- en Recreatiecentrum Haneveld.',
    image: '/placeholder.webp',
    rating: 4
  },
  {
    name: 'Losloopzone Haneveld',
    slug: 'de-haan-haneveld',
    address: 'Lindenlaan, De Haan',
    lat: 51.25942,
    lng: 3.0277,
    city: 'de-haan',
    description: 'Zone nabij het sportcomplex Haneveld.',
    image: '/losloopzonehaneveld.webp',
    rating: 4
  },
  {
    name: 'Losloopzone Duinbossen',
    slug: 'de-haan-duinbossen',
    address: 'Zwarte Kiezel, De Haan',
    lat: 51.28507,
    lng: 3.059305,
    city: 'de-haan',
    description: 'Grote omheinde boszone van 1,2 hectare. Bereikbaar via parking Zwarte Kiezel (ca. 100m wandelen).',
    image: '/losloopzoneduinbossen.webp',
    rating: 5
  },
  {
    name: 'Losloopzone Wenduine - Manitobastraat',
    slug: 'wenduine-manitobastraat',
    address: 'Manitobastraat, Wenduine',
    lat: 51.3025,
    lng: 3.0864,
    city: 'wenduine',
    description: 'Omheinde hondenweide in Wenduine.',
    image: '/losloopzonewenduinemanitobastraat.webp',
    rating: 4
  },
  {
    name: 'Losloopzone Wenduine - Westhinderlaan',
    slug: 'wenduine-westhinderlaan',
    address: 'Westhinderlaan / Wancourstraat, Wenduine',
    lat: 51.295,
    lng: 3.078,
    city: 'wenduine',
    description: 'Gelegen op de hoek van Westhinderlaan en Wancourstraat.',
    image: '/losloopzonewenduinewesthinderlaan.webp',
    rating: 4
  },
  // Bredene
  {
    name: 'Hondenweide Brouwerijstraat',
    slug: 'bredene-brouwerijstraat',
    address: 'Brouwerijstraat, 8450 Bredene',
    lat: 51.2398,
    lng: 2.9715,
    city: 'bredene',
    description: 'Volledig omheind grasveld direct naast de grote watertoren en het elektriciteitsstation, vlakbij jeugdhuis Creatuur.',
    image: '/brouwerijstraatbredene.webp',
    rating: 4
  },
  // Oostende
  {
    name: 'Maria Hendrikapark (Grootste)',
    slug: 'oostende-maria-hendrikapark',
    address: 'Iependreef / Cederdreef, 8400 Oostende',
    lat: 51.2089,
    lng: 2.9148,
    city: 'oostende',
    description: 'Grootste en populairste hondenloopweide van Oostende. De weide ligt achter het Dierenasiel "Het Blauwe Kruis". Niet zichtbaar vanaf de hoofdweg.',
    image: '/placeholder.webp',
    rating: 4
  },
  {
    name: 'Losloopzone Raversijde',
    slug: 'oostende-raversijde',
    address: 'Westlaan 1, Raversijde',
    lat: 51.2056,
    lng: 2.8645,
    city: 'oostende',
    description: 'Nabij de luchthaven en Nieuwpoortsesteenweg.',
    image: '/losloopzoneraversijde.webp',
    rating: 4
  },
  {
    name: 'Losloopzone Leffingestraat',
    slug: 'oostende-leffingestraat',
    address: 'Leffingestraat 40, 8400 Oostende',
    lat: 51.2185,
    lng: 2.9325,
    city: 'oostende',
    description: 'Veilige, omheinde zone achter de Ostend Tennis Club. Volledig verborgen achter de tennisvelden, je moet langs het tennisgebouw kijken.',
    image: '/placeholder.webp',
    rating: 4
  },
  {
    name: 'Losloopzone Lijndraaiersstraat',
    slug: 'oostende-lijndraaiersstraat',
    address: 'Lijndraaiersstraat, 8400 Oostende',
    lat: 51.2245,
    lng: 2.9198,
    city: 'oostende',
    description: 'Omheind stuk gras op de hoek van Stapelshuisstraat en Lijndraaiersstraat (Oosteroever). Voorheen bekend als "Slachthuiskaai".',
    image: '/placeholder.webp',
    rating: 3
  },
  {
    name: 'Losloopzone Ankerstraat',
    slug: 'oostende-ankerstraat',
    address: 'Ankerstraat, Oostende',
    lat: 51.2312,
    lng: 2.9285,
    city: 'oostende',
    description: 'Smalle, langgerekte strook gras die parallel loopt aan de tramsporen. Ziet eruit als een berm, maar is omheind voor honden.',
    image: '/placeholder.webp',
    rating: 4
  },
  {
    name: 'Hondenbos',
    slug: 'oostende-hondenbos',
    address: 'Karperstraat / A10, Oostende',
    lat: 51.2125,
    lng: 2.9425,
    city: 'oostende',
    description: 'Groot hondenbos (ca. 3,5 hectare) in natuurzone nabij de brug van de A10. Je moet de Karperstraat inrijden (doodlopend) om de toegang te vinden.',
    image: '/placeholder.webp',
    rating: 4
  },
  {
    name: 'Losloopzone Slachthuiskaai',
    slug: 'oostende-slachthuiskaai',
    address: 'Slachthuiskaai, Oostende',
    lat: 51.2168,
    lng: 2.9385,
    city: 'oostende',
    description: 'Rustige zone gelegen aan de rand van de woonwijk.',
    image: '/placeholder.webp',
    rating: 4
  },
  {
    name: 'Losloopzone Brigade Pironlaan',
    slug: 'oostende-brigade-pironlaan',
    address: 'Brigade Pironlaan, Oostende',
    lat: 51.2098,
    lng: 2.9215,
    city: 'oostende',
    description: 'Praktische zone in de groene strook voor buurtbewoners. Recent vernieuwd met speeltoestellen (april 2023).',
    image: '/placeholder.webp',
    rating: 4
  },
  {
    name: 'Provinciedomein Raversijde',
    slug: 'oostende-provinciedomein-raversijde',
    address: 'Nieuwpoortsesteenweg 636 / Westlaan, 8400 Oostende',
    lat: 51.2045,
    lng: 2.8625,
    city: 'oostende',
    description: 'Specifieke speelweide binnen het provinciedomein (ingang via Westlaan). In de rest van het park moeten honden aan de leiband.',
    image: '/placeholder.webp',
    rating: 5
  },
  {
    name: 'Losloopweide Schorrepark',
    slug: 'oostende-schorrepark',
    address: 'Schorredijk, 8400 Oostende',
    lat: 51.2385,
    lng: 2.9045,
    city: 'oostende',
    description: 'Eén van de mooiste en grootste losloopweiden aan de kust. Dit uitgestrekte natuurgebied aan de rand van Oostende (Stene) biedt vijvers waar honden kunnen zwemmen, bunkers, heuvels en prachtige wilde bloemen. Het terrein is niet omheind maar afgelegen genoeg voor honden om voluit te lopen. Een toplocatie voor grotere rassen en honden die graag zwemmen.',
    image: '/losloopweidedeschorre.webp',
    rating: 5
  },
  // Middelkerke
  {
    name: 'Hondenweide Middelkerke',
    slug: 'middelkerke-koninginnelaan',
    address: 'Koninginnelaan 100, 8430 Middelkerke',
    lat: 51.1832,
    lng: 2.8198,
    city: 'middelkerke',
    description: 'Gezellige, volledig omheinde hondenweide in de rustige wijk achter de Stille Meers. Een sociale plek waar je altijd wel andere baasjes en honden tegenkomt - perfect voor je viervoeter om nieuwe speelkameraadjes te maken! De veilige, afgeslotenzone ligt tegenover het Woonzorgcentrum Haerlebout. Tip: help mee om deze fijne plek proper te houden voor iedereen.',
    image: '/stillemeers.webp',
    rating: 4
  },
  {
    name: 'Hondenweide Westende',
    slug: 'middelkerke-westende',
    address: 'Hofstraat, Westende',
    lat: 51.1698,
    lng: 2.7856,
    city: 'middelkerke',
    description: 'Rustige plek vlakbij Sportpark "De Krokodiel". Zoek naar de kruising met de Voetbalstraat.',
    image: '/placeholder.webp',
    rating: 4
  },
  // Nieuwpoort
  {
    name: 'Hondenweide Prins Mauritspark',
    slug: 'nieuwpoort-prins-mauritspark',
    address: 'Louisweg / Dienstweg Havengeul, Nieuwpoort',
    lat: 51.1425,
    lng: 2.7312,
    city: 'nieuwpoort',
    description: 'Grote omheinde zone (ca. 2.500 m┬▓) aan de kant van de havengeul, vlakbij het vakantiepark. Uitstekend alternatief voor het strand in de zomer!',
    image: '/placeholder.webp',
    rating: 5
  },
  {
    name: 'Hondenweide Leopold II Park',
    slug: 'nieuwpoort-leopold-ii-park',
    address: 'Albert I Laan, Nieuwpoort',
    lat: 51.1285,
    lng: 2.7485,
    city: 'nieuwpoort',
    description: 'Kleinere omheinde zone binnenin het park, voorzien van een saskluis bij de ingang.',
    image: '/placeholder.webp',
    rating: 4
  },
  // Koksijde
  {
    name: 'Losloopzone Sportpark Oostduinkerke',
    slug: 'koksijde-sportpark-oostduinkerke',
    address: 'Hazebeekstraat, Oostduinkerke',
    lat: 51.1185,
    lng: 2.6698,
    city: 'koksijde',
    description: 'Ruime zone aan de rand van sportcomplex "Hazebeek".',
    image: '/placeholder.webp',
    rating: 4
  },
  {
    name: 'Losloopzone Koksijde Ster Der Zee',
    slug: 'koksijde-ster-der-zee',
    address: 'Gladiolenlaan 17, Koksijde',
    lat: 51.0985,
    lng: 2.6125,
    city: 'koksijde',
    description: 'Hondenspeelzone nabij het Abdijmuseum Ten Duinen. Ingang via de Gladiolenlaan.',
    image: '/losloopzonekoksijdesterderzee.webp',
    rating: 4
  },
  // De Panne
  {
    name: 'Hondenweide Kerkstraat',
    slug: 'de-panne-kerkstraat',
    address: 'Kerkstraat / Artiestenpad, De Panne',
    lat: 51.0998,
    lng: 2.5912,
    city: 'de-panne',
    description: 'Belangrijkste omheinde losloopweide in De Panne. Je moet helemaal naar achteren, naast de begraafplaats en motorclub "t Motosiekeltje".',
    image: '/placeholder.webp',
    rating: 4
  },
  {
    name: 'Hondenweide Doornstraat',
    slug: 'adinkerke-doornstraat',
    address: 'Doornstraat, 8660 Adinkerke',
    lat: 51.070347,
    lng: 2.595182,
    city: 'de-panne',
    description: 'Ruime omheinde hondenlosloopzone op het domein van Vijvers Markey, ook bereikbaar via de Moersesteenweg. De weide heeft twee ingangen en is heuvelachtig aangelegd. Er kan langs de weg geparkeerd worden. Een hondentoilet ligt op ongeveer 30 meter van de losloopzone. Zitbank aanwezig.',
    image: '/weidedoornstraat.webp',
    rating: 4
  }
];

