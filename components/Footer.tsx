
import React from 'react';
import { PawPrint, ExternalLink, Mail, Check, Bike, Caravan, Baby } from 'lucide-react';
import { Link } from 'react-router-dom';

const WHATSAPP_URL = `https://wa.me/32494816714?text=${encodeURIComponent('Dag! 👋\n\nIk wil mijn hondvriendelijke zaak graag gratis laten vermelden op hondaanzee.be.\n\nKun je me meer info geven over hoe ik kan aanmelden?\n\nBedankt!')}`;

const InstagramIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Footer: React.FC = () => {
  return (
    <footer className="relative z-[1] bg-gradient-to-b from-slate-900 via-slate-950 to-black pt-16 sm:pt-20 md:pt-24 pb-12 sm:pb-16 safe-area-bottom">
      {/* Ocean depth gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/10 to-blue-950/20 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 safe-area-left safe-area-right relative z-10">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 lg:gap-16 mb-12 sm:mb-16 text-center sm:text-left">

          {/* Column 1: Brand Identity */}
          <div className="lg:col-span-1 flex flex-col items-center sm:items-start">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-cyan-500 p-1.5 rounded-lg text-white">
                <PawPrint size={20} strokeWidth={2.5} />
              </div>
              <span className="text-lg font-extrabold tracking-tight">
                <span className="text-white">Hond</span><span className="text-cyan-400">Aan</span><span className="text-white">Zee</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
              Jouw digitale gids voor een zorgeloos verblijf met je viervoeter aan de Belgische kust. Altijd up-to-date met de laatste politieverordeningen.
            </p>

            {/* Contact Email */}
            <a
              href="mailto:info@hondaanzee.be"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors mb-3"
              aria-label="Email contact: info@hondaanzee.be"
            >
              <Mail size={18} aria-hidden="true" />
              <span className="text-sm font-medium">info@hondaanzee.be</span>
            </a>

            {/* Social links */}
            <div className="flex flex-col gap-3">
              <a
                href="https://www.instagram.com/hondaanzee/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-slate-400 hover:text-pink-400 transition-colors group"
                aria-label="Volg @hondaanzee op Instagram"
              >
                <InstagramIcon size={18} className="group-hover:scale-110 transition-transform" aria-hidden="true" />
                <span className="text-sm font-medium">@hondaanzee</span>
              </a>
              <a
                href="https://www.facebook.com/hondaanzee"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors group"
                aria-label="Volg HondAanZee op Facebook"
              >
                <FacebookIcon size={18} className="group-hover:scale-110 transition-transform" aria-hidden="true" />
                <span className="text-sm font-medium">HondAanZee</span>
              </a>
              <a
                href="https://wa.me/32494816714"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-slate-400 hover:text-green-400 transition-colors group"
                aria-label="Stuur een bericht via WhatsApp"
              >
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform" aria-hidden="true">
                  <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                  <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Zm0 0a5 5 0 0 0 5 5m0 0h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1Z" />
                </svg>
                <span className="text-sm font-medium">WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Column 2: Navigatie */}
          <div className="flex flex-col items-center sm:items-start">
            <h4 className="font-bold text-slate-500 mb-5 uppercase tracking-[0.2em] text-xs">Navigatie</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                  Alle steden
                </Link>
              </li>
              <li>
                <Link to="/hotspots" className="text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                  Hotspots
                </Link>
              </li>
              <li>
                <Link to="/diensten" className="text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                  Diensten
                </Link>
              </li>
              <li>
                <Link to="/losloopzones" className="text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                  Losloopzones
                </Link>
              </li>
              <li>
                <Link to="/agenda" className="text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                  Evenementen
                </Link>
              </li>
              <li>
                <Link to="/goed-om-te-weten" className="text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                  Goed om te weten
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/over-ons" className="text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                  Over ons
                </Link>
              </li>
              <li>
                <Link to="/steun-ons" className="text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                  Steun ons
                </Link>
              </li>
              <li>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  Meld je zaak aan
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Alle Kuststeden (kustlijn NO → ZW) */}
          <div className="flex flex-col items-center sm:items-start">
            <h4 className="font-bold text-slate-500 mb-5 uppercase tracking-[0.2em] text-xs">Alle Kuststeden</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/knokke-heist" className="text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                  Knokke-Heist
                </Link>
              </li>
              <li>
                <Link to="/zeebrugge" className="text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                  Zeebrugge
                </Link>
              </li>
              <li>
                <Link to="/blankenberge" className="text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                  Blankenberge
                </Link>
              </li>
              <li>
                <Link to="/wenduine" className="text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                  Wenduine
                </Link>
              </li>
              <li>
                <Link to="/de-haan" className="text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                  De Haan
                </Link>
              </li>
              <li>
                <Link to="/bredene" className="text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                  Bredene
                </Link>
              </li>
              <li>
                <Link to="/oostende" className="text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                  Oostende
                </Link>
              </li>
              <li>
                <Link to="/middelkerke" className="text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                  Middelkerke
                </Link>
              </li>
              <li>
                <Link to="/nieuwpoort" className="text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                  Nieuwpoort
                </Link>
              </li>
              <li>
                <Link to="/koksijde" className="text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                  Koksijde
                </Link>
              </li>
              <li>
                <Link to="/de-panne" className="text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                  De Panne
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Server Status */}
          <div className="flex flex-col items-center sm:items-start">
            <h4 className="font-bold text-slate-500 mb-5 uppercase tracking-[0.2em] text-xs">Status</h4>
            <div className="inline-flex items-center gap-2 bg-black/20 border border-white/5 rounded-full px-3 py-1.5 text-xs font-mono mb-4">
              <Check size={14} className="text-emerald-400" strokeWidth={3} />
              <span className="text-emerald-400">Actueel</span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              Alle diensten operationeel.<br />
              <span className="text-slate-400">Laadsnelheid: </span>
              <span className="text-emerald-400 font-mono">0.04s</span>
            </p>
            <div className="mt-4 bg-black/30 border border-white/5 rounded-xl px-4 py-3">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Laatste update</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">28</span>
                <span className="text-sm font-bold text-cyan-400">feb</span>
                <span className="text-xs font-mono text-slate-400">2026</span>
              </div>
            </div>
          </div>
        </div>

        {/* Partner Sites */}
        <div className="mb-12 sm:mb-16">
          <h4 className="font-bold text-slate-500 mb-6 uppercase tracking-[0.2em] text-xs text-center">Onze Familie</h4>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
            {/* FietsAanZee */}
            <a
              href="https://fietsaanzee.be"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 group"
            >
              <div className="bg-amber-500 p-2 rounded-xl text-white group-hover:scale-110 transition-transform">
                <Bike size={20} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold">
                  <span className="text-white">Fiets</span><span className="text-amber-400">Aan</span><span className="text-white">Zee</span>
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Binnenkort beschikbaar</span>
              </div>
            </a>

            {/* CamperAanZee */}
            <a
              href="https://camperaanzee.be"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 group"
            >
              <div className="bg-emerald-500 p-2 rounded-xl text-white group-hover:scale-110 transition-transform">
                <Caravan size={20} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold">
                  <span className="text-white">Camper</span><span className="text-emerald-400">Aan</span><span className="text-white">Zee</span>
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Binnenkort beschikbaar</span>
              </div>
            </a>

            {/* KidsAanZee */}
            <a
              href="https://kidsaanzee.be"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 group"
            >
              <div className="bg-orange-500 p-2 rounded-xl text-white group-hover:scale-110 transition-transform">
                <Baby size={20} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold">
                  <span className="text-white">Kids</span><span className="text-orange-400">Aan</span><span className="text-white">Zee</span>
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Binnenkort beschikbaar</span>
              </div>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 border-t border-white/5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6 mb-4">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-slate-400 text-xs">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacybeleid</Link>
              <span className="text-slate-600">•</span>
              <Link to="/algemene-voorwaarden" className="hover:text-white transition-colors">Algemene Voorwaarden</Link>
              <span className="text-slate-600">•</span>
              <Link to="/cookies" className="hover:text-white transition-colors">Cookiebeleid</Link>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
            <div className="text-slate-500 text-xs">
              <span className="text-slate-400">Hond</span><span className="text-cyan-400">Aan</span><span className="text-slate-400">Zee</span>.be &copy; {new Date().getFullYear()}
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-xs">
              <span>website door</span>
              <a
                href="https://webaanzee.be"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold hover:text-cyan-400 flex items-center gap-1 group transition-colors duration-300"
              >
                <span><span className="text-slate-300">Web</span><span className="text-amber-400">aan</span><span className="text-slate-300">Zee</span></span>
                <ExternalLink size={12} className="opacity-50 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
