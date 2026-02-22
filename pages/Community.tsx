import React, { useEffect, useState, useCallback } from 'react';
import { Send, Camera, MessageCircle, ChevronDown, ChevronUp, MapPin, ArrowRight, Heart, Star, Sparkles, Trophy, User, Share2, Download } from 'lucide-react';
import { useSEO, SEO_DATA } from '../utils/seo.ts';
import ImageModal from '../components/ImageModal.tsx';

// ─── MAANDTHEMA'S ────────────────────────────────────────────────────
const MONTHLY_THEMES = [
  { month: 0,  label: 'Januari',   emoji: '🧣', theme: 'Winterwandelaars',           description: 'Jouw hond trotseerend de koude wind, met sjaal of trui, wapperend haar — laat zien hoe jullie de winterkust veroveren!' },
  { month: 1,  label: 'Februari',  emoji: '🐶', theme: 'Zandsnuiten',                 description: 'Snuit vol zand, oren in de wind — deel het mooiste strandportret van jouw hond! Hoe zanderiger, hoe beter.' },
  { month: 2,  label: 'Maart',     emoji: '🌊', theme: 'Eerste Plons',                description: 'De lente nadert! Was jouw hond dapper genoeg om erin te springen? Of stond die twijfelend aan de vloedlijn? We willen het zien!' },
  { month: 3,  label: 'April',     emoji: '🐾', theme: 'Zandpoten Hall of Fame',      description: 'Hoe vuiler, hoe beter! We zoeken de meest epische zandpoten van de kust. Bonus: als je auto-interieur ook op de foto staat 😂' },
  { month: 4,  label: 'Mei',       emoji: '🌅', theme: 'Golden Hour Vibes',           description: 'Die magische avondzon aan zee… met je hond in silhouet. Jouw mooiste zonsondergang-shot met je viervoeter!' },
  { month: 5,  label: 'Juni',      emoji: '🏖️', theme: 'Stranddag Starter Pack',      description: 'Parasol, handdoek, koelbox én een kwispelende hond — deel jullie ultieme strandsetup! De gezelligste foto wint ons hart.' },
  { month: 6,  label: 'Juli',      emoji: '💦', theme: 'Splash!',                     description: 'Rennend door de golven, schudden na een duik, of gewoon kopje-onder — we willen jullie natste, wildste waterfoto\'s!' },
  { month: 7,  label: 'Augustus',  emoji: '😴', theme: 'Vakantie-Modus Aan',          description: 'Uitgeblust na een dag strand? Je hond in slaap gevallen op het terras? Deel de ultieme "ik-ben-op-vakantie" relaxfoto!' },
  { month: 8,  label: 'September', emoji: '🍂', theme: 'Herfst aan Zee',              description: 'Die eerste herfstwandeling met stormachtige luchten en lege stranden. Mist, regen, wind — alles mag, als je hond er maar bij staat!' },
  { month: 9,  label: 'Oktober',   emoji: '🎃', theme: 'Spooky Snoot',                description: 'Halloween editie! Heeft je hond een kostuum? Een grappige grimas? Of gewoon een eng schattig gezicht? Bring it on! 👻' },
  { month: 10, label: 'November',  emoji: '🌧️', theme: 'Regen? Maakt Niet Uit!',      description: 'Echte kusthonden laten zich niet tegenhouden door een bui. Laat zien hoe jullie door weer en wind gaan — regenjas optioneel!' },
  { month: 11, label: 'December',  emoji: '🎄', theme: 'Kerst aan de Kust',           description: 'Kerstmuts, lichtjes, kerstboom op het strand — maak er iets magisch van! De feestelijkste hondenfoto wint eeuwige roem.' },
];

// ─── TOPPER VAN DE WEEK ───────────────────────────────────────────────
const TOPPER_VAN_DE_WEEK = {
  image: '/gucci_topper.webp',
  dogName: 'Gucci',
  ownerName: 'Frank & Ann',
  city: 'Blankenberge',
  caption: 'Gucci geniet met volle teugen van het strand in Blankenberge! 🐾',
};

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const Confetti = () => {
  const [show, setShow] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(50)].map((_, i) => {
        const left = Math.random() * 100;
        const animationDuration = 2 + Math.random() * 3;
        const animationDelay = Math.random() * 2;
        const colors = ['bg-sky-400', 'bg-amber-400', 'bg-blue-500', 'bg-yellow-300', 'bg-white'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        return (
          <div
            key={i}
            className={`absolute top-[-10%] w-3 h-3 rounded-sm ${color} opacity-80`}
            style={{
              left: `${left}%`,
              animation: `fall ${animationDuration}s linear ${animationDelay}s forwards`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          />
        );
      })}
      <style>{`
        @keyframes fall {
          to {
            transform: translateY(120vh) rotate(720deg);
          }
        }
      `}</style>
    </div>
  );
};

// ─── COMPONENT ────────────────────────────────────────────────────────
const Community: React.FC = () => {
  useSEO(SEO_DATA.community);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const now = new Date();
  const currentMonthIndex = now.getMonth();
  const currentTheme = MONTHLY_THEMES[currentMonthIndex];
  const nextTheme = MONTHLY_THEMES[(currentMonthIndex + 1) % 12];

  const [showAllThemes, setShowAllThemes] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<string>('');
  const [modalAlt, setModalAlt] = useState<string>('');

  const openPhotoModal = useCallback((image: string, alt: string) => {
    setModalImage(image);
    setModalAlt(alt);
    setModalOpen(true);
  }, []);

  const whatsappLink = `https://wa.me/32494816714?text=${encodeURIComponent(
    `Hey Kevin & Jax! 🐾\n\nIk wil graag een foto insturen voor de community!\n\n📍 Gemeente: \n🐶 Naam hond: \n📸 Thema: ${currentTheme.theme}\n\n[Foto hieronder toevoegen]`
  )}`;

  const topper = TOPPER_VAN_DE_WEEK;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${topper.dogName} is Topper van de Week!`,
          text: `Kijk eens wie de Topper van de Week is op HondAanZee.be! 🐾👑`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing', error);
      }
    } else {
      alert('Kopieer de link bovenaan om deze pagina te delen met je vrienden!');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Confetti />

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden pt-32 sm:pt-40 pb-16 sm:pb-24">
        {/* Layered background */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-50/90 via-sky-50/30 to-white" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full opacity-[0.06]" style={{ background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)' }} />
        {/* Decorative paw prints */}
        <div className="absolute top-24 left-[10%] text-sky-200/30 text-4xl rotate-[-15deg] select-none hidden sm:block">🐾</div>
        <div className="absolute top-40 right-[8%] text-sky-200/25 text-3xl rotate-[20deg] select-none hidden sm:block">🐾</div>
        <div className="absolute bottom-20 left-[15%] text-sky-200/20 text-2xl rotate-[10deg] select-none hidden lg:block">🐾</div>

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          {/* Small badge */}
          <div className="inline-flex items-center gap-1.5 bg-sky-100/80 text-sky-700 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-6 sm:mb-8">
            <Heart size={12} className="fill-current" />
            <span>Community</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-5 sm:mb-6">
            Word de volgende{' '}
            <span className="text-sky-600 relative inline-block">
              Topper van de Week
              <svg className="absolute -bottom-1 sm:-bottom-2 md:-bottom-3 left-0 w-full h-3 sm:h-4 text-sky-400/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 25 0 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="8" />
              </svg>
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-lg mx-auto">
            Elke week kiezen we één hond als Topper van de Week — groot in beeld op onze site. Stuur je foto via WhatsApp en wie weet sta jij er volgende week!
          </p>
        </div>
      </section>

      {/* ═══════════ MAANDTHEMA ═══════════ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-16 sm:mb-24">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-sky-900/20" style={{
          background: 'linear-gradient(135deg, #0c1929 0%, #0f2847 30%, #143a6b 60%, #0f2847 80%, #0c1929 100%)',
        }}>
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #818cf8 0%, transparent 70%)' }} />

          {/* Main content */}
          <div className="relative px-6 sm:px-10 pt-8 sm:pt-10 pb-6 sm:pb-8">
            {/* Top label row */}
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-sky-300 text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] px-3 py-1 rounded-full border border-white/10">
                {currentTheme.label} {now.getFullYear()}
              </span>
              <span className="inline-flex items-center gap-1 bg-sky-400/20 text-sky-300 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-sky-400/20">
                <Sparkles size={10} />
                Actief
              </span>
            </div>

            {/* Theme display */}
            <div className="flex items-center gap-5 sm:gap-7">
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center" style={{
                  background: 'linear-gradient(145deg, rgba(56,189,248,0.15), rgba(129,140,248,0.1))',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.05)',
                }}>
                  <span className="text-4xl sm:text-5xl drop-shadow-lg">{currentTheme.emoji}</span>
                </div>
                {/* Soft glow behind emoji */}
                <div className="absolute inset-0 rounded-2xl opacity-40 blur-xl pointer-events-none" style={{ background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)' }} />
              </div>
              <div className="min-w-0">
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2 sm:mb-3 drop-shadow-sm">
                  {currentTheme.theme}
                </h2>
                <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-md">
                  {currentTheme.description}
                </p>
              </div>
            </div>
          </div>

          {/* Next month footer */}
          <div className="relative border-t border-white/[0.06] px-6 sm:px-10 py-3.5 sm:py-4 flex items-center justify-between" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.2) 100%)' }}>
            <div className="flex items-center gap-3">
              <span className="text-lg">{nextTheme.emoji}</span>
              <p className="text-xs sm:text-sm text-slate-500">
                Volgende maand: <span className="font-semibold text-slate-400">{nextTheme.theme}</span>
              </p>
            </div>
            <button
              onClick={() => setShowAllThemes(!showAllThemes)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-sky-400 transition-colors"
            >
              {showAllThemes ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              <span className="hidden sm:inline">{showAllThemes ? 'Verberg' : 'Alle thema\'s'}</span>
            </button>
          </div>
        </div>

        {showAllThemes && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5 animate-in fade-in duration-300">
            {MONTHLY_THEMES.map((t) => {
              const isCurrent = t.month === currentMonthIndex;
              return (
                <div
                  key={t.month}
                  className={`rounded-xl px-5 py-4 transition-all duration-200 ${
                    isCurrent
                      ? 'bg-sky-50 ring-2 ring-sky-200 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-0.5">{t.emoji}</span>
                    <div className="min-w-0">
                      <p className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${isCurrent ? 'text-sky-600' : 'text-slate-400'}`}>
                        {t.label}{isCurrent ? ' — nu' : ''}
                      </p>
                      <p className="font-bold text-slate-800 text-sm mb-1">{t.theme}</p>
                      <p className="text-slate-400 text-xs leading-relaxed">{t.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ═══════════ TOPPER VAN DE WEEK ═══════════ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 sm:mb-24">
        {/* Section header */}
        <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-5">
            <Trophy size={13} className="fill-amber-500 text-amber-500" />
            <span>{currentTheme.label} {now.getFullYear()}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Topper van de Week
          </h2>
          <p className="text-base sm:text-lg text-slate-500 leading-relaxed">
            Elke week zetten we één hond in de spotlights. <span className="font-semibold text-slate-700">Wordt de volgende de jouwe?</span>
          </p>
        </div>

        {/* ── Shareable Player Card & Description ── */}
        <div className="relative max-w-5xl mx-auto mt-12 sm:mt-20 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          
          {/* The Card Container */}
          <div className="relative w-full max-w-md" style={{ perspective: '1000px' }}>
            {/* Dynamic Background (Waves/Sand) */}
            <div className="absolute -inset-6 bg-gradient-to-br from-sky-300/30 via-amber-200/30 to-sky-400/30 rounded-[3rem] blur-2xl animate-pulse -z-10" />
            
            <div 
              id="topper-card"
              className="relative bg-white rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/50 aspect-[9/16] flex flex-col justify-end transform transition-transform duration-500 hover:scale-[1.02] z-20"
              style={{
                boxShadow: '0 25px 50px -12px rgba(14, 165, 233, 0.25), 0 0 0 1px rgba(255,255,255,0.5) inset'
              }}
            >
            {/* Image */}
            <img
              src={topper.image}
              alt={`${topper.dogName} — Topper van de Week`}
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Gradient Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-transparent to-transparent h-32" />

            {/* Top Bar: Logo & Watermark */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30">
                <Trophy size={14} className="text-amber-300 fill-amber-300" />
                <span className="text-white text-xs font-bold tracking-wider uppercase shadow-sm">Topper van de Week</span>
              </div>
              <div className="text-right">
                <p className="text-white/90 font-black text-sm tracking-widest drop-shadow-md">HONDAANZEE.BE</p>
              </div>
            </div>

            {/* Floating Crown */}
            <div className="absolute top-[15%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 animate-bounce">
              <div className="text-6xl drop-shadow-[0_0_15px_rgba(251,191,36,0.8)] rotate-[15deg]">👑</div>
            </div>

            {/* Bottom Content */}
            <div className="relative z-20 p-6 sm:p-8 w-full">
              {/* Huge Name */}
              <h3 className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tight mb-2 uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                {topper.dogName}
              </h3>
              
              {/* Stats / Info */}
              <div className="space-y-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="bg-sky-500/80 backdrop-blur-sm px-3 py-1 rounded-lg border border-sky-400/50 flex items-center gap-1.5">
                    <MapPin size={14} className="text-white" />
                    <span className="text-white text-sm font-bold">{topper.city}</span>
                  </div>
                  <div className="bg-amber-500/80 backdrop-blur-sm px-3 py-1 rounded-lg border border-amber-400/50 flex items-center gap-1.5">
                    <User size={14} className="text-white" />
                    <span className="text-white text-sm font-bold">{topper.ownerName}</span>
                  </div>
                </div>
                
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/30">
                  <Sparkles size={14} className="text-amber-300" />
                  <span className="text-white text-sm font-bold">Zandhapper Level: <span className="text-amber-300">Expert</span></span>
                </div>
              </div>
            </div>
          </div>
          </div>

          {/* Description Block (Outside the card) */}
          <div className="relative w-full max-w-sm md:max-w-xs flex flex-col items-center md:items-start text-center md:text-left mt-8 md:mt-0">
            {/* Arrow pointing to the card (Desktop) */}
            <div className="hidden md:block absolute -left-20 top-1/4 text-sky-400 animate-pulse">
              <svg width="80" height="80" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="transform -rotate-12">
                <path d="M90 20 Q 50 20 10 60" />
                <path d="M10 60 L 30 50 M10 60 L 20 80" />
              </svg>
            </div>
            {/* Arrow pointing to the card (Mobile) */}
            <div className="md:hidden absolute -top-16 left-1/2 -translate-x-1/2 text-sky-400 animate-pulse">
              <svg width="60" height="60" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="transform rotate-12">
                <path d="M80 80 Q 50 40 20 20" />
                <path d="M20 20 L 40 20 M20 20 L 20 40" />
              </svg>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-100 relative w-full transform md:rotate-2 hover:rotate-0 transition-transform duration-300">
              <div className="absolute -top-4 -left-2 text-6xl text-sky-200 font-serif opacity-50">"</div>
              <p className="text-lg sm:text-xl font-bold italic leading-relaxed text-slate-700 relative z-10">
                {topper.caption}
              </p>
              <div className="mt-6 flex items-center gap-3 justify-center md:justify-start">
                <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
                  <User size={20} className="text-sky-500" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-900">{topper.ownerName}</p>
                  <p className="text-xs text-slate-500">Baasje van {topper.dogName}</p>
                </div>
              </div>
            </div>

            {/* Share / Download Button */}
            <div className="mt-8 w-full">
              <button 
                onClick={handleShare}
                className="w-full group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black text-lg px-8 py-4 rounded-full shadow-[0_0_40px_rgba(14,165,233,0.4)] hover:shadow-[0_0_60px_rgba(14,165,233,0.6)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <Share2 size={22} className="relative z-10" />
                <span className="relative z-10">Deel Overwinning!</span>
              </button>
              <p className="text-slate-400 text-sm mt-3 font-medium text-center">Perfect formaat voor je Instagram Story 📸</p>
            </div>
          </div>
        </div>

        {/* CTA under showcase */}
        <div className="text-center mt-16 sm:mt-20">
          <p className="text-sm sm:text-base text-slate-500 mb-5 leading-relaxed">
            Wil jij dat jouw hond volgende week hier staat? Stuur je leukste foto!
          </p>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-lift group inline-flex items-center gap-3 sm:gap-4 text-white font-bold px-8 sm:px-12 py-4 sm:py-5 rounded-full text-base sm:text-lg shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30 transition-all"
            style={{ backgroundColor: '#25D366' }}
          >
            <WhatsAppIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>Ik wil Topper worden!</span>
            <Send size={18} className="opacity-70 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </section>

      {/* ═══════════ PHOTO MODAL ═══════════ */}
      <ImageModal
        images={modalImage ? [modalImage] : []}
        altText={modalAlt}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />

    </div>
  );
};

export default Community;
