export interface DogEvent {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  city: string; // internal id
  citySlug: string; // URL slug for routing
  cityName: string;
  date: string; // YYYY-MM-DD for sorting
  dateDisplay: string; // Human-readable date
  timeDisplay: string; // e.g. "11:00 - 17:00"
  season: 'Lente' | 'Zomer' | 'Herfst' | 'Winter';
  category: string; // e.g. 'Festival', 'Wandeling', 'Workshop'
  description: string;
  descriptionHighlight?: string;
  highlights: string[];
  location: string; // Venue name
  address: string;
  price: string; // e.g. 'Gratis' or '€10'
  image: string;
  imagePosition?: string;
  website?: string;
  websiteLabel?: string;
  additionalLinks?: Array<{
    label: string;
    url: string;
  }>;
  email?: string;
  phone?: string;
  accessibility?: string[];
  detailGallery?: {
    eyebrow?: string;
    title: string;
    description?: string;
    images: Array<{
      src: string;
      alt: string;
      label: string;
    }>;
  };
  tags: string[];
}

export const EVENTS: DogEvent[] = [
  {
    id: 1,
    slug: 'kwispelfestival-de-panne-2026',
    title: 'Kwispelfestival De Panne',
    subtitle: 'Hét jaarlijkse feest voor hond & baasje',
    city: 'depanne',
    citySlug: 'de-panne',
    cityName: 'De Panne',
    date: '2026-05-17',
    dateDisplay: '17 mei 2026',
    timeDisplay: '11:00 - 17:00',
    season: 'Lente',
    category: 'Festival',
    description: 'Maak je klaar voor dé dag van het jaar waar jouw viervoeter de absolute ster is! Op het Kwispelfestival in De Panne draait alles om plezier, avontuur en heel veel kwispelende staartjes. Geniet samen van een prachtige wandeltocht langs de kust, ontdek leuke workshops waar je hond nieuwe tricks leert, en laat een professionele foto maken als aandenken. Terwijl jouw trouwe metgezel zich uitleeft, kun jij gezellig rondsnuffelen op de gezellige hondenmarkt vol leuke spulletjes, of kijk je ogen uit bij spectaculaire demonstraties. Een dag vol beleving, ontmoeting en onvergetelijke momenten — voor honden én hun baasjes!',
    highlights: [
      '🐾 Wandeltocht langs de kustlijn',
      '🎓 Leuke workshops voor jouw hond',
      '📸 Professionele hondenfotografie',
      '🛍️ Gezellige hondenmarkt',
      '🎪 Indrukwekkende demonstraties',
      '👨‍👩‍👧‍👦 Leuk voor het hele gezin',
    ],
    location: 'Leopold I-Esplanade',
    address: 'Zeelaan 21, 8660 De Panne',
    price: 'Gratis — vrije toegang!',
    image: '/kwispelfestival.webp',
    imagePosition: 'center',
    website: 'https://www.visitdepanne.be',
    email: 'visit@depanne.be',
    phone: '058 42 18 18',
    accessibility: [
      'Verharde ondergrond op het evenemententerrein',
      'Toegankelijke toiletten aanwezig',
      'Wieltoegankelijke wandelroute beschikbaar',
    ],
    tags: ['Top-event', 'Gratis', 'Familiedag', 'Hondenfestival', 'Wandeling', 'Workshop'],
  },
  {
    id: 2,
    slug: 'groot-oostends-hondenfestival-2026',
    title: 'Groot Oostends Hondenfestival',
    subtitle: 'Een volledig weekend hondenvreugde aan zee',
    city: 'oostende',
    citySlug: 'oostende',
    cityName: 'Oostende',
    date: '2026-05-23',
    dateDisplay: '23 & 24 mei 2026',
    timeDisplay: 'Festival 10:00-17:00, wandeling 11:00',
    season: 'Lente',
    category: 'Festival',
    description: 'Na het overweldigende succes van de eerste editie in 2025 keert het Groot Oostends Hondenfestival terug — en dit keer nog groter. Op zaterdag 23 en zondag 24 mei 2026 verandert Domein Duin & Zee opnieuw in een hondenparadijs van 12.000 m² vol demonstraties, standhouders, losloopplezier en food corners voor mens en dier. Nieuw dit jaar is de grote Stratier-hondenwandeling ten voordele van dierenasielen: beide dagen vertrekt die om 11:00 aan de Stratier-stand op het festivalterrein. Zo combineer je een gratis festivaldag aan zee met een extra wandeling die niet alleen leuk is, maar ook adoptie en asieldieren extra in de kijker zet.',
    descriptionHighlight: 'Nieuw dit jaar is de grote Stratier-hondenwandeling',
    highlights: [
      '🎪 12.000 m² festivalterrein op toplocatie aan zee',
      '🐾 Stratier-hondenwandeling start beide dagen om 11:00',
      '💙 €3 per persoon voor de wandeling, integraal naar dierenasielen',
      '🐕 Losloopzone voor je viervoeter',
      '🎯 Demonstraties in diverse disciplines',
      '🛍️ Hondenboetiekjes & standhouders',
      '🍔 Uitgebreide food corner voor mens & dier',
      '📝 Vooraf inschrijven kan, maar ter plaatse aansluiten ook',
      '🏖️ Vlakbij het hondenstrand',
      '🅿️ Ruime gratis parking',
    ],
    location: 'Domein Duin & Zee',
    address: 'Fortstraat 128, 8400 Oostende',
    price: 'Festival gratis - Stratier-wandeling €3 p.p.',
    image: '/oostendshondenfestival.webp',
    imagePosition: 'center',
    website: 'https://www.pooches.be',
    websiteLabel: 'Officiële festivalinfo',
    additionalLinks: [
      {
        label: 'Inschrijven voor de Stratier-wandeling',
        url: 'https://tally.so/r/QK7jx1',
      },
      {
        label: 'Instagram van Stratier',
        url: 'https://www.instagram.com/stratier.be',
      },
    ],
    accessibility: [
      'Ruim terrein met verharde paden',
      'Start van de Stratier-wandeling aan de Stratier-stand op het terrein',
      'Vlakbij het hondenstrand voor een wandeling na het festival',
      'Gratis parking op het terrein',
      'Honden aan de lijn verplicht (behalve in losloopzone)',
    ],
    detailGallery: {
      eyebrow: 'Stratier apart',
      title: 'Flyers van de Stratier-wandeling',
      description: 'Bekijk hier de voor- en achterkant van de flyer met alle praktische info voor de wandeling.',
      images: [
        {
          src: '/gohf-stratier-flyer-voor.webp',
          alt: 'Flyer voorkant van de Stratier-wandeling op het Groot Oostends Hondenfestival',
          label: 'Flyer voorkant',
        },
        {
          src: '/gohf-stratier-flyer-achter.webp',
          alt: 'Flyer achterkant van de Stratier-wandeling op het Groot Oostends Hondenfestival',
          label: 'Flyer achterkant',
        },
      ],
    },
    tags: ['Gratis festival', 'Tweedaags', 'Hondenfestival', 'Goed doel', 'Aan zee', 'Losloopzone'],
  },
  {
    id: 3,
    slug: 'grote-hondenwandeling-bredene-2026',
    title: 'Grote Hondenwandeling Bredene',
    subtitle: 'Jaarlijkse wandeling door duinen, strand en groen',
    city: 'bredene',
    citySlug: 'bredene',
    cityName: 'Bredene',
    date: '2026-05-24',
    dateDisplay: '24 mei 2026',
    timeDisplay: 'Vrije start vanaf 11:00',
    season: 'Lente',
    category: 'Wandeling',
    description: 'De zee, het strand en de Bredense duinen vormen opnieuw het decor voor de jaarlijkse Grote Hondenwandeling! Vanaf 11 uur vertrek je aan het Jeugdhuis Creatuur en volg je de pijltjes doorheen het Bredense groen, de duinen en langs het strand. De bewegwijzering brengt je heen en terug samen met je favoriete viervoeter(s). Bij aankomst wacht er een superleuke attentie voor je beste vriend! Speciaal voor de oudere deelnemers is er opnieuw een verkorte route voorzien — zodat elke hond mee kan genieten van deze fantastische dag.',
    highlights: [
      '🐾 Bewegwijzerde wandelroute door duinen & strand',
      '🎁 Leuke attentie bij aankomst voor je hond',
      '♿ Verkorte route voor oudere honden',
      '🏖️ Prachtig parcours langs de kustlijn',
      '👥 Georganiseerd door SOS Reptiel vzw',
      '🎟️ Deelname ter plaatse aan de inschrijftafel',
    ],
    location: 'Jeugdhuis Creatuur',
    address: 'Kerkstraat 9, 8450 Bredene',
    price: '€5 per deelnemer',
    image: '/hondenbredene.webp',
    imagePosition: 'center',
    website: 'https://www.sosreptiel.be',
    accessibility: [
      'Verkorte route beschikbaar voor oudere honden',
      'Parcours deels over strand en duinen',
      'Geen vooraf reserveren nodig — deelname ter plaatse',
    ],
    tags: ['Wandeling', 'Duinen', 'Strand', 'Jaarlijks', 'Hondenvriendelijk'],
  },
];
