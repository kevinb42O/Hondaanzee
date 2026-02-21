
import React from 'react';
import { Link } from 'react-router-dom';
import { Bone } from 'lucide-react';

interface DesktopNavProps {
    currentPath: string;
    currentHash: string;
}

interface NavItem {
    to: string;
    label: string;
    matchHash?: string;
    isHome?: boolean;
    startsWith?: boolean;
}

const NAV_ITEMS: NavItem[] = [
    { to: '/#steden', label: 'Badsteden', matchHash: '#steden', isHome: true },
    { to: '/hotspots', label: 'Hotspots' },
    { to: '/diensten', label: 'Diensten' },
    { to: '/losloopzones', label: 'Losloopzones' },
    { to: '/agenda', label: 'Agenda' },
    { to: '/goed-om-te-weten', label: 'Info' },
    { to: '/blog', label: 'Blog', startsWith: true },
    { to: '/community', label: 'Community' },
    { to: '/over-ons', label: 'Over ons' },
];

export const DesktopNav: React.FC<DesktopNavProps> = ({ currentPath, currentHash }) => {
    const isActive = (item: NavItem) => {
        if (item.isHome) {
            return currentHash === '#steden' || (currentPath === '/' && !currentHash);
        }
        if (item.startsWith) return currentPath.startsWith(item.to);
        return currentPath === item.to;
    };

    return (
        <nav className="hidden lg:flex items-center gap-0 xl:gap-1" aria-label="Hoofdnavigatie">
            {NAV_ITEMS.map((item) => (
                <Link
                    key={item.to}
                    to={item.to}
                    className={`relative px-2.5 xl:px-3 py-2 text-[13px] xl:text-sm whitespace-nowrap transition-all duration-300 rounded-lg group/nav ${isActive(item)
                        ? 'text-sky-600 font-bold bg-sky-50'
                        : 'text-slate-700 font-medium hover:text-sky-600 hover:bg-sky-50/60'
                        }`}
                >
                    <span>{item.label}</span>
                    <span
                        className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-sky-500 transition-all duration-300 ${isActive(item) ? 'w-4' : 'w-0 group-hover/nav:w-4'}`}
                    />
                </Link>
            ))}
            <div className="h-4 w-[1px] bg-slate-200 mx-1 xl:mx-2"></div>
            <Link
                to="/steun-ons"
                className="btn-lift flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white px-3 xl:px-4 py-2 rounded-full font-black text-[13px] xl:text-sm hover:from-amber-500 hover:to-amber-600 shadow-lg shadow-amber-400/30 hover:shadow-amber-400/50 group transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
            >
                <span>Steun ons</span>
                <Bone size={16} className="fill-white group-hover:rotate-12 transition-transform" />
            </Link>
        </nav>
    );
};
