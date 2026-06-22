
import React, { useEffect, useMemo, useRef } from 'react';
import {
  Calendar,
  Info,
  MapPin,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from 'framer-motion';
import { City } from '../types';
import { evaluateCityRuleStatus } from '../utils/rules.ts';
import { WeatherWidget } from './WeatherWidget.tsx';

interface StatusCheckProps {
  city: City;
}

const LAST_VERIFIED_DATE = new Date('2026-03-14T00:00:00');

// ── Status visual config ────────────────────────────────────────────
type StatusKey = 'JA' | 'DEELS' | 'NEE';

const STATUS_THEME: Record<StatusKey, {
  card: string;
  glow: string;
  ring: string;
  icon: React.ReactElement;
}> = {
  JA: {
    card: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    glow: 'bg-emerald-400/40',
    ring: 'lg:hover:shadow-emerald-400/30',
    icon: <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16" />,
  },
  DEELS: {
    card: 'text-orange-700 bg-orange-50 border-orange-200',
    glow: 'bg-orange-400/40',
    ring: 'lg:hover:shadow-orange-400/30',
    icon: <AlertCircle className="w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16" />,
  },
  NEE: {
    card: 'text-rose-700 bg-rose-50 border-rose-200',
    glow: 'bg-rose-400/40',
    ring: 'lg:hover:shadow-rose-400/30',
    icon: <XCircle className="w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16" />,
  },
};

const StatusCheck: React.FC<StatusCheckProps> = ({ city }) => {
  const prefersReducedMotion = useReducedMotion();

  // ── JS-driven sticky for the desktop answer card ───────────────────
  // We can't rely on CSS `position: sticky` because the app's html/body/#root
  // all have `overflow-x: clip` (mobile horizontal-scroll guard) which
  // poisons sticky's containing block in every major browser. Instead we
  // translate the card by the scroll delta so it follows the viewport top
  // (with a 96px header offset) and stops when its bottom hits the grid
  // bottom. Pure transform, no layout thrash, runs in a single rAF.
  const gridRef  = useRef<HTMLDivElement>(null);
  const cardRef  = useRef<HTMLDivElement>(null);
  const stickyY  = useMotionValue(0);
  const STICKY_OFFSET = 96; // matches lg:top-24

  useEffect(() => {
    if (prefersReducedMotion) { stickyY.set(0); return; }
    const grid = gridRef.current;
    const card = cardRef.current;
    if (!grid || !card) return;

    let rafId = 0;
    let enabled = false;

    const isDesktop = () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(min-width: 1024px)').matches;

    const compute = () => {
      rafId = 0;
      if (!enabled) { stickyY.set(0); return; }
      const gridRect = grid.getBoundingClientRect();
      const cardH    = card.offsetHeight;
      // How far the grid top has scrolled above the sticky line.
      const overshoot = STICKY_OFFSET - gridRect.top;
      if (overshoot <= 0) { stickyY.set(0); return; }
      // Hard ceiling: card-bottom may not pass grid-bottom.
      const maxOffset = Math.max(0, gridRect.height - cardH);
      stickyY.set(Math.min(overshoot, maxOffset));
    };

    const onScroll = () => { if (!rafId) rafId = requestAnimationFrame(compute); };
    const onResize = () => {
      enabled = isDesktop();
      if (!enabled) { stickyY.set(0); return; }
      if (!rafId) rafId = requestAnimationFrame(compute);
    };

    onResize();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [prefersReducedMotion, stickyY]);

  const statusInfo = useMemo(() => {
    const evaluatedStatus = evaluateCityRuleStatus(city);
    const theme = STATUS_THEME[evaluatedStatus.status as StatusKey];
    return {
      status: evaluatedStatus.status,
      rule: evaluatedStatus.rule,
      label: evaluatedStatus.label,
      ...theme,
    };
  }, [city]);

  const verifiedDate = new Intl.DateTimeFormat('nl-BE', { dateStyle: 'long' }).format(LAST_VERIFIED_DATE);
  const todayLong    = new Intl.DateTimeFormat('nl-BE', { dateStyle: 'long' }).format(new Date());
  const todayFull    = new Intl.DateTimeFormat('nl-BE', { dateStyle: 'full' }).format(new Date());

  // ── Motion variants ────────────────────────────────────────────────
  const fadeIn: Variants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  const fadeUp: Variants = prefersReducedMotion
    ? fadeIn
    : {
        hidden:  { opacity: 0, y: 28 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
      };

  const stagger: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
  };

  // Headline line mask reveal — used on desktop
  const lineUp: Variants = prefersReducedMotion
    ? fadeIn
    : {
        hidden:  { y: '110%', opacity: 0 },
        visible: { y: '0%', opacity: 1, transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } },
      };

  // SVG squiggle draw-on under the city name (desktop)
  const pathDraw: Variants = prefersReducedMotion
    ? { hidden: { pathLength: 1 }, visible: { pathLength: 1 } }
    : {
        hidden:  { pathLength: 0 },
        visible: { pathLength: 1, transition: { duration: 0.9, delay: 0.55, ease: [0.65, 0, 0.35, 1] } },
      };

  // Status icon — spring entrance (desktop)
  const iconSpring: Variants = prefersReducedMotion
    ? fadeIn
    : {
        hidden:  { opacity: 0, scale: 0, rotate: -180 },
        visible: {
          opacity: 1, scale: 1, rotate: 0,
          transition: { type: 'spring', stiffness: 140, damping: 12, delay: 0.35 },
        },
      };

  // Numeral letter stagger (desktop)
  const numeralContainer: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07, delayChildren: 0.55 } },
  };

  const letterPop: Variants = prefersReducedMotion
    ? fadeIn
    : {
        hidden:  { opacity: 0, y: 30, scale: 0.6, filter: 'blur(8px)' },
        visible: {
          opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
          transition: { type: 'spring', stiffness: 180, damping: 14 },
        },
      };

  // Mobile-only simple numeral pop (kept from previous design)
  const numeralPopMobile: Variants = prefersReducedMotion
    ? fadeIn
    : {
        hidden:  { opacity: 0, scale: 0.6, y: 12, filter: 'blur(8px)' },
        visible: {
          opacity: 1, scale: 1, y: 0, filter: 'blur(0px)',
          transition: { delay: 0.35, duration: 0.8, ease: [0.16, 1, 0.3, 1] },
        },
      };

  const cardPop: Variants = prefersReducedMotion
    ? fadeIn
    : {
        hidden:  { opacity: 0, scale: 0.94, y: 32 },
        visible: {
          opacity: 1, scale: 1, y: 0,
          transition: { delay: 0.1, duration: 0.85, ease: [0.22, 1, 0.36, 1] },
        },
      };

  // ── City-name + squiggle underline helper ──────────────────────────
  const cityNameWithUnderline = (
    textColorClass: string,
    underlineColorClass: string,
    animatePath = false,
  ) => (
    <span className={`${textColorClass} relative inline-block whitespace-nowrap`}>
      {city.name}
      <svg
        className={`absolute -bottom-1 sm:-bottom-2 md:-bottom-3 left-0 w-full h-3 sm:h-4 ${underlineColorClass}`}
        viewBox="0 0 100 10"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {animatePath ? (
          <motion.path
            d="M0 5 Q 25 0 50 5 T 100 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            variants={pathDraw}
          />
        ) : (
          <path
            d="M0 5 Q 25 0 50 5 T 100 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
          />
        )}
      </svg>
    </span>
  );

  // ── Headline line wrapper — masked slide-up ────────────────────────
  const Line: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="block overflow-hidden pb-[0.08em]">
      <motion.span variants={lineUp} className="inline-block will-change-transform">
        {children}
      </motion.span>
    </span>
  );

  // ── Reusable info cards (solid white surface in both layouts) ──────
  const TodayCard = () => (
    <div className="p-4 sm:p-5 md:p-6 rounded-[1.25rem] sm:rounded-[1.5rem] md:rounded-3xl border bg-white border-slate-200 shadow-sm active:bg-slate-50 transition-colors flex items-start gap-3 sm:gap-4">
      <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl h-fit shrink-0 bg-sky-50 text-sky-600">
        <Calendar size={18} className="sm:w-5 sm:h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-bold text-sm md:text-base mb-0.5 text-slate-900">Vandaag</h3>
        <p className="text-xs sm:text-[13px] md:text-sm capitalize font-medium text-slate-500 leading-snug break-words">
          {todayFull}
        </p>
      </div>
    </div>
  );

  const ZeedijkCard = () => (
    <div className="p-4 sm:p-5 md:p-6 rounded-[1.25rem] sm:rounded-[1.5rem] md:rounded-3xl border bg-white border-slate-200 shadow-sm active:bg-slate-50 transition-colors flex items-start gap-3 sm:gap-4">
      <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl h-fit shrink-0 bg-amber-50 text-amber-600">
        <Info size={18} className="sm:w-5 sm:h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-bold text-sm md:text-base mb-0.5 text-slate-900">Zeedijk</h3>
        <p className="text-xs sm:text-[13px] md:text-sm font-medium leading-snug text-slate-500 break-words">
          Het hele jaar welkom aan de leiband.
        </p>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════
  // Desktop answer card — magnetic tilt + entrance, letter-staggered numeral
  // ════════════════════════════════════════════════════════════════════
  const DesktopAnswerCard: React.FC = () => {
    // Magnetic 3-D tilt — mouse-tracked
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]),  { stiffness: 160, damping: 18 });
    const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [4, -4]),  { stiffness: 160, damping: 18 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (prefersReducedMotion) return;
      const rect = e.currentTarget.getBoundingClientRect();
      mx.set((e.clientX - rect.left) / rect.width  - 0.5);
      my.set((e.clientY - rect.top)  / rect.height - 0.5);
    };
    const handleMouseLeave = () => {
      mx.set(0);
      my.set(0);
    };

    const tiltStyle = prefersReducedMotion ? undefined : {
      rotateX,
      rotateY,
      transformStyle: 'preserve-3d' as const,
    };

    return (
      <div
        className="relative"
        style={{ perspective: 1200 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Pulsing colored glow */}
        {!prefersReducedMotion && (
          <motion.div
            aria-hidden="true"
            className={`pointer-events-none absolute -inset-6 rounded-[3.5rem] blur-3xl ${statusInfo.glow}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.35, 0.6, 0.35], scale: [0.98, 1.04, 0.98] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          />
        )}

        <motion.div
          style={tiltStyle}
          className={`relative p-10 lg:p-12 xl:p-14 rounded-[3rem] border-2 shadow-2xl shadow-slate-900/30 ${statusInfo.card} ${statusInfo.ring} lg:transition-shadow lg:duration-500`}
        >
          <div className="flex flex-col items-center text-center">
            {/* Status icon — spring entrance */}
            <motion.div variants={iconSpring} className="mb-4 md:mb-6 will-change-transform">
              {statusInfo.icon}
            </motion.div>

            {/* Label */}
            <motion.span
              variants={fadeUp}
              className="text-xs uppercase tracking-[0.2em] font-black mb-2 opacity-80 flex items-center gap-2"
            >
              <Clock size={12} /> {statusInfo.label}
            </motion.span>

            {/* Letter-stagger numeral */}
            <motion.div
              variants={numeralContainer}
              aria-label={statusInfo.status}
              className="text-9xl xl:text-[10rem] 2xl:text-[11rem] font-black leading-none mb-6 md:mb-8 tracking-tighter flex"
            >
              {statusInfo.status.split('').map((ch, i) => (
                <motion.span
                  key={`${statusInfo.status}-${i}`}
                  variants={letterPop}
                  className="inline-block will-change-transform"
                >
                  {ch}
                </motion.span>
              ))}
            </motion.div>

            {/* Rule */}
            <motion.p
              variants={fadeUp}
              className="text-xl lg:text-2xl font-bold leading-relaxed max-w-lg text-slate-800 px-2 whitespace-pre-line"
            >
              {statusInfo.rule}
            </motion.p>

            {city.rules.special && (
              <motion.p
                variants={fadeUp}
                className="text-sm md:text-base font-medium leading-relaxed max-w-2xl text-slate-600 px-2 mt-4 md:mt-6 whitespace-pre-line"
              >
                {city.rules.special}
              </motion.p>
            )}
          </div>
        </motion.div>
      </div>
    );
  };

  // ── The mobile answer card (no tilt / simpler numeral) ─────────────
  const MobileAnswerCard: React.FC = () => (
    <div className="relative">
      <div className={`relative p-5 sm:p-6 md:p-10 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[3rem] border-2 shadow-xl shadow-slate-200/50 ${statusInfo.card}`}>
        <div className="flex flex-col items-center text-center">
          <div className="mb-3 sm:mb-4 md:mb-6">{statusInfo.icon}</div>
          <span className="text-[9px] sm:text-[10px] md:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] font-black mb-1 md:mb-2 opacity-80 flex items-center gap-1.5 sm:gap-2">
            <Clock size={10} className="sm:w-3 sm:h-3" /> {statusInfo.label}
          </span>
          <motion.div
            variants={numeralPopMobile}
            initial="hidden"
            animate="visible"
            className="text-5xl sm:text-6xl md:text-8xl font-black leading-none mb-3 sm:mb-4 md:mb-8 tracking-tighter"
          >
            {statusInfo.status}
          </motion.div>
          <p className="text-base sm:text-lg md:text-xl font-bold leading-relaxed max-w-lg text-slate-800 px-2 whitespace-pre-line">
            {statusInfo.rule}
          </p>
          {city.rules.special && (
            <p className="text-xs sm:text-sm md:text-base font-medium leading-relaxed max-w-2xl text-slate-600 px-2 mt-3 sm:mt-4 md:mt-6 whitespace-pre-line">
              {city.rules.special}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl lg:max-w-7xl mx-auto px-1 sm:px-0">

      {/* ════════════════════════════════════════════════════════════
          MOBILE / TABLET  (<lg)  — solid cards, vertical stack
          ════════════════════════════════════════════════════════════ */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="lg:hidden space-y-4 sm:space-y-5"
      >
        <motion.div
          variants={fadeUp}
          className="rounded-[1.5rem] sm:rounded-[2rem] bg-white ring-1 ring-slate-200 shadow-2xl shadow-slate-900/30 px-4 sm:px-5 md:px-6 py-5 sm:py-6 md:py-7 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] sm:text-[11px] md:text-xs font-bold mb-3 sm:mb-4 uppercase tracking-widest border border-slate-200">
            <MapPin size={12} className="text-sky-600 sm:w-[14px] sm:h-[14px]" /> {city.name}, België
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 leading-[1.15] mb-3 sm:mb-4">
            Mag mijn hond <span className="text-sky-600">nu</span> op het strand in{' '}
            {cityNameWithUnderline('text-sky-600', 'text-sky-300/40', false)}?
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            <span className="block sm:inline">Laatst geverifieerd: {verifiedDate}</span>
            <span className="hidden sm:inline"> &middot; </span>
            <span className="block sm:inline">Vandaag: {todayLong}</span>
          </p>
        </motion.div>

        <motion.div variants={fadeUp}>
          <MobileAnswerCard />
        </motion.div>

        <motion.div variants={fadeUp}>
          <WeatherWidget city={city} />
        </motion.div>

        <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <TodayCard />
          <ZeedijkCard />
        </motion.div>
      </motion.div>

      {/* ════════════════════════════════════════════════════════════
          DESKTOP  (lg+)  — editorial magazine layout
          ════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:block">
        <motion.div
          ref={gridRef}
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative grid grid-cols-12 gap-10 xl:gap-14 items-start"
        >
          {/* ── LEFT: editorial text on the LIGHT pane ── */}
          <div className="col-span-6 xl:col-span-5">
            {/* Location chip — premium, with micro hover */}
            <motion.div
              variants={fadeUp}
              whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-[11px] xl:text-xs font-extrabold uppercase tracking-[0.18em] shadow-sm hover:shadow-md mb-6 xl:mb-8 cursor-default"
            >
              <MapPin size={14} className="text-sky-600" />
              {city.name}, België
            </motion.div>

            {/* Headline — line-by-line masked reveal.
                The h1 uses `stagger` purely as a conduit so each <Line>
                triggers its own slide-up via the parent's staggerChildren. */}
            <motion.h1
              variants={stagger}
              aria-label={`Mag mijn hond nu op het strand in ${city.name}?`}
              className="text-[2.75rem] xl:text-6xl 2xl:text-[4.5rem] font-black leading-[1.02] tracking-tight text-slate-900 mb-6 xl:mb-8"
            >
              <Line>
                Mag mijn hond <span className="text-sky-600">nu</span>
              </Line>
              <Line>op het strand in</Line>
              <Line>
                {cityNameWithUnderline('text-sky-600', 'text-sky-300/70', true)}?
              </Line>
            </motion.h1>

            {/* Meta row */}
            <motion.div
              variants={fadeUp}
              className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] xl:text-sm font-semibold text-slate-600 mb-8 xl:mb-10"
            >
              <span className="inline-flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600" />
                Geverifieerd op {verifiedDate}
              </span>
              <span className="hidden xl:inline-flex items-center gap-2">
                <Calendar size={16} className="text-sky-600" />
                Vandaag: {todayLong}
              </span>
            </motion.div>

            <motion.div variants={fadeUp} className="mb-5">
              <WeatherWidget city={city} />
            </motion.div>

            <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4">
              <TodayCard />
              <ZeedijkCard />
            </motion.div>
          </div>

          {/* ── RIGHT: big animated answer card — JS-driven sticky follows
              scroll alongside the left column and stops at the hero bottom ── */}
          <motion.div
            variants={cardPop}
            className="col-span-6 xl:col-span-7"
          >
            <motion.div
              ref={cardRef}
              style={prefersReducedMotion ? undefined : { y: stickyY, willChange: 'transform' }}
            >
              <DesktopAnswerCard />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default StatusCheck;
