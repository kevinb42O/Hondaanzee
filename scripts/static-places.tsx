import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter, Routes, Route } from 'react-router-dom';
import Header from '../components/Header.tsx';
import Footer from '../components/Footer.tsx';
import ResponsibilityBanner from '../components/ResponsibilityBanner.tsx';
import PlaceDetail from '../pages/PlaceDetail.tsx';
import AllHotspots from '../pages/AllHotspots.tsx';
import AllServices from '../pages/AllServices.tsx';
import { HOTSPOTS, SERVICES } from '../constants.ts';
import { CITIES } from '../cityData.ts';
import { getPlaceSEO, SEO_DATA } from '../utils/seo.ts';
import { getPlaceDetailPath, type PlaceKind } from '../utils/placeRoutes.ts';
import { StaticSEOContext } from '../utils/staticSEO';
import type { SEOProps } from '../utils/seo';

export function renderPlaceRoute(route: string) {
  const kind: PlaceKind = route === '/diensten' || route.includes('/diensten/') ? 'service' : 'hotspot';
  const collection = kind === 'hotspot' ? HOTSPOTS : SERVICES;
  const place = collection.find((entry) => getPlaceDetailPath(entry, kind) === route);
  const city = place && CITIES.find((entry) => entry.slug === place.city);
  if (!place && route !== '/hotspots' && route !== '/diensten') throw new Error(`Unknown business route: ${route}`);
  if (place && !city) throw new Error(`Missing city: ${route}`);
  let seo: SEOProps = place && city
    ? getPlaceSEO(place, city, kind)
    : { ...SEO_DATA[kind === 'hotspot' ? 'hotspots' : 'diensten'], canonical: `https://hondaanzee.be${route}` };
  const body = renderToStaticMarkup(
    <StaticSEOContext.Provider value={value => { seo = value; }}>
    <StaticRouter location={route}>
      <div className="min-h-screen flex flex-col" style={{ overflowX: 'clip' }}>
        <Header />
        <main id="main-content" className="flex-grow">
          <Routes>
            <Route path="/hotspots" element={<AllHotspots />} />
            <Route path="/diensten" element={<AllServices />} />
            <Route path="/:city/hotspots/:slug" element={<PlaceDetail kind="hotspot" />} />
            <Route path="/:city/diensten/:slug" element={<PlaceDetail kind="service" />} />
          </Routes>
        </main>
        <ResponsibilityBanner />
        <Footer />
      </div>
    </StaticRouter>
    </StaticSEOContext.Provider>,
  );
  return { body, seo };
}
