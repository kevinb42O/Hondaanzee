const { createHash } = require('node:crypto');

const sortedValue = (value) => Array.isArray(value)
  ? value.map(sortedValue)
  : value && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortedValue(value[key])]))
    : value;

/** Store actual content changes; rebuilding unchanged pages never advances lastmod. */
function getPlacePageRevisions({ HOTSPOTS, SERVICES, CITIES }, previous, template, today) {
  const state = {};
  for (const [collection, places] of [['hotspots', HOTSPOTS], ['diensten', SERVICES]]) {
    for (const place of places) {
      const route = `/${place.city}/${collection}/${place.slug}`;
      const cityName = CITIES.find((city) => city.slug === place.city)?.name;
      const hash = createHash('sha256').update(JSON.stringify(sortedValue({ place, cityName, template }))).digest('hex');
      const old = previous[route];
      state[route] = { hash, lastmod: old?.hash === hash ? old.lastmod : today };
    }
  }
  return state;
}

module.exports = { getPlacePageRevisions };
