function validatePlaceData({ HOTSPOTS, SERVICES, CITIES }) {
  const cities = new Set(CITIES.map((city) => city.slug));
  const paths = new Set();
  for (const [collection, places] of [['hotspots', HOTSPOTS], ['diensten', SERVICES]]) {
    const ids = new Set();
    const types = collection === 'hotspots'
      ? ['Café', 'Koffiebar', 'Slapen', 'Restaurant', 'Brasserie', 'Shoppen']
      : ['Dierenarts', 'Dierenspeciaalzaak'];
    for (const place of places) {
      const route = `/${place.city}/${collection}/${place.slug}`;
      if (!cities.has(place.city)) throw new Error(`Unknown city for ${place.name}: ${place.city}`);
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(place.slug || '')) throw new Error(`Invalid permanent slug: ${place.name}`);
      if (paths.has(route)) throw new Error(`Duplicate business URL: ${route}`);
      if (ids.has(place.id)) throw new Error(`Duplicate ${collection} ID: ${place.id}`);
      if (!types.includes(place.type)) throw new Error(`Unknown business type: ${route}`);
      for (const key of ['name', 'description', 'address', 'image']) {
        if (typeof place[key] !== 'string' || !place[key].trim()) throw new Error(`Missing ${key}: ${route}`);
      }
      for (const url of [place.website, ...(place.sameAs || [])].filter(Boolean)) {
        if (!['http:', 'https:'].includes(new URL(url).protocol)) throw new Error(`Invalid public business URL: ${route}`);
      }
      paths.add(route);
      ids.add(place.id);
    }
  }
  return paths;
}

module.exports = { validatePlaceData };
