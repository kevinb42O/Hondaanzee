
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Bone, ChevronDown } from 'lucide-react';

interface DesktopNavProps {
    currentPath: string;
    currentHash: string;
    isScrolled: boolean;
    useLightText: boolean;
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
    useLightText: boolean;
    onEnter: (label: string) => void;
    onLeave: () => void;
    onClose: () => void;
}> = ({ item, currentPath, currentHash, isOpen, isScrolled, useLightText, onEnter, onLeave, onClose }) => {
    const active = isDropdownActive(item, currentPath, currentHash);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [panelCoords, setPanelCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

    // Measure button position whenever the dropdown opens so the portal panel aligns correctly
    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setPanelCoords({ top: rect.bottom + 8, left: rect.left + rect.width / 2 });
        }
    }, [isOpen]);

    let btnClass = 'text-slate-600 hover:text-slate-900 hover:bg-white/30';
    if (active || isOpen) { btnClass = useLightText && !isScrolled ? 'text-white bg-white/20' : 'text-sky-700 bg-white/50'; }
    else if (useLightText && !isScrolled) { btnClass = 'text-white/70 hover:text-white hover:bg-white/20'; }
    else if (!isScrolled) { btnClass = 'text-slate-900 hover:text-black hover:bg-white/20'; }

    // Portal panel — rendered at document.body to escape the header's backdrop-filter
    // stacking context, so backdrop-blur actually sees the real page content behind it.
    //
    // KEY: -translate-x-1/2 is a Tailwind class (not inline style). Mixing
    // `style={{ transform: '...' }}` with Tailwind translate classes causes the
    // inline style to win and completely overrides the Tailwind animation. By using
    // only Tailwind transforms, CSS variables compose correctly and everything works.
    const panel = createPortal(
        <div
            // pt-1.5 bridges the small gap so the mouse can move from button to panel
            // without triggering the close timer.
            style={{ position: 'fixed', top: panelCoords.top, left: panelCoords.left, zIndex: 200 }}
            className={`-translate-x-1/2 w-max pt-1.5 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
            onMouseEnter={() => onEnter(item.label)}
            onMouseLeave={onLeave}
        >
            {/* bg-white/30 + backdrop-blur-xl = true frosted glass.
                Lower opacity (30%) lets the blurred scene clearly show through.
                The outer wrapper is transparent so the blur reads real page pixels. */}
            <div className={`transition-all duration-200 ease-out bg-white/30 backdrop-blur-xl backdrop-saturate-150 rounded-2xl border border-white/60 shadow-2xl shadow-black/[0.22] ring-1 ring-inset ring-white/40 py-1.5 min-w-[170px] ${
                isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1.5 pointer-events-none'
            }`}>
                {item.children.map((child) => {
                    const childActive = isLinkActive(child, currentPath, currentHash);
                    return (
                        <Link
                            key={child.to}
                            to={child.to}
                            onClick={onClose}
                            className={`block px-4 py-2.5 text-[13px] font-medium transition-colors first:rounded-t-lg last:rounded-b-lg ${
                                childActive
                                    ? 'text-sky-700 bg-white/40 font-semibold'
                                    : 'text-slate-800 hover:text-slate-900 hover:bg-white/30'
                            }`}
                        >
                            {child.label}
                        </Link>
                    );
                })}
            </div>
        </div>,
        document.body
    );

    return (
        <div
            className="relative"
            onMouseEnter={() => onEnter(item.label)}
            onMouseLeave={onLeave}
        >
            <button
                ref={buttonRef}
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
            {panel}
        </div>
    );
};

export const DesktopNav: React.FC<DesktopNavProps> = ({ currentPath, currentHash, isScrolled, useLightText }) => {
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

    return (
        <nav className="hidden lg:flex items-center gap-0.5" aria-label="Hoofdnavigatie">
            {NAV_ENTRIES.map((entry) => {
                if (entry.type === 'link') {
                    const active = isLinkActive(entry.item, currentPath, currentHash);
                    let linkClass = 'text-slate-600 hover:text-slate-900 hover:bg-white/30';
                    if (active) { linkClass = useLightText && !isScrolled ? 'text-white bg-white/20' : 'text-sky-700 bg-white/50'; }
                    else if (useLightText && !isScrolled) { linkClass = 'text-white/70 hover:text-white hover:bg-white/20'; }
                    else if (!isScrolled) { linkClass = 'text-slate-900 hover:text-black hover:bg-white/20'; }
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
                        useLightText={useLightText}
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
