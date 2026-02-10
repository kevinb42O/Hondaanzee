
import React, { useState, useEffect } from 'react';
import { PawPrint, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { DesktopNav } from './header/DesktopNav.tsx';
import { MobileMenu } from './header/MobileMenu.tsx';

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
        globalThis.requestAnimationFrame(() => {
          setIsScrolled(globalThis.scrollY > 30);
          ticking = false;
        });
        ticking = true;
      }
    };
    globalThis.addEventListener('scroll', handleScroll, { passive: true });
    return () => globalThis.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className={`sticky top-0 z-[100] transition-all duration-300 safe-area-top ${isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20 py-2 md:py-3' : 'bg-white/70 backdrop-blur-lg py-3 sm:py-4 md:py-6'
        }`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 flex items-center justify-between safe-area-left safe-area-right">

          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2.5 group transition-transform active:scale-95 touch-target min-w-0 ml-2 sm:ml-0">
            <div className="bg-sky-600 p-1.5 rounded-lg text-white group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-sky-200 flex-shrink-0">
              <PawPrint size={18} className="sm:w-[22px] sm:h-[22px] md:w-6 md:h-6" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-base sm:text-xl md:text-2xl font-black tracking-tighter leading-none">
                <span className="text-slate-900">Hond</span><span className="text-sky-600">Aan</span><span className="text-slate-900">Zee</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5 sm:mt-1 hidden sm:block">
                De Kustgids
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <DesktopNav currentPath={location.pathname} currentHash={location.hash} />

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2.5 mr-2 sm:mr-0 mt-1 sm:mt-0 text-slate-900 bg-slate-100 rounded-xl active:scale-90 transition-transform relative z-[120] touch-target flex-shrink-0"
            aria-label={isMenuOpen ? "Sluit menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        currentPath={location.pathname}
        currentHash={location.hash}
      />
    </>
  );
};

export default Header;
