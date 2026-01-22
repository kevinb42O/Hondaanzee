
import React, { useState, useEffect } from 'react';
import { PawPrint, Menu, X, ChevronRight, Megaphone, Globe, MapPin, Coffee, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { CITIES } from '../cityData.ts';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

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
    <header className={`sticky top-0 z-[100] transition-all duration-300 safe-area-top ${
      isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20 py-2 md:py-3' : 'bg-white/70 backdrop-blur-lg py-3 sm:py-4 md:py-6'
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
        <nav className="hidden md:flex items-center gap-2 lg:gap-6">
          <Link 
            to="/#steden" 
            className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
              location.hash === '#steden' || (location.pathname === '/' && !location.hash) ? 'text-sky-600 bg-sky-50' : 'text-slate-600 hover:text-sky-600 hover:bg-slate-50'
            }`}
          >
            Alle Badsteden
          </Link>
          <Link 
            to="/#hotspots" 
            className="px-4 py-2 rounded-full font-bold text-sm text-slate-600 hover:text-sky-600 hover:bg-slate-50 transition-all"
          >
            Hotspots
          </Link>
          <div className="h-4 w-[1px] bg-slate-200 mx-2 hidden lg:block"></div>
          <Link 
            to="/#business" 
            className="btn-lift flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-full font-black text-sm hover:bg-sky-600 shadow-md hover:shadow-sky-100 group"
          >
            <Megaphone size={16} className="group-hover:rotate-12 transition-transform" />
            <span>Meld je zaak aan</span>
          </Link>
        </nav>

        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-3 -mr-2 text-slate-900 bg-slate-100 rounded-xl active:scale-90 transition-transform z-[110] touch-target"
          aria-label={isMenuOpen ? "Sluit menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu Drawer (Enhanced Overlay) */}
      <div 
        className={`fixed inset-0 top-0 md:hidden bg-white z-[105] transition-transform duration-300 ease-out will-change-transform ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!isMenuOpen}
      >
        <div className="flex flex-col h-full pt-20 md:pt-24 safe-area-top">
          <div className="flex-grow overflow-y-auto px-4 sm:px-6 py-4 custom-scrollbar overscroll-contain safe-area-left safe-area-right">
            {/* Quick Links Section */}
            <div className="mb-6 sm:mb-8">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-3 sm:mb-4">Navigatie</span>
              <div className="space-y-2">
                <Link to="/" className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl font-bold text-slate-900 hover:bg-sky-50 hover:text-sky-600 transition-all active:scale-[0.98] touch-target">
                  <div className="flex items-center gap-3">
                    <Home size={20} className="text-sky-600" />
                    <span>Home</span>
                  </div>
                  <ChevronRight size={18} className="text-slate-300" />
                </Link>
                <Link to="/#hotspots" className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl font-bold text-slate-900 hover:bg-sky-50 hover:text-sky-600 transition-all active:scale-[0.98] touch-target">
                  <div className="flex items-center gap-3">
                    <Coffee size={20} className="text-sky-600" />
                    <span>Hotspots</span>
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
              <h4 className="text-xl font-black mb-2 relative z-10 tracking-tight">Eigenaar van een zaak?</h4>
              <p className="text-slate-400 text-sm mb-6 relative z-10 font-medium leading-relaxed">
                Zet jouw café, hotel of restaurant gratis op onze kaart.
              </p>
              <Link 
                to="/#business"
                className="inline-flex items-center justify-center w-full py-4 bg-sky-600 text-white rounded-2xl font-black text-center relative z-10 hover:bg-sky-500 transition-colors shadow-lg shadow-sky-900/20 active:scale-95"
              >
                Nu Aanmelden
              </Link>
            </div>
          </div>

          <div className="p-6 border-t border-slate-100 bg-slate-50/50">
            <p className="text-center text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
              <span className="text-slate-900">Hond</span><span className="text-sky-600">Aan</span><span className="text-slate-900">Zee</span>.be &copy; 2026
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
