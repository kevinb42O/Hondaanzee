
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Trash2, Heart, ShieldAlert, Users, Sparkles, Fish } from 'lucide-react';

const ResponsibilityBanner: React.FC = () => {
  const location = useLocation();
  const isMapPage = location.pathname === '/kaart';

  return (
    <section className="relative py-20 sm:py-28 md:py-36 overflow-hidden">
      {/* Wave Divider at Top */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] z-10 rotate-180">
        <div className="wave-animation" style={{ display: 'flex', width: '200%' }}>
          <svg
            className="block h-[60px] sm:h-[80px] md:h-[120px]"
            style={{ minWidth: '100vw', flex: '0 0 100vw' }}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,60 C150,30 300,90 450,60 C600,30 750,90 900,60 C1050,30 1150,60 1200,60 L1200,120 L0,120 Z"
              className={`fill-current ${isMapPage ? 'text-slate-950' : 'text-stone-50'}`}
            />
          </svg>
          <svg
            className="block h-[60px] sm:h-[80px] md:h-[120px]"
            style={{ minWidth: '100vw', flex: '0 0 100vw' }}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,60 C150,30 300,90 450,60 C600,30 750,90 900,60 C1050,30 1150,60 1200,60 L1200,120 L0,120 Z"
              className={`fill-current ${isMapPage ? 'text-slate-950' : 'text-stone-50'}`}
            />
          </svg>
        </div>
      </div>

      {/* Sailboat riding on the wave surface */}
      <div className="absolute top-[8px] sm:top-[15px] md:top-[28px] left-0 z-[15] pointer-events-none sailboat-journey">
        <svg
          width="140"
          height="80"
          viewBox="0 0 150 90"
          className="sm:w-[164px] sm:h-[94px] md:w-[190px] md:h-[112px] drop-shadow-2xl"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Wind lines behind the boat */}
          <g className="wind-trails" opacity="0.6">
            <path
              d="M5,30 Q10,28 15,30"
              stroke="#cbd5e1"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M8,40 Q15,38 22,40"
              stroke="#cbd5e1"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M3,50 Q12,48 20,50"
              stroke="#cbd5e1"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M10,60 Q18,58 25,60"
              stroke="#e2e8f0"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
          </g>

          {/* Water reflection */}
          <ellipse cx="70" cy="82" rx="35" ry="4" fill="#0369a1" opacity="0.2" />

          {/* Hull - Realistic boat shape */}
          {/* Main hull body */}
          <path
            d="M48,68 L48,73 Q70,78 92,73 L92,68 Q70,72 48,68 Z"
            fill="#6b4423"
            stroke="#4a2f1a"
            strokeWidth="1"
          />

          {/* Hull top edge - deck */}
          <ellipse
            cx="70"
            cy="68"
            rx="22"
            ry="4"
            fill="#8b5a3c"
            stroke="#5d3a26"
            strokeWidth="0.8"
          />

          {/* Hull shadow/depth */}
          <path
            d="M48,68 L48,73 Q55,75 62,75 L62,70 Z"
            fill="#4a2f1a"
            opacity="0.4"
          />

          {/* Keel/bottom detail */}
          <path
            d="M65,76 Q70,79 75,76"
            stroke="#3d2517"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />

          {/* Hull planks detail */}
          <path
            d="M50,69.5 Q70,73 90,69.5"
            stroke="#5d3a26"
            strokeWidth="0.5"
            opacity="0.6"
            fill="none"
          />
          <path
            d="M49,71 Q70,74.5 91,71"
            stroke="#5d3a26"
            strokeWidth="0.5"
            opacity="0.6"
            fill="none"
          />

          {/* Cabin/cockpit area */}
          <ellipse
            cx="70"
            cy="67"
            rx="12"
            ry="3"
            fill="#5d3a26"
            opacity="0.3"
          />

          {/* Main Mast - positioned on deck */}
          <line
            x1="70"
            y1="67"
            x2="70"
            y2="15"
            stroke="#654321"
            strokeWidth="2.5"
          />

          {/* Mast base */}
          <rect
            x="68"
            y="65"
            width="4"
            height="3"
            fill="#4a2f1a"
            rx="1"
          />

          {/* Main Sail - Large with gradient effect */}
          <path
            d="M70,67 L70,18 L98,60 Z"
            fill="url(#mainSailGradient)"
            stroke="#cbd5e1"
            strokeWidth="1.5"
          />

          {/* Front Sail - Jib with gradient */}
          <path
            d="M70,67 L70,25 L45,58 Z"
            fill="url(#jibGradient)"
            stroke="#bae6fd"
            strokeWidth="1.5"
          />

          {/* Sail details - seams */}
          <line x1="70" y1="25" x2="88" y2="50" stroke="#e2e8f0" strokeWidth="0.8" opacity="0.6" />
          <line x1="70" y1="35" x2="92" y2="56" stroke="#e2e8f0" strokeWidth="0.8" opacity="0.6" />
          <line x1="70" y1="45" x2="95" y2="62" stroke="#e2e8f0" strokeWidth="0.8" opacity="0.6" />

          <line x1="70" y1="30" x2="52" y2="50" stroke="#e0f2fe" strokeWidth="0.8" opacity="0.6" />
          <line x1="70" y1="40" x2="48" y2="55" stroke="#e0f2fe" strokeWidth="0.8" opacity="0.6" />

          {/* Rigging lines */}
          <line x1="70" y1="15" x2="98" y2="60" stroke="#94a3b8" strokeWidth="0.8" opacity="0.7" />
          <line x1="70" y1="15" x2="45" y2="58" stroke="#94a3b8" strokeWidth="0.8" opacity="0.7" />

          {/* Boom for main sail */}
          <line x1="70" y1="67" x2="98" y2="60" stroke="#654321" strokeWidth="1.5" opacity="0.8" />

          {/* Flag at top */}
          <path
            d="M70,15 L80,18 L70,21 Z"
            fill="#dc2626"
          />

          {/* Mast cap */}
          <circle cx="70" cy="15" r="2" fill="#654321" />

          {/* Gradients */}
          <defs>
            <linearGradient id="mainSailGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#f8fafc', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: '#e2e8f0', stopOpacity: 0.95 }} />
              <stop offset="100%" style={{ stopColor: '#cbd5e1', stopOpacity: 0.9 }} />
            </linearGradient>
            <linearGradient id="jibGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#e0f2fe', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: '#bae6fd', stopOpacity: 0.95 }} />
              <stop offset="100%" style={{ stopColor: '#7dd3fc', stopOpacity: 0.85 }} />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Parallax Background Image - Fixed only on larger screens */}
      <div
        className="absolute inset-0 bg-cover bg-center md:bg-fixed"
        style={{ backgroundImage: 'url(/blankenberge.webp)' }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/80 to-slate-900" />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-20">
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
    </section>
  );
};

export default ResponsibilityBanner;
