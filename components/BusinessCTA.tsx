
import React from 'react';
import { Rocket, Megaphone, HeartHandshake, Star } from 'lucide-react';

const BusinessCTA: React.FC = () => {
  return (
    <section id="business" className="py-10 sm:py-12 md:py-24 px-4 md:px-6 scroll-mt-24">
      <div className="max-w-6xl mx-auto bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3.5rem] p-6 sm:p-8 md:p-20 relative overflow-hidden text-white shadow-2xl shadow-slate-300">
        <div className="absolute top-0 right-0 w-full md:w-1/3 h-full bg-sky-600/10 skew-x-12 transform translate-x-20 pointer-events-none"></div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-sky-500/20 text-sky-400 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-widest mb-4 sm:mb-6">
              <Rocket size={14} /> Lokale Ondernemers
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black mb-4 sm:mb-6 leading-[1.15] tracking-tight">
              Heb jij een <span className="text-sky-400">hondvriendelijke</span> zaak aan de kust?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-lg leading-relaxed font-medium">
              Word gevonden door duizenden hondeneigenaars die onze site gebruiken als gids. Meld je gratis aan en zet jouw zaak op de kaart.
            </p>
            <a 
              href={`https://wa.me/32494816714?text=${encodeURIComponent(`Dag! 👋\n\nIk wil mijn hondvriendelijke zaak graag gratis laten vermelden op hondaanzee.be.\n\nKun je me meer info geven over hoe ik kan aanmelden?\n\nBedankt!`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-lift w-full sm:w-auto bg-gradient-to-r from-white to-sky-50 text-slate-900 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-black text-base sm:text-lg hover:from-sky-50 hover:to-sky-100 active:scale-95 shadow-xl shadow-sky-900/20 flex items-center justify-center gap-3 touch-target group transition-all"
            >
              <Megaphone size={18} className="text-sky-600 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform" />
              Gratis aanmelden via WhatsApp
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            <div className="bg-white/5 border border-white/10 p-5 sm:p-6 md:p-8 rounded-[1.25rem] sm:rounded-[1.5rem] md:rounded-3xl backdrop-blur-sm transition-colors hover:bg-white/[0.08] active:bg-white/[0.12]">
              <div className="text-sky-400 mb-3 sm:mb-4 bg-sky-400/10 w-fit p-2.5 sm:p-3 rounded-xl sm:rounded-2xl"><HeartHandshake size={24} className="sm:w-7 sm:h-7" /></div>
              <h4 className="font-bold text-base sm:text-lg md:text-xl mb-1.5 sm:mb-2">Gratis Visibiliteit</h4>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">Geen verborgen kosten, gewoon meer harige klanten in je zaak.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-5 sm:p-6 md:p-8 rounded-[1.25rem] sm:rounded-[1.5rem] md:rounded-3xl backdrop-blur-sm transition-colors hover:bg-white/[0.08] active:bg-white/[0.12]">
              <div className="text-sky-400 mb-3 sm:mb-4 bg-sky-400/10 w-fit p-2.5 sm:p-3 rounded-xl sm:rounded-2xl"><Star size={24} className="sm:w-7 sm:h-7" /></div>
              <h4 className="font-bold text-base sm:text-lg md:text-xl mb-1.5 sm:mb-2">Relevant Publiek</h4>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">Bereik specifiek mensen die met hun hond op stap zijn aan zee.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BusinessCTA;
