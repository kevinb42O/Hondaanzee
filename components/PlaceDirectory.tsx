import React from 'react';
import { Link } from 'react-router-dom';
import { CITIES } from '../cityData.ts';
import { HOTSPOTS, SERVICES } from '../constants.ts';
import { getPlaceDetailPath, type PlaceKind } from '../utils/placeRoutes.ts';

/** Every business stays reachable, including cards behind the “show more” button. */
export default function PlaceDirectory({ kind }: { kind: PlaceKind }) {
  const places = kind === 'hotspot' ? HOTSPOTS : SERVICES;
  return (
    <details className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
      <summary className="cursor-pointer text-lg font-bold text-slate-900">
        Alle {kind === 'hotspot' ? 'hotspots' : 'diensten'} per gemeente
      </summary>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CITIES.map((city) => {
          const localPlaces = places.filter((place) => place.city === city.slug)
            .sort((a, b) => a.name.localeCompare(b.name, 'nl'));
          if (!localPlaces.length) return null;
          return (
            <div key={city.slug}>
              <h2 className="mb-2 font-bold text-slate-900">{city.name}</h2>
              <ul className="space-y-2 text-sm">
                {localPlaces.map((place) => (
                  <li key={place.slug}>
                    <Link to={getPlaceDetailPath(place, kind)} className="text-sky-700 hover:underline">
                      {place.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </details>
  );
}
