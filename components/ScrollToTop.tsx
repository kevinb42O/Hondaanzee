import React, { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';

/**
 * Floating "scroll to top" button. Appears after the user scrolls
 * past one viewport-height. Mobile-aware: positioned to clear the
 * iOS home indicator and the FloatingSupport bone button.
 */
const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = () => {
      setIsVisible(window.scrollY > Math.max(400, window.innerHeight * 0.8));
    };
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const scrollToTop = () => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Ga naar bovenkant pagina"
      className={`fixed z-40 w-11 h-11 rounded-full bg-white/95 backdrop-blur border border-slate-200 shadow-lg flex items-center justify-center text-slate-700 hover:text-sky-600 hover:border-sky-300 transition-all duration-300 active:scale-90 touch-target ${
        isVisible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-3 pointer-events-none'
      }`}
      style={{
        // On mobile, sit above the FloatingSupport (12 + 16 + safe-area)
        bottom: 'max(5.25rem, calc(env(safe-area-inset-bottom) + 4.5rem))',
        right: 'max(1rem, calc(env(safe-area-inset-right) + 1rem))',
      }}
    >
      <ChevronUp size={22} aria-hidden="true" />
    </button>
  );
};

export default ScrollToTop;
