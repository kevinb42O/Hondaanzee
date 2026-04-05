
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Trash2, Heart, ShieldAlert, Users, Sparkles, Fish } from 'lucide-react';
import { CITIES } from '../cityData.ts';

const ResponsibilityBanner: React.FC = () => {
  const location = useLocation();
  const isMapPage = location.pathname === '/kaart';
  const isCityPage = CITIES.some((city) => `/${city.slug}` === location.pathname);

  return (
    <section
      className="relative overflow-hidden"
      style={{ paddingTop: 'clamp(5rem, 10vw, 9rem)', paddingBottom: 'clamp(5rem, 10vw, 9rem)' }}
    >
      {/* Parallax Background Image - keep only on non-city pages */}
      {!isCityPage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/blankenberge.webp)' }}
        />
      )}

      {/* Dark Overlay */}
      {!isCityPage && (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/80 to-slate-900" />
      )}

      {/* On city pages, keep the wave strip transparent so the page background shows through */}
      {isCityPage && (
        <div className="absolute inset-x-0 bottom-0 top-[70px] sm:top-[90px] md:top-[130px] bg-gradient-to-b from-slate-900/62 via-slate-900/78 to-slate-950/92" />
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-20">
        <div className="bg-slate-800/35 backdrop-blur-xl border border-white/15 rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3rem] p-6 sm:p-8 md:p-10 shadow-2xl shadow-black/30">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-6 shadow-xl">
              <Sparkles size={12} className="text-amber-300" strokeWidth={2.5} />
              Samen houden we de kust fijn
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight drop-shadow-2xl" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
              Code van de <span className="text-amber-400">Goede Kustvriend</span>
            </h2>
            <p className="mt-4 sm:mt-6 text-gray-200 font-normal max-w-2xl mx-auto leading-relaxed text-base sm:text-lg px-2" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.4)' }}>
              Een dagje zee is voor iedereen plezierig als we rekening houden met elkaar en de natuur. Volg deze zes gouden regels.
            </p>
          </div>

          {/* Glassmorphism Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Rule 1: Cleanliness */}
          <div className="group bg-slate-800/50 backdrop-blur-xl border border-white/10 p-6 sm:p-7 md:p-8 rounded-2xl transition-all duration-300 ease-out hover:bg-white/10 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/20">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-sky-500/10 group-hover:bg-sky-500/20 transition-colors duration-300">
                <Trash2 size={24} strokeWidth={2} className="text-sky-400 group-hover:text-sky-300 transition-colors duration-300" />
              </div>
            </div>
            <h3 className="font-bold text-white text-lg sm:text-xl mb-3 tracking-tight group-hover:text-amber-400 transition-colors duration-300">
              Ruim altijd op
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed group-hover:text-white transition-colors duration-300">
              Laat nooit hondenpoep of afval achter. Gebruik de aanwezige vuilbakken of neem het mee naar huis.
            </p>
          </div>

          {/* Rule 2: Respect Rules */}
          <div className="group bg-slate-800/50 backdrop-blur-xl border border-white/10 p-6 sm:p-7 md:p-8 rounded-2xl transition-all duration-300 ease-out hover:bg-white/10 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/20">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-sky-500/10 group-hover:bg-sky-500/20 transition-colors duration-300">
                <ShieldAlert size={24} strokeWidth={2} className="text-sky-400 group-hover:text-sky-300 transition-colors duration-300" />
              </div>
            </div>
            <h3 className="font-bold text-white text-lg sm:text-xl mb-3 tracking-tight group-hover:text-amber-400 transition-colors duration-300">
              Ken de regels
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed group-hover:text-white transition-colors duration-300">
              Elke gemeente heeft eigen zones en uren. Check onze gids voor je het strand oploopt.
            </p>
          </div>

          {/* Rule 3: Ask First */}
          <div className="group bg-slate-800/50 backdrop-blur-xl border border-white/10 p-6 sm:p-7 md:p-8 rounded-2xl transition-all duration-300 ease-out hover:bg-white/10 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/20">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-sky-500/10 group-hover:bg-sky-500/20 transition-colors duration-300">
                <Users size={24} strokeWidth={2} className="text-sky-400 group-hover:text-sky-300 transition-colors duration-300" />
              </div>
            </div>
            <h3 className="font-bold text-white text-lg sm:text-xl mb-3 tracking-tight group-hover:text-amber-400 transition-colors duration-300">
              Vraag eerst
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed group-hover:text-white transition-colors duration-300">
              Niet elke hond of mens wil contact. Vraag altijd even toestemming voor je iemand benadert.
            </p>
          </div>

          {/* Rule 4: Be Social */}
          <div className="group bg-slate-800/50 backdrop-blur-xl border border-white/10 p-6 sm:p-7 md:p-8 rounded-2xl transition-all duration-300 ease-out hover:bg-white/10 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/20">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-sky-500/10 group-hover:bg-sky-500/20 transition-colors duration-300">
                <Heart size={24} strokeWidth={2} className="text-sky-400 group-hover:text-sky-300 transition-colors duration-300" />
              </div>
            </div>
            <h3 className="font-bold text-white text-lg sm:text-xl mb-3 tracking-tight group-hover:text-amber-400 transition-colors duration-300">
              Wees sociaal
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed group-hover:text-white transition-colors duration-300">
              Houd je hond onder controle in drukke zones. Zo geniet iedereen zorgeloos van de gezonde zeelucht.
            </p>
          </div>

          {/* Rule 5: Seals */}
          <div className="group bg-white/10 backdrop-blur-xl border border-amber-400 p-6 sm:p-7 md:p-8 rounded-2xl transition-all duration-300 ease-out hover:bg-white/10 hover:border-amber-400 shadow-lg shadow-amber-500/20">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-sky-500/20 transition-colors duration-300">
                <Fish size={24} strokeWidth={2} className="text-sky-300 transition-colors duration-300" />
              </div>
            </div>
            <h3 className="font-bold text-amber-400 text-lg sm:text-xl mb-3 tracking-tight transition-colors duration-300">
              Zeehonden? Afstand!
            </h3>
            <p className="text-white text-sm sm:text-base leading-relaxed transition-colors duration-300">
              Zie je een zeehond? Houd minstens 30m afstand, hou je hond aangelijnd en bel 0491/74 32 78 (NorthSealTeam).
            </p>
          </div>

          {/* Rule 6: Pick up extra */}
          <div className="group bg-white/10 backdrop-blur-xl border border-amber-400 p-6 sm:p-7 md:p-8 rounded-2xl transition-all duration-300 ease-out hover:bg-white/10 hover:border-amber-400 hover:-translate-y-1 shadow-lg shadow-amber-500/20 cursor-pointer">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-sky-500/20 transition-colors duration-300">
                <Sparkles size={24} strokeWidth={2} className="text-sky-300 transition-colors duration-300" />
              </div>
            </div>
            <h3 className="font-bold text-amber-400 text-lg sm:text-xl mb-3 tracking-tight transition-colors duration-300">
              Extra inzet
            </h3>
            <p className="text-white text-sm sm:text-base leading-relaxed transition-colors duration-300">
              Zie je zwerfvuil? Raap het op en neem het mee in een poepzakje naar de eerstvolgende vuilbak. Samen houden we de kust schoon.
            </p>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResponsibilityBanner;
