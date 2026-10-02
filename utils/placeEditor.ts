import type { Hotspot, Service } from '../types.ts';
import { PLACE_FIELDS, PLACE_BLOCKS, DAYS, getHoursMode, type PlacePresentation, type TagGroups, type Hours } from '../supabase/functions/_shared/placeFields.ts';

type Place = Hotspot | Service;
export function placeToValues(content: Place): Record<string, string> {
  return Object.fromEntries([
    ...PLACE_FIELDS.map(([key]) => [key, content[key] || '']), ['type', content.type],
    ['tags', content.tags.join(', ')], ['sameAs', (content.sameAs || []).join('\n')],
    ['openingHoursMode', getHoursMode(content)], ['openingHoursNote', content.openingHoursNote || ''],
    ['openingHoursWeatherDependent', content.openingHoursWeatherDependent ? 'true' : 'false'],
    ...DAYS.map(([day]) => [`hours_${day}`, content.openingHours?.[day] === null ? 'Gesloten' : content.openingHours?.[day] || '']),
    ...Object.keys(PLACE_BLOCKS).map(key => [`visibility_${key}`, content.presentation?.[key as keyof PlacePresentation] || 'auto']),
    ...Object.entries(content.tagGroups || {}).map(([tag, group]) => [`group_${tag}`, group]),
  ]);
}
export function buildPlacePatch(changed: Record<string, string>, values: Record<string, string>, original?: Place): Record<string, unknown> {
  const patch: Record<string, unknown> = {};
  const presentation: PlacePresentation = {};
  const groups: TagGroups = { ...original?.tagGroups };
  let hoursChanged = false, groupsChanged = false;
  for (const [key, value] of Object.entries(changed)) {
    if (key.startsWith('visibility_')) presentation[key.slice(11)] = value;
    else if (key.startsWith('group_')) {
      groupsChanged = true;
      if (value === 'auto') delete groups[key.slice(6)]; else groups[key.slice(6)] = value as 'dog' | 'other';
    } else if (key.startsWith('hours_')) hoursChanged = true;
    else if (key === 'tags') patch.tags = value.split(',').map(tag => tag.trim()).filter(Boolean);
    else if (key === 'sameAs') patch.sameAs = value.split('\n').map(url => url.trim()).filter(Boolean);
    else if (key === 'openingHoursWeatherDependent') patch[key] = value === 'true';
    else patch[key] = value;
  }
  if (hoursChanged) {
    const hours: Hours = {};
    for (const [day] of DAYS) {
      const value = (values[`hours_${day}`] || '').trim();
      if (value) hours[day] = value.toLowerCase() === 'gesloten' ? null : value;
    }
    patch.openingHours = Object.keys(hours).length ? hours : null;
  }
  if (Object.keys(presentation).length) patch.presentation = presentation;
  if (groupsChanged || 'tags' in patch) {
    const tags = (patch.tags || original?.tags || []) as string[];
    patch.tagGroups = Object.fromEntries(Object.entries(groups).filter(([tag]) => tags.includes(tag)));
  }
  return patch;
}
export function applyPlacePatch(original: Place, patch: Record<string, unknown>): Place {
  return { ...original, ...patch, ...(patch.presentation ? { presentation: { ...original.presentation, ...patch.presentation as PlacePresentation } } : {}) } as Place;
}
