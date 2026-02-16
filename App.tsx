
import React, { useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Header from './components/Header.tsx';
import { FloatingSupport } from './components/FloatingSupport.tsx';

// Lazy-loaded below-the-fold components
const Footer = React.lazy(() => import('./components/Footer.tsx'));
const ResponsibilityBanner = React.lazy(() => import('./components/ResponsibilityBanner.tsx'));

// Lazy-loaded pages for code-splitting
const Home = React.lazy(() => import('./pages/Home.tsx'));
const CityPage = React.lazy(() => import('./pages/CityPage.tsx'));
const AllHotspots = React.lazy(() => import('./pages/AllHotspots.tsx'));
const AllServices = React.lazy(() => import('./pages/AllServices.tsx'));
const AllOffLeashAreas = React.lazy(() => import('./pages/AllOffLeashAreas.tsx'));
const Privacy = React.lazy(() => import('./pages/Privacy.tsx'));
const Terms = React.lazy(() => import('./pages/Terms.tsx'));
const Cookies = React.lazy(() => import('./pages/Cookies.tsx'));
const NotFound = React.lazy(() => import('./pages/NotFound.tsx'));
const CoastalMap = React.lazy(() => import('./pages/CoastalMap.tsx'));
const Support = React.lazy(() => import('./pages/Support.tsx'));
const About = React.lazy(() => import('./pages/About.tsx'));
const GoedOmTeWeten = React.lazy(() => import('./pages/GoedOmTeWeten.tsx'));
const Blog = React.lazy(() => import('./pages/Blog.tsx'));
const BlogDetail = React.lazy(() => import('./pages/BlogDetail.tsx'));

// Loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-10 w-10 border-4 border-sky-200 border-t-sky-600"></div>
  </div>
);

// Error Boundary for graceful error handling
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Oeps! Er ging iets mis.</h2>
          <p className="text-slate-600 mb-6 max-w-md">
            Er is een onverwachte fout opgetreden. Probeer de pagina opnieuw te laden.
          </p>
          <button
            onClick={() => globalThis.location.reload()}
            className="px-6 py-3 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 transition-colors"
          >
            Pagina herladen
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

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
    <BrowserRouter>
      <div className="min-h-screen flex flex-col selection:bg-sky-100 selection:text-sky-900 overflow-x-clip">
        <ScrollToHash />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg">Ga naar inhoud</a>
        <Header />
        <main id="main-content" className="flex-grow">
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/hotspots" element={<AllHotspots />} />
                <Route path="/diensten" element={<AllServices />} />
                <Route path="/losloopzones" element={<AllOffLeashAreas />} />
                <Route path="/kaart" element={<CoastalMap />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/algemene-voorwaarden" element={<Terms />} />
                <Route path="/cookies" element={<Cookies />} />
                <Route path="/over-ons" element={<About />} />
                <Route path="/goed-om-te-weten" element={<GoedOmTeWeten />} />
                <Route path="/steun-ons" element={<Support />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogDetail />} />
                <Route path="/:slug" element={<CityPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
        <ResponsibilityBanner />
        <Footer />
        <FloatingSupport />
        <Analytics />
      </div>
    </BrowserRouter>
  );
}

export default App;
