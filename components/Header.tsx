
import React, { useState, useEffect } from 'react';
import { PawPrint, Menu, X, ChevronRight, Megaphone, Globe, MapPin, Coffee, Home, ShoppingBag, TreePine, Bone } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { CITIES } from '../cityData.ts';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Helper function to check if a link is active
  const isActive = (hash: string) => {
    if (hash === '#steden') {
      return location.hash === '#steden' || (location.pathname === '/' && !location.hash);
    }
    return location.hash === hash;
  };

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname, location.hash]);

  // Handle scroll effect for header appearance
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 30);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  return (
    <>
      <header className={`sticky top-0 z-[100] transition-all duration-300 safe-area-top ${isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20 py-2 md:py-3' : 'bg-white/70 backdrop-blur-lg py-3 sm:py-4 md:py-6'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between safe-area-left safe-area-right">

          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group transition-transform active:scale-95 touch-target">
            <div className="bg-sky-600 p-1.5 rounded-lg text-white group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-sky-200">
              <PawPrint size={20} className="sm:w-[22px] sm:h-[22px] md:w-6 md:h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl md:text-2xl font-black tracking-tighter leading-none">
                <span className="text-slate-900">Hond</span><span className="text-sky-600">Aan</span><span className="text-slate-900">Zee</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5 sm:mt-1 hidden sm:block">
                De Kustgids
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-3">
            <Link
              to="/#steden"
              className={`relative px-4 py-2 text-sm transition-all ${isActive('#steden')
                ? 'text-sky-600 font-bold'
                : 'text-slate-700 font-medium hover:text-sky-600'
                }`}
            >
              Alle Badsteden
              {isActive('#steden') && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-sky-600 rounded-full"></span>
              )}
            </Link>
            <Link
              to="/hotspots"
              className={`relative px-4 py-2 text-sm transition-all ${location.pathname === '/hotspots'
                ? 'text-sky-600 font-bold'
                : 'text-slate-700 font-medium hover:text-sky-600'
                }`}
            >
              Hotspots
              {location.pathname === '/hotspots' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-sky-600 rounded-full"></span>
              )}
            </Link>
            <Link
              to="/diensten"
              className={`relative px-4 py-2 text-sm transition-all ${location.pathname === '/diensten'
                ? 'text-sky-600 font-bold'
                : 'text-slate-700 font-medium hover:text-sky-600'
                }`}
            >
              Diensten
              {location.pathname === '/diensten' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-sky-600 rounded-full"></span>
              )}
            </Link>
            <Link
              to="/losloopzones"
              className={`relative px-4 py-2 text-sm transition-all ${location.pathname === '/losloopzones'
                ? 'text-sky-600 font-bold'
                : 'text-slate-700 font-medium hover:text-sky-600'
                }`}
            >
              Losloopzones
              {location.pathname === '/losloopzones' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-sky-600 rounded-full"></span>
              )}
            </Link>
            <Link
              to="/kaart"
              className={`relative px-4 py-2 text-sm transition-all ${location.pathname === '/kaart'
                ? 'text-sky-600 font-bold'
                : 'text-slate-700 font-medium hover:text-sky-600'
                }`}
            >
              Kaart
              {location.pathname === '/kaart' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-sky-600 rounded-full"></span>
              )}
            </Link>
            <div className="h-4 w-[1px] bg-slate-200 mx-2 hidden lg:block"></div>
            <Link
              to="/steun-ons"
              className="btn-lift flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 text-white px-4 py-2.5 rounded-full font-black text-sm hover:from-amber-500 hover:to-amber-600 shadow-lg shadow-amber-400/30 hover:shadow-amber-400/50 group transition-all transform hover:-translate-y-0.5"
            >
              <span>Steun ons</span>
              <Bone size={16} className="fill-white group-hover:rotate-12 transition-transform" />
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-3 -mr-2 text-slate-900 bg-slate-100 rounded-xl active:scale-90 transition-transform relative z-[120] touch-target"
            aria-label={isMenuOpen ? "Sluit menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer (Enhanced Overlay) */}
      <div
        className={`fixed inset-0 top-0 md:hidden bg-white z-[110] transition-all duration-300 ease-out ${isMenuOpen ? 'translate-x-0 opacity-100 pointer-events-auto' : 'translate-x-full opacity-0 pointer-events-none'
          }`}
        aria-hidden={!isMenuOpen}
      >
        {/* Close Button Inside Menu */}
        < div className="absolute top-0 right-0 p-4 z-[120] safe-area-top safe-area-right" >
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-3 text-slate-900 bg-slate-100 rounded-xl active:scale-90 transition-transform touch-target shadow-lg"
            aria-label="Sluit menu"
          >
            <X size={22} />
          </button>
        </div >

        {/* Logo in Menu */}
        < div className="absolute top-0 left-0 p-4 safe-area-top safe-area-left" >
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-sky-600 p-1.5 rounded-lg text-white shadow-lg">
              <PawPrint size={18} />
            </div>
            <span className="text-lg font-black tracking-tighter leading-none">
              <span className="text-slate-900">Hond</span><span className="text-sky-600">Aan</span><span className="text-slate-900">Zee</span>
            </span>
          </Link>
        </div >

        <div className="flex flex-col h-full pt-20 pb-6 safe-area-top safe-area-bottom">
          <div className="flex-grow overflow-y-auto px-4 sm:px-6 py-4 custom-scrollbar overscroll-contain safe-area-left safe-area-right">
            {/* Quick Links Section */}
            <div className="mb-6 sm:mb-8">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-3 sm:mb-4">Navigatie</span>
              <div className="space-y-2">
                <Link
                  to="/"
                  className={`flex items-center justify-between p-4 rounded-2xl transition-all active:scale-[0.98] touch-target ${location.pathname === '/' && !location.hash
                    ? 'bg-sky-50 text-sky-600 font-bold border-l-4 border-sky-600'
                    : 'bg-slate-50 text-slate-900 font-semibold hover:bg-sky-50 hover:text-sky-600'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Home size={20} className={location.pathname === '/' && !location.hash ? 'text-sky-600' : 'text-slate-400'} />
                    <span>Home</span>
                  </div>
                  <ChevronRight size={18} className="text-slate-300" />
                </Link>
                <Link
                  to="/hotspots"
                  className={`flex items-center justify-between p-4 rounded-2xl transition-all active:scale-[0.98] touch-target ${location.pathname === '/hotspots'
                    ? 'bg-sky-50 text-sky-600 font-bold border-l-4 border-sky-600'
                    : 'bg-slate-50 text-slate-900 font-semibold hover:bg-sky-50 hover:text-sky-600'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Coffee size={20} className={location.pathname === '/hotspots' ? 'text-sky-600' : 'text-slate-400'} />
                    <span>Hotspots</span>
                  </div>
                  <ChevronRight size={18} className="text-slate-300" />
                </Link>
                <Link
                  to="/diensten"
                  className={`flex items-center justify-between p-4 rounded-2xl transition-all active:scale-[0.98] touch-target ${location.pathname === '/diensten'
                    ? 'bg-sky-50 text-sky-600 font-bold border-l-4 border-sky-600'
                    : 'bg-slate-50 text-slate-900 font-semibold hover:bg-sky-50 hover:text-sky-600'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag size={20} className={location.pathname === '/diensten' ? 'text-sky-600' : 'text-slate-400'} />
                    <span>Diensten</span>
                  </div>
                  <ChevronRight size={18} className="text-slate-300" />
                </Link>
                <Link
                  to="/losloopzones"
                  className={`flex items-center justify-between p-4 rounded-2xl transition-all active:scale-[0.98] touch-target ${location.pathname === '/losloopzones'
                    ? 'bg-sky-50 text-sky-600 font-bold border-l-4 border-sky-600'
                    : 'bg-slate-50 text-slate-900 font-semibold hover:bg-sky-50 hover:text-sky-600'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <TreePine size={20} className={location.pathname === '/losloopzones' ? 'text-sky-600' : 'text-slate-400'} />
                    <span>Losloopzones</span>
                  </div>
                  <ChevronRight size={18} className="text-slate-300" />
                </Link>
                <Link
                  to="/kaart"
                  className={`flex items-center justify-between p-4 rounded-2xl transition-all active:scale-[0.98] touch-target ${location.pathname === '/kaart'
                    ? 'bg-sky-50 text-sky-600 font-bold border-l-4 border-sky-600'
                    : 'bg-slate-50 text-slate-900 font-semibold hover:bg-sky-50 hover:text-sky-600'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <MapPin size={20} className={location.pathname === '/kaart' ? 'text-sky-600' : 'text-slate-400'} />
                    <span>Kaart</span>
                  </div>
                  <ChevronRight size={18} className="text-slate-300" />
                </Link>
              </div>
            </div>

            {/* Cities Section */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Snel naar stad</span>
                <Globe size={14} className="text-slate-300" />
              </div>
              <div className="grid grid-cols-1 gap-0.5 sm:gap-1">
                {CITIES.map((city) => (
                  <Link
                    key={city.slug}
                    to={`/${city.slug}`}
                    className="flex items-center justify-between py-3 sm:py-3.5 px-3 sm:px-4 rounded-xl hover:bg-slate-50 transition-colors group active:bg-slate-100 touch-target"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 p-2 rounded-lg text-slate-400 group-hover:bg-sky-100 group-hover:text-sky-600 transition-colors">
                        <MapPin size={16} />
                      </div>
                      <span className="font-bold text-slate-700 group-hover:text-slate-900">{city.name}</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Business Section Card */}
            <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group mb-10">
              <div className="absolute -top-6 -right-6 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-700">
                <PawPrint size={140} />
              </div>
              <h4 className="text-xl font-black mb-2 relative z-10 tracking-tight">Steun Hond aan Zee</h4>
              <p className="text-slate-400 text-sm mb-6 relative z-10 font-medium leading-relaxed">
                Help ons de leukste plekjes aan de kust te blijven delen!
              </p>
              <div className="flex flex-col gap-3 relative z-10">
                <Link
                  to="/steun-ons"
                  className="inline-flex items-center justify-center w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-2xl font-black text-center hover:from-amber-500 hover:to-amber-600 transition-all shadow-lg shadow-amber-900/20 active:scale-95 gap-2"
                >
                  <span>Trakteer koekje</span>
                  <Bone size={18} className="fill-white" />
                </Link>
                <a
                  href={`https://wa.me/32494816714?text=${encodeURIComponent(`Dag! 👋\n\nIk wil mijn hondvriendelijke zaak graag gratis laten vermelden op hondaanzee.be.\n\nKun je me meer info geven over hoe ik kan aanmelden?\n\nBedankt!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full py-3.5 bg-sky-600/20 text-sky-400 border border-sky-600/30 rounded-2xl font-bold text-center hover:bg-sky-600/30 transition-colors active:scale-95"
                >
                  Zaak Aanmelden
                </a>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-slate-100 bg-slate-50/50">
            <p className="text-center text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
              <span className="text-slate-900">Hond</span><span className="text-sky-600">Aan</span><span className="text-slate-900">Zee</span>.be &copy; 2026
            </p>
          </div>
        </div>
      </div >
    </>
  );
};

export default Header;
