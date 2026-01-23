
import { Hotspot, Service, OffLeashArea } from './types';

export const HOTSPOTS: Hotspot[] = [
  {
    id: 1,
    name: 'Lakaiann Blankenberge',
    type: 'Café',
    description: 'De gezelligste plek voor een koffie na een lange strandwandeling.',
    tags: ['Waterbak aanwezig', 'Hondensnacks', 'Terras'],
    image: '/lakaian.webp',
    city: 'blankenberge',
    address: 'Zeedijk 205/01, 8370 Blankenberge',
    website: 'https://lakaiann.com/'
  },
  {
    id: 2,
    name: 'Dune Hotel Nieuwpoort',
    type: 'Hotel',
    description: 'Overnachten met je viervoeter was nog nooit zo comfortabel.',
    tags: ['Honden toegelaten op kamer', 'Nabij strand'],
    image: '/dunehotel.webp',
    city: 'nieuwpoort',
    address: '',
    website: ''
  },
  {
    id: 3,
    name: 'Restaurant De Kwinte Middelkerke',
    type: 'Restaurant',
    description: 'Geniet van lokale gerechten terwijl je hond rustig onder tafel ligt.',
    tags: ['Ruime plaatsen', 'Waterbak aanwezig', 'Hondvriendelijk team'],
    image: '/dekwintemiddelkerke.webp',
    city: 'middelkerke',
    address: '',
    website: ''
  },
  {
    id: 4,
    name: 'Bistrot de la Mer',
    type: 'Restaurant',
    description: 'Sfeervol restaurant waar u samen met uw hond geniet van dagverse visgerechten en schaaldieren.',
    tags: ['Terras', 'Hondvriendelijk team', 'Waterbak aanwezig'],
    image: '/bistrotdelameroostende.webp',
    city: 'oostende',
    address: 'Visserskaai 20, 8400 Oostende',
    website: 'https://www.bistrot-delamer.be'
  },
  {
    id: 5,
    name: 'C-Hotels Andromeda',
    type: 'Hotel',
    description: 'Luxe hotel aan de zeedijk waar honden (max. 10kg) van harte welkom zijn op de kamer.',
    tags: ['Honden toegelaten op kamer', 'Nabij strand', 'Waterbak aanwezig'],
    image: '/c-hotelsandromedaoostende.webp',
    city: 'oostende',
    address: 'Kursaal Westhelling 5, 8400 Oostende',
    website: 'https://www.c-hotels.be/nl/andromeda'
  },
  {
    id: 6,
    name: 'Gastrobar Sam',
    type: 'Restaurant',
    description: 'Gezellige gastrobar met open keuken waar uw viervoeter gewoon mee naar binnen mag.',
    tags: ['Indoor toegelaten', 'Waterbak aanwezig', 'Hondvriendelijk team'],
    image: '/gastrobarsamoostende.webp',
    city: 'oostende',
    address: 'Van Iseghemlaan 60, 8400 Oostende',
    website: 'https://www.gastrobarsam.be'
  },
  {
    id: 7,
    name: 'Upstairs Hotel',
    type: 'Hotel',
    description: 'Hip en modern hotel vlakbij het strand waar honden welkom zijn in specifieke kamertypes.',
    tags: ['Honden toegelaten op kamer', 'Nabij strand', 'Buitenplaats'],
    image: '/upstairshoteloostende.webp',
    city: 'oostende',
    address: 'Hertstraat 15, 8400 Oostende',
    website: 'https://www.upstairshotel.com'
  },
  {
    id: 8,
    name: 'Siesta Bar',
    type: 'Restaurant',
    description: 'Unieke tapasbar die beroemd is om zijn speciale hondenmenu met snacks en \'hondenbier\'.',
    tags: ['Hondenmenu', 'Hondensnacks', 'Terras', 'Indoor toegelaten'],
    image: '/siestabarknokke.webp',
    city: 'knokke-heist',
    address: 'Dumortierlaan 127, 8300 Knokke-Heist',
    website: 'https://www.thesiesta.be'
  },
  {
    id: 9,
    name: 'The Beach Restaurant',
    type: 'Restaurant',
    description: 'Gezellig restaurant op de zeedijk waar honden zowel binnen als op het terras welkom zijn.',
    tags: ['Terras', 'Indoor toegelaten', 'Waterbak aanwezig', 'Nabij strand'],
    image: '/thebeachrestaurantknokke.webp',
    city: 'knokke-heist',
    address: 'Zeedijk-Albertstrand 552, 8300 Knokke-Heist',
    website: 'https://thebeachrestaurant.be'
  },
  {
    id: 10,
    name: 'Brasserie Rubens',
    type: 'Restaurant',
    description: 'Een vaste waarde in Knokke waar u en uw hond kunnen genieten van klassieke brasseriegerechten.',
    tags: ['Terras', 'Ruime plaatsen', 'Hondvriendelijk team'],
    image: '/brasserierubensknokke.webp',
    city: 'knokke-heist',
    address: 'Zeedijk-Albertstrand 589, 8300 Knokke-Heist',
    website: 'https://www.rubens-knokke.be'
  },
  {
    id: 11,
    name: 'Brasserie Montmartre',
    type: 'Restaurant',
    description: 'Ruime brasserie op de Zeedijk waar gezinnen met honden graag gezien zijn.',
    tags: ['Terras', 'Ruime plaatsen', 'Nabij strand', 'Indoor toegelaten'],
    image: '/brasseriemontmatreblankenberge.webp',
    city: 'blankenberge',
    address: 'Zeedijk 157, 8370 Blankenberge',
    website: 'https://www.brasseriemontmartre.be'
  },
  {
    id: 12,
    name: 'Belgium Pier Brasserie',
    type: 'Restaurant',
    description: 'Unieke locatie 350 meter in zee waar honden aangelijnd welkom zijn in de brasserie.',
    tags: ['Terras', 'Nabij strand', 'Waterbak aanwezig', 'Unieke locatie'],
    image: '/belgianpierbrasserieblankenberge.webp',
    city: 'blankenberge',
    address: 'Zeedijk 261, 8370 Blankenberge',
    website: 'https://www.belgiumpier.be'
  },
  {
    id: 13,
    name: 'Brasserie Lolo',
    type: 'Restaurant',
    description: 'Hondvriendelijke brasserie aan de Zeedijk waar u samen geniet van een dagschotel of koffie.',
    tags: ['Terras', 'Waterbak aanwezig', 'Nabij strand'],
    image: '/brasserielolodepanne.webp',
    city: 'de-panne',
    address: 'Zeedijk 26, 8660 De Panne',
    website: ''
  },
  {
    id: 14,
    name: 'De Verloren Gernoare',
    type: 'Café',
    description: 'Authentiek bruin café/estaminet waar honden als \'thuis\' worden ontvangen door de uitbater.',
    tags: ['Indoor toegelaten', 'Hondvriendelijk team', 'Waterbak aanwezig'],
    image: '/brasserieDeVerlorenGernoaredepanne.webp',
    city: 'de-panne',
    address: 'Stationsplein 12, 8660 De Panne',
    website: 'https://www.deverlorengernoare.com'
  },
  {
    id: 15,
    name: 'Brasserie Carrousel',
    type: 'Restaurant',
    description: 'Populaire brasserie waar honden overal welkom zijn, behalve aan het ontbijtbuffet.',
    tags: ['Waterbak aanwezig', 'Hondensnacks', 'Ruime plaatsen', 'Terras'],
    image: '/brasseriecarrouselnieuwpoort.webp',
    city: 'nieuwpoort',
    address: 'Albert I laan 141, 8620 Nieuwpoort',
    website: 'https://www.brasseriecarrousel.be'
  },
  {
    id: 16,
    name: 'Brasserie Het Kompas',
    type: 'Restaurant',
    description: 'Gezellig tafelen op de Zeedijk, maximaal één hond per tafel toegelaten.',
    tags: ['Terras', 'Nabij strand', 'Waterbak aanwezig'],
    image: '/brasseriehetkompasnieuwpoort.webp',
    city: 'nieuwpoort',
    address: 'Zeedijk 50, 8620 Nieuwpoort',
    website: 'https://www.hetkompas.be'
  },
  {
    id: 17,
    name: 'Bistro Noordzee',
    type: 'Restaurant',
    description: 'Bekende bistro op de zeedijk met een hart voor dieren, perfect na een strandwandeling.',
    tags: ['Terras', 'Nabij strand', 'Waterbak aanwezig', 'Hondvriendelijk team'],
    image: '/bistrotnoordzeemiddelkerke.webp',
    city: 'middelkerke',
    address: 'Zeedijk 223, 8430 Middelkerke',
    website: 'https://www.bistronoordzee.be'
  },
  {
    id: 18,
    name: 'De Lekpot',
    type: 'Restaurant',
    description: 'Familierestaurant gespecialiseerd in mosselen waar de hond gewoon mee onder tafel mag.',
    tags: ['Ruime plaatsen', 'Terras', 'Indoor toegelaten'],
    image: '/delekpotmiddelkerke.webp',
    city: 'middelkerke',
    address: 'Zeedijk 138, 8430 Middelkerke',
    website: 'https://www.delekpot.be'
  },
  {
    id: 19,
    name: 'Restaurant De Concessie',
    type: 'Restaurant',
    description: 'Stijlvol genieten in het historische hart van De Haan, honden zijn hier toegelaten.',
    tags: ['Terras', 'Buitenplaats', 'Hondvriendelijk team'],
    image: '/restaurantdeconcessiedehaan.webp',
    city: 'de-haan',
    address: 'Leopoldlaan 18-20, 8420 De Haan',
    website: 'http://www.deconcessie-dehaan.be'
  }
];

export const SERVICES: Service[] = [
  {
    id: 1,
    name: 'Dierenarts Frederik Galle',
    type: 'Dierenarts',
    description: 'Moderne dierenartsenpraktijk waar persoonlijke aanpak en het welzijn van uw huisdier centraal staan.',
    tags: ['Hondvriendelijk team', 'Indoor toegelaten', 'Consultatie op afspraak'],
    image: '/placeholder.webp',
    city: 'oostende',
    address: 'Onafhankelijkheidsstraat 19, 8400 Oostende',
    website: 'https://www.dierenartsgalle.be'
  },
  {
    id: 2,
    name: 'Dier & Tuincenter Rommel',
    type: 'Dierenspeciaalzaak',
    description: 'Familiezaak met meer dan 20 jaar ervaring en een enorm aanbod aan voeding en accessoires.',
    tags: ['Hondensnacks', 'Ruime plaatsen', 'Indoor toegelaten', 'Hondvriendelijk team'],
    image: '/placeholder.webp',
    city: 'oostende',
    address: 'Rosmolenstraat 4, 8400 Oostende',
    website: 'https://www.dier-tuin-rommel.be'
  },
  {
    id: 3,
    name: 'Dierenarts Ilse Kerckhof',
    type: 'Dierenarts',
    description: 'Professionele praktijk in Westkapelle met een groot hart voor honden en katten.',
    tags: ['Hondvriendelijk team', 'Indoor toegelaten', 'Consultatie op afspraak'],
    image: '/placeholder.webp',
    city: 'knokke-heist',
    address: 'Westkapellestraat 438, 8300 Knokke-Heist',
    website: 'https://www.dierenarts-ilse.be'
  },
  {
    id: 4,
    name: 'Dierenplezier Heist',
    type: 'Dierenspeciaalzaak',
    description: 'Gezellige dierenwinkel waar u deskundig advies krijgt en uw hond mee mag komen shoppen.',
    tags: ['Hondensnacks', 'Indoor toegelaten', 'Hondvriendelijk team', 'Nabij strand'],
    image: '/placeholder.webp',
    city: 'knokke-heist',
    address: 'Westkapellestraat 176, 8300 Knokke-Heist',
    website: 'https://www.dierenplezierknokke-heist.com'
  },
  {
    id: 5,
    name: 'De Praktijk 227',
    type: 'Dierenarts',
    description: 'Moderne dierenartsenpraktijk met ruime openingsuren en aandacht voor elk huisdier.',
    tags: ['Hondvriendelijk team', 'Indoor toegelaten', 'Waterbak aanwezig'],
    image: '/placeholder.webp',
    city: 'blankenberge',
    address: 'Kerkstraat 227, 8370 Blankenberge',
    website: 'https://www.depraktijk227.be'
  },
  {
    id: 6,
    name: 'Snuffels',
    type: 'Dierenspeciaalzaak',
    description: 'Hondenboetiek en trimsalon met een mooi assortiment aan accessoires en snacks.',
    tags: ['Hondensnacks', 'Indoor toegelaten', 'Hondvriendelijk team'],
    image: '/placeholder.webp',
    city: 'blankenberge',
    address: 'Vissersstraat 29, 8370 Blankenberge',
    website: 'https://www.snuffels-blankenberge.be'
  },
  {
    id: 7,
    name: 'De Dierendokter (Alex Salomez)',
    type: 'Dierenarts',
    description: 'Ervaren dierenarts die ook \'Cat Friendly\' gecertificeerd is, maar honden met open armen ontvangt.',
    tags: ['Hondvriendelijk team', 'Indoor toegelaten', 'Consultatie op afspraak'],
    image: '/placeholder.webp',
    city: 'de-panne',
    address: 'Kasteelstraat 68, 8660 De Panne',
    website: 'https://www.dedierendokter.be'
  },
  {
    id: 8,
    name: 'Faunami',
    type: 'Dierenspeciaalzaak',
    description: 'Ruime winkel met alles voor uw huisdier, van voeding tot speelgoed en verzorging.',
    tags: ['Ruime plaatsen', 'Hondensnacks', 'Indoor toegelaten'],
    image: '/placeholder.webp',
    city: 'de-panne',
    address: 'Veurnestraat 61, 8660 De Panne',
    website: ''
  },
  {
    id: 9,
    name: 'Dierenarts Elise Buyse',
    type: 'Dierenarts',
    description: 'Betrokken dierenarts in het centrum van Nieuwpoort, gespecialiseerd in kleine huisdieren.',
    tags: ['Hondvriendelijk team', 'Indoor toegelaten', 'Consultatie op afspraak'],
    image: '/placeholder.webp',
    city: 'nieuwpoort',
    address: 'Kerkstraat 17, 8620 Nieuwpoort',
    website: 'https://www.dierenartselisebuyse.be'
  },
  {
    id: 10,
    name: 'DogTime',
    type: 'Dierenspeciaalzaak',
    description: 'Gespecialiseerde winkel met een ruim aanbod aan voeding en accessoires voor uw viervoeter.',
    tags: ['Hondensnacks', 'Indoor toegelaten', 'Hondvriendelijk team'],
    image: '/placeholder.webp',
    city: 'nieuwpoort',
    address: 'Albert I laan 274, 8620 Nieuwpoort',
    website: ''
  },
  {
    id: 11,
    name: 'Dierenartsenpraktijk Katty',
    type: 'Dierenarts',
    description: 'Warme praktijk waar uw hond de beste medische zorgen krijgt in een rustige omgeving.',
    tags: ['Hondvriendelijk team', 'Indoor toegelaten', 'Waterbak aanwezig'],
    image: '/placeholder.webp',
    city: 'middelkerke',
    address: 'Rietstraat 18, 8430 Middelkerke',
    website: 'https://www.dierenartskatty.be'
  },
  {
    id: 12,
    name: 'Dogs & Co',
    type: 'Dierenspeciaalzaak',
    description: 'Combinatie van trimsalon en winkel met kwalitatieve producten voor honden en katten.',
    tags: ['Indoor toegelaten', 'Hondensnacks', 'Hondvriendelijk team'],
    image: '/placeholder.webp',
    city: 'middelkerke',
    address: 'Leopoldlaan 94, 8430 Middelkerke',
    website: 'https://www.dogsandco.be'
  },
  {
    id: 13,
    name: 'Dierenartsenpraktijk Breemersch',
    type: 'Dierenarts',
    description: 'Goed uitgeruste praktijk waar een persoonlijke band met dier en eigenaar voorop staat.',
    tags: ['Hondvriendelijk team', 'Indoor toegelaten', 'Consultatie op afspraak'],
    image: '/placeholder.webp',
    city: 'de-haan',
    address: 'Driftweg 30, 8420 De Haan',
    website: ''
  },
  {
    id: 14,
    name: 'Happy Dog',
    type: 'Dierenspeciaalzaak',
    description: 'Hondentrimsalon dat ook voeding en verzorgingsproducten verkoopt in het centrum.',
    tags: ['Indoor toegelaten', 'Hondensnacks', 'Hondvriendelijk team'],
    image: '/placeholder.webp',
    city: 'de-haan',
    address: 'Nieuwstraat 5, 8420 De Haan',
    website: ''
  }
];

// Off-Leash Dog Areas / Losloopzones
export const OFF_LEASH_AREAS: OffLeashArea[] = [
  // Blankenberge
  { 
    name: 'Hondenweide J. Vande Puttelaan', 
    address: 'J. Vande Puttelaan 7, Blankenberge', 
    lat: 51.3078, 
    lng: 3.1298,
    city: 'blankenberge',
    description: 'Omheinde hondenweide op het grasveld tussen Oude Steenweg en J. Vande Puttelaan.',
    image: '/weideputtelaan.webp',
    rating: 4
  },
  { 
    name: 'Hondenweide A. Van Ackersquare', 
    address: 'A. Van Ackersquare 1, Blankenberge', 
    lat: 51.3142, 
    lng: 3.1365,
    city: 'blankenberge',
    description: 'Omheinde hondenweide op de site van het voormalige zwembad/Nordzeebad.',
    image: '/noordzeebad.webp',
    rating: 4
  },
  // Knokke-Heist
  { 
    name: 'Losloopweide Heist', 
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
    address: 'Kennedyplein, Vosseslag', 
    lat: 51.2612, 
    lng: 3.0058,
    city: 'de-haan',
    description: 'Omheinde zone naast de parking.',
    image: '/placeholder.webp',
    rating: 4
  },
  { 
    name: 'Losloopzone Centrum/Sport', 
    address: 'Nieuwe Steenweg, De Haan', 
    lat: 51.2756, 
    lng: 3.0248,
    city: 'de-haan',
    description: 'Gelegen bij Sport- en Recreatiecentrum Haneveld.',
    image: '/placeholder.webp',
    rating: 4
  },
  { 
    name: 'Losloopzone Haneveld', 
    address: 'Lindenlaan, De Haan', 
    lat: 51.2742, 
    lng: 3.0212,
    city: 'de-haan',
    description: 'Zone nabij het sportcomplex Haneveld.',
    image: '/placeholder.webp',
    rating: 4
  },
  { 
    name: 'Losloopzone Duinbossen', 
    address: 'Zwarte Kiezel, De Haan', 
    lat: 51.2685, 
    lng: 3.0385,
    city: 'de-haan',
    description: 'Grote omheinde boszone van 1,2 hectare. Bereikbaar via parking Zwarte Kiezel (ca. 100m wandelen).',
    image: '/placeholder.webp',
    rating: 5
  },
  { 
    name: 'Losloopzone Wenduine - Manitobastraat', 
    address: 'Manitobastraat, Wenduine', 
    lat: 51.2948, 
    lng: 3.0712,
    city: 'de-haan',
    description: 'Omheinde hondenweide in Wenduine.',
    image: '/placeholder.webp',
    rating: 4
  },
  { 
    name: 'Losloopzone Wenduine - Westhinderlaan', 
    address: 'Westhinderlaan / Wancourstraat, Wenduine', 
    lat: 51.2935, 
    lng: 3.0685,
    city: 'de-haan',
    description: 'Gelegen op de hoek van Westhinderlaan en Wancourstraat.',
    image: '/placeholder.webp',
    rating: 4
  },
  // Bredene
  { 
    name: 'Hondenweide Brouwerijstraat', 
    address: 'Brouwerijstraat, Bredene', 
    lat: 51.2398, 
    lng: 2.9715,
    city: 'bredene',
    description: 'Omheinde weide nabij de watertoren/schakelstation.',
    image: '/placeholder.webp',
    rating: 4
  },
  // Oostende
  { 
    name: 'Maria Hendrikapark (Grootste)', 
    address: 'Iependreef / Cederdreef, Oostende', 
    lat: 51.2089, 
    lng: 2.9148,
    city: 'oostende',
    description: 'Grootste hondenweide, achter het Blauwe Kruis dierenasiel.',
    image: '/placeholder.webp',
    rating: 5
  },
  { 
    name: 'Losloopzone Raversijde', 
    address: 'Westlaan 1, Raversijde', 
    lat: 51.2056, 
    lng: 2.8645,
    city: 'oostende',
    description: 'Nabij de luchthaven en Nieuwpoortsesteenweg.',
    image: '/placeholder.webp',
    rating: 4
  },
  { 
    name: 'Losloopzone Leffingestraat', 
    address: 'Leffingestraat, Oostende', 
    lat: 51.2185, 
    lng: 2.9325,
    city: 'oostende',
    description: 'Achter de tennisclub.',
    image: '/placeholder.webp',
    rating: 3
  },
  { 
    name: 'Losloopzone Slachthuiskaai', 
    address: 'Slachthuiskaai, Oostende', 
    lat: 51.2245, 
    lng: 2.9198,
    city: 'oostende',
    description: 'Nabij de kruising met Lijndraaiersstraat.',
    image: '/placeholder.webp',
    rating: 3
  },
  { 
    name: 'Losloopzone Ankerstraat', 
    address: 'Ankerstraat, Oostende', 
    lat: 51.2312, 
    lng: 2.9285,
    city: 'oostende',
    description: 'Nabij tramhalte "Weg naar Vismijn".',
    image: '/placeholder.webp',
    rating: 3
  },
  { 
    name: 'Hondenbos', 
    address: 'Karperstraat / A10, Oostende', 
    lat: 51.2125, 
    lng: 2.9425,
    city: 'oostende',
    description: 'Bosstrook tussen Karperstraat en de A10 (nabij "Groene 62").',
    image: '/placeholder.webp',
    rating: 4
  },
  { 
    name: 'Losloopzone Schietbaanstraat', 
    address: 'Schietbaanstraat, Oostende', 
    lat: 51.2168, 
    lng: 2.9385,
    city: 'oostende',
    image: '/placeholder.webp',
    rating: 3
  },
  { 
    name: 'Losloopzone Brigade Pironlaan', 
    address: 'Brigade Pironlaan, Oostende', 
    lat: 51.2098, 
    lng: 2.9215,
    city: 'oostende',
    image: '/placeholder.webp',
    rating: 3
  },
  // Middelkerke
  { 
    name: 'Hondenweide Middelkerke', 
    address: 'Koninginnelaan, Middelkerke', 
    lat: 51.1832, 
    lng: 2.8198,
    city: 'middelkerke',
    description: 'Direct tegenover WZC Haerlebout.',
    image: '/placeholder.webp',
    rating: 4
  },
  { 
    name: 'Hondenweide Westende', 
    address: 'Hofstraat, Westende', 
    lat: 51.1698, 
    lng: 2.7856,
    city: 'middelkerke',
    description: 'Nabij de kruising met Voetbalstraat.',
    image: '/placeholder.webp',
    rating: 4
  },
  // Nieuwpoort
  { 
    name: 'Hondenweide Prins Mauritspark', 
    address: 'Louisweg / Dienstweg Havengeul, Nieuwpoort', 
    lat: 51.1425, 
    lng: 2.7312,
    city: 'nieuwpoort',
    description: 'Alternatief voor strand in de zomer! Omheinde losloopweide op de hoek van Louisweg en Dienstweg Havengeul.',
    image: '/placeholder.webp',
    rating: 5
  },
  { 
    name: 'Hondenweide Leopold II Park', 
    address: 'Albert I Laan, Nieuwpoort', 
    lat: 51.1285, 
    lng: 2.7485,
    city: 'nieuwpoort',
    description: 'Kleinere omheinde zone binnen het park.',
    image: '/placeholder.webp',
    rating: 4
  },
  // Koksijde
  { 
    name: 'Losloopzone Sportpark Oostduinkerke', 
    address: 'Hazebeekstraat, Oostduinkerke', 
    lat: 51.1185, 
    lng: 2.6698,
    city: 'koksijde',
    description: 'Gelegen bij Sportpark Oostduinkerke.',
    image: '/placeholder.webp',
    rating: 4
  },
  { 
    name: 'Losloopzone Sint-Idesbald', 
    address: 'Gladiolenlaan 17, Koksijde', 
    lat: 51.0985, 
    lng: 2.6125,
    city: 'koksijde',
    description: 'Nabij het Abdijmuseum Ten Duinen.',
    image: '/placeholder.webp',
    rating: 4
  },
  // De Panne
  { 
    name: 'Hondenweide Kerkstraat', 
    address: 'Kerkstraat / Artiestenpad, De Panne', 
    lat: 51.0998, 
    lng: 2.5912,
    city: 'de-panne',
    description: 'Nabij motorclub "t Motosiekeltje" en tramhalte "Moeder Lambik".',
    image: '/placeholder.webp',
    rating: 4
  },
  { 
    name: 'Hondenweide Vijvers Markey', 
    address: 'Doornstraat, Adinkerke', 
    lat: 51.0785, 
    lng: 2.5985,
    city: 'de-panne',
    description: 'Gelegen op domein "Vijvers Markey".',
    image: '/placeholder.webp',
    rating: 4
  }
];

export const RULES_BLANKENBERGE = {
  summer: {
    start: '03-15', // March 15
    end: '10-15',   // October 15
    rule: 'Verboden tussen Oosterstaketsel en Grote Helling. Toegelaten buiten deze zones aan de leiband.',
    status: 'DEELS'
  },
  winter: {
    rule: 'Overal toegelaten op het strand, ook zonder leiband!',
    status: 'JA'
  }
};
