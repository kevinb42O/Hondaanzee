
import React from 'react';
import { Trash2, Heart, ShieldAlert, Users, Sparkles } from 'lucide-react';

const ResponsibilityBanner: React.FC = () => {
  return (
    <section className="relative py-20 sm:py-28 md:py-36 overflow-hidden">
      {/* Parallax Background Image - Fixed only on larger screens */}
      <div 
        className="absolute inset-0 bg-cover bg-center md:bg-fixed"
        style={{ backgroundImage: 'url(/blankenberge.webp)' }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/80 to-slate-900/70" />
      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
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
            Een dagje zee is voor iedereen plezierig als we rekening houden met elkaar en de natuur. Volg deze vier gouden regels.
          </p>
        </div>

        {/* Glassmorphism Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Rule 1: Cleanliness */}
          <div className="group bg-black/30 backdrop-blur-xl border border-white/10 p-6 sm:p-7 md:p-8 rounded-2xl transition-all duration-500 ease-out hover:border-white/30 hover:brightness-110 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
            <div className="mb-6">
              <Trash2 size={32} strokeWidth={2} className="text-sky-400 w-8 h-8 sm:w-9 sm:h-9" />
            </div>
            <h3 className="font-semibold text-white text-lg sm:text-xl mb-3 tracking-tight">
              Ruim altijd op
            </h3>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
              Laat nooit hondenpoep of afval achter. Gebruik de aanwezige vuilbakken of neem het mee naar huis.
            </p>
          </div>

          {/* Rule 2: Respect Rules */}
          <div className="group bg-black/30 backdrop-blur-xl border border-white/10 p-6 sm:p-7 md:p-8 rounded-2xl transition-all duration-500 ease-out hover:border-white/30 hover:brightness-110 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
            <div className="mb-6">
              <ShieldAlert size={32} strokeWidth={2} className="text-sky-400 w-8 h-8 sm:w-9 sm:h-9" />
            </div>
            <h3 className="font-semibold text-white text-lg sm:text-xl mb-3 tracking-tight">
              Ken de regels
            </h3>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
              Elke gemeente heeft eigen zones en uren. Check onze gids voor je het strand oploopt.
            </p>
          </div>

          {/* Rule 3: Ask First */}
          <div className="group bg-black/30 backdrop-blur-xl border border-white/10 p-6 sm:p-7 md:p-8 rounded-2xl transition-all duration-500 ease-out hover:border-white/30 hover:brightness-110 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
            <div className="mb-6">
              <Users size={32} strokeWidth={2} className="text-sky-400 w-8 h-8 sm:w-9 sm:h-9" />
            </div>
            <h3 className="font-semibold text-white text-lg sm:text-xl mb-3 tracking-tight">
              Vraag eerst
            </h3>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
              Niet elke hond of mens wil contact. Vraag altijd even toestemming voor je iemand benadert.
            </p>
          </div>

          {/* Rule 4: Be Social */}
          <div className="group bg-black/30 backdrop-blur-xl border border-white/10 p-6 sm:p-7 md:p-8 rounded-2xl transition-all duration-500 ease-out hover:border-white/30 hover:brightness-110 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
            <div className="mb-6">
              <Heart size={32} strokeWidth={2} className="text-sky-400 w-8 h-8 sm:w-9 sm:h-9" />
            </div>
            <h3 className="font-semibold text-white text-lg sm:text-xl mb-3 tracking-tight">
              Wees sociaal
            </h3>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
              Houd je hond onder controle in drukke zones. Zo geniet iedereen zorgeloos van de gezonde zeelucht.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResponsibilityBanner;
