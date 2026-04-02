import React from 'react';
import { Link } from 'react-router-dom';
import { PawPrint, Bone, Users } from 'lucide-react';

export const SupportCard: React.FC = () => {
    return (
        <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group mb-10">
            <div className="absolute -top-6 -right-6 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-700">
                <PawPrint size={140} />
            </div>
            <h4 className="text-xl font-black mb-2 relative z-10 tracking-tight">Steun of help mee</h4>
            <p className="text-slate-400 text-sm mb-6 relative z-10 font-medium leading-relaxed">
                Met een koekje, een zaakvermelding of als vrijwilliger in jouw gemeente.
            </p>
            <div className="flex flex-col gap-3 relative z-10">
                <Link
                    to="/steun-ons"
                    className="inline-flex items-center justify-center w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-2xl font-black text-center hover:from-amber-500 hover:to-amber-600 transition-all shadow-lg shadow-amber-900/20 active:scale-95 gap-2"
                >
                    <span>Trakteer koekje</span>
                    <Bone size={18} className="fill-white" />
                </Link>
                <Link
                    to="/zaak-aanmelden"
                    className="inline-flex items-center justify-center w-full py-3.5 bg-sky-600/20 text-sky-400 border border-sky-600/30 rounded-2xl font-bold text-center hover:bg-sky-600/30 transition-colors active:scale-95"
                >
                    Zaak Aanmelden
                </Link>
                <Link
                    to="/meldpunt/vrijwilligers"
                    className="inline-flex items-center justify-center w-full py-3.5 bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 rounded-2xl font-bold text-center hover:bg-emerald-500/25 transition-colors active:scale-95 gap-2"
                >
                    <Users size={18} />
                    Vrijwilligers
                </Link>
            </div>
        </div>
    );
};
