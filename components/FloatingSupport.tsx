import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bone, X } from 'lucide-react';

export const FloatingSupport: React.FC = () => {
    const location = useLocation();
    const [isMinimized, setIsMinimized] = useState(() => {
        // Load minimized state from localStorage
        return localStorage.getItem('floatingSupportMinimized') === 'true';
    });
    
    // Check if user prefers reduced motion
    const prefersReducedMotion = globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Don't show on /steun-ons and /over-ons pages
    if (location.pathname === '/steun-ons' || location.pathname === '/over-ons') {
        return null;
    }

    // Save minimized state to localStorage
    const handleMinimize = () => {
        setIsMinimized(true);
        localStorage.setItem('floatingSupportMinimized', 'true');
    };

    const handleMaximize = () => {
        setIsMinimized(false);
        localStorage.setItem('floatingSupportMinimized', 'false');
    };

    if (isMinimized) {
        return (
            <button
                onClick={handleMaximize}
                className="md:hidden fixed bottom-6 right-4 z-50 w-12 h-12 bg-amber-500 rounded-full shadow-2xl flex items-center justify-center text-white active:scale-90 transition-all duration-300 safe-area-bottom safe-area-right overflow-hidden"
                aria-label="Toon steun knop"
            >
                {!prefersReducedMotion && (
                    <span className="absolute inset-0 animate-shine bg-gradient-to-r from-transparent via-white/30 to-transparent" 
                          style={{ animationDuration: '3s', animationIterationCount: 'infinite' }} />
                )}
                <Bone size={20} className="fill-white isolate z-10" />
            </button>
        );
    }

    return (
        <div className="md:hidden fixed bottom-6 right-4 z-50 safe-area-bottom safe-area-right">
            <Link
                to="/steun-ons"
                className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 text-white pl-4 pr-4 py-3 rounded-full shadow-2xl active:scale-95 transition-all hover:from-amber-500 hover:to-amber-600 group relative overflow-hidden"
                aria-label="Steun ons"
            >
                {!prefersReducedMotion && (
                    <span className="absolute inset-0 animate-shine bg-gradient-to-r from-transparent via-white/20 to-transparent" 
                          style={{ animationDuration: '3s', animationIterationCount: 'infinite' }} />
                )}
                <Bone size={18} className={`fill-white transition-transform isolate z-10 ${prefersReducedMotion ? '' : 'group-hover:rotate-12'}`} />
                <span className="font-black text-sm whitespace-nowrap isolate z-10">Steun ons</span>
            </Link>
            <button
                onClick={handleMinimize}
                className="absolute -top-1 -right-1 w-5 h-5 bg-slate-800 rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform"
                aria-label="Minimaliseer steun knop"
            >
                <X size={12} strokeWidth={3} />
            </button>
        </div>
    );
};
