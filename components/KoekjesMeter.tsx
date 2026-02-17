import React, { useEffect, useState, useRef, useCallback } from 'react';

/* ─── Helpers ─── */

/** Deterministic seed per month → "organic" base count so all visitors see similar numbers */
function getMonthSeed(): number {
    const now = new Date();
    const seed = now.getFullYear() * 100 + (now.getMonth() + 1); // e.g. 202602
    // Simple hash-ish number between 14 and 28
    return 14 + (((seed * 9301 + 49297) % 233280) % 15);
}

/** Day-of-month drip: adds 0–~12 extra "koekjes" as the month progresses */
function getDayDrip(): number {
    const day = new Date().getDate();
    // Curved growth: fast start, slows down
    return Math.floor(Math.sqrt(day) * 2.4);
}

const STORAGE_KEY = 'haz_koekjes';
const GOAL = 40;

interface StoredState {
    month: string;   // "2026-02"
    extra: number;   // user-triggered increments
}

function currentMonthKey(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function loadState(): StoredState {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed: StoredState = JSON.parse(raw);
            if (parsed.month === currentMonthKey()) return parsed;
        }
    } catch { /* corrupted → reset */ }
    return { month: currentMonthKey(), extra: 0 };
}

function saveState(state: StoredState) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* quota */ }
}

/* ─── Component ─── */

interface KoekjesMeterProps {
    onDonationTriggered?: boolean;          // parent toggles this after copy/scan
    onPopupShown?: () => void;              // callback after popup auto-dismiss
}

const KoekjesMeter: React.FC<KoekjesMeterProps> = ({ onDonationTriggered, onPopupShown }) => {
    const [state, setState] = useState<StoredState>(loadState);
    const [animatedPercent, setAnimatedPercent] = useState(0);
    const [showPopup, setShowPopup] = useState(false);
    const [popupFading, setPopupFading] = useState(false);
    const barRef = useRef<HTMLDivElement>(null);
    const hasAnimated = useRef(false);
    const prevDonation = useRef(onDonationTriggered);

    // Computed count
    const baseCount = getMonthSeed() + getDayDrip();
    const totalCount = Math.min(baseCount + state.extra, GOAL);
    const percent = Math.round((totalCount / GOAL) * 100);

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

    /* ─── React to donation trigger ─── */
    const incrementAndPopup = useCallback(() => {
        setState(prev => {
            const next = { ...prev, extra: prev.extra + 1 };
            saveState(next);
            return next;
        });
        // Bump animated percent too
        setAnimatedPercent(p => Math.min(p + Math.round(100 / GOAL), 100));
        // Show popup
        setShowPopup(true);
        setPopupFading(false);
        setTimeout(() => setPopupFading(true), 3200);
        setTimeout(() => {
            setShowPopup(false);
            setPopupFading(false);
            onPopupShown?.();
        }, 4000);
    }, [onPopupShown]);

    useEffect(() => {
        if (onDonationTriggered && !prevDonation.current) {
            incrementAndPopup();
        }
        prevDonation.current = onDonationTriggered;
    }, [onDonationTriggered, incrementAndPopup]);

    return (
        <div className="relative mb-8" ref={barRef}>
            {/* Title */}
            <p className="text-center text-slate-700 text-[15px] sm:text-base font-medium mb-3 leading-snug">
                Deze maand hebben al <span className="font-bold text-amber-600">{totalCount} baasjes</span>{' '}
                <span className="font-['Patrick_Hand'] text-lg sm:text-xl">
                    <span className="text-slate-900">Hond</span>
                    <span className="text-sky-600">Aan</span>
                    <span className="text-slate-900">Zee</span>
                </span>{' '}
                een koekje gegeven 🐾
            </p>

            {/* Bar container */}
            <div className="relative mx-auto max-w-md">
                <div className="w-full h-[16px] bg-[#e5e7eb] rounded-full overflow-hidden shadow-inner">
                    <div
                        className="h-full rounded-full relative"
                        style={{
                            width: `${animatedPercent}%`,
                            background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 60%, #f59e0b 100%)',
                            transition: 'width 900ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                            boxShadow: '0 0 8px rgba(245, 158, 11, 0.4)',
                        }}
                    >
                        {/* Paw icon riding the edge */}
                        <span
                            className="absolute -right-1 top-1/2 -translate-y-1/2 text-[14px] drop-shadow-sm select-none pointer-events-none"
                            style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.15))' }}
                            aria-hidden="true"
                        >
                            🐾
                        </span>
                    </div>
                </div>

                {/* Count label under bar */}
                <p className="text-center text-xs text-slate-400 mt-1.5 font-medium tracking-wide">
                    {totalCount} / {GOAL} koekjes deze maand
                </p>
            </div>

            {/* Subtitle */}
            <p className="text-center text-[13px] text-slate-400 mt-1 italic">
                Daarna begint de teller gewoon opnieuw
            </p>

            {/* ─── Post-donation popup ─── */}
            {showPopup && (
                <div
                    className={`
                        fixed inset-x-0 bottom-6 z-50 flex justify-center pointer-events-none
                        transition-all duration-500
                        ${popupFading ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}
                    `}
                    style={{ animation: popupFading ? undefined : 'koekje-pop-in 400ms cubic-bezier(0.34,1.56,0.64,1)' }}
                >
                    <div className="bg-white border border-amber-200 shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-3 pointer-events-auto max-w-sm mx-4">
                        <span className="text-2xl" aria-hidden="true">🐾</span>
                        <div>
                            <p className="text-slate-800 font-bold text-sm leading-snug">
                                Jij hebt net een koekje gegeven 🐾
                            </p>
                            <p className="text-slate-500 text-xs mt-0.5">
                                Dankjewel — je hebt de teller een stukje vooruit geduwd
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KoekjesMeter;
