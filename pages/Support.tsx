import React, { useEffect } from 'react';
import { Heart, Coffee, Bone, Wallet, QrCode, Copy, Check } from 'lucide-react';

const Support: React.FC = () => {
    const [copied, setCopied] = React.useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const copyToClipboard = () => {
        navigator.clipboard.writeText("BE43 7380 0488 6701");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
            <div className="max-w-3xl mx-auto">

                {/* Header Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 bg-amber-100 text-amber-600 rounded-2xl mb-6 shadow-sm transform -rotate-3">
                        <Bone size={32} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                        Trakteer <span className="font-['Patrick_Hand'] text-4xl sm:text-5xl md:text-6xl"><span className="text-slate-900">Hond</span><span className="text-sky-600">Aan</span><span className="text-slate-900">Zee</span></span> op een <span className="text-amber-500">hondenkoekje</span> 🐾
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
                        Help ons de leukste plekjes aan de kust te blijven delen!
                    </p>
                </div>

                {/* content Card */}
                <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100">
                    <div className="p-6 sm:p-10 md:p-12">

                        {/* Personal Message */}
                        <div className="prose prose-slate max-w-none text-slate-600 mb-12">
                            <p className="text-lg font-medium text-slate-800 mb-4">
                                Hoi! Wat leuk dat je op deze pagina kijkt.
                            </p>
                            <p className="mb-4">
                                Zoals je misschien wel weet, is Hond aan Zee een uit de hand gelopen hobbyproject. Ik vind het geweldig om de leukste plekjes aan de kust te delen waar onze viervoeters welkom zijn.
                            </p>
                            <p className="mb-4">
                                Maar... eerlijk is eerlijk: het in de lucht houden van deze website kost geld (hosting, domeinnaam, onderhoud) en vooral heel veel tijd. Momenteel leg ik er geld op toe om de site online te houden voor jullie.
                            </p>
                            <p className="font-medium text-slate-800">
                                Vind jij de info op Hond aan Zee nuttig? En wil je helpen de site online te houden?
                            </p>
                            <p>
                                Dan zou je me enorm blij maken met een kleine bijdrage. Zie het als het trakteren op een koffie (of een zakje hondenkoekjes 😉).
                            </p>
                        </div>

                        {/* Donation Area */}
                        <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200">
                            <div className="flex flex-col md:flex-row gap-8 items-center">

                                {/* QR Code Column */}
                                <div className="w-full md:w-1/2 flex flex-col items-center">
                                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-4">
                                        <img
                                            src="https://epc-qr.eu/?bname=Kevin%20Bourguignon&iban=BE43738004886701&euro=&info=Donatie%20Hond%20aan%20Zee&zero=blank"
                                            alt="Payconiq/Bancontact QR Code"
                                            className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider">
                                        <QrCode size={16} />
                                        <span>Scan met bank-app</span>
                                    </div>
                                </div>

                                {/* Manual Transfer Column */}
                                <div className="w-full md:w-1/2 text-center md:text-left">
                                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center justify-center md:justify-start gap-2">
                                        <Wallet className="text-sky-600" />
                                        <span>Handmatig overmaken</span>
                                    </h3>

                                    <div className="space-y-4">
                                        <p className="text-slate-500 text-sm">
                                            Lukt scannen niet? Je mag ook handmatig iets overmaken:
                                        </p>

                                        <div className="bg-white border border-slate-200 rounded-xl p-4 relative group">
                                            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">IBAN</div>
                                            <div className="font-mono text-lg font-bold text-slate-800">BE43 7380 0488 6701</div>
                                            <button
                                                onClick={copyToClipboard}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                                                aria-label="Kopieer IBAN"
                                            >
                                                {copied ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} />}
                                            </button>
                                        </div>

                                        <div className="text-sm text-slate-600">
                                            <span className="block mb-1">t.a.v. <span className="font-semibold text-slate-900">Kevin Bourguignon</span></span>
                                            <span className="block">Mededeling: <span className="font-mono bg-slate-200 px-1.5 py-0.5 rounded text-slate-800">Donatie</span></span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Footer Message */}
                        <div className="mt-10 text-center">
                            <p className="text-slate-500 italic mb-6">
                                Elke euro wordt gebruikt om de site sneller en beter te maken.
                            </p>
                            <div className="inline-flex items-center gap-2 text-xl font-black text-slate-900">
                                <span>Dikke merci!</span>
                                <Heart className="text-rose-500 fill-rose-500 animate-pulse" />
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Support;
