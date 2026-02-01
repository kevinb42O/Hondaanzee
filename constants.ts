
import { Hotspot, Service, OffLeashArea } from './types';

export const HOTSPOTS: Hotspot[] = [
  {
    id: 1,
    name: 'Lakaiann Blankenberge',
    type: 'Café',
    description: 'Zonder twijfel de meest hondvriendelijke hotspot op de Zeedijk! Hier word je met open armen ontvangen door de allerliefste eigenaars. Geniet van een heerlijke specialty coffee terwijl je rondneust tussen prachtige kristallen, handgemaakte juwelen en andere unieke schatten. De ideale stop na een strandwandeling voor wie houdt van goede vibes, lekkere koffie en… pure verwennerij voor je hond!',
    tags: ['Waterbak aanwezig', 'Hondensnacks', 'Specialty Coffee', 'Aanrader'],
    image: '/gucci.webp',
    city: 'blankenberge',
    address: 'Zeedijk 205/01, 8370 Blankenberge',
    website: 'https://lakaiann.com/'
  },
  {
    id: 2,
    name: 'Dune Hotel Nieuwpoort',
    type: 'Slapen',
    description: 'Overnachten met je viervoeter was nog nooit zo comfortabel.',
    tags: ['Honden toegelaten op kamer', 'Nabij strand'],
    image: '/dunehotel.webp',
    imagePosition: 'center 30%',
    city: 'nieuwpoort',
    address: 'Nieuwlandplein 1, 8620 Nieuwpoort',
    website: 'https://www.dunehotel.be/'
  },
  {
    id: 3,
    name: 'Beachbar De Kwinte',
    type: 'Beach Bar',
    description: 'Geniet van lokale gerechten terwijl je hond rustig onder tafel ligt.',
    tags: ['Ruime plaatsen', 'Waterbak aanwezig', 'Hondvriendelijk team', 'Surfclub'],
    image: '/dekwintemiddelkerke.webp',
    city: 'middelkerke',
    address: 'Koning Ridderdijk 100/90, 8434 Middelkerke',
    website: 'https://www.surfclubwn.be/'
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
    type: 'Slapen',
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
    type: 'Slapen',
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
    address: 'Zeelaan 83, 8660 De Panne',
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
  },
  {
    id: 20,
    name: "Bel'air",
    type: 'Restaurant',
    description: 'Charmant restaurant op de Zeedijk waar gastronomie en een warme sfeer hand in hand gaan. Jouw viervoeter is hier van harte welkom om mee te genieten van een culinaire ervaring met zicht op zee.',
    tags: ['Terras', 'Nabij strand', 'Waterbak aanwezig', 'Hondvriendelijk team'],
    image: '/belairv2.webp',
    imagePosition: 'center bottom',
    city: 'blankenberge',
    address: 'Zeedijk 154, 8370 Blankenberge',
    website: 'https://www.belairblankenberge.com/'
  },
  {
    id: 21,
    name: 'Beach Palace Hotel',
    type: 'Slapen',
    description: 'Luxueus 5-sterren hotel direct aan de Zeedijk met 20 prachtig uitgeruste kamers speciaal ingericht voor gasten met honden. Geniet van topservice en comfort terwijl je viervoeter zich thuis voelt in dit exclusieve strandhotel.',
    tags: ['Honden toegelaten op kamer', '5-sterren', 'Nabij strand', 'Luxe accommodatie', 'Waterbak aanwezig'],
    image: '/beachpalace.webp',
    city: 'blankenberge',
    address: 'Zeedijk 77-79, 8370 Blankenberge',
    website: 'https://beach-palace.com/'
  },
  {
    id: 22,
    name: 'Cozy Moments',
    type: 'Café',
    description: 'Gezellig café op de Grote Markt waar honden hartelijk welkom zijn voor een drankje en versnapering. Perfect om even uit te rusten na een wandeling door het centrum, terwijl je viervoeter geniet van de aandacht en een waterbakje.',
    tags: ['Terras', 'Waterbak aanwezig', 'Hondensnacks', 'Hondvriendelijk team', 'Centrum', 'Aanrader'],
    image: '/sixtines.webp',
    imagePosition: 'center 25%',
    city: 'blankenberge',
    address: 'Grote Markt 2/0002, 8370 Blankenberge',
    website: 'www.cozy-moments.be'
  },
  {
    id: 23,
    name: 'Alaska',
    type: 'Restaurant',
    description: 'Authentiek eethuis en frituur in het hart van Bredene waar je hond welkom is terwijl jij geniet van klassieke Belgische gerechten en verse frietjes. Een gezellige, ongedwongen sfeer waar iedereen zich thuis voelt.',
    tags: ['Hondvriendelijk team', 'Waterbak aanwezig', 'Belgische keuken'],
    image: '/alaska.webp',
    city: 'bredene',
    address: 'Kapelstraat 127, 8450 Bredene',
    website: ''
  },
  {
    id: 24,
    name: 'Coffee & Wine De Golf',
    type: 'Café',
    description: 'Stijlvolle zaak waar je overdag kunt genieten van een heerlijke koffie en \'s avonds van een goed glas wijn. Je viervoeter is hier van harte welkom om mee te relaxen in de gezellige sfeer.',
    tags: ['Terras', 'Waterbak aanwezig', 'Hondvriendelijk team', 'Specialty Coffee', 'Wijnbar'],
    image: '/coffeewinedegolf.webp',
    city: 'bredene',
    address: 'Kapelstraat 73, 8450 Bredene',
    website: 'https://www.coffeeandwine.be'
  },
  {
    id: 25,
    name: 'Brasserie Shop \'n Lunch P&P',
    type: 'Café',
    description: 'Gezellige zaak waar je kunt genieten van een heerlijk ontbijt, verse koffie en smakelijke broodjes.Daarnaast worden ook diverse middagsnacks en pannekoeken,gebak en ijscoupes geserveerd om jouw middagpauze compleet te maken.Je hond is hier van harte welkom om mee te genieten van de relaxte sfeer.',
    tags: ['Ontbijt', 'Waterbak aanwezig', 'Hondvriendelijk team', 'Specialty Coffee', 'Winkel', 'Ijscoupes', 'Brasserie', 'Aanrader'],
    image: '/shopnlunch.webp',
    city: 'bredene',
    address: 'Duinenstraat 316, 8450 Bredene',
    website: ''
  },
  // Oostende Hotels & Accommodations
  {
    id: 26,
    name: 'Mercure Oostende',
    type: 'Slapen',
    description: 'Modern 4-sterrenhotel in het centrum, vlakbij het strand en het casino. Huisdieren zijn welkom in dit comfortabele hotel met uitstekende ligging.',
    tags: ['Honden toegelaten op kamer', '4-sterren', 'Nabij strand', 'Centrum'],
    image: '/mercurehotel.webp',
    city: 'oostende',
    address: 'Leopold II-laan 20, 8400 Oostende',
    website: 'https://www.mercureoostende.be'
  },
  {
    id: 27,
    name: 'Hotel Pacific',
    type: 'Slapen',
    description: 'Gezellig driesterrenhotel op 50 meter van het strand. Perfect voor een ontspannen verblijf met je viervoeter aan zee.',
    tags: ['Honden toegelaten op kamer', '3-sterren', 'Nabij strand'],
    image: '/hotelpacific.webp',
    city: 'oostende',
    address: 'Hofstraat 11, 8400 Oostende',
    website: 'https://www.pacifichotel.com'
  },
  {
    id: 28,
    name: 'Hotel Royal Astrid',
    type: 'Slapen',
    description: '3-sterrenhotel met wellnessfaciliteiten (1000m²), gelegen nabij het strand. Geniet van ontspanning terwijl je hond welkom is.',
    tags: ['Honden toegelaten op kamer', '3-sterren', 'Nabij strand', 'Wellness'],
    image: '/hotelroyalastrid.webp',
    city: 'oostende',
    address: 'Wellingtonstraat 15, 8400 Oostende',
    website: 'https://www.royalastrid.com'
  },
  {
    id: 29,
    name: 'Hotel Albert II',
    type: 'Slapen',
    description: 'Historisch pand met Belle Époque sfeer in het centrum, vlakbij de markt. Een charmant hotel waar geschiedenis en comfort samenkomen.',
    tags: ['Honden toegelaten op kamer', 'Centrum', 'Historisch pand', 'Belle Époque'],
    image: '/hotelalbert2.webp',
    city: 'oostende',
    address: 'Vlaanderenstraat 42, 8400 Oostende',
    website: 'https://www.hotelalbert2.be'
  },
  {
    id: 30,
    name: 'Charmehotel \'t Kruishof',
    type: 'Slapen',
    description: 'Gelegen tussen stad en polders, met veel ruimte en groen. Ideaal voor wandelingen met je hond in een rustige omgeving.',
    tags: ['Honden toegelaten op kamer', 'Veel groen', 'Wandelgebied', 'Charmehotel'],
    image: '/charmehotelkruishof.webp',
    city: 'oostende',
    address: 'Kruishofstraat 1, 8400 Oostende',
    website: 'https://www.kruishof.be'
  },
  {
    id: 31,
    name: 'B&B Huyze Elimonica',
    type: 'Slapen',
    description: 'Stijlvolle B&B in een geklasseerd pand uit 1899, hondvriendelijk. Geniet van de charme van een historisch gebouw met moderne comfort.',
    tags: ['Honden toegelaten op kamer', 'B&B', 'Historisch pand', 'Stijlvol'],
    image: '/huyzeelimonica.webp',
    city: 'oostende',
    address: 'Euphrosina Beernaertstraat 39, 8400 Oostende',
    website: 'https://www.elimonica.be'
  },
  {
    id: 32,
    name: 'Villa Cecha B&B & Wellness',
    type: 'Slapen',
    description: 'Kleinschalige B&B met wellness in het rustige Stene-dorp. Perfect voor een ontspannen uitje met je viervoeter.',
    tags: ['Honden toegelaten op kamer', 'B&B', 'Wellness', 'Rustig'],
    image: '/villacecha.webp',
    city: 'oostende',
    address: 'Lavendelstraat 4, 8400 Oostende (Stene)',
    website: 'https://www.villacecha.be'
  },
  {
    id: 33,
    name: 'Maison Martha',
    type: 'Slapen',
    description: 'Ruime vakantiewoning (tot 12 personen) met sauna en jacuzzi. Ideaal voor een groepsverblijf met je hond.',
    tags: ['Honden toegelaten', 'Vakantiewoning', 'Sauna', 'Jacuzzi', 'Grote groepen'],
    image: '/maisonmartha.webp',
    city: 'oostende',
    address: 'Edith Cavellstraat 14, 8400 Oostende',
    website: 'https://www.maisonmartha.eu'
  },
  {
    id: 34,
    name: 'Villa Odette',
    type: 'Slapen',
    description: 'Luxe vakantiehuis voor grote groepen (tot 14 personen), ingericht in beach-style. Perfect voor een strandvakantie met familie en hond.',
    tags: ['Honden toegelaten', 'Vakantiewoning', 'Beach-style', 'Grote groepen', 'Luxe'],
    image: '/villaodette.webp',
    city: 'oostende',
    address: 'Leffingestraat 170, 8400 Oostende',
    website: 'https://www.villaodette.be'
  },
  {
    id: 35,
    name: 'Sea Breeze',
    type: 'Slapen',
    description: 'Appartement in het centrum, op wandelafstand van de zeedijk. Ideale uitvalsbasis voor een stedentrip met je hond.',
    tags: ['Honden toegelaten', 'Appartement', 'Centrum', 'Nabij strand'],
    image: '/seabreeze.webp',
    city: 'oostende',
    address: 'Ooststraat 71, 8400 Oostende',
    website: ''
  },
  {
    id: 36,
    name: 'Zilte Stilte',
    type: 'Slapen',
    description: 'Vakantiewoning met focus op rust, huisdieren welkom. Geniet van een rustige vakantie in een hondvriendelijke omgeving.',
    tags: ['Honden toegelaten', 'Vakantiewoning', 'Rustig'],
    image: '/ziltestilte.webp',
    city: 'oostende',
    address: 'Plakkersstraat 69B, 8400 Oostende',
    website: ''
  },
  {
    id: 37,
    name: 'Les Cabanes d\'Ostende',
    type: 'Slapen',
    description: 'Unieke \'cabins\' in het groen nabij het Ensorpark, een oase van rust aan de rand van de stad. Bijzondere ervaring voor jou en je hond.',
    tags: ['Honden toegelaten', 'Cabins', 'Veel groen', 'Unieke ervaring', 'Rustig'],
    image: '/lescabanes.webp',
    city: 'oostende',
    address: 'Mariakerke (nabij het Ensorpark), 8400 Oostende',
    website: 'https://www.lescabanes.be'
  },
  // Oostende Restaurants & Cafés
  {
    id: 38,
    name: 'Taverne De Klokke',
    type: 'Café',
    description: 'Authentieke bruine kroeg/brasserie waar je hond welkom is. Geniet van een gezellige sfeer en klassieke gerechten.',
    tags: ['Indoor toegelaten', 'Waterbak aanwezig', 'Hondvriendelijk team', 'Authentiek'],
    image: '/tavernedeklokke.webp',
    city: 'oostende',
    address: 'Christinastraat 35, 8400 Oostende',
    website: 'https://www.tavernedeklokke.be'
  },
  {
    id: 39,
    name: 'Yuzu',
    type: 'Restaurant',
    description: 'Sushi en seafood restaurant, fusion van Japans en Frans-Belgisch. Je hond mag mee genieten van deze culinaire ervaring.',
    tags: ['Indoor toegelaten', 'Waterbak aanwezig', 'Sushi', 'Fusion'],
    image: '/yuzu.webp',
    city: 'oostende',
    address: 'Christinastraat 75, 8400 Oostende',
    website: 'https://www.yuzuoostende.be'
  },
  {
    id: 40,
    name: 'Brasserie David',
    type: 'Restaurant',
    description: 'Gezellige zaak met klassieke gerechten en verse vis. Je viervoeter is hier van harte welkom.',
    tags: ['Indoor toegelaten', 'Waterbak aanwezig', 'Verse vis', 'Klassieke gerechten'],
    image: '/brasseriedavid.webp',
    city: 'oostende',
    address: 'Christinastraat 45, 8400 Oostende',
    website: 'https://www.brasseriedavid.be'
  },
  {
    id: 41,
    name: 'Moby Dick',
    type: 'Restaurant',
    description: 'Bekend visrestaurant met een toog in de vorm van een vissersboot. Een unieke ervaring waar je hond welkom is.',
    tags: ['Terras', 'Waterbak aanwezig', 'Verse vis', 'Unieke locatie'],
    image: '/mobydick.webp',
    city: 'oostende',
    address: 'Visserskaai 6, 8400 Oostende',
    website: 'https://www.mobydickoostende.be'
  },
  {
    id: 42,
    name: 'Bottarga',
    type: 'Restaurant',
    description: 'Trendy brasserie op de zeedijk met zeezicht. Geniet van een heerlijke maaltijd terwijl je uitkijkt over zee met je hond naast je.',
    tags: ['Terras', 'Nabij strand', 'Zeezicht', 'Trendy'],
    image: '/bottarga.webp',
    city: 'oostende',
    address: 'Albert I-Promenade 64, 8400 Oostende',
    website: 'https://www.bottarga.be'
  },
  {
    id: 43,
    name: 'Cappuccino Rooftop Bar',
    type: 'Café',
    description: 'Tearoom en rooftop bar voor ontbijt, wafels en cocktails. Je hond mag mee genieten van het uitzicht.',
    tags: ['Terras', 'Rooftop', 'Ontbijt', 'Cocktails', 'Waterbak aanwezig'],
    image: '/cappuccinorooftopbar.webp',
    city: 'oostende',
    address: 'Ooststraat 22, 8400 Oostende',
    website: 'https://www.cappuccino-oostende.be'
  },
  {
    id: 44,
    name: 'HAN\'s centrum',
    type: 'Café',
    description: 'Gezonde lunch, soep en boterhammen. Perfect voor een snelle, gezonde hap met je viervoeter.',
    tags: ['Indoor toegelaten', 'Waterbak aanwezig', 'Gezonde lunch'],
    image: '/hanscentrum.webp',
    city: 'oostende',
    address: 'Rogierlaan 64, 8400 Oostende',
    website: ''
  },
  {
    id: 45,
    name: 'Lloyd Coffee Eatery',
    type: 'Café',
    description: 'Koffiebar met ontbijt, bagels en zoetigheden. Je hond is welkom om mee te genieten van de gezellige sfeer.',
    tags: ['Indoor toegelaten', 'Waterbak aanwezig', 'Ontbijt', 'Specialty Coffee', 'Bagels'],
    image: '/lloydcoffeeeatery.webp',
    city: 'oostende',
    address: 'Kapellestraat 1, 8400 Oostende',
    website: 'https://www.lloydcoffee.com'
  },
  // Blankenberge - New Additions
  {
    id: 46,
    name: 'Grand Café',
    type: 'Café',
    description: 'Een echte trekpleister op de zeedijk van Blankenberge! Of je nu uitgebreid wilt dineren of op zoek bent naar een snelle lunch, in de gevarieerde menukaart en seizoensgebonden dagschotels vind je altijd je gading. De uitgebreide wijnkaart met selecties uit verschillende landen en wijnstreken biedt bij elk gerecht een passende wijn. Het topteam staat elke dag paraat om je de best mogelijke ervaring te geven met een sterke prijs-kwaliteit verhouding. Let op: reserveren is niet mogelijk, dus kom gewoon langs met je viervoeter!',
    tags: ['Terras', 'Waterbak aanwezig', 'Nabij strand', 'Hondvriendelijk team', 'Klassieke sfeer'],
    image: '/grandcafe.webp',
    city: 'blankenberge',
    address: 'Zeedijk 145, 8370 Blankenberge',
    website: 'https://legrandcafe-blankenberge.be/'
  },
  {
    id: 47,
    name: "Fondue & Co 't Keteltje",
    type: 'Restaurant',
    description: 'Gezellig restaurant gespecialiseerd in heerlijke fondues en Zwitserse specialiteiten. Een warme, huiselijke sfeer waar je hond van harte welkom is om mee te genieten van een culinaire ervaring.',
    tags: ['Indoor toegelaten', 'Waterbak aanwezig', 'Hondvriendelijk team', 'Fondue specialiteit', 'Gezellig'],
    image: '/fonduetketeltje.webp',
    city: 'blankenberge',
    address: 'Weststraat 5, 8370 Blankenberge',
    website: 'https://mymenuweb.com/bel/restaurants/2054296/?utm_source=google_profile&utm_medium=google_profile&utm_campaign=admin'
  },
  {
    id: 48,
    name: 'Frituur Sparkle Chips',
    type: 'Restaurant',
    description: 'Moderne frituur op de Zeedijk waar je kunt genieten van krokante frietjes en klassieke frituursnacks. Je hond mag mee aanschuiven terwijl jij geniet van authentieke Belgische frietcultuur met zicht op zee.',
    tags: ['Terras', 'Nabij strand', 'Belgische frietjes', 'Snacks', 'Hondvriendelijk team'],
    image: '/frituursparklechips.webp',
    city: 'blankenberge',
    address: 'Zeedijk 174, 8370 Blankenberge',
    website: 'https://sparkle-chips-bv.unipage.eu/landing'
  },
  {
    id: 49,
    name: 'De Sleutel & La Clef',
    type: 'Restaurant',
    description: 'Charmant restaurant op de Zeedijk met een uitgebreide kaart en prachtig uitzicht op zee. Een perfecte plek om te genieten van verse gerechten terwijl je viervoeter rustig naast je ligt. Bij reservatie graag vermelden dat je met hond komt.',
    tags: ['Terras', 'Nabij strand', 'Waterbak aanwezig', 'Zeezicht', 'Hondvriendelijk team', 'Vleesgerechten'],
    image: '/desleutel.webp',
    city: 'blankenberge',
    address: 'Zeedijk 182, 8370 Blankenberge',
    website: 'https://restaurantdesleutel.be/'
  },
  {
    id: 50,
    name: 'Frituur Taste',
    type: 'Restaurant',
    description: 'Populaire frituur in het centrum waar kwaliteit en smaak voorop staan. Geniet van verse frietjes en een ruim aanbod aan snacks, terwijl je hond welkom is om mee te genieten.',
    tags: ['Indoor toegelaten', 'Belgische frietjes', 'Snacks', 'Hondvriendelijk team', 'Centrum'],
    image: '/tasteV2.webp',
    imagePosition: 'center bottom',
    city: 'blankenberge',
    address: 'Kerkstraat 131, 8370 Blankenberge',
    website: 'https://www.strandverblijf.be/nl/eten-en-drinken/1620/taste-food-drinks'
  },
  {
    id: 51,
    name: 'Huisje van Majutte',
    type: 'Café',
    description: 'Stap binnen in het oudste vissershuisje van de kust (1775) en laat je terugvoeren in de tijd. Gastheer Luc en gastvrouw Charlotte leggen je in de watten met hun dagverse taarten en — de absolute favoriet — garnaalkroketten volgens geheim familierecept. Kom spontaan langs, reserveren is niet nodig tenzij je met een groep komt. Ook je trouwe viervoeter is hier meer dan welkom!',
    tags: ['Indoor toegelaten', 'Waterbak aanwezig', 'Hondvriendelijk team', 'Gezellig', 'Authentiek'],
    image: '/majutte.webp',
    city: 'blankenberge',
    address: 'Breydelstraat 10, 8370 Blankenberge',
    website: 'https://majutte.be/'
  },
  {
    id: 52,
    name: 'Tearoom Koffiepotje',
    type: 'Café',
    description: 'Charmante tearoom waar je kunt genieten van verse koffie, thee en heerlijke gebakjes. Een rustige plek om even uit te rusten met je hond na een wandeling door het centrum.',
    tags: ['Indoor toegelaten', 'Waterbak aanwezig', 'Gebak', 'Koffie & Thee', 'Hondvriendelijk team'],
    image: '/koffiepotje.webp',
    city: 'blankenberge',
    address: 'Molenstraat 48, 8370 Blankenberge',
    website: 'www.koffiepotje.be'
  },
  {
    id: 53,
    name: 'My Home My Coffee',
    type: 'Café',
    description: 'Gezellige koffiebar met een huiselijke sfeer waar je kunt genieten van specialty coffee en verse lekkernijen. Je hond is hier welkom om mee te genieten van de relaxte ambiance.',
    tags: ['Indoor toegelaten', 'Waterbak aanwezig', 'Specialty Coffee', 'Hondvriendelijk team', 'Gezellig'],
    image: '/myhomemycoffee.webp',
    city: 'blankenberge',
    address: 'Vredelaan 60, 8370 Blankenberge',
    website: ''
  },
  {
    id: 54,
    name: "B&B Chez Ba'Nus",
    type: 'Slapen',
    description: 'Unieke bed & breakfast met stijlvol ingerichte themakamers: de Manhattan Room, Shanghai Room, Waikiki Family Suite en London Suite. Geniet van een luxueus ontbijt met streekproducten, huisbereide confituren en eigen gebak. Ontspan in de gezellige lounge met poolbiljart, zithoek, boeken, strips en gezelschapsspelen die uitgeeft op het charmante stadstuintje. Het beste van alles? Honden zijn welkom in de hele B&B – jullie viervoeter is hier echt thuis!',
    tags: ['Honden toegelaten op kamer', 'B&B', 'Nabij strand', 'Persoonlijke service', 'Aanrader'],
    image: '/chezbanus.webp',
    city: 'blankenberge',
    address: 'Rogierlaan, 8370 Blankenberge',
    website: 'https://www.chezbanus.be/'
  },
  {
    id: 55,
    name: 'Vakantieappartement LD383277',
    type: 'Slapen',
    description: 'Comfortabel vakantieappartement ideaal gelegen nabij het Leopoldpark, lunapark en strandbars. Perfect voor een ontspannen vakantie met je hond in het hart van Blankenberge.',
    tags: ['Honden toegelaten', 'Appartement', 'Nabij strand', 'Centrum', 'Nabij park'],
    image: '/LD383277.webp',
    city: 'blankenberge',
    address: 'Nabij Leopoldpark, lunapark & strandbars, 8370 Blankenberge',
    website: ''
  },
  {
    id: 56,
    name: 'Brasserie Eloïse',
    type: 'Café',
    description: 'Charmante brasserie in het hart van Wenduine waar kleine honden van harte welkom zijn! Geniet van een gezellige sfeer en heerlijke gerechten terwijl je kleine viervoeter comfortabel naast je kan zitten. Perfect voor een ontspannen moment met je trouwe metgezel.',
    tags: ['Kleine honden welkom', 'Waterbak aanwezig', 'Hondvriendelijk team', 'Gezellig', 'Terras'],
    image: '/eloise.webp',
    city: 'de-haan',
    address: 'Graaf Jansdijk 3, 8420 Wenduine',
    website: ''
  },
  {
    id: 57,
    name: 'Hippo 12',
    type: 'Café',
    description: 'Gezellig café met een levendige sfeer waar je kunt genieten van heerlijke cocktails en live muziek. Het ruime buitenterras is perfect om te ontspannen met je hond terwijl je geniet van de gezellige ambiance en de bruisende energie van dit populaire hotspot aan de kust.',
    tags: ['Terras', 'Waterbak aanwezig', 'Cocktails', 'Live muziek', 'Hondvriendelijk team', 'Nabij strand'],
    image: '/hippo12.webp',
    city: 'bredene',
    address: 'Duindoornstraat, 8450 Bredene',
    website: 'https://hippo12.be/'
  },
  {
    id: 58,
    name: 'Bar Delta',
    type: 'Café',
    description: 'Gezellige bar aan het einde van de zeedijk in Heist, richting Zeebrugge. Perfect om even tot rust te komen met een huisbereide specialty coffee terwijl je viervoeter naast je ligt. Een ideale plek voor koffieliefhebbers die op zoek zijn naar kwaliteit en een warme, ontspannen sfeer.',
    tags: ['Specialty Coffee', 'Waterbak aanwezig', 'Hondvriendelijk team', 'Nabij strand', 'Gezellig'],
    image: '/bardeltaV2.webp',
    city: 'knokke-heist',
    address: 'Zeedijk 83, 8301 Heist aan Zee',
    website: ''
  },
  {
    id: 59,
    name: 'Sea Sparkle',
    type: 'Slapen',
    description: 'Prachtig afgewerkt vakantieappartement met adembenemend zeezicht voor maximaal zes personen. Chris en Tatiana verwennen hun gasten graag in dit luxueuze verblijf in het centrum van Blankenberge, tussen de pier en het casino. Alle activiteiten en bezienswaardigheden liggen op wandelafstand. Perfect voor een zorgeloze vakantie met je hond aan zee!',
    tags: ['Honden toegelaten', 'Appartement', 'Zeezicht', 'Centrum', 'Nabij strand', 'Luxeverblijf'],
    image: '/seasparkle.webp',
    city: 'blankenberge',
    address: 'Centrum Blankenberge (tussen pier en casino), 8370 Blankenberge',
    website: 'https://hureninblankenberge.be/sea-sparkle/'
  },
  {
    id: 60,
    name: 'Pancho',
    type: 'Slapen',
    description: 'Charmant vakantieappartement dat alle comfort biedt voor vier personen op een boogscheut van het strand. Chris en Tatiana verhuren dit gezellige appartement al drie jaar en maken er een punt van om hun gasten een zorgeloze vakantie te bezorgen. Dieren zijn hier van harte welkom!',
    tags: ['Honden toegelaten', 'Appartement', 'Nabij strand', 'Luxeverblijf', 'Alle comfort'],
    image: '/pancho.webp',
    city: 'blankenberge',
    address: 'Nabij strand, 8370 Blankenberge',
    website: 'https://hureninblankenberge.be/pancho/'
  }
];

export const SERVICES: Service[] = [
  {
    id: 1,
    name: 'Dierenarts Frederik Galle',
    type: 'Dierenarts',
    description: 'Moderne dierenartsenpraktijk waar persoonlijke aanpak en het welzijn van uw huisdier centraal staan.',
    tags: ['Hondvriendelijk team', 'Indoor toegelaten', 'Consultatie op afspraak'],
    image: '/dierenartsfredericgalle.webp',
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
    image: '/diertuincenterrommel.webp',
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
    image: '/dierenartsilsekerckhof.webp',
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
    image: '/dierenplezierheist.webp',
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
    image: '/praktijk227.webp',
    city: 'blankenberge',
    address: 'Kerkstraat 227, 8370 Blankenberge',
    website: 'https://www.depraktijk227.be'
  },
  {
    id: 6,
    name: 'Snuffels',
    type: 'Dierenspeciaalzaak',
    description: 'Honden- en kattenspeciaalzaak met een ruim aanbod aan buggy\'s, draagtasjes en kledij. Daarnaast vind je hier een uitgebreide collectie harnasjes en halsbandjes.',
    tags: ['Hondensnacks', 'Indoor toegelaten', 'Hondvriendelijk team'],
    image: '/snuffels.webp',
    imagePosition: 'center top',
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
    image: '/dedierendokter.webp',
    city: 'de-panne',
    address: 'Kasteelstraat 68, 8660 De Panne',
    website: 'https://www.dedierendokter.be'
  },
  {
    id: 8,
    name: 'Dierenarts Elise Buyse',
    type: 'Dierenarts',
    description: 'Betrokken dierenarts in het centrum van Nieuwpoort, gespecialiseerd in kleine huisdieren.',
    tags: ['Hondvriendelijk team', 'Indoor toegelaten', 'Consultatie op afspraak'],
    image: '/dierenartselisebuyse.webp',
    city: 'nieuwpoort',
    address: 'Kerkstraat 17, 8620 Nieuwpoort',
    website: 'https://www.dierenartselisebuyse.be'
  },
  {
    id: 9,
    name: 'Dierenartsenpraktijk Katty',
    type: 'Dierenarts',
    description: 'Warme praktijk waar uw hond de beste medische zorgen krijgt in een rustige omgeving.',
    tags: ['Hondvriendelijk team', 'Indoor toegelaten', 'Waterbak aanwezig'],
    image: '/dierenartsenpraktijkkatty.webp',
    city: 'middelkerke',
    address: 'Rietstraat 18, 8430 Middelkerke',
    website: 'https://www.dierenartskatty.be'
  },
  {
    id: 10,
    name: 'Dogs & Co',
    type: 'Dierenspeciaalzaak',
    description: 'Combinatie van trimsalon en winkel met kwalitatieve producten voor honden en katten.',
    tags: ['Indoor toegelaten', 'Hondensnacks', 'Hondvriendelijk team'],
    image: '/dogsandco.webp',
    city: 'middelkerke',
    address: 'Leopoldlaan 94, 8430 Middelkerke',
    website: 'https://www.dogsandco.be'
  },
  {
    id: 11,
    name: 'Dierenartsenpraktijk Breemersch',
    type: 'Dierenarts',
    description: 'Goed uitgeruste praktijk waar een persoonlijke band met dier en eigenaar voorop staat.',
    tags: ['Hondvriendelijk team', 'Indoor toegelaten', 'Consultatie op afspraak'],
    image: '/dierenartsenpraktijkbreemersch.webp',
    city: 'de-haan',
    address: 'Grotestraat 144, 8421 De Haan',
    website: ''
  },
  {
    id: 12,
    name: 'Happy Dog',
    type: 'Dierenspeciaalzaak',
    description: 'Hondentrimsalon dat ook voeding en verzorgingsproducten verkoopt in het centrum.',
    tags: ['Indoor toegelaten', 'Hondensnacks', 'Hondvriendelijk team'],
    image: '/happydog.webp',
    city: 'de-haan',
    address: 'Nieuwstraat 5, 8420 De Haan',
    website: ''
  },
  {
    id: 13,
    name: 'Dogs & Cats',
    type: 'Dierenspeciaalzaak',
    description: 'Complete dierenwinkel voor honden en katten met voeding, accessoires en verzorgingsproducten van topkwaliteit.',
    tags: ['Indoor toegelaten', 'Hondensnacks', 'Hondvriendelijk team', 'Kattenvriendelijk'],
    image: '/dogsandcats.webp',
    city: 'blankenberge',
    address: 'Langestraat, 8370 Blankenberge',
    website: 'https://www.dogsandcats.be/'
  },
  {
    id: 14,
    name: 'Q-ties',
    type: 'Dierenspeciaalzaak',
    description: 'Gespecialiseerde hondenwinkel met een breed assortiment aan kwaliteitsvoeding, speelgoed en accessoires voor je trouwe viervoeter. Deskundig advies en persoonlijke service staan hier centraal.',
    tags: ['Indoor toegelaten', 'Hondensnacks', 'Hondvriendelijk team', 'Speelgoed', 'Accessoires'],
    image: '/q-ties.webp',
    city: 'bredene',
    address: 'Kapelstraat 173, 8450 Bredene',
    website: 'https://www.q-ties.be'
  },
  {
    id: 15,
    name: 'Dierenkliniek AniCura',
    type: 'Dierenarts',
    description: 'Moderne spoedkliniek nabij Oostende, dagelijks bereikbaar van 7.30u tot 21.00u. Professionele zorg voor je huisdier wanneer je het nodig hebt.',
    tags: ['Spoed', 'Hondvriendelijk team', 'Indoor toegelaten', 'Dagelijks open'],
    image: '/anicura.webp',
    city: 'oostende',
    address: 'Verhelststraat 1, 8460 Oudenburg',
    website: 'https://www.anicura.be/klinieken/west-vlaanderen/causus/'
  }
];

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
    lng: 3.144520,
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
    lng: 3.00840,
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
    lng: 3.0360,
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
    lng: 3.02770,
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
    city: 'de-haan',
    description: 'Omheinde hondenweide in Wenduine.',
    image: '/losloopzonewenduinemanitobastraat.webp',
    rating: 4
  },
  {
    name: 'Losloopzone Wenduine - Westhinderlaan',
    slug: 'wenduine-westhinderlaan',
    address: 'Westhinderlaan / Wancourstraat, Wenduine',
    lat: 51.2950,
    lng: 3.0780,
    city: 'de-haan',
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
    description: 'Volledig omheind grasveld direct naast de grote watertoren en het elektriciteitsstation. Op Street View lijkt het een braakliggend terrein.',
    image: '/placeholder.webp',
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
  // Middelkerke
  {
    name: 'Hondenweide Middelkerke',
    slug: 'middelkerke-koninginnelaan',
    address: 'Koninginnelaan, Middelkerke',
    lat: 51.1832,
    lng: 2.8198,
    city: 'middelkerke',
    description: 'Goed onderhouden, omheind stuk in de duinengordel. Ligt recht tegenover het Woonzorgcentrum (WZC) Haerlebout.',
    image: '/placeholder.webp',
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
    description: 'Grote omheinde zone (ca. 2.500 m²) aan de kant van de havengeul, vlakbij het vakantiepark. Uitstekend alternatief voor het strand in de zomer!',
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
    name: 'Losloopzone Sint-Idesbald',
    slug: 'koksijde-sint-idesbald',
    address: 'Gladiolenlaan 17, Koksijde',
    lat: 51.0985,
    lng: 2.6125,
    city: 'koksijde',
    description: 'Hondenspeelzone nabij het Abdijmuseum Ten Duinen. Ingang via de Gladiolenlaan.',
    image: '/placeholder.webp',
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
  }
];

export const RULES_BLANKENBERGE = {
  summer: {
    start: '03-15', // March 15
    end: '10-15',   // October 15
    rule: 'Zone West (westelijke strekdam → Wenduine): Jaarrond vrij loslopen. Zone Midden (Oosterstaketsel → J. Gadeynehelling): Verboden tijdens paasvakantie t/m 15 sept*, buiten deze periode aan leiband. Zone Oost (J. Gadeynehelling → Zeebrugge): Aan leiband.',
    status: 'DEELS'
  },
  winter: {
    rule: 'Zone West: Jaarrond vrij loslopen. Zone Midden: Aan leiband. Zone Oost: Vrij loslopen zonder leiband.',
    status: 'JA'
  }
};

