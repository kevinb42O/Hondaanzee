
import React from 'react';
import { Link } from 'react-router-dom';
import { Bone } from 'lucide-react';

interface DesktopNavProps {
    currentPath: string;
    currentHash: string;
}

export const DesktopNav: React.FC<DesktopNavProps> = ({ currentPath, currentHash }) => {
    const isActive = (hash: string) => {
        if (hash === '#steden') {
            return currentHash === '#steden' || (currentPath === '/' && !currentHash);
        }
        return currentHash === hash;
    };

    return (
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
                className={`relative px-4 py-2 text-sm transition-all ${currentPath === '/hotspots'
                    ? 'text-sky-600 font-bold'
                    : 'text-slate-700 font-medium hover:text-sky-600'
                    }`}
            >
                Hotspots
                {currentPath === '/hotspots' && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-sky-600 rounded-full"></span>
                )}
            </Link>
            <Link
                to="/diensten"
                className={`relative px-4 py-2 text-sm transition-all ${currentPath === '/diensten'
                    ? 'text-sky-600 font-bold'
                    : 'text-slate-700 font-medium hover:text-sky-600'
                    }`}
            >
                Diensten
                {currentPath === '/diensten' && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-sky-600 rounded-full"></span>
                )}
            </Link>
            <Link
                to="/losloopzones"
                className={`relative px-4 py-2 text-sm transition-all ${currentPath === '/losloopzones'
                    ? 'text-sky-600 font-bold'
                    : 'text-slate-700 font-medium hover:text-sky-600'
                    }`}
            >
                Losloopzones
                {currentPath === '/losloopzones' && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-sky-600 rounded-full"></span>
                )}
            </Link>
            <Link
                to="/kaart"
                className={`relative px-4 py-2 text-sm transition-all ${currentPath === '/kaart'
                    ? 'text-sky-600 font-bold'
                    : 'text-slate-700 font-medium hover:text-sky-600'
                    }`}
            >
                Kaart
                {currentPath === '/kaart' && (
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
    );
};
