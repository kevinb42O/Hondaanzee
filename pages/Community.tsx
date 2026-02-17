import React, { useEffect, useState, useCallback } from 'react';
import { Send, Camera, MessageCircle, ChevronDown, ChevronUp, MapPin, ArrowRight, Heart, Star, Sparkles, Trophy, User } from 'lucide-react';
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

// ─── TOPPER VAN DE MAAND ──────────────────────────────────────────────
const TOPPER_VAN_DE_MAAND = {
  image: '/community/oostende.webp',
  dogName: 'Billie',
  ownerName: 'Sarissa M.',
  city: 'Oostende',
  caption: 'Billie als koning van Oostende — altijd klaar voor avontuur aan zee! 👑',
};

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

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

  const topper = TOPPER_VAN_DE_MAAND;

  return (
    <div className="min-h-screen bg-white">

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
              Topper van de Maand
              <svg className="absolute -bottom-1 sm:-bottom-2 md:-bottom-3 left-0 w-full h-3 sm:h-4 text-sky-400/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 25 0 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="8" />
              </svg>
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-lg mx-auto">
            Elke maand kiezen we één hond als Topper van de Maand — groot in beeld op onze site. Stuur je foto via WhatsApp en wie weet sta jij er volgende maand!
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

      {/* ═══════════ TOPPER VAN DE MAAND ═══════════ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 sm:mb-24">
        {/* Section header */}
        <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-5">
            <Trophy size={13} className="fill-amber-500 text-amber-500" />
            <span>{currentTheme.label} {now.getFullYear()}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Topper van de Maand
          </h2>
          <p className="text-base sm:text-lg text-slate-500 leading-relaxed">
            Elke maand zetten we één hond in de spotlights. <span className="font-semibold text-slate-700">Wordt de volgende de jouwe?</span>
          </p>
        </div>

        {/* ── Big showcase card with picture frame ── */}
        <div className="group relative max-w-2xl mx-auto">

          {/* Nameplate above the frame — like a museum plaque */}
          <div className="flex justify-center mb-4 sm:mb-5">
            <div className="relative px-6 sm:px-10 py-3 sm:py-4 rounded-md text-center" style={{ background: 'linear-gradient(145deg, #c9a84c, #a07628, #d4b65a)', boxShadow: '0 3px 12px rgba(139,105,20,0.3), inset 0 1px 2px rgba(255,255,255,0.3)' }}>
              <div className="flex items-center justify-center gap-2 mb-1">
                <Star size={14} className="text-amber-900/70 fill-amber-900/70" />
                <h3 className="text-lg sm:text-xl md:text-2xl font-black text-amber-950 tracking-tight">
                  {topper.dogName}
                </h3>
                <Star size={14} className="text-amber-900/70 fill-amber-900/70" />
              </div>
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-amber-900/60">
                Topper van de Maand
              </p>
            </div>
          </div>

          {/* === ORNATE PICTURE FRAME === */}
          <div className="relative rounded-lg" style={{
            padding: '18px',
            background: 'linear-gradient(160deg, #dcc06e 0%, #b8912e 8%, #e8d48a 16%, #c9a84c 24%, #a07628 40%, #c9a84c 56%, #e8d48a 72%, #b8912e 88%, #dcc06e 100%)',
            boxShadow: '0 12px 48px rgba(139,105,20,0.3), 0 2px 8px rgba(0,0,0,0.15), inset 0 2px 3px rgba(255,255,255,0.4), inset 0 -2px 3px rgba(0,0,0,0.15)',
          }}>
            {/* Outer carved line */}
            <div className="absolute inset-[5px] rounded-md pointer-events-none" style={{ border: '1px solid rgba(255,255,255,0.25)' }} />
            <div className="absolute inset-[7px] rounded-md pointer-events-none" style={{ border: '1px solid rgba(0,0,0,0.12)' }} />

            {/* Inner carved ridge */}
            <div className="relative rounded" style={{
              padding: '4px',
              background: 'linear-gradient(160deg, #8b6914, #6b4f0e, #8b6914)',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5), inset 0 -1px 2px rgba(255,255,255,0.1)',
            }}>
              {/* Ornate detail line */}
              <div className="absolute inset-[2px] rounded-sm pointer-events-none" style={{ border: '1px solid rgba(255,215,0,0.15)' }} />

              {/* Cream passepartout / mat */}
              <div className="relative bg-[#f5f0e6] p-4 sm:p-6 rounded-sm" style={{
                boxShadow: 'inset 0 0 20px rgba(139,105,20,0.08)',
              }}>
                {/* Subtle V-groove around the photo (inner shadow frame effect) */}
                <div className="relative" style={{
                  boxShadow: '0 0 0 1px rgba(139,105,20,0.15), inset 0 0 0 1px rgba(139,105,20,0.1)',
                }}>
                  {/* The actual photo */}
                  <button
                    onClick={() => openPhotoModal(topper.image, topper.dogName)}
                    className="relative w-full cursor-zoom-in block overflow-hidden"
                    aria-label={`Bekijk foto van ${topper.dogName}`}
                  >
                    <img
                      src={topper.image}
                      alt={`${topper.dogName} — Topper van de Maand in ${topper.city}`}
                      className="w-full h-[340px] sm:h-[440px] md:h-[500px] object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                      loading="eager"
                      decoding="async"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info card below frame */}
        <div className="max-w-2xl mx-auto mt-6 sm:mt-8 bg-white rounded-2xl shadow-md ring-1 ring-slate-200/60 px-5 sm:px-8 py-5 sm:py-6">
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed mb-4 sm:mb-5 italic">
            &ldquo;{topper.caption}&rdquo;
          </p>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <div className="flex items-center gap-1.5 bg-sky-50 rounded-full px-3.5 py-2 ring-1 ring-sky-100">
              <MapPin size={13} className="text-sky-500" />
              <span className="text-slate-700 text-xs sm:text-sm font-bold">{topper.city}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-sky-50 rounded-full px-3.5 py-2 ring-1 ring-sky-100">
              <User size={13} className="text-sky-500" />
              <span className="text-slate-700 text-xs sm:text-sm font-bold">Baasje: {topper.ownerName}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-amber-50 rounded-full px-3.5 py-2 ring-1 ring-amber-100">
              <span className="text-sm">{currentTheme.emoji}</span>
              <span className="text-slate-700 text-xs sm:text-sm font-bold">{currentTheme.theme}</span>
            </div>
          </div>
        </div>

        {/* CTA under showcase */}
        <div className="text-center mt-8 sm:mt-12">
          <p className="text-sm sm:text-base text-slate-500 mb-5 leading-relaxed">
            Wil jij dat jouw hond volgende maand hier staat? Stuur je leukste foto!
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
