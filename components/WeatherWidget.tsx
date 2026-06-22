import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    AlertTriangle,
    ArrowRight,
    Cloud,
    CloudDrizzle,
    CloudFog,
    CloudLightning,
    CloudRain,
    CloudSnow,
    Compass,
    Droplets,
    Sun,
    Sunrise,
    Sunset,
    Thermometer,
    Waves,
    Wind,
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { City } from '../types.ts';

interface WeatherWidgetProps {
    city: City;
}

const HEAT_GUIDE_PATH = '/blog/hond-strand-warm-weer';

/* ─────────────────────────────────────────────────────────────
   Shape of the data the widget consumes. Every field is optional
   so the UI can gracefully degrade if a single endpoint fails.
   ───────────────────────────────────────────────────────────── */
interface WeatherData {
    temperature?: number;
    apparent?: number;
    humidity?: number;
    windSpeed?: number;
    windGusts?: number;
    windDir?: number;        // degrees, 0 = N
    weatherCode?: number;
    uvIndex?: number;
    sunrise?: string;        // "HH:MM" local
    sunset?: string;         // "HH:MM" local
    precipProb?: number;     // % chance of precipitation today
}

interface MarineData {
    seaTemp?: number;
    waveHeight?: number;
    nextHigh?: { time: string; level: number }; // time = "HH:MM"
    nextLow?:  { time: string; level: number };
}

/* ─────────────────────────────────────────────────────────────
   In-memory caches per coordinate. Tides change slowly so the
   marine endpoint is cached longer than current weather.
   ───────────────────────────────────────────────────────────── */
const weatherCache = new Map<string, { data: WeatherData; timestamp: number }>();
const marineCache  = new Map<string, { data: MarineData;  timestamp: number }>();
const WEATHER_CACHE_MS = 15 * 60 * 1000; // 15 min
const MARINE_CACHE_MS  = 60 * 60 * 1000; // 60 min

/* ─────────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────────── */
const DUTCH_COMPASS = [
    'N', 'NNO', 'NO', 'ONO', 'O', 'OZO', 'ZO', 'ZZO',
    'Z', 'ZZW', 'ZW', 'WZW', 'W', 'WNW', 'NW', 'NNW',
];
function degToDutch(deg: number | undefined): string | null {
    if (deg === undefined || deg === null || Number.isNaN(deg)) return null;
    const idx = Math.round(((deg % 360) + 360) % 360 / 22.5) % 16;
    return DUTCH_COMPASS[idx];
}

function hhmm(iso: string | undefined): string | null {
    if (!iso) return null;
    // Open-Meteo returns ISO-like local strings ("2026-06-22T05:12") when
    // timezone=Europe/Brussels is requested — slice the time portion.
    const match = iso.match(/T(\d{2}):(\d{2})/);
    return match ? `${match[1]}:${match[2]}` : null;
}

interface WmoInfo { label: string; Icon: React.ComponentType<{ className?: string; size?: number }>; tint: string; }
function describeWmo(code: number | undefined): WmoInfo {
    if (code === undefined) return { label: 'Onbekend', Icon: Cloud, tint: 'text-slate-400' };
    if (code === 0)                          return { label: 'Helder',         Icon: Sun,           tint: 'text-amber-500' };
    if (code === 1)                          return { label: 'Overwegend zonnig', Icon: Sun,        tint: 'text-amber-500' };
    if (code === 2)                          return { label: 'Half bewolkt',   Icon: Cloud,         tint: 'text-sky-400'  };
    if (code === 3)                          return { label: 'Bewolkt',        Icon: Cloud,         tint: 'text-slate-400' };
    if (code === 45 || code === 48)          return { label: 'Mistig',         Icon: CloudFog,      tint: 'text-slate-400' };
    if (code >= 51 && code <= 57)            return { label: 'Motregen',       Icon: CloudDrizzle,  tint: 'text-sky-500' };
    if (code >= 61 && code <= 67)            return { label: 'Regen',          Icon: CloudRain,     tint: 'text-sky-500' };
    if (code >= 71 && code <= 77)            return { label: 'Sneeuw',         Icon: CloudSnow,     tint: 'text-sky-200' };
    if (code >= 80 && code <= 82)            return { label: 'Regenbuien',     Icon: CloudRain,     tint: 'text-sky-500' };
    if (code >= 85 && code <= 86)            return { label: 'Sneeuwbuien',    Icon: CloudSnow,     tint: 'text-sky-200' };
    if (code >= 95)                          return { label: 'Onweer',         Icon: CloudLightning, tint: 'text-violet-500' };
    return { label: 'Bewolkt', Icon: Cloud, tint: 'text-slate-400' };
}

function describeUv(uv: number | undefined): { label: string; tone: 'low' | 'mid' | 'high' | 'extreme' } | null {
    if (uv === undefined || Number.isNaN(uv)) return null;
    if (uv < 3)  return { label: 'Laag',         tone: 'low'     };
    if (uv < 6)  return { label: 'Matig',        tone: 'mid'     };
    if (uv < 8)  return { label: 'Hoog',         tone: 'high'    };
    if (uv < 11) return { label: 'Zeer hoog',    tone: 'high'    };
    return            { label: 'Extreem',     tone: 'extreme' };
}

/* From an hourly sea-level series, find the next local maximum (HW) and
   the next local minimum (LW) AFTER `nowMs`. Returns null if either can't
   be confidently identified within the available horizon. */
function findNextTideExtremes(
    times: string[],
    levels: number[],
    nowMs: number,
): { high: { time: string; level: number } | null; low: { time: string; level: number } | null } {
    if (!Array.isArray(times) || !Array.isArray(levels) || times.length !== levels.length) {
        return { high: null, low: null };
    }

    let high: { time: string; level: number } | null = null;
    let low:  { time: string; level: number } | null = null;

    // Search interior points only; require strict comparison with both neighbours.
    for (let i = 1; i < times.length - 1; i++) {
        const tISO = times[i];
        const t = Date.parse(tISO);
        if (Number.isNaN(t) || t < nowMs) continue;

        const prev = levels[i - 1];
        const curr = levels[i];
        const next = levels[i + 1];

        if (curr > prev && curr > next) {
            if (!high) high = { time: tISO, level: curr };
        } else if (curr < prev && curr < next) {
            if (!low) low = { time: tISO, level: curr };
        }

        if (high && low) break;
    }

    return { high, low };
}

/* ─────────────────────────────────────────────────────────────
   Data fetchers — each returns null on failure and never throws
   ───────────────────────────────────────────────────────────── */
async function fetchForecast(lat: number, lng: number, signal: AbortSignal): Promise<WeatherData | null> {
    const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${lat}&longitude=${lng}` +
        `&current=temperature_2m,apparent_temperature,relative_humidity_2m,` +
        `wind_speed_10m,wind_direction_10m,wind_gusts_10m,weather_code,uv_index` +
        `&daily=sunrise,sunset,precipitation_probability_max` +
        `&wind_speed_unit=kmh&timezone=Europe%2FBrussels`;

    try {
        const res = await fetch(url, { signal });
        if (!res.ok) return null;
        const j = await res.json();
        const c = j.current ?? {};
        const d = j.daily ?? {};

        const data: WeatherData = {
            temperature: typeof c.temperature_2m === 'number' ? c.temperature_2m : undefined,
            apparent:    typeof c.apparent_temperature === 'number' ? c.apparent_temperature : undefined,
            humidity:    typeof c.relative_humidity_2m === 'number' ? c.relative_humidity_2m : undefined,
            windSpeed:   typeof c.wind_speed_10m === 'number' ? c.wind_speed_10m : undefined,
            windGusts:   typeof c.wind_gusts_10m === 'number' ? c.wind_gusts_10m : undefined,
            windDir:     typeof c.wind_direction_10m === 'number' ? c.wind_direction_10m : undefined,
            weatherCode: typeof c.weather_code === 'number' ? c.weather_code : undefined,
            uvIndex:     typeof c.uv_index === 'number' ? c.uv_index : undefined,
            sunrise:     Array.isArray(d.sunrise) ? hhmm(d.sunrise[0]) ?? undefined : undefined,
            sunset:      Array.isArray(d.sunset)  ? hhmm(d.sunset[0])  ?? undefined : undefined,
            precipProb:  Array.isArray(d.precipitation_probability_max) ? d.precipitation_probability_max[0] : undefined,
        };

        return data;
    } catch {
        return null;
    }
}

async function fetchMarine(lat: number, lng: number, signal: AbortSignal): Promise<MarineData | null> {
    const url =
        `https://marine-api.open-meteo.com/v1/marine` +
        `?latitude=${lat}&longitude=${lng}` +
        `&current=sea_surface_temperature,wave_height` +
        `&hourly=sea_level_height_msl` +
        `&forecast_days=2&timezone=Europe%2FBrussels`;

    try {
        const res = await fetch(url, { signal });
        if (!res.ok) return null;
        const j = await res.json();
        const c = j.current ?? {};
        const h = j.hourly  ?? {};

        let nextHigh: MarineData['nextHigh'];
        let nextLow:  MarineData['nextLow'];
        if (Array.isArray(h.time) && Array.isArray(h.sea_level_height_msl)) {
            const { high, low } = findNextTideExtremes(h.time, h.sea_level_height_msl, Date.now());
            if (high) {
                const t = hhmm(high.time);
                if (t) nextHigh = { time: t, level: high.level };
            }
            if (low) {
                const t = hhmm(low.time);
                if (t) nextLow = { time: t, level: low.level };
            }
        }

        const data: MarineData = {
            seaTemp:    typeof c.sea_surface_temperature === 'number' ? c.sea_surface_temperature : undefined,
            waveHeight: typeof c.wave_height === 'number' ? c.wave_height : undefined,
            nextHigh,
            nextLow,
        };

        // If nothing useful came through, treat as failure.
        if (data.seaTemp === undefined && data.waveHeight === undefined && !data.nextHigh && !data.nextLow) {
            return null;
        }

        return data;
    } catch {
        return null;
    }
}

/* ─────────────────────────────────────────────────────────────
   Sub-components
   ───────────────────────────────────────────────────────────── */
interface StatTileProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    sub?: string;
    tone?: 'default' | 'warn' | 'hot' | 'sea';
}
const StatTile: React.FC<StatTileProps> = ({ icon, label, value, sub, tone = 'default' }) => {
    const toneClasses =
        tone === 'warn' ? 'border-amber-200 bg-amber-50/70'
      : tone === 'hot'  ? 'border-rose-200 bg-rose-50/70'
      : tone === 'sea'  ? 'border-sky-200 bg-sky-50/70'
      :                   'border-slate-200 bg-slate-50/70';

    const iconBg =
        tone === 'warn' ? 'bg-amber-100 text-amber-700'
      : tone === 'hot'  ? 'bg-rose-100 text-rose-700'
      : tone === 'sea'  ? 'bg-sky-100 text-sky-700'
      :                   'bg-white text-slate-600 ring-1 ring-slate-200';

    return (
        <div className={`flex items-center gap-2.5 rounded-xl border ${toneClasses} p-2.5`}>
            <div className={`shrink-0 grid place-items-center w-9 h-9 rounded-lg ${iconBg}`}>
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 leading-none mb-0.5">
                    {label}
                </div>
                <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-sm font-black text-slate-900 leading-none">{value}</span>
                    {sub && <span className="text-[11px] font-semibold text-slate-500 leading-none">{sub}</span>}
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
   Main component
   ───────────────────────────────────────────────────────────── */
export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ city }) => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [marine,  setMarine]  = useState<MarineData  | null>(null);
    const [loading, setLoading] = useState(true);
    const prefersReducedMotion = useReducedMotion();

    useEffect(() => {
        const cacheKey = `${city.lat},${city.lng}`;
        const controller = new AbortController();

        const cachedWeather = weatherCache.get(cacheKey);
        const cachedMarine  = marineCache.get(cacheKey);
        const now = Date.now();

        const weatherFresh = cachedWeather && now - cachedWeather.timestamp < WEATHER_CACHE_MS;
        const marineFresh  = cachedMarine  && now - cachedMarine.timestamp  < MARINE_CACHE_MS;

        // Seed with cache so the UI is instant on revisits
        if (cachedWeather) setWeather(cachedWeather.data);
        if (cachedMarine)  setMarine(cachedMarine.data);
        if (weatherFresh && marineFresh) {
            setLoading(false);
            return () => controller.abort();
        }

        const tasks: Promise<void>[] = [];
        if (!weatherFresh) {
            tasks.push(
                fetchForecast(city.lat, city.lng, controller.signal).then((data) => {
                    if (data) {
                        weatherCache.set(cacheKey, { data, timestamp: Date.now() });
                        setWeather(data);
                    }
                }),
            );
        }
        if (!marineFresh) {
            tasks.push(
                fetchMarine(city.lat, city.lng, controller.signal).then((data) => {
                    if (data) {
                        marineCache.set(cacheKey, { data, timestamp: Date.now() });
                        setMarine(data);
                    }
                }),
            );
        }

        Promise.allSettled(tasks).finally(() => setLoading(false));

        return () => controller.abort();
    }, [city.lat, city.lng]);

    /* ── derived display values ──────────────────────────────── */
    const wmo = useMemo(() => describeWmo(weather?.weatherCode), [weather?.weatherCode]);
    const uv  = useMemo(() => describeUv(weather?.uvIndex),       [weather?.uvIndex]);
    const windCompass = useMemo(() => degToDutch(weather?.windDir), [weather?.windDir]);

    const isHot     = weather?.temperature !== undefined && weather.temperature >= 22;
    const isCodeRed = weather?.temperature !== undefined && weather.temperature >= 25;

    /* If we have absolutely nothing AND we're done loading, hide entirely
       so the hero doesn't render an awkward empty shell. */
    if (!loading && !weather && !marine) return null;

    /* Loading skeleton — minimal so it never feels broken */
    if (loading && !weather) {
        return (
            <div className="w-full">
                <div className="rounded-[1.5rem] bg-white border border-slate-200 shadow-sm p-5 sm:p-6">
                    <div className="animate-pulse flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100" />
                        <div className="flex-1 space-y-2">
                            <div className="h-3 w-20 rounded bg-slate-100" />
                            <div className="h-6 w-32 rounded bg-slate-100" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const WmoIcon = wmo.Icon;
    const temp = weather?.temperature;
    const apparent = weather?.apparent;

    /* ── Heat-alert CTA (links to the hittegids blog) ─────────── */
    const renderHeatCta = () => {
        if (!isHot) {
            return (
                <div className="flex items-center gap-3 bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl border border-emerald-100">
                    <Thermometer size={20} className="shrink-0" />
                    <div className="text-xs sm:text-sm font-bold leading-tight">
                        <span className="block uppercase text-[10px] opacity-70">Hondenweer</span>
                        <span className="block">Ideaal wandelweer!</span>
                    </div>
                </div>
            );
        }
        const codeRed = isCodeRed;
        return (
            <Link
                to={HEAT_GUIDE_PATH}
                aria-label={codeRed
                    ? 'Pootjes alarm — lees de hittegids: hond op het strand bij warm weer'
                    : 'Warm weer — lees de hittegids: hond op het strand bij warm weer'}
                className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 ${
                    codeRed
                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 focus-visible:ring-rose-400'
                        : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200 focus-visible:ring-orange-400'
                }`}
            >
                {codeRed
                    ? <AlertTriangle size={20} className="shrink-0 animate-pulse" />
                    : <Thermometer    size={20} className="shrink-0" />}
                <div className="flex-1 text-xs sm:text-sm font-bold leading-tight">
                    <span className="block uppercase text-[10px] opacity-70">
                        {codeRed ? 'Pootjes alarm' : 'Warm weer'}
                    </span>
                    <span className="block">
                        {codeRed ? 'Zand is te heet — lees de hittegids' : 'Check zand & lees de hittegids'}
                    </span>
                </div>
                <ArrowRight size={16} className="shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
        );
    };

    /* ── tiles to render (filtered for present data) ──────────── */
    const tiles: React.ReactNode[] = [];
    if (weather?.humidity !== undefined) {
        tiles.push(
            <StatTile
                key="hum"
                icon={<Droplets size={18} />}
                label="Vochtigheid"
                value={`${Math.round(weather.humidity)}%`}
            />
        );
    }
    if (uv) {
        tiles.push(
            <StatTile
                key="uv"
                icon={<Sun size={18} />}
                label="UV-index"
                value={String(Math.round(weather!.uvIndex!))}
                sub={uv.label}
                tone={uv.tone === 'high' || uv.tone === 'extreme' ? 'warn' : 'default'}
            />
        );
    }
    if (marine?.seaTemp !== undefined) {
        tiles.push(
            <StatTile
                key="sea"
                icon={<Waves size={18} />}
                label="Zee"
                value={`${Math.round(marine.seaTemp)}°C`}
                tone="sea"
            />
        );
    }
    if (marine?.waveHeight !== undefined) {
        tiles.push(
            <StatTile
                key="wave"
                icon={<Waves size={18} />}
                label="Golfhoogte"
                value={`${marine.waveHeight.toFixed(1)} m`}
                tone="sea"
            />
        );
    }

    /* ── Sun + tide row ──────────────────────────────────────── */
    const horizonItems: { icon: React.ReactNode; label: string; value: string; tone: string }[] = [];
    if (weather?.sunrise) horizonItems.push({ icon: <Sunrise size={14} />, label: 'Op',  value: weather.sunrise, tone: 'text-amber-600' });
    if (weather?.sunset)  horizonItems.push({ icon: <Sunset  size={14} />, label: 'Onder', value: weather.sunset,  tone: 'text-orange-600' });
    if (marine?.nextHigh) horizonItems.push({ icon: <Waves   size={14} />, label: 'HW',  value: marine.nextHigh.time, tone: 'text-sky-600' });
    if (marine?.nextLow)  horizonItems.push({ icon: <Waves   size={14} />, label: 'LW',  value: marine.nextLow.time,  tone: 'text-sky-500' });

    return (
        <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
        >
            <div className="relative overflow-hidden rounded-[1.5rem] bg-white border border-slate-200 shadow-sm">
                {/* subtle decorative gradient blob */}
                <div aria-hidden="true" className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-to-br from-sky-100/60 via-amber-100/40 to-transparent blur-2xl" />

                {/* Header row */}
                <div className="relative flex items-center justify-between gap-3 px-5 pt-4 sm:px-6 sm:pt-5">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live weer · {city.name}
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                        <WmoIcon size={13} className={wmo.tint} />
                        {wmo.label}
                    </div>
                </div>

                {/* Temperature + wind hero row */}
                <div className="relative px-5 pt-3 pb-4 sm:px-6">
                    <div className="flex items-end justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="grid place-items-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200">
                                <WmoIcon className={`${wmo.tint}`} size={32} />
                            </div>
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl sm:text-5xl font-black text-slate-900 leading-none tracking-tight">
                                        {temp !== undefined ? Math.round(temp) : '–'}
                                        <span className="text-2xl sm:text-3xl align-top">°</span>
                                    </span>
                                </div>
                                {apparent !== undefined && (
                                    <div className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">
                                        Voelt als {Math.round(apparent)}°C
                                    </div>
                                )}
                            </div>
                        </div>

                        {weather?.windSpeed !== undefined && (
                            <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 leading-none mb-1 flex items-center gap-1.5">
                                    <Wind size={11} /> Wind
                                </div>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-base font-black text-slate-900 leading-none">
                                        {Math.round(weather.windSpeed)}
                                    </span>
                                    <span className="text-[11px] font-semibold text-slate-500">km/u</span>
                                    {windCompass && (
                                        <span className="inline-flex items-center gap-1 ml-1 text-[11px] font-bold text-sky-700">
                                            <Compass size={11} /> {windCompass}
                                        </span>
                                    )}
                                </div>
                                {weather.windGusts !== undefined && (
                                    <div className="text-[10px] font-semibold text-slate-500 mt-0.5">
                                        Stoten tot {Math.round(weather.windGusts)} km/u
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats grid */}
                {tiles.length > 0 && (
                    <div className="relative px-5 sm:px-6 pb-4">
                        <div className="grid grid-cols-2 gap-2">
                            {tiles}
                        </div>
                    </div>
                )}

                {/* Sun + tide line */}
                {horizonItems.length > 0 && (
                    <div className="relative px-5 sm:px-6 pb-4">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-slate-200 bg-gradient-to-r from-amber-50/50 via-white to-sky-50/50 px-3 py-2.5">
                            {horizonItems.map((it, idx) => (
                                <div key={`${it.label}-${idx}`} className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                                    <span className={it.tone}>{it.icon}</span>
                                    <span className="uppercase tracking-wider text-[9px] text-slate-500">{it.label}</span>
                                    <span className="tabular-nums">{it.value}</span>
                                </div>
                            ))}
                        </div>
                        {(marine?.nextHigh || marine?.nextLow) && (
                            <p className="text-[10px] text-slate-400 mt-1.5 px-1">
                                Getij: schatting · check officiële getijdentafels voor varen/zwemmen.
                            </p>
                        )}
                    </div>
                )}

                {/* Heat CTA */}
                <div className="relative px-5 sm:px-6 pb-5">
                    {renderHeatCta()}
                </div>
            </div>
        </motion.div>
    );
};
