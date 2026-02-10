
import React, { useState, useEffect } from 'react';
import { Cloud, Sun, Wind, Droplets, Thermometer, AlertTriangle } from 'lucide-react';
import { City } from '../types.ts';

interface WeatherWidgetProps {
    city: City;
}

interface WeatherData {
    temperature: number;
    windSpeed: number;
    weatherCode: number;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ city }) => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                setLoading(true);
                // Open-Meteo API (Free, no key required)
                const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lng}&current=temperature_2m,wind_speed_10m,weather_code&wind_speed_unit=kmh`
                );
                if (!response.ok) throw new Error('Weer ophalen mislukt');
                const data = await response.json();

                setWeather({
                    temperature: data.current.temperature_2m,
                    windSpeed: data.current.wind_speed_10m,
                    weatherCode: data.current.weather_code
                });
            } catch (_err) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, [city]);

    if (loading || error || !weather) return null;

    // Simple WMO Weather Code interpretation
    const getWeatherIcon = (code: number) => {
        if (code <= 1) return <Sun className="text-amber-500" />;
        if (code <= 3) return <Cloud className="text-slate-400" />;
        if (code <= 67) return <Droplets className="text-sky-500" />; // Rain
        if (code <= 77) return <Cloud className="text-slate-200" />; // Snow
        return <Cloud className="text-slate-500" />;
    };

    const isHot = weather.temperature >= 22;
    const isCodeRed = weather.temperature >= 25;

    const renderPawsAlert = () => {
        if (isCodeRed) {
            return (
                <div className="flex items-center gap-3 bg-rose-50 text-rose-700 px-4 py-3 rounded-xl border border-rose-100 flex-grow sm:flex-grow-0">
                    <AlertTriangle size={20} className="shrink-0 animate-pulse" />
                    <div className="text-xs sm:text-sm font-bold">
                        <span className="block uppercase text-[10px] opacity-70">Pootjes Alarm</span>
                        <span className="block">Zand is te heet! Opgelet.</span>
                    </div>
                </div>
            );
        }
        if (isHot) {
            return (
                <div className="flex items-center gap-3 bg-orange-50 text-orange-700 px-4 py-3 rounded-xl border border-orange-100 flex-grow sm:flex-grow-0">
                    <Thermometer size={20} className="shrink-0" />
                    <div className="text-xs sm:text-sm font-bold">
                        <span className="block uppercase text-[10px] opacity-70">Warm weer</span>
                        <span className="block">Check temperatuur van zand.</span>
                    </div>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-3 bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl border border-emerald-100 flex-grow sm:flex-grow-0">
                <Thermometer size={20} className="shrink-0" />
                <div className="text-xs sm:text-sm font-bold">
                    <span className="block uppercase text-[10px] opacity-70">Hondenweer</span>
                    <span className="block">Ideaal wandelweer!</span>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-3xl mx-auto px-1 sm:px-0 mt-6">
            <div className="bg-white rounded-[1.5rem] border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">

                <div className="flex items-center gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl">
                        {getWeatherIcon(weather.weatherCode)}
                    </div>
                    <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Weerbericht</div>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl font-black text-slate-900">{Math.round(weather.temperature)}°C</span>
                            <span className="flex items-center gap-1 text-sm font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                <Wind size={12} /> {Math.round(weather.windSpeed)} km/u
                            </span>
                        </div>
                    </div>
                </div>

                {/* Paws Alert System */}
                {renderPawsAlert()}
            </div>
        </div>
    );
};
