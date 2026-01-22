
import { Hotspot } from './types';

export const HOTSPOTS: Hotspot[] = [
  {
    id: 1,
    name: 'Lakaiann Blankenberge',
    type: 'Café',
    description: 'De gezelligste plek voor een koffie na een lange strandwandeling.',
    tags: ['Waterbak aanwezig', 'Hondensnacks', 'Terras'],
    image: '/lakaian.webp'
  },
  {
    id: 2,
    name: 'Dune Hotel Nieuwpoort',
    type: 'Hotel',
    description: 'Overnachten met je viervoeter was nog nooit zo comfortabel.',
    tags: ['Honden toegelaten op kamer', 'Nabij strand'],
    image: '/dunehotel.webp'
  },
  {
    id: 3,
    name: 'Restaurant De Kwinte Middelkerke',
    type: 'Restaurant',
    description: 'Geniet van lokale gerechten terwijl je hond rustig onder tafel ligt.',
    tags: ['Ruime plaatsen', 'Waterbak aanwezig', 'Hondvriendelijk team'],
    image: '/dekwintemiddelkerke.webp'
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
