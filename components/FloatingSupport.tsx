import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bone } from 'lucide-react';
import { CITIES } from '../cityData.ts';

export const FloatingSupport: React.FC = () => {
    const location = useLocation();

    // Don't show on homepage, /steun-ons and /over-ons pages
    if (location.pathname === '/' || location.pathname === '/steun-ons' || location.pathname === '/over-ons' || CITIES.some(city => location.pathname === `/${city.slug}`)) {
        return null;
    }

    return (
        <Link
            to="/steun-ons"
            className="md:hidden fixed right-4 z-50 w-12 h-12 bg-amber-500 rounded-full shadow-2xl flex items-center justify-center text-white active:scale-90 transition-all duration-300 overflow-hidden touch-target"
            style={{
                bottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 0.75rem))',
                right: 'max(1rem, calc(env(safe-area-inset-right) + 1rem))',
            }}
            aria-label="Steun ons"
        >
            <Bone size={20} className="fill-white isolate z-10" />
        </Link>
    );
};
