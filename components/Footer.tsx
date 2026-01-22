
import React from 'react';
import { PawPrint, ExternalLink, Facebook, Instagram, Mail, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0B1120] border-t border-cyan-900/30 pt-16 sm:pt-20 md:pt-24 pb-8 sm:pb-10 safe-area-bottom">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 safe-area-left safe-area-right">
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
            
            {/* Social Media Icons */}
            <div className="flex items-center gap-3">
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-slate-400 hover:bg-cyan-500 hover:text-white transition-colors duration-300" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-slate-400 hover:bg-cyan-500 hover:text-white transition-colors duration-300" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-slate-400 hover:bg-cyan-500 hover:text-white transition-colors duration-300" aria-label="Email">
                <Mail size={18} />
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
                <a href="#hotspots" className="text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                  Hotspots
                </a>
              </li>
              <li>
                <a href="#business" className="text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                  Bedrijven
                </a>
              </li>
            </ul>
          </div>
          
          {/* Column 3: Populaire Regio's */}
          <div className="flex flex-col items-center sm:items-start">
            <h4 className="font-bold text-slate-500 mb-5 uppercase tracking-[0.2em] text-xs">Populaire Regio's</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/blankenberge" className="text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                  Blankenberge
                </Link>
              </li>
              <li>
                <Link to="/knokke-heist" className="text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                  Knokke-Heist
                </Link>
              </li>
              <li>
                <Link to="/oostende" className="text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                  Oostende
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
              <span className="text-emerald-400">Up to date</span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              Alle diensten operationeel.<br />
              <span className="text-slate-400">Laadsnelheid: </span>
              <span className="text-emerald-400 font-mono">0.04s</span>
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div className="text-slate-500 text-xs">
            <span className="text-slate-400">Hond</span><span className="text-cyan-400">Aan</span><span className="text-slate-400">Zee</span>.be &copy; 2026
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
    </footer>
  );
};

export default Footer;
