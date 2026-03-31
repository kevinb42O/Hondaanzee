
import React, { useState, useEffect } from 'react';
import { PawPrint, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { DesktopNav } from './header/DesktopNav.tsx';
import { MobileMenu } from './header/MobileMenu.tsx';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOverHero, setIsOverHero] = useState(false);
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

  useEffect(() => {
    let ticking = false;

    const updateHeroState = () => {
      const hero = document.querySelector<HTMLElement>('[data-header-hero="light"]');
      if (!hero) {
        setIsOverHero(false);
        ticking = false;
        return;
      }

      const rect = hero.getBoundingClientRect();
      const headerProbeY = 96;
      setIsOverHero(rect.top <= headerProbeY && rect.bottom > headerProbeY);
      ticking = false;
    };

    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      globalThis.requestAnimationFrame(updateHeroState);
    };

    requestUpdate();
    globalThis.addEventListener('scroll', requestUpdate, { passive: true });
    globalThis.addEventListener('resize', requestUpdate);

    return () => {
      globalThis.removeEventListener('scroll', requestUpdate);
      globalThis.removeEventListener('resize', requestUpdate);
    };
  }, [location.pathname, location.search, location.hash]);

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
      {/* Fixed glassmorphism pill header — floats over content, pointer-events-none lets clicks pass through padding */}
      <header className="fixed top-0 left-0 right-0 z-[100] pointer-events-none safe-area-top">
        <div className={`mx-auto max-w-5xl px-3 sm:px-4 transition-all duration-500 ease-out ${isScrolled ? 'pt-2' : 'pt-3 sm:pt-4'}`}>
          <div className={`pointer-events-auto rounded-full border transition-all duration-500 ease-out ${
            isScrolled
              ? 'bg-white/70 backdrop-blur-3xl backdrop-saturate-[1.8] border-white/50 shadow-lg shadow-black/[0.08]'
              : 'bg-white/10 backdrop-blur-sm border-white/15 shadow-sm shadow-black/[0.02]'
          }`}>
            <div className="flex items-center justify-between px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5">

              {/* Logo Section */}
              <Link to="/" className="flex items-center gap-1.5 sm:gap-2 group transition-transform active:scale-95 touch-target min-w-0 pointer-events-auto">
                <div className="bg-sky-600 p-1.5 rounded-lg text-white group-hover:scale-110 transition-transform duration-300 shadow-md shadow-sky-200/50 flex-shrink-0">
                  <PawPrint size={16} className="sm:w-[18px] sm:h-[18px]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="inline-flex items-center text-sm sm:text-base lg:text-lg font-black tracking-tighter leading-none">
                    <span className={isOverHero && !isScrolled ? 'text-white' : 'text-slate-800'}>Hond</span><span className="text-sky-500">Aan</span><span className={isOverHero && !isScrolled ? 'text-white' : 'text-slate-800'}>Zee</span>
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <DesktopNav currentPath={location.pathname} currentHash={location.hash} isScrolled={isScrolled} useLightText={isOverHero && !isScrolled} />

              {/* Mobile Menu Toggle */}
              {(() => {
                let mobileToggleClass = 'text-slate-700 hover:text-slate-900 bg-white/40 hover:bg-white/60';
                if (isOverHero && !isScrolled) { mobileToggleClass = 'text-white/70 hover:text-white bg-white/20 hover:bg-white/35'; }
                else if (!isScrolled) { mobileToggleClass = 'text-slate-900 hover:text-black bg-white/20 hover:bg-white/35'; }
                return (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`lg:hidden w-9 h-9 rounded-xl active:scale-90 transition-all relative z-[120] touch-target flex-shrink-0 flex items-center justify-center ${mobileToggleClass}`}
                aria-label={isMenuOpen ? "Sluit menu" : "Open menu"}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
                );
              })()}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {isMenuOpen && (
        <MobileMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          currentPath={location.pathname}
          currentHash={location.hash}
        />
      )}
    </>
  );
};

export default Header;
