import React, { useEffect, useState, useRef } from 'react';

/* ─── Config ─── */
const STICKER_COUNT = 26;
const STICKER_GOAL = 100;
const STORAGE_KEY = 'haz_sticker_meter';

interface StoredState {
    extra: number;
}

function loadState(): StoredState {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch { /* corrupted → reset */ }
    return { extra: 0 };
}

function saveState(state: StoredState) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* quota */ }
}

/* ─── Component ─── */

interface StickerMeterProps {
    onStickerRequested?: boolean;
    onPopupShown?: () => void;
}

const StickerMeter: React.FC<StickerMeterProps> = ({ onStickerRequested, onPopupShown }) => {
    const [state, setState] = useState<StoredState>(loadState);
    const [animatedPercent, setAnimatedPercent] = useState(0);
    const [showPopup, setShowPopup] = useState(false);
    const [popupFading, setPopupFading] = useState(false);
    const barRef = useRef<HTMLDivElement>(null);
    const hasAnimated = useRef(false);
    const prevRequested = useRef(onStickerRequested);

    const totalCount = Math.min(STICKER_COUNT + state.extra, STICKER_GOAL);
    const percent = Math.round((totalCount / STICKER_GOAL) * 100);

    /* ─── Animate bar on first visible ─── */
    useEffect(() => {
        if (hasAnimated.current) return;
        const el = barRef.current;
        if (!el) return;

        const startAnimation = () => {
            hasAnimated.current = true;
            setTimeout(() => setAnimatedPercent(percent), 80);
        };

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated.current) {
                    startAnimation();
                    observer.disconnect();
                }
            },
            { threshold: 0.3 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [percent]);

    /* ─── React to sticker request trigger ─── */
    useEffect(() => {
        if (onStickerRequested && !prevRequested.current) {
            setState(prev => {
                const next = { extra: prev.extra + 1 };
                saveState(next);
                return next;
            });
            setAnimatedPercent(p => Math.min(p + Math.round(100 / STICKER_GOAL), 100));
            setShowPopup(true);
            setPopupFading(false);
            setTimeout(() => setPopupFading(true), 3200);
            setTimeout(() => {
                setShowPopup(false);
                setPopupFading(false);
                onPopupShown?.();
            }, 4000);
        }
        prevRequested.current = onStickerRequested;
    }, [onStickerRequested, onPopupShown]);

    return (
        <div className="relative mb-8" ref={barRef}>
            {/* Title */}
            <p className="text-center text-slate-700 text-[15px] sm:text-base font-medium mb-3 leading-snug">
                Al <span className="font-bold text-emerald-600">{totalCount} kustzaken</span> dragen het{' '}
                <span className="font-['Patrick_Hand'] text-lg sm:text-xl">
                    <span className="text-slate-900">Hond</span>
                    <span className="text-sky-600">Aan</span>
                    <span className="text-slate-900">Zee</span>
                </span>{' '}
                keurmerk 🏆
            </p>

            {/* Bar container */}
            <div className="relative mx-auto max-w-md">
                <div className="w-full h-[16px] bg-[#e5e7eb] rounded-full overflow-hidden shadow-inner">
                    <div
                        className="h-full rounded-full relative"
                        style={{
                            width: `${animatedPercent}%`,
                            background: 'linear-gradient(90deg, #059669 0%, #34d399 60%, #059669 100%)',
                            transition: 'width 900ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                            boxShadow: '0 0 8px rgba(5, 150, 105, 0.35)',
                        }}
                    >
                        {/* Trophy icon riding the edge */}
                        <span
                            className="absolute -right-1 top-1/2 -translate-y-1/2 text-[13px] drop-shadow-sm select-none pointer-events-none"
                            style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.15))' }}
                            aria-hidden="true"
                        >
                            🏆
                        </span>
                    </div>
                </div>

                {/* Count label under bar */}
                <p className="text-center text-xs text-slate-400 mt-1.5 font-medium tracking-wide">
                    {totalCount} / {STICKER_GOAL} kustzaken
                </p>
            </div>

            {/* Subtitle */}
            <p className="text-center text-[13px] text-slate-400 mt-1 italic">
                Help mee de kust hondvriendelijker te maken — zaak voor zaak
            </p>

            {/* ─── Post-request popup ─── */}
            {showPopup && (
                <div
                    className={`
                        fixed inset-x-0 bottom-6 z-50 flex justify-center pointer-events-none
                        transition-all duration-500
                        ${popupFading ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}
                    `}
                    style={{ animation: popupFading ? undefined : 'koekje-pop-in 400ms cubic-bezier(0.34,1.56,0.64,1)' }}
                >
                    <div className="bg-white border border-emerald-200 shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-3 pointer-events-auto max-w-sm mx-4">
                        <span className="text-2xl" aria-hidden="true">🏆</span>
                        <div>
                            <p className="text-slate-800 font-bold text-sm leading-snug">
                                Welkom bij het netwerk! 🐾
                            </p>
                            <p className="text-slate-500 text-xs mt-0.5">
                                We nemen snel contact op — Jax kijkt al uit naar het bezoekje
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StickerMeter;
