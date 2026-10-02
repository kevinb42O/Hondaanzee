// Leaflet requires a browser at module load. During static HTML generation its
// effects never run; only the module-level marker icon configuration is used.
// All interactive map operations deliberately fail here instead of fabricating
// a map. Production browser bundles still use the real Leaflet package.
const browserOnly = () => { throw new Error('Interactive maps must initialize in a browser effect'); };
const leaflet = {
  icon: (options: object) => ({ options }),
  Marker: { prototype: { options: {} as { icon?: unknown } } },
  map: browserOnly, marker: browserOnly, tileLayer: browserOnly,
  latLngBounds: browserOnly,
};
export default leaflet;
