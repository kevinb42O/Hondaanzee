
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import Home from './pages/Home.tsx';
import CityPage from './pages/CityPage.tsx';
import AllHotspots from './pages/AllHotspots.tsx';
import AllServices from './pages/AllServices.tsx';
import AllOffLeashAreas from './pages/AllOffLeashAreas.tsx';
import Privacy from './pages/Privacy.tsx';
import Terms from './pages/Terms.tsx';
import Cookies from './pages/Cookies.tsx';
import NotFound from './pages/NotFound.tsx';
import ResponsibilityBanner from './components/ResponsibilityBanner.tsx';

// Custom component to handle scroll-to-hash functionality
const ScrollToHash = () => {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (hash) {
      // Small delay to ensure the content is rendered
      const timeout = setTimeout(() => {
        const element = document.getElementById(hash.replace('#', ''));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return () => clearTimeout(timeout);
    } else if (pathname === '/') {
      // If navigating to home without a hash, scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [hash, pathname]);

  return null;
};

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col selection:bg-sky-100 selection:text-sky-900 overflow-x-clip">
        <ScrollToHash />
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/hotspots" element={<AllHotspots />} />
            <Route path="/diensten" element={<AllServices />} />
            <Route path="/losloopzones" element={<AllOffLeashAreas />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/algemene-voorwaarden" element={<Terms />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/:slug" element={<CityPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <ResponsibilityBanner />
        <Footer />
      </div>
    </HashRouter>
  );
}

export default App;
