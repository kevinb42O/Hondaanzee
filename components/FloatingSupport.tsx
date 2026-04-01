import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bone } from 'lucide-react';

export const FloatingSupport: React.FC = () => {
    const location = useLocation();

    // Check if user prefers reduced motion
    const prefersReducedMotion = (() => { try { return globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false; } catch { return false; } })();

    // Don't show on homepage, /steun-ons and /over-ons pages
    if (location.pathname === '/' || location.pathname === '/steun-ons' || location.pathname === '/over-ons') {
        return null;
    }

    return (
        <Link
            to="/steun-ons"
            className="md:hidden fixed bottom-6 right-4 z-50 w-12 h-12 bg-amber-500 rounded-full shadow-2xl flex items-center justify-center text-white active:scale-90 transition-all duration-300 safe-area-bottom safe-area-right overflow-hidden"
            aria-label="Steun ons"
        >
            {!prefersReducedMotion && (
                <span
                    className="absolute inset-0 animate-shine bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    style={{ animationDuration: '3s', animationIterationCount: 'infinite' }}
                />
            )}
            <Bone size={20} className="fill-white isolate z-10" />
        </Link>
    );
};
