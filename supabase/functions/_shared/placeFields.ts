// Shared by the dashboard, Edge Function and static catalog build.
export const PLACE_FIELDS = [
  ['name', 'Naam', 200, 'basis'], ['summary', 'Korte samenvatting', 1200, 'basis'],
  ['description', 'Beschrijving', 12000, 'basis'], ['address', 'Adres', 400, 'basis'],
  ['phone', 'Telefoonnummer', 80, 'contact'], ['website', 'Website', 1000, 'contact'],
  ['websiteLabel', 'Label voor de websitelink', 100, 'contact'],
  ['practicalNote', 'Eigen praktisch advies', 2000, 'advies'],
  ['recommendationNote', 'Redactionele tip', 2000, 'tip'],
] as const;
export const PLACE_BLOCKS = {
  hours: 'Openingstijden & beschikbaarheid', dogInfo: 'Met je hond', features: 'Overige kenmerken',
  practicalAdvice: 'Praktisch advies', recommendation: 'Onze tip', gallery: 'Fotogalerij',
  phone: 'Telefoon', website: 'Website', socialLinks: 'Officiële links',
} as const;
export type PlaceBlock = keyof typeof PLACE_BLOCKS;
export const VISIBILITY = ['auto', 'show', 'hide'] as const;
export type PlacePresentation = Partial<Record<PlaceBlock, typeof VISIBILITY[number]>>;
export const HOURS_MODES = {
  unknown: 'Nog niet bevestigd', schedule: 'Vaste weekuren', appointment: 'Op afspraak',
  variable: 'Variabel / seizoensgebonden', not_applicable: 'Niet van toepassing',
} as const;
export type HoursMode = keyof typeof HOURS_MODES;
export const DAYS = [['ma', 'Maandag'], ['di', 'Dinsdag'], ['wo', 'Woensdag'], ['do', 'Donderdag'], ['vr', 'Vrijdag'], ['za', 'Zaterdag'], ['zo', 'Zondag']] as const;
export type Hours = Partial<Record<typeof DAYS[number][0], string | null>>;
export type TagGroups = Record<string, 'dog' | 'other'>;

export const CATEGORY_COPY = {
  food: { label: 'Eten & drinken', title: 'Voor je bezoek', note: 'Vraag bij het reserveren of bij aankomst welke plek geschikt is voor jou en je hond.', website: 'Bekijk de website' },
  stay: { label: 'Overnachten', title: 'Voor je verblijf', note: 'Vraag vóór je boekt naar een eventuele hondentoeslag, het aantal toegelaten honden en de ruimtes waar je hond mee mag.', website: 'Bekijk het verblijf' },
  care: { label: 'Dierenarts', title: 'Afspraak & consultatie', note: 'Neem contact op met de praktijk voor een afspraak en beschikbaarheid. Controleer bij spoed welke praktijk of wachtdienst bereikbaar is.', website: 'Naar de praktijkwebsite' },
  shop: { label: 'Winkels & advies', title: 'Voor je winkelbezoek', note: 'Bekijk het aanbod op de website van de zaak. Vraag vooraf naar de beschikbaarheid van een product of dienst.', website: 'Bekijk de winkelwebsite' },
};
export function getPlaceCategory(place: { type: string }): keyof typeof CATEGORY_COPY {
  if (place.type === 'Slapen') return 'stay';
  if (place.type === 'Dierenarts') return 'care';
  if (place.type === 'Shoppen' || place.type === 'Dierenspeciaalzaak') return 'shop';
  return 'food';
}
export function parseHourPeriods(value: string): { opens: string; closes: string }[] | null {
  const periods = value.split(',').map(period => period.trim().match(/^(\d{2}:\d{2})\s*[-–—]\s*(\d{2}:\d{2})$/));
  if (!periods.length || periods.some(period => !period)) return null;
  const valid = (time: string, end = false) => /^([01]\d|2[0-3]):[0-5]\d$/.test(time) || (end && time === '24:00');
  if (periods.some(period => !valid(period![1]) || !valid(period![2], true) || period![1] === period![2])) return null;
  return periods.map(period => ({ opens: period![1], closes: period![2] }));
}
export function cleanHours(hours?: Hours | null): Hours | undefined {
  const entries = DAYS.flatMap(([day]) => {
    const value = hours?.[day];
    return value === null ? [[day, null]] : typeof value === 'string' && value.trim() ? [[day, value.trim()]] : [];
  });
  return entries.length ? Object.fromEntries(entries) : undefined;
}
export interface PresentablePlace {
  type: string; tags: string[]; openingHours?: Hours | null; openingHoursMode?: HoursMode;
  openingHoursNote?: string; openingHoursWeatherDependent?: boolean; presentation?: PlacePresentation;
  tagGroups?: TagGroups; practicalNote?: string; recommendationNote?: string;
  phone?: string; website?: string; websiteLabel?: string; sameAs?: string[]; images?: string[];
}
export function getHoursMode(place: PresentablePlace): HoursMode {
  return place.openingHoursMode || (cleanHours(place.openingHours) ? 'schedule' : place.openingHoursNote?.trim() || place.openingHoursWeatherDependent ? 'variable' : 'unknown');
}
export function getTagGroup(place: PresentablePlace, tag: string): 'dog' | 'other' {
  return place.tagGroups && Object.hasOwn(place.tagGroups, tag) ? place.tagGroups[tag] : (/hond|waterbak|voer\/drinkbak|indoor toegelaten|dekentje/i.test(tag) ? 'dog' : 'other');
}
export function isPlaceBlockVisible(place: PresentablePlace, block: PlaceBlock): boolean {
  const choice = place.presentation?.[block] || 'auto';
  if (choice === 'hide') return false;
  if (block === 'hours') {
    const mode = getHoursMode(place);
    if (mode === 'unknown' || mode === 'not_applicable') return choice === 'show';
    return choice === 'show' || mode === 'appointment' || mode === 'variable' || !!cleanHours(place.openingHours) || !!place.openingHoursNote?.trim() || !!place.openingHoursWeatherDependent;
  }
  if (block === 'dogInfo' || block === 'practicalAdvice' || block === 'gallery') return true;
  if (block === 'features') return place.tags.some(tag => tag !== 'Aanrader' && getTagGroup(place, tag) === 'other');
  if (block === 'recommendation') return !!place.recommendationNote?.trim();
  if (block === 'socialLinks') return !!place.sameAs?.length;
  return !!place[block]?.trim();
}
// A projection never mutates private concepts. Retained policy makes it idempotent.
export function resolvePublicPlace<T extends PresentablePlace>(original: T): T {
  const place = { ...original, tags: [...original.tags] };
  for (const [block, fields] of [
    ['phone', ['phone']], ['website', ['website', 'websiteLabel']], ['socialLinks', ['sameAs']],
    ['recommendation', ['recommendationNote']], ['practicalAdvice', ['practicalNote']],
  ] as const) if (!isPlaceBlockVisible(original, block)) for (const field of fields) delete place[field];
  const mode = getHoursMode(original);
  if (!isPlaceBlockVisible(original, 'hours')) {
    delete place.openingHours; delete place.openingHoursNote; delete place.openingHoursWeatherDependent;
  } else {
    place.openingHours = mode === 'schedule' || mode === 'variable' ? cleanHours(original.openingHours) : undefined;
  }
  // Keep the resolved mode when hidden data was the legacy source for it.
  place.openingHoursMode = mode;
  place.tags = place.tags.filter(tag => tag === 'Aanrader' || isPlaceBlockVisible(original, getTagGroup(original, tag) === 'dog' ? 'dogInfo' : 'features'));
  if (original.tagGroups) place.tagGroups = Object.fromEntries(Object.entries(original.tagGroups).filter(([tag]) => place.tags.includes(tag)));
  if (!isPlaceBlockVisible(original, 'gallery')) delete place.images;
  return place;
}

export function publicPlaceText(original: PresentablePlace & { name: string; city: string; address: string; description: string }): string {
  const place = resolvePublicPlace(original);
  const lines = [`### ${place.name} (${place.city}, ${place.type})`, `Adres: ${place.address}`, `Beschrijving: ${place.description}`];
  if (place.recommendationNote) lines.push(`Aanrader omdat: ${place.recommendationNote}`);
  if (place.tags.length) lines.push(`Kenmerken: ${place.tags.join(', ')}`);
  if (place.phone) lines.push(`Telefoon: ${place.phone}`);
  if (place.website) lines.push(`Website: ${place.website}`);
  if (place.sameAs?.length) lines.push(`Officiële links: ${place.sameAs.join(', ')}`);
  if (isPlaceBlockVisible(place, 'hours')) {
    lines.push(`Beschikbaarheid: ${HOURS_MODES[getHoursMode(place)]}`);
    if (place.openingHours) lines.push(`Openingstijden: ${Object.entries(place.openingHours).map(([day, hours]) => `${day}: ${hours ?? 'gesloten'}`).join('; ')}`);
    if (place.openingHoursNote) lines.push(`Opmerking openingsuren: ${place.openingHoursNote}`);
    if (place.openingHoursWeatherDependent) lines.push('De openingsuren zijn weersafhankelijk.');
  }
  if (isPlaceBlockVisible(place, 'practicalAdvice')) lines.push(`Praktisch advies: ${place.practicalNote?.trim() || CATEGORY_COPY[getPlaceCategory(place)].note}`);
  return lines.join('\n') + '\n\n';
}
