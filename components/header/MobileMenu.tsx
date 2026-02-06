
import React from 'react';
import { Link } from 'react-router-dom';
import { PawPrint, X, ChevronRight, Home, Coffee, ShoppingBag, TreePine, MapPin, Globe, Info } from 'lucide-react';
import { CITIES } from '../../cityData.ts';
import { SupportCard } from './SupportCard.tsx';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    currentPath: string;
    currentHash: string;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, currentPath, currentHash }) => {
    return (
        <div
            className={`fixed inset-0 top-0 md:hidden bg-white z-[110] transition-all duration-300 ease-out ${isOpen ? 'translate-x-0 opacity-100 pointer-events-auto' : 'translate-x-full opacity-0 pointer-events-none'
                }`}
            aria-hidden={!isOpen}
        >
            {/* Close Button Inside Menu */}
            <div className="absolute top-0 right-0 p-4 z-[120] safe-area-top safe-area-right">
                <button
                    onClick={onClose}
                    className="p-3 text-slate-900 bg-slate-100 rounded-xl active:scale-90 transition-transform touch-target shadow-lg"
                    aria-label="Sluit menu"
                >
                    <X size={22} />
                </button>
            </div>

            {/* Logo in Menu */}
            <div className="absolute top-0 left-0 p-4 safe-area-top safe-area-left">
                <Link to="/" className="flex items-center gap-2 group" onClick={onClose}>
                    <div className="bg-sky-600 p-1.5 rounded-lg text-white shadow-lg">
                        <PawPrint size={18} />
                    </div>
                    <span className="text-lg font-black tracking-tighter leading-none">
                        <span className="text-slate-900">Hond</span><span className="text-sky-600">Aan</span><span className="text-slate-900">Zee</span>
                    </span>
                </Link>
            </div>

            <div className="flex flex-col h-full pt-20 pb-6 safe-area-top safe-area-bottom">
                <div className="flex-grow overflow-y-auto px-4 sm:px-6 py-4 custom-scrollbar overscroll-contain safe-area-left safe-area-right">
                    {/* Quick Links Section */}
                    <div className="mb-6 sm:mb-8">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-3 sm:mb-4">Navigatie</span>
                        <div className="space-y-2">
                            <Link
                                to="/"
                                onClick={onClose}
                                className={`flex items-center justify-between p-4 rounded-2xl transition-all active:scale-[0.98] touch-target ${currentPath === '/' && !currentHash
                                    ? 'bg-sky-50 text-sky-600 font-bold border-l-4 border-sky-600'
                                    : 'bg-slate-50 text-slate-900 font-semibold hover:bg-sky-50 hover:text-sky-600'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Home size={20} className={currentPath === '/' && !currentHash ? 'text-sky-600' : 'text-slate-400'} />
                                    <span>Home</span>
                                </div>
                                <ChevronRight size={18} className="text-slate-300" />
                            </Link>
                            <Link
                                to="/hotspots"
                                onClick={onClose}
                                className={`flex items-center justify-between p-4 rounded-2xl transition-all active:scale-[0.98] touch-target ${currentPath === '/hotspots'
                                    ? 'bg-sky-50 text-sky-600 font-bold border-l-4 border-sky-600'
                                    : 'bg-slate-50 text-slate-900 font-semibold hover:bg-sky-50 hover:text-sky-600'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Coffee size={20} className={currentPath === '/hotspots' ? 'text-sky-600' : 'text-slate-400'} />
                                    <span>Hotspots</span>
                                </div>
                                <ChevronRight size={18} className="text-slate-300" />
                            </Link>
                            <Link
                                to="/diensten"
                                onClick={onClose}
                                className={`flex items-center justify-between p-4 rounded-2xl transition-all active:scale-[0.98] touch-target ${currentPath === '/diensten'
                                    ? 'bg-sky-50 text-sky-600 font-bold border-l-4 border-sky-600'
                                    : 'bg-slate-50 text-slate-900 font-semibold hover:bg-sky-50 hover:text-sky-600'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <ShoppingBag size={20} className={currentPath === '/diensten' ? 'text-sky-600' : 'text-slate-400'} />
                                    <span>Diensten</span>
                                </div>
                                <ChevronRight size={18} className="text-slate-300" />
                            </Link>
                            <Link
                                to="/losloopzones"
                                onClick={onClose}
                                className={`flex items-center justify-between p-4 rounded-2xl transition-all active:scale-[0.98] touch-target ${currentPath === '/losloopzones'
                                    ? 'bg-sky-50 text-sky-600 font-bold border-l-4 border-sky-600'
                                    : 'bg-slate-50 text-slate-900 font-semibold hover:bg-sky-50 hover:text-sky-600'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <TreePine size={20} className={currentPath === '/losloopzones' ? 'text-sky-600' : 'text-slate-400'} />
                                    <span>Losloopzones</span>
                                </div>
                                <ChevronRight size={18} className="text-slate-300" />
                            </Link>
                            <Link
                                to="/kaart"
                                onClick={onClose}
                                className={`flex items-center justify-between p-4 rounded-2xl transition-all active:scale-[0.98] touch-target ${currentPath === '/kaart'
                                    ? 'bg-sky-50 text-sky-600 font-bold border-l-4 border-sky-600'
                                    : 'bg-slate-50 text-slate-900 font-semibold hover:bg-sky-50 hover:text-sky-600'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <MapPin size={20} className={currentPath === '/kaart' ? 'text-sky-600' : 'text-slate-400'} />
                                    <span>Kaart</span>
                                </div>
                                <ChevronRight size={18} className="text-slate-300" />
                            </Link>
                            <Link
                                to="/over-ons"
                                onClick={onClose}
                                className={`flex items-center justify-between p-4 rounded-2xl transition-all active:scale-[0.98] touch-target ${currentPath === '/over-ons'
                                    ? 'bg-sky-50 text-sky-600 font-bold border-l-4 border-sky-600'
                                    : 'bg-slate-50 text-slate-900 font-semibold hover:bg-sky-50 hover:text-sky-600'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Info size={20} className={currentPath === '/over-ons' ? 'text-sky-600' : 'text-slate-400'} />
                                    <span>Over ons</span>
                                </div>
                                <ChevronRight size={18} className="text-slate-300" />
                            </Link>
                        </div>
                    </div>

                    {/* Business Section Card */}
                    <SupportCard />

                    {/* Cities Section */}
                    <div className="mb-6 sm:mb-8">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Snel naar stad</span>
                            <Globe size={14} className="text-slate-300" />
                        </div>
                        <div className="grid grid-cols-1 gap-0.5 sm:gap-1">
                            {CITIES.map((city) => (
                                <Link
                                    key={city.slug}
                                    to={`/${city.slug}`}
                                    onClick={onClose}
                                    className="flex items-center justify-between py-3 sm:py-3.5 px-3 sm:px-4 rounded-xl hover:bg-slate-50 transition-colors group active:bg-slate-100 touch-target"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-slate-100 p-2 rounded-lg text-slate-400 group-hover:bg-sky-100 group-hover:text-sky-600 transition-colors">
                                            <MapPin size={16} />
                                        </div>
                                        <span className="font-bold text-slate-700 group-hover:text-slate-900">{city.name}</span>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-300 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                    <p className="text-center text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
                        <span className="text-slate-900">Hond</span><span className="text-sky-600">Aan</span><span className="text-slate-900">Zee</span>.be &copy; 2026
                    </p>
                </div>
            </div>
        </div >
    );
};
