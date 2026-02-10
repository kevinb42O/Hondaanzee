import React, { useEffect } from 'react';
import { Heart, Bone, Wallet, QrCode, Copy, Check, MapPin } from 'lucide-react';
import { useSEO, SEO_DATA } from '../utils/seo.ts';

const Support: React.FC = () => {
    useSEO(SEO_DATA.steunOns);

    const [copied, setCopied] = React.useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText("BE43 7380 0488 6701");
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback: selecteer de tekst manueel
            setCopied(false);
        }
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
                                            width={224}
                                            height={224}
                                            loading="lazy"
                                            decoding="async"
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

                {/* Keurmerk Sticker Section */}
                <div className="mt-16">
                    <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100">

                        {/* Hero: Sticker groot & centraal */}
                        <div className="relative bg-slate-50">
                            <img
                                src="/sticker.webp"
                                alt="Hondaanzee keurmerk sticker"
                                className="w-full object-cover"
                                loading="lazy"
                                decoding="async"
                            />
                        </div>
                        <div className="px-6 pt-8 pb-2 sm:px-10 text-center">
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                                Vraag onze sticker aan voor jouw zaak 🏆
                            </h2>
                            <p className="text-slate-500 text-base mt-2 max-w-md mx-auto">
                                Laat jouw zaak stralen als officieel hondvriendelijke hotspot aan de kust.
                            </p>
                        </div>

                        {/* Info content */}
                        <div className="p-6 sm:p-10 md:p-12">
                            <h3 className="text-xl font-bold text-slate-900 mb-4 text-center">
                                Wat betekent het keurmerk?
                            </h3>
                            <div className="space-y-3 text-slate-600 mb-8 max-w-2xl mx-auto text-center">
                                <p>
                                    Met de <span className="font-semibold text-slate-800">Hond aan Zee keurmerk sticker</span> op je deur of raam weten hondeneigenaars die jouw zaak passeren onmiddellijk:
                                    <br />
                                    <em className="text-sky-600 font-medium">"Hier zijn we van harte welkom met onze viervoeter(s)!"</em>
                                </p>
                                <p>
                                    Jouw zaak wordt onderdeel van het groeiende <span className="font-semibold text-slate-800">Hond aan Zee netwerk</span> — een community van kustondernemers die samen de Belgische kust tot de meest hondvriendelijke plek van het land maken.
                                </p>
                                <p>
                                    Hondeneigenaars herkennen de sticker en weten direct dat ze bij jou terechtkunnen, zonder twijfel of ongemak. Dat zorgt voor vertrouwen, meer bezoekers én een warm gevoel.
                                </p>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 max-w-lg mx-auto">
                                <div className="flex items-start gap-3">
                                    <MapPin className="text-amber-500 mt-0.5 flex-shrink-0" size={20} />
                                    <div>
                                        <p className="font-bold text-slate-800 text-lg mb-1">
                                            €20 <span className="text-sm font-normal text-slate-500">— eenmalig</span>
                                        </p>
                                        <p className="text-sm text-slate-600">
                                            Jax 🐕 en ik komen de sticker persoonlijk bij je afleveren! Zo maken we er meteen een leuk kennismakingsmoment van.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center">
                                <a
                                    href="https://wa.me/32494816714?text=Hallo%20Kevin%20en%20Jax!%20%F0%9F%90%BE%0A%0AIk%20zou%20graag%20een%20Hondaanzee%20keurmerk%20sticker%20aanvragen%20voor%20mijn%20zaak.%0A%0ANaam%20zaak%3A%20%0AAdres%3A%20"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 text-lg"
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                    <span>Vraag je sticker aan via WhatsApp</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Support;
