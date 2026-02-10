
import React, { useEffect, useRef } from 'react';
import { X, MapPin, ExternalLink, Tag } from 'lucide-react';
import { Hotspot, Service } from '../types.ts';

interface PlaceModalProps {
    place: Hotspot | Service | null;
    isOpen: boolean;
    onClose: () => void;
    accentColor?: string; // For theming (sky-600 for hotspots, emerald-600 for services)
}

const PlaceModal: React.FC<PlaceModalProps> = ({ place, isOpen, onClose, accentColor = 'sky' }) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    // Open/close the native dialog
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (isOpen && place) {
            if (!dialog.open) {
                dialog.showModal();
            }
        } else if (dialog.open) {
            dialog.close();
        }
    }, [isOpen, place]);

    // Handle native close event (ESC key, etc.)
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const handleClose = () => onClose();
        dialog.addEventListener('close', handleClose);
        return () => dialog.removeEventListener('close', handleClose);
    }, [onClose]);

    if (!isOpen || !place) return null;

    // Generate Google Maps direction URL
    const getDirectionsUrl = (address: string) => {
        const encodedAddress = encodeURIComponent(address);
        return `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
    };

    const accentColors = {
        sky: {
            bg: 'bg-sky-50',
            text: 'text-sky-600',
            hover: 'hover:bg-sky-100',
            border: 'border-sky-100',
            button: 'bg-sky-600 hover:bg-sky-700',
        },
        emerald: {
            bg: 'bg-emerald-50',
            text: 'text-emerald-600',
            hover: 'hover:bg-emerald-100',
            border: 'border-emerald-100',
            button: 'bg-emerald-600 hover:bg-emerald-700',
        },
    };

    const colors = accentColors[accentColor as keyof typeof accentColors] || accentColors.sky;

    return (
        <dialog
            ref={dialogRef}
            className="fixed inset-0 z-50 m-auto p-4 sm:p-6 bg-transparent backdrop:bg-slate-900/60 backdrop:backdrop-blur-sm max-w-2xl w-full rounded-[2rem] overflow-visible"
            aria-label={place?.name}
            onClick={(e) => {
                if (e.target === dialogRef.current) {
                    onClose();
                }
            }}
            onKeyDown={(e) => {
                if (e.key === 'Escape') {
                    onClose();
                }
            }}
        >
            {/* Modal */}
            <div
                className="relative bg-white w-full rounded-[2rem] shadow-2xl max-h-[90vh] overflow-hidden animate-scaleIn"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur rounded-full p-2.5 shadow-lg hover:bg-slate-50 transition-colors active:scale-95"
                    aria-label="Sluiten"
                >
                    <X size={20} className="text-slate-700" />
                </button>

                {/* Scrollable Content */}
                <div className="overflow-y-auto max-h-[95vh] sm:max-h-[90vh]">
                    {/* Image */}
                    {place.image && (
                        <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden">
                            <img
                                src={place.image}
                                alt={place.name}
                                className="w-full h-full object-cover"
                                width={600}
                                height={300}
                                loading="eager"
                                decoding="async"
                                style={{ objectPosition: place.imagePosition || 'center' }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                        </div>
                    )}

                    {/* Content */}
                    <div className="p-6 sm:p-8">
                        {/* Type Badge */}
                        <div className={`inline-flex items-center gap-2 ${colors.bg} ${colors.text} px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-4`}>
                            {place.type}
                        </div>

                        {/* Name */}
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
                            {place.name}
                        </h2>

                        {/* Description */}
                        <p className="text-slate-600 font-medium leading-relaxed mb-6 text-sm sm:text-base">
                            {place.description}
                        </p>

                        {/* Address - Clickable */}
                        {place.address && (
                            <a
                                href={getDirectionsUrl(place.address)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-start gap-3 ${colors.bg} ${colors.hover} p-4 rounded-2xl mb-6 transition-all group border ${colors.border}`}
                            >
                                <MapPin size={20} className={`${colors.text} flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Adres</p>
                                    <p className={`${colors.text} font-bold text-sm sm:text-base break-words`}>
                                        {place.address}
                                    </p>
                                    <p className="text-xs text-slate-500 font-medium mt-1">
                                        Tik om route te openen in Google Maps →
                                    </p>
                                </div>
                            </a>
                        )}

                        {/* Tags */}
                        {place.tags && place.tags.length > 0 && (
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <Tag size={16} className="text-slate-400" />
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kenmerken</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {place.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className={`text-xs font-black uppercase tracking-widest px-3 py-2 rounded-lg border ${tag === 'Aanrader'
                                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                    : `${colors.bg} ${colors.text} ${colors.border}`
                                                }`}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Website Button */}
                        {place.website && (
                            <a
                                href={place.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center justify-center gap-2 w-full ${colors.button} text-white font-bold py-4 px-6 rounded-2xl transition-all hover:shadow-lg active:scale-[0.98]`}
                            >
                                <ExternalLink size={18} />
                                Bezoek website
                            </a>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
        </dialog>
    );
};

export default PlaceModal;
