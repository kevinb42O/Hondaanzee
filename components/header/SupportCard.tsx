import React from 'react';
import { Link } from 'react-router-dom';
import { PawPrint, Bone } from 'lucide-react';

export const SupportCard: React.FC = () => {
    return (
        <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group mb-10">
            <div className="absolute -top-6 -right-6 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-700">
                <PawPrint size={140} />
            </div>
            <h4 className="text-xl font-black mb-2 relative z-10 tracking-tight">Steun Hond aan Zee</h4>
            <p className="text-slate-400 text-sm mb-6 relative z-10 font-medium leading-relaxed">
                Help ons de leukste plekjes aan de kust te blijven delen!
            </p>
            <div className="flex flex-col gap-3 relative z-10">
                <Link
                    to="/steun-ons"
                    className="inline-flex items-center justify-center w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-2xl font-black text-center hover:from-amber-500 hover:to-amber-600 transition-all shadow-lg shadow-amber-900/20 active:scale-95 gap-2"
                >
                    <span>Trakteer koekje</span>
                    <Bone size={18} className="fill-white" />
                </Link>
                <a
                    href={`https://wa.me/32494816714?text=${encodeURIComponent(`Dag! 👋\n\nIk wil mijn hondvriendelijke zaak graag gratis laten vermelden op hondaanzee.be.\n\nKun je me meer info geven over hoe ik kan aanmelden?\n\nBedankt!`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full py-3.5 bg-sky-600/20 text-sky-400 border border-sky-600/30 rounded-2xl font-bold text-center hover:bg-sky-600/30 transition-colors active:scale-95"
                >
                    Zaak Aanmelden
                </a>
            </div>
        </div>
    );
};
