
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Bone, ChevronDown } from 'lucide-react';

interface DesktopNavProps {
    currentPath: string;
    currentHash: string;
    isScrolled: boolean;
}

interface NavLink {
    to: string;
    label: string;
    matchHash?: string;
    isHome?: boolean;
    startsWith?: boolean;
}

interface NavDropdown {
    label: string;
    children: NavLink[];
}

type NavEntry = { type: 'link'; item: NavLink } | { type: 'dropdown'; item: NavDropdown };

const NAV_ENTRIES: NavEntry[] = [
    { type: 'link', item: { to: '/', label: 'Home', isHome: true } },
    {
        type: 'dropdown',
        item: {
            label: 'Kust',
            children: [
                { to: '/#steden', label: 'Badsteden', matchHash: '#steden' },
                { to: '/hotspots', label: 'Hotspots' },
                { to: '/diensten', label: 'Diensten' },
                { to: '/losloopzones', label: 'Losloopzones' },
            ],
        },
    },
    {
        type: 'dropdown',
        item: {
            label: 'Ontdek',
            children: [
                { to: '/agenda', label: 'Agenda' },
                { to: '/blog', label: 'Blog', startsWith: true },
                { to: '/community', label: 'Community' },
            ],
        },
    },
    {
        type: 'dropdown',
        item: {
            label: 'Over',
            children: [
                { to: '/goed-om-te-weten', label: 'Goed om te weten' },
                { to: '/over-ons', label: 'Over ons' },
                { to: '/updates', label: 'Updates' },
            ],
        },
    },
];

const isLinkActive = (link: NavLink, currentPath: string, currentHash: string): boolean => {
    if (link.isHome) return currentPath === '/' && (!currentHash || currentHash === '');
    if (link.matchHash) return currentHash === link.matchHash;
    if (link.startsWith) return currentPath.startsWith(link.to);
    return currentPath === link.to;
};

const isDropdownActive = (dropdown: NavDropdown, currentPath: string, currentHash: string): boolean => {
    return dropdown.children.some(child => isLinkActive(child, currentPath, currentHash));
};

/** Single dropdown item — timer is managed by parent DesktopNav */
const DropdownMenu: React.FC<{
    item: NavDropdown;
    currentPath: string;
    currentHash: string;
    isOpen: boolean;
    isScrolled: boolean;
    isHome: boolean;
    onEnter: (label: string) => void;
    onLeave: () => void;
    onClose: () => void;
}> = ({ item, currentPath, currentHash, isOpen, isScrolled, isHome, onEnter, onLeave, onClose }) => {
    const active = isDropdownActive(item, currentPath, currentHash);
    const useLightEffect = ['/', '/hotspots', '/diensten', '/losloopzones', '/agenda', '/community'].includes(currentPath);

    let btnClass = 'text-slate-600 hover:text-slate-900 hover:bg-white/30';
    if (active || isOpen) { btnClass = 'text-sky-700 bg-white/50'; }
    else if (!isScrolled && !useLightEffect) { btnClass = 'text-slate-900 hover:text-black hover:bg-white/20'; }
    else if (!isScrolled) { btnClass = 'text-white/60 hover:text-white hover:bg-white/20'; }

    return (
        <div
            className="relative"
            onMouseEnter={() => onEnter(item.label)}
            onMouseLeave={onLeave}
        >
            <button
                className={`flex items-center gap-1 px-3 py-1.5 text-[13px] font-semibold rounded-full transition-all duration-200 cursor-pointer ${btnClass}`}
                onClick={() => isOpen ? onClose() : onEnter(item.label)}
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <span>{item.label}</span>
                <ChevronDown
                    size={13}
                    className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Panel starts flush at button bottom — pt-2 creates visual gap inside the hover zone */}
            <div
                className={`absolute top-full left-1/2 -translate-x-1/2 w-max transition-all duration-200 ${
                    isOpen
                        ? 'opacity-100 translate-y-0 visible'
                        : 'opacity-0 -translate-y-1 invisible pointer-events-none'
                }`}
            >
                <div className="pt-2">
                    <div className="bg-white/75 backdrop-blur-2xl rounded-2xl border border-white/40 shadow-xl shadow-black/[0.08] py-1.5 min-w-[170px]">
                        {item.children.map((child) => {
                            const childActive = isLinkActive(child, currentPath, currentHash);
                            return (
                                <Link
                                    key={child.to}
                                    to={child.to}
                                    onClick={onClose}
                                    className={`block px-4 py-2.5 text-[13px] transition-colors first:rounded-t-lg last:rounded-b-lg ${
                                        childActive
                                            ? 'text-sky-700 bg-sky-50/80 font-bold'
                                            : 'text-slate-600 font-medium hover:text-slate-900 hover:bg-slate-50/80'
                                    }`}
                                >
                                    {child.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const DesktopNav: React.FC<DesktopNavProps> = ({ currentPath, currentHash, isScrolled }) => {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    // ONE shared timer for all dropdowns — prevents cross-dropdown cancel bugs
    const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearCloseTimer = useCallback(() => {
        if (closeTimerRef.current) {
            clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
    }, []);

    const handleDropdownEnter = useCallback((label: string) => {
        clearCloseTimer();
        setOpenDropdown(label);
    }, [clearCloseTimer]);

    const handleDropdownLeave = useCallback(() => {
        clearCloseTimer();
        closeTimerRef.current = globalThis.setTimeout(() => {
            setOpenDropdown(null);
        }, 300);
    }, [clearCloseTimer]);

    const handleClose = useCallback(() => {
        clearCloseTimer();
        setOpenDropdown(null);
    }, [clearCloseTimer]);

    // Close dropdowns on route change
    useEffect(() => {
        setOpenDropdown(null);
    }, [currentPath, currentHash]);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => { clearCloseTimer(); };
    }, [clearCloseTimer]);

    const isHome = currentPath === '/';

    return (
        <nav className="hidden lg:flex items-center gap-0.5" aria-label="Hoofdnavigatie">
            {NAV_ENTRIES.map((entry) => {
                if (entry.type === 'link') {
                    const active = isLinkActive(entry.item, currentPath, currentHash);
                    const useLightEffect = ['/', '/hotspots', '/diensten', '/losloopzones', '/agenda', '/community'].includes(currentPath);
                    let linkClass = 'text-slate-600 hover:text-slate-900 hover:bg-white/30';
                    if (active) { linkClass = 'text-sky-700 bg-white/50'; }
                    else if (!isScrolled && !useLightEffect) { linkClass = 'text-slate-900 hover:text-black hover:bg-white/20'; }
                    else if (!isScrolled) { linkClass = 'text-white/60 hover:text-white hover:bg-white/20'; }
                    return (
                        <Link
                            key={entry.item.to}
                            to={entry.item.to}
                            className={`px-3 py-1.5 text-[13px] font-semibold rounded-full transition-all duration-200 ${linkClass}`}
                        >
                            {entry.item.label}
                        </Link>
                    );
                }

                return (
                    <DropdownMenu
                        key={entry.item.label}
                        item={entry.item}
                        currentPath={currentPath}
                        currentHash={currentHash}
                        isOpen={openDropdown === entry.item.label}
                        isScrolled={isScrolled}
                        isHome={isHome}
                        onEnter={handleDropdownEnter}
                        onLeave={handleDropdownLeave}
                        onClose={handleClose}
                    />
                );
            })}

            {/* Steun ons CTA — amber pill button */}
            <div className="ml-1.5">
                <Link
                    to="/steun-ons"
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-bold text-[13px] transition-all duration-200 ${
                        currentPath === '/steun-ons'
                            ? 'bg-amber-500 text-white shadow-md shadow-amber-400/30'
                            : 'bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-md shadow-amber-400/25 hover:shadow-lg hover:shadow-amber-400/40 hover:from-amber-500 hover:to-amber-600 hover:-translate-y-px'
                    }`}
                >
                    <span>Steun ons</span>
                    <Bone size={14} className="fill-white" />
                </Link>
            </div>
        </nav>
    );
};
