import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Bone, QrCode, Copy, Check, MapPin, Share2, Users, ArrowRight } from 'lucide-react';
import { useSEO, SEO_DATA } from '../utils/seo.ts';
import StickerMeter from '../components/StickerMeter.tsx';
import { buildSupportQrUrl, formatSupportAmount, parseSupportAmount, SUPPORT_IBAN, SUPPORT_RECIPIENT, SUPPORT_REFERENCE } from '../utils/support.ts';
import { trackSupportAction } from '../utils/supportAnalytics.ts';

const AMOUNTS = [5, 10, 25] as const;

const Support: React.FC = () => {
    useSEO(SEO_DATA.steunOns);
    const [selectedAmount, setSelectedAmount] = useState<number | 'custom'>(5);
    const [customAmount, setCustomAmount] = useState('');
    const [copied, setCopied] = useState(false);
    const [copyError, setCopyError] = useState(false);
    const [qrVisible, setQrVisible] = useState(false);
    const [qrError, setQrError] = useState(false);
    const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const amountInput = useRef<HTMLInputElement>(null);
    const amount = selectedAmount === 'custom' ? parseSupportAmount(customAmount) ?? undefined : selectedAmount;
    const invalidAmount = selectedAmount === 'custom' && customAmount.trim() !== '' && amount === undefined;
    // The EPC QR format has a technical ceiling; direct transfers remain available.
    const exceedsQrFormat = amount !== undefined && amount > 999999999.99;
    const qrUrl = buildSupportQrUrl(amount);

    useEffect(() => {
        window.scrollTo(0, 0);
        return () => { if (copyTimer.current) clearTimeout(copyTimer.current); };
    }, []);
    useEffect(() => { setQrError(false); }, [qrUrl]);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(SUPPORT_IBAN);
            setCopied(true);
            setCopyError(false);
            trackSupportAction('iban-gekopieerd');
            if (copyTimer.current) clearTimeout(copyTimer.current);
            copyTimer.current = setTimeout(() => setCopied(false), 3000);
        } catch {
            setCopied(false);
            setCopyError(true);
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: 'HondAanZee',
            text: 'Met je hond naar de Belgische kust? Vind strandregels, losloopzones en hondvriendelijke adresjes op HondAanZee. 🐾',
            url: 'https://hondaanzee.be',
        };
        try {
            if (navigator.share) await navigator.share(shareData);
            else window.open(`https://wa.me/?text=${encodeURIComponent(`${shareData.text} ${shareData.url}`)}`, '_blank', 'noopener,noreferrer');
            trackSupportAction('gedeeld');
        } catch { /* Sharing cancelled. */ }
    };

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-7 sm:mb-9">
                    <div className="inline-flex items-center justify-center p-3 bg-amber-100 text-amber-600 rounded-2xl mb-4 transform -rotate-3">
                        <Bone size={28} strokeWidth={2.5} aria-hidden="true" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
                        Help HondAanZee <span className="text-sky-600">gratis en actueel</span> te houden
                    </h1>
                    <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto">
                        Heeft de gids je geholpen bij een uitstap met je hond? Met een vrijwillige bijdrage help je me de info te blijven bijhouden.
                    </p>
                </div>

                <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100">
                    <div className="p-5 sm:p-8 md:p-10">
                        <div className="mb-6 text-slate-600 leading-relaxed">
                            <p><span className="font-bold text-slate-900">Hoi, ik ben Kevin.</span> Ik onderhoud HondAanZee en trek met Jax de kust op. Je bijdrage helpt met de kosten en het uitzoekwerk achter deze gids.</p>
                        </div>

                        <section aria-labelledby="support-amount-heading" className="rounded-3xl border border-amber-200 bg-amber-50/60 p-4 sm:p-6">
                            <h2 id="support-amount-heading" className="text-xl font-black text-slate-900">Kies zelf je bijdrage 🐾</h2>
                            <p id="support-amount-help" className="mt-1 mb-4 text-sm text-slate-600">Eenmalig, zonder abonnement. Elk bedrag is welkom.</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="group" aria-label="Bijdrage kiezen">
                                {AMOUNTS.map(value => (
                                    <button key={value} type="button" aria-pressed={selectedAmount === value}
                                        onClick={() => { setSelectedAmount(value); trackSupportAction(`bedrag-${value}`); }}
                                        className={`min-h-12 rounded-xl border-2 px-3 py-3 text-lg font-black transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${selectedAmount === value ? 'border-amber-500 bg-white text-amber-800' : 'border-slate-200 bg-white text-slate-700 hover:border-amber-400'}`}>
                                        €{value}
                                    </button>
                                ))}
                                <button type="button" aria-pressed={selectedAmount === 'custom'}
                                    onClick={() => { setSelectedAmount('custom'); trackSupportAction('ander-bedrag'); requestAnimationFrame(() => amountInput.current?.focus()); }}
                                    className={`min-h-12 rounded-xl border-2 px-3 py-3 text-sm font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${selectedAmount === 'custom' ? 'border-amber-500 bg-white text-amber-800' : 'border-slate-200 bg-white text-slate-700 hover:border-amber-400'}`}>
                                    Ander bedrag
                                </button>
                            </div>
                            {selectedAmount === 'custom' && (
                                <div className="mt-4">
                                    <label htmlFor="support-custom-amount" className="block text-sm font-bold text-slate-800 mb-2">Jouw bedrag in euro</label>
                                    <div className="relative max-w-xs">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true">€</span>
                                        <input ref={amountInput} id="support-custom-amount" type="text" inputMode="decimal" autoComplete="off"
                                            value={customAmount} onChange={event => setCustomAmount(event.target.value)} placeholder="Bijvoorbeeld 15,00"
                                            aria-invalid={invalidAmount} aria-describedby="support-custom-help"
                                            className="w-full min-h-12 rounded-xl border border-slate-300 bg-white py-3 pl-9 pr-4 text-base text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-100" />
                                    </div>
                                    <p id="support-custom-help" className={`mt-2 text-sm ${invalidAmount ? 'text-red-700' : 'text-slate-600'}`}>
                                        {invalidAmount ? 'Vul een positief bedrag in, met maximaal twee cijfers na de komma.' : 'Ook minder dan €5 of meer dan €25 kan. Laat dit leeg als je het bedrag liever in je bankapp kiest.'}
                                    </p>
                                </div>
                            )}

                            <div className="mt-5 border-t border-amber-200 pt-5">
                                <h3 className="font-bold text-slate-900">Steun via een bankoverschrijving</h3>
                                <p className="mt-1 text-sm text-slate-600">Kopieer het rekeningnummer en open je bankapp. Vul de gegevens hieronder in en bevestig daar je overschrijving.</p>
                                <dl className="mt-4 space-y-3 text-sm">
                                    <div><dt className="text-slate-500">Rekeningnummer</dt><dd className="font-mono font-bold text-slate-900 text-base sm:text-lg select-all break-words">{SUPPORT_IBAN}</dd></div>
                                    <div><dt className="text-slate-500">Ontvanger</dt><dd className="font-semibold text-slate-900">{SUPPORT_RECIPIENT}</dd></div>
                                    <div><dt className="text-slate-500">Mededeling</dt><dd className="font-semibold text-slate-900 select-all">{SUPPORT_REFERENCE}</dd></div>
                                    <div><dt className="text-slate-500">Bedrag</dt><dd className="font-bold text-slate-900" aria-live="polite">{invalidAmount ? 'Controleer je bedrag hierboven' : amount === undefined ? 'Kies zelf in je bankapp' : formatSupportAmount(amount)}</dd></div>
                                </dl>
                                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                                    <button type="button" onClick={copyToClipboard}
                                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-700 px-4 py-3 font-bold text-white transition-colors">
                                        {copied ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
                                        {copied ? 'Rekeningnummer gekopieerd' : 'Kopieer rekeningnummer'}
                                    </button>
                                    <button type="button" aria-expanded={qrVisible} aria-controls="support-qr" disabled={invalidAmount || exceedsQrFormat}
                                        onClick={() => { if (!qrVisible) trackSupportAction('qr-bekeken'); setQrVisible(!qrVisible); }}
                                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-3 font-bold text-slate-700 transition-colors disabled:opacity-50">
                                        <QrCode size={18} aria-hidden="true" />{qrVisible ? 'Verberg QR-code' : 'Toon QR-code'}
                                    </button>
                                </div>
                                <p role="status" className={`mt-3 text-sm ${copyError ? 'text-red-700' : 'text-slate-600'}`}>
                                    {copyError ? 'Kopiëren lukt niet in deze browser. Selecteer het rekeningnummer hierboven en kopieer het zelf.' : copied ? 'Plak het rekeningnummer in je bankapp. De overschrijving rond je daar af.' : 'Je bijdrage is volledig vrijwillig. De gids blijft gratis voor iedereen.'}
                                </p>
                                {exceedsQrFormat && <p className="mt-2 text-sm text-slate-600">Dit bedrag past niet in de QR-code. Je kunt het wel rechtstreeks overschrijven.</p>}
                                {qrVisible && !invalidAmount && !exceedsQrFormat && (
                                    <div id="support-qr" className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 text-center">
                                        {qrError ? <p role="status" className="text-sm text-slate-600">De QR-code kon niet worden geladen. Gebruik de betaalgegevens hierboven.</p> : <img key={qrUrl} src={qrUrl} onError={() => setQrError(true)} alt={`QR-code voor een bijdrage${amount === undefined ? ' met een zelf te kiezen bedrag' : ` van ${formatSupportAmount(amount)}`}`} width={224} height={224} className="mx-auto h-56 w-56 max-w-full object-contain" decoding="async" />}
                                        <p className="mt-3 text-sm font-bold text-slate-800">Scan met een bankapp die overschrijvingscodes ondersteunt.</p>
                                        <p className="mt-1 text-xs leading-relaxed text-slate-500">Bekijk je de site op je telefoon? Gebruik de betaalgegevens hierboven. Controleer altijd de ontvanger en het bedrag in je bankapp.</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        <div className="mt-7">
                            <h2 className="text-lg font-black text-slate-900">Wat je mee mogelijk maakt</h2>
                            <ul className="mt-3 grid sm:grid-cols-3 gap-3 text-sm text-slate-600">
                                <li className="rounded-xl bg-slate-50 p-4"><span className="block font-bold text-slate-900 mb-1">Regels blijven nakijken</span>Strandregels en seizoensuren per kustgemeente.</li>
                                <li className="rounded-xl bg-slate-50 p-4"><span className="block font-bold text-slate-900 mb-1">De gids onderhouden</span>Losloopzones en hondvriendelijke adresjes bijhouden.</li>
                                <li className="rounded-xl bg-slate-50 p-4"><span className="block font-bold text-slate-900 mb-1">De site online houden</span>Bijdragen aan hosting, domeinnaam en onderhoud.</li>
                            </ul>
                            <p className="mt-4 text-sm text-slate-600">Een koffie, een zakje hondenkoekjes of een ander bedrag: dankjewel dat je meehelpt. <Heart size={14} className="inline text-rose-500" aria-hidden="true" /></p>
                        </div>
                        <div className="mt-6 border-t border-slate-100 pt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <p className="text-sm text-slate-500">Je helpt ook door de gids met een hondenbaasje te delen.</p>
                            <button type="button" onClick={handleShare} className="inline-flex shrink-0 min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2.5 text-sm transition-colors"><Share2 size={16} aria-hidden="true" />Deel HondAanZee</button>
                        </div>
                        <Link to="/" className="mt-5 inline-flex items-center gap-2 py-2 text-sm font-semibold text-sky-700 hover:underline">Verder op ontdekking <ArrowRight size={15} aria-hidden="true" /></Link>
                    </div>
                </div>

                <div className="mt-12 overflow-hidden rounded-[2rem] border border-sky-100 bg-gradient-to-r from-sky-50 via-white to-emerald-50 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)]">
                    <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1.35fr)_auto] lg:items-center lg:p-8">
                        <div className="max-w-3xl">
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-sky-700">
                                <Users size={14} />
                                Vrijwilligers gezocht
                            </div>
                            <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                                Liever tijd geven dan geld?
                            </h2>
                            <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
                                Je kunt HondAanZee ook helpen zonder donatie. Voor het meldpunt zoeken we per kustgemeente betrokken mensen die af en toe lokaal willen meekijken bij meldingen rond gif, gevaarlijke stoffen en andere risico&apos;s.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 lg:items-end">
                            <Link
                                to="/meldpunt/vrijwilligers"
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-4 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-sky-700"
                            >
                                <Users size={18} />
                                Vrijwilligerspagina bekijken
                            </Link>
                            <p className="text-xs font-medium text-slate-500">
                                Misschien past dit beter bij jou dan een donatie.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Keurmerk Sticker Section */}
                <div id="sticker" className="mt-16 scroll-mt-28">
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

                            {/* Sticker Meter – boven prijs/CTA */}
                            <StickerMeter />

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

                            {/* Betalen: QR + WhatsApp naast elkaar */}
                            <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200 mb-8 max-w-xl mx-auto">
                                <div className="flex flex-col sm:flex-row gap-6 items-center">

                                    {/* QR Code */}
                                    <div className="flex flex-col items-center">
                                        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 mb-3">
                                            <img
                                                src="https://epc-qr.eu/?bname=Kevin%20Bourguignon&iban=BE43738004886701&euro=20.00&info=Sticker%20Hond%20aan%20Zee&zero=blank"
                                                alt="QR Code — €20 sticker"
                                                className="w-40 h-40 sm:w-44 sm:h-44 object-contain"
                                                width={176}
                                                height={176}
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            <QrCode size={14} />
                                            <span>Scan — €20</span>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="hidden sm:block w-px h-32 bg-slate-200" />
                                    <div className="sm:hidden h-px w-full bg-slate-200" />

                                    {/* WhatsApp CTA */}
                                    <div className="flex-1 text-center">
                                        <p className="text-sm text-slate-500 mb-3">
                                            Of neem direct contact op:
                                        </p>
                                        <a
                                            href="https://wa.me/32494816714?text=Hallo%20Kevin%20en%20Jax!%20%F0%9F%90%BE%0A%0AIk%20zou%20graag%20een%20Hondaanzee%20keurmerk%20sticker%20aanvragen%20voor%20mijn%20zaak.%0A%0ANaam%20zaak%3A%20%0AAdres%3A%20"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 text-base"
                                        >
                                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                            <span>Vraag aan via WhatsApp</span>
                                        </a>
                                        <p className="text-xs text-slate-400 mt-3 italic">
                                            Jax 🐕 en ik komen de sticker persoonlijk brengen!
                                        </p>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Support;
