import { HOTSPOTS } from './hotspots.ts';
import { OFF_LEASH_AREAS } from './offLeashAreas.ts';
import { SERVICES } from './services.ts';
import { BEACH_ACCESS_GUIDANCE, DUNE_GUIDANCE, PENALTY_GUIDANCE } from './beachRules.ts';

/** Visible answers and JSON-LD use this same array. */
export const HOME_FAQ = [
  { q: 'Wanneer mogen honden op het strand? Wat zijn de exacte data?', a: BEACH_ACCESS_GUIDANCE },
  { q: 'Waar mag mijn hond loslopen op het strand?', a: 'Dat hangt af van de strandzone en de periode. Voorbeelden van permanente strandzones waar loslopen toegelaten is: westelijk van het Westerstaketsel in Blankenberge, de groene zone in Zeebrugge richting Blankenberge en het strand ten oosten van Surfers Paradise in Knokke-Heist tot de Nederlandse grens. Ook onbewaakte stranddelen in De Haan en Wenduine laten honden onder controle los toe. De toelating geldt niet automatisch in aangrenzende natuurgebieden. Bekijk de volledige gemeentelijke regeling op de stadspagina.' },
  { q: 'Gelden de strandregels ook in de duinen?', a: DUNE_GUIDANCE },
  { q: 'Wat is het verschil tussen de zomer- en winterregeling?', a: 'De seizoensgrenzen verschillen: Oostende heeft een winterregeling vanaf 1 oktober, Bredene vanaf 15 oktober en Knokke-Heist en Zeebrugge vanaf 16 oktober. De Haan, Wenduine, Middelkerke, Nieuwpoort, Koksijde en De Panne wijzigen hun regeling op 16 september. Blankenberge heeft afzonderlijke periodes per zone. Ook in de winter geldt op sommige stranden een leibandplicht. Er is geen datum waarop alle stranden dezelfde regels krijgen.' },
  { q: 'Wat riskeer ik als ik de hondenregels niet naleef?', a: PENALTY_GUIDANCE },
  { q: 'Hoeveel losloopzones en hondenweides staan er in de gids?', a: `De gids bevat ${OFF_LEASH_AREAS.length} losloopzones en hondenweides. Bekijk per locatie de beschikbare informatie en controleer ter plaatse de toegangsregels.` },
  { q: 'Waar vind ik hondvriendelijke hotspots en praktische diensten?', a: `De gids bevat ${HOTSPOTS.length} hotspots en ${SERVICES.length} praktische diensten, waaronder dierenartsen en dierenspeciaalzaken. Je vindt adressen en beschikbare contactgegevens op de detailpagina’s. Bel een dierenarts vooraf om de beschikbaarheid bij een spoedgeval te bevestigen.` },
  { q: 'Kan ik mijn hondvriendelijke zaak aanmelden?', a: 'Ja, aanmelden voor een vermelding op HondAanZee.be is gratis. Bekijk de voorwaarden en meld je zaak aan via de pagina Zaak aanmelden.' },
];
export const HOME_FAQ_SCHEMA = {
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: HOME_FAQ.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
};
