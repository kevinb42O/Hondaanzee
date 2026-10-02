import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import { StaticSEOContext } from '../utils/staticSEO';
import type { SEOProps } from '../utils/seo';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ResponsibilityBanner from '../components/ResponsibilityBanner';
import Home from '../pages/Home';
import CityPage from '../pages/CityPage';
import AllOffLeashAreas from '../pages/AllOffLeashAreas';
import CoastalMap from '../pages/CoastalMap';
import Privacy from '../pages/Privacy';
import Terms from '../pages/Terms';
import Cookies from '../pages/Cookies';
import About from '../pages/About';
import GoedOmTeWeten from '../pages/GoedOmTeWeten';
import Support from '../pages/Support';
import ZaakAanmelden from '../pages/ZaakAanmelden';
import Blog from '../pages/Blog';
import BlogDetail from '../pages/BlogDetail';
import Agenda from '../pages/Agenda';
import EventDetail from '../pages/EventDetail';
import Updates from '../pages/Updates';
import Meldpunt from '../pages/Meldpunt';
import MeldpuntVrijwilligers from '../pages/MeldpuntVrijwilligers';
import NotFound from '../pages/NotFound';

export function renderPublicRoute(route: string) {
  let seo: SEOProps | undefined;
  const body = renderToStaticMarkup(
    <StaticSEOContext.Provider value={value => { seo = value; }}>
      <AnimatePresence initial={false}><MotionConfig isStatic reducedMotion="always">
        <StaticRouter location={route}>
          <div className="min-h-screen flex flex-col" style={{ overflowX: 'clip' }}>
            <Header />
            <main id="main-content" className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/losloopzones" element={<AllOffLeashAreas />} />
                <Route path="/losloopzones/:slug" element={<AllOffLeashAreas />} />
                <Route path="/kaart" element={<CoastalMap />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/algemene-voorwaarden" element={<Terms />} />
                <Route path="/cookies" element={<Cookies />} />
                <Route path="/over-ons" element={<About />} />
                <Route path="/goed-om-te-weten" element={<GoedOmTeWeten />} />
                <Route path="/steun-ons" element={<Support />} />
                <Route path="/zaak-aanmelden" element={<ZaakAanmelden />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogDetail />} />
                <Route path="/agenda" element={<Agenda />} />
                <Route path="/agenda/:slug" element={<EventDetail />} />
                <Route path="/meldpunt" element={<Meldpunt />} />
                <Route path="/meldpunt/vrijwilligers" element={<MeldpuntVrijwilligers />} />
                <Route path="/updates" element={<Updates />} />
                <Route path="/404.html" element={<NotFound />} />
                <Route path="/:slug" element={<CityPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <ResponsibilityBanner />
            <Footer />
          </div>
        </StaticRouter>
      </MotionConfig></AnimatePresence>
    </StaticSEOContext.Provider>,
  );
  if (!seo) throw new Error(`Page did not supply its SEO: ${route}`);
  return { body, seo };
}
