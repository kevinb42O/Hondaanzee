import React, { useEffect } from 'react';
import { Heart, MapPin, Clock, Database, Coffee, PawPrint, Mail, MessageCircle, Camera } from 'lucide-react';
import { useSEO, SEO_DATA } from '../utils/seo.ts';

const About: React.FC = () => {
    useSEO(SEO_DATA.about);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-sky-50 to-slate-50">
            <div className="max-w-4xl mx-auto">

                {/* Header Section */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center p-4 bg-sky-100 text-sky-600 rounded-2xl mb-6 shadow-sm">
                        <PawPrint size={40} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                        Over <span className="text-sky-600 relative inline-block">
                            HondAanZee
                            <svg className="absolute -bottom-1 sm:-bottom-2 md:-bottom-3 left-0 w-full h-3 sm:h-4 text-sky-600/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 25 0 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="8" />
                            </svg>
                        </span>
                    </h1>
                    <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
                        De complete gids voor een zorgeloos verblijf met je viervoeter aan de Belgische kust
                    </p>
                </div>

                {/* Hero Image Section */}
                <div className="mb-16 rounded-3xl overflow-hidden shadow-2xl">
                    <img 
                        src="/jaxenikV5.webp" 
                        alt="Kevin en Jax aan zee" 
                        className="w-full h-auto object-contain"
                        width={1200}
                        height={675}
                        loading="eager"
                        decoding="async"
                    />
                </div>

                {/* Story Section */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl shadow-xl overflow-hidden border-2 border-amber-100 mb-8">
                    <div className="p-8 sm:p-12">
                        <div className="flex items-center gap-3 mb-6">
                            <Heart className="text-amber-600" size={28} strokeWidth={2.5} />
                            <h2 className="text-3xl font-black text-slate-900">Het Verhaal</h2>
                        </div>
                        
                        <div className="prose prose-lg prose-slate max-w-none">
                            <p className="text-slate-700 leading-relaxed mb-4">
                                Hoi! Ik ben Kevin, en dit is Jax — mijn 6-jarige Australische Herder en de echte inspiratie achter dit platform.
                            </p>
                            <p className="text-slate-700 leading-relaxed mb-4">
                                Als rasechte kustbewoner dacht ik de weg wel te kennen. Maar telkens opnieuw botste ik op dezelfde vragen: <em>"Mag Jax hier nu los? Is dit strand in de zomer wel toegankelijk? En hoe vermijd ik die absurde boetes?"</em>
                            </p>
                            <p className="text-slate-700 leading-relaxed mb-4">
                                Niets verpest een wandeling sneller dan de twijfel of je ergens wel <strong>mág</strong> lopen. Je wil gewoon van de zee genieten, zonder constant over je schouder te kijken naar de lokale politie of vage verbodsborden te ontcijferen.
                            </p>
                            <p className="text-slate-700 leading-relaxed mb-4">
                                Ik was het beu om urenlang te graven in onduidelijke gemeentewebsites en verouderde PDF's. Als webdeveloper nam ik het heft in eigen handen: ik verzamelde alle info op één centrale plek. Wat begon als een persoonlijk project voor Jax en mezelf, is ondertussen uitgegroeid tot <strong>dé gids voor de hele kust.</strong>
                            </p>
                            <p className="text-slate-700 leading-relaxed mb-4">
                                Vandaag helpt HondAanZee maandelijks duizenden hondeneigenaars de weg te vinden. Zo kun jij zorgeloos op stap, zonder schrik voor boetes of onaangename verrassingen.
                            </p>
                            <p className="text-slate-700 leading-relaxed font-medium text-lg">
                                Zodat je je enkel nog druk hoeft te maken over de zandpoten in de auto. 🐾
                            </p>
                        </div>
                    </div>
                </div>

                {/* Mission Section */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 mb-8">
                    <div className="p-8 sm:p-12">
                        <div className="flex items-center gap-3 mb-6">
                            <MapPin className="text-sky-600" size={28} strokeWidth={2.5} />
                            <h2 className="text-3xl font-black text-slate-900">De Missie</h2>
                        </div>
                        
                        <p className="text-slate-700 text-lg leading-relaxed mb-6">
                            Mijn doel is simpel: <strong>ervoor zorgen dat jij en je hond zonder zorgen kunnen genieten van de Belgische kust.</strong>
                        </p>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="bg-sky-50 p-6 rounded-2xl border border-sky-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="bg-sky-600 p-2 rounded-lg text-white">
                                        <Database size={20} />
                                    </div>
                                    <h3 className="font-bold text-slate-900">Compleet</h3>
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    Alle kuststeden, stranden, losloopzones, hotspots en hondvriendelijke zaken op één plek.
                                </p>
                            </div>

                            <div className="bg-sky-50 p-6 rounded-2xl border border-sky-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="bg-sky-600 p-2 rounded-lg text-white">
                                        <Clock size={20} />
                                    </div>
                                    <h3 className="font-bold text-slate-900">Actueel</h3>
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    Regelmatig geüpdatet met de nieuwste politieverordeningen en seizoensregels.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* How it Works Section */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl shadow-xl overflow-hidden border-2 border-amber-100 mb-8">
                    <div className="p-8 sm:p-12">
                        <div className="flex items-center gap-3 mb-6">
                            <Coffee className="text-amber-600" size={28} strokeWidth={2.5} />
                            <h2 className="text-3xl font-black text-slate-900">Hoe Het Werkt</h2>
                        </div>
                        
                        <div className="prose prose-lg prose-slate max-w-none">
                            <p className="text-slate-700 leading-relaxed mb-4">
                                <strong>Transparantie is belangrijk voor mij.</strong> Alle informatie op HondAanZee komt rechtstreeks uit:
                            </p>
                            <ul className="space-y-2 text-slate-700">
                                <li>📜 Officiële gemeentelijke politieverordeningen</li>
                                <li>🏖️ Websites van kuststeden en toeristische diensten</li>
                                <li>🐾 Persoonlijke bezoeken en verificaties</li>
                                <li>💬 Tips en feedback van andere hondenbezitters</li>
                            </ul>
                            <p className="text-slate-700 leading-relaxed mt-4">
                                <strong>Dit is een passieproject.</strong> Ik ben geen grote organisatie, maar één persoon die in zijn vrije tijd deze site onderhoudt. Dat betekent ook dat het soms wat tijd kan kosten om nieuwe plekken toe te voegen of updates door te voeren – maar ik doe mijn best om alles zo actueel mogelijk te houden!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Privacy & No Corporate BS Section */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-xl overflow-hidden text-white p-8 sm:p-12 mb-8 relative">
                    <div className="absolute top-0 right-0 opacity-5">
                        <PawPrint size={200} strokeWidth={1.5} />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black mb-6">Geen Corporate Bullshit</h2>
                        <div className="prose prose-lg prose-invert max-w-none">
                            <p className="text-slate-200 leading-relaxed mb-4">
                                We houden niet van grote corporate toestanden. HondAanZee is simpel, eerlijk en zonder poespas.
                            </p>
                            <p className="text-slate-200 leading-relaxed mb-6">
                                <strong className="text-white">Dat betekent concreet:</strong>
                            </p>
                            <div className="grid sm:grid-cols-2 gap-4 not-prose">
                                <div className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/20">
                                    <div className="text-2xl mb-2">🚫🍪</div>
                                    <h3 className="font-bold text-white mb-2">Geen Cookies</h3>
                                    <p className="text-slate-300 text-sm leading-relaxed">
                                        Geen tracking cookies, geen analytics die je volgen. Gewoon een website die doet wat hij moet doen.
                                    </p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/20">
                                    <div className="text-2xl mb-2">🔒</div>
                                    <h3 className="font-bold text-white mb-2">Jouw Privacy</h3>
                                    <p className="text-slate-300 text-sm leading-relaxed">
                                        We verzamelen geen persoonlijke data. Wat je bekijkt blijft tussen jou en je browser.
                                    </p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/20">
                                    <div className="text-2xl mb-2">📱</div>
                                    <h3 className="font-bold text-white mb-2">Installeer als App</h3>
                                    <p className="text-slate-300 text-sm leading-relaxed">
                                        Je kan deze site installeren als app op je telefoon! Klik in je browser op "Toevoegen aan beginscherm" (iOS) of "Installeren" (Android).
                                    </p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/20">
                                    <div className="text-2xl mb-2">💙</div>
                                    <h3 className="font-bold text-white mb-2">Simpel & Eerlijk</h3>
                                    <p className="text-slate-300 text-sm leading-relaxed">
                                        Geen verborgen agenda's. Gewoon nuttige info voor mensen die van honden en de zee houden.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Support Section */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl shadow-xl overflow-hidden border-2 border-amber-100 p-8 sm:p-12 relative">
                    <div className="absolute top-0 right-0 opacity-5">
                        <PawPrint size={200} strokeWidth={1.5} className="text-amber-600" />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black mb-4 text-slate-900">Steun Het Project</h2>
                        <p className="text-slate-700 text-lg leading-relaxed mb-4">
                            HondAanZee is een volledig gratis platform dat Jax en ik met veel passie onderhouden. We verzamelen alle informatie over hondvriendelijke plekken aan de Belgische kust, houden politieverordeningen bij, en zorgen dat jij en je hond altijd weten waar jullie welkom zijn.
                        </p>
                        <p className="text-slate-700 text-lg leading-relaxed mb-6">
                            Dit kost echter geld (hosting, domeinnaam, onderhoud) en vooral héél veel tijd en moeite. Van het updaten van seizoensregels tot het persoonlijk verifiëren van nieuwe hotspots – het is een uit de hand gelopen hobbyproject waar we ons hart en ziel in steken om alle baasjes en hun viervoeters een zorgeloos verblijf te bezorgen aan onze mooie Belgische kust. ❤️
                        </p>
                        <p className="text-slate-900 font-bold text-lg leading-relaxed mb-8 text-center">
                            Vind je deze gratis kustgids voor honden nuttig? Trakteer Jax dan op een symbolisch hondenkoekje! 🐾
                        </p>
                        <div className="flex justify-center">
                            <a 
                                href="/steun-ons"
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-4 rounded-2xl font-black text-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg active:scale-95"
                            >
                                Trakteer een koekje
                                <Heart size={20} className="fill-white" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="mt-8 bg-gradient-to-br from-pink-500 via-purple-500 to-purple-600 rounded-3xl shadow-xl overflow-hidden text-white p-8 sm:p-12 relative">
                    <div className="absolute top-0 right-0 opacity-10">
                        <Camera size={180} strokeWidth={1.5} />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black mb-4 text-center">Volg Ons & Deel Je Avonturen! 📸</h2>
                        <p className="text-white/90 text-lg text-center mb-8 max-w-2xl mx-auto leading-relaxed">
                            Tag ons op Instagram <strong>@hondaanzee</strong> met jullie mooiste strandmomenten! We delen graag jullie foto's en verhalen. 🐾
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
                            <a
                                href="https://www.instagram.com/hondaanzee/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 bg-white text-purple-600 hover:bg-purple-50 px-8 py-4 rounded-2xl transition-all group w-full sm:w-auto justify-center shadow-xl font-black text-lg"
                            >
                                <Camera size={24} className="group-hover:scale-110 transition-transform" />
                                <span>Volg @hondaanzee</span>
                            </a>
                            <a
                                href={"https://wa.me/32494816714?text=" + encodeURIComponent("Hallo Jax & Kevin! 👋\n\nIk heb net jullie \"Over ons\" pagina gelezen en wou even hallo zeggen!\n\nGroetjes! 🐾")}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 bg-white text-slate-900 hover:bg-slate-50 border-2 border-slate-200 px-8 py-4 rounded-2xl transition-all group w-full sm:w-auto justify-center shadow-xl font-black text-lg"
                            >
                                <MessageCircle size={24} className="text-green-500 group-hover:scale-110 transition-transform" />
                                <span>Chat via WhatsApp</span>
                            </a>
                        </div>
                        <div className="flex justify-center mb-6">
                            <a
                                href="mailto:info@hondaanzee.be"
                                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/30 px-6 py-4 rounded-2xl transition-colors group w-full sm:w-auto justify-center font-bold"
                            >
                                <Mail size={20} className="group-hover:scale-110 transition-transform" />
                                <span>info@hondaanzee.be</span>
                            </a>
                        </div>
                        <p className="text-white/80 text-center text-sm leading-relaxed">
                            💌 Stuur ons je mooiste strandfoto's, tips voor nieuwe plekken, of gewoon een leuk verhaal!<br />
                            🐶 Samen maken we HondAanZee nóg beter voor alle viervoeters aan de kust.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default About;
