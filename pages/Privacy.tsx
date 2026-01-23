
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { useSEO, SEO_DATA } from '../utils/seo.ts';

const Privacy: React.FC = () => {
  useSEO(SEO_DATA.privacy);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="animate-in fade-in">
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12 sm:py-16 md:py-20 pb-16 sm:pb-20">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-slate-300 font-bold hover:text-sky-400 transition-colors mb-6 sm:mb-8 active:opacity-70 touch-target py-2"
          >
            <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="text-sm sm:text-base">Terug naar home</span>
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="bg-sky-600 p-3 rounded-xl">
              <Shield size={24} />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight">
              Privacybeleid
            </h1>
          </div>
          <p className="text-slate-300 text-sm sm:text-base">
            Laatst bijgewerkt: 22 januari 2026
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 sm:py-16 md:py-20">
        <div className="prose prose-slate max-w-none">
          <section className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">1. Wie zijn wij?</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              HondAanZee.be is een informatieve website die hondeneigenaars helpt bij het vinden van hondvriendelijke locaties aan de Belgische kust. 
              Wij respecteren je privacy en gaan zorgvuldig om met je persoonsgegevens.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">2. Welke gegevens verzamelen wij?</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              HondAanZee.be verzamelt <strong>minimale persoonsgegevens</strong>:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li><strong>Via WhatsApp contact:</strong> Wanneer je ons contacteert via WhatsApp voor zakelijke aanmelding, delen je vrijwillig je telefoonnummer en berichtgegevens. Deze communicatie vindt plaats via WhatsApp en wordt beheerd volgens het privacybeleid van WhatsApp/Meta.</li>
              <li><strong>Technische gegevens:</strong> We kunnen basis technische informatie verzamelen zoals IP-adres, browsertype en bezoekgedrag via webserver logs voor beveiligings- en optimalisatiedoeleinden.</li>
            </ul>
            <p className="text-slate-600 leading-relaxed">
              <strong>Wij verzamelen GEEN accountgegevens, e-mailadressen of andere persoonsgegevens via de website zelf.</strong> Er is geen registratie of login vereist.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">3. Waarvoor gebruiken wij je gegevens?</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              De beperkte gegevens die we verzamelen worden uitsluitend gebruikt voor:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Het beantwoorden van vragen van ondernemers die hun zaak willen aanmelden</li>
              <li>Het verbeteren van de website en gebruikerservaring</li>
              <li>Het waarborgen van de veiligheid en betrouwbaarheid van de website</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">4. Cookies en tracking</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Onze website gebruikt momenteel <strong>geen cookies of externe tracking tools</strong> (zoals Google Analytics). 
              Mochten we in de toekomst cookies willen gebruiken, zullen we je hier expliciet om toestemming vragen via een cookie banner.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Je browser kan basis "session storage" gebruiken voor het lokaal opslaan van filterinstellingen, maar dit wordt niet gedeeld met ons of derden.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">5. Delen wij je gegevens met derden?</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Wij verkopen of verhuren <strong>NOOIT</strong> je persoonsgegevens aan derden.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              We kunnen wel samenwerken met:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li><strong>WhatsApp (Meta):</strong> Wanneer je ons contacteert via WhatsApp, valt deze communicatie onder het privacybeleid van WhatsApp.</li>
              <li><strong>Hosting provider:</strong> Je gegevens kunnen worden opgeslagen op servers van onze hosting provider binnen de EU.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">6. Hoe lang bewaren wij je gegevens?</h2>
            <p className="text-slate-600 leading-relaxed">
              We bewaren persoonsgegevens niet langer dan noodzakelijk. WhatsApp-conversaties worden beheerd volgens jouw instellingen en ons bedrijfsbeleid. 
              Webserver logs worden maximaal 30 dagen bewaard voor beveiligingsdoeleinden.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">7. Je rechten volgens de AVG/GDPR</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Volgens de Europese privacywetgeving (AVG/GDPR) heb je de volgende rechten:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li><strong>Recht op inzage:</strong> Je kan opvragen welke gegevens we van jou hebben</li>
              <li><strong>Recht op correctie:</strong> Je kan onjuiste gegevens laten corrigeren</li>
              <li><strong>Recht op verwijdering:</strong> Je kan vragen om je gegevens te verwijderen</li>
              <li><strong>Recht op beperking:</strong> Je kan de verwerking van je gegevens beperken</li>
              <li><strong>Recht op bezwaar:</strong> Je kan bezwaar maken tegen verwerking</li>
              <li><strong>Recht op overdraagbaarheid:</strong> Je kan je gegevens laten overdragen</li>
            </ul>
            <p className="text-slate-600 leading-relaxed">
              Om deze rechten uit te oefenen, neem contact met ons op via WhatsApp: <a href="https://wa.me/32494816714" className="text-sky-600 font-bold hover:underline">+32 494 81 67 14</a>
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">8. Beveiliging</h2>
            <p className="text-slate-600 leading-relaxed">
              We nemen passende technische en organisatorische maatregelen om je gegevens te beschermen tegen verlies, misbruik of ongeautoriseerde toegang. 
              Onze website maakt gebruik van HTTPS-encryptie voor veilige communicatie.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">9. Wijzigingen in dit privacybeleid</h2>
            <p className="text-slate-600 leading-relaxed">
              We kunnen dit privacybeleid van tijd tot tijd aanpassen. De meest recente versie vind je altijd op deze pagina. 
              Belangrijke wijzigingen zullen we duidelijk communiceren op de website.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">10. Vragen of klachten?</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Heb je vragen over dit privacybeleid of wil je een klacht indienen? Neem contact met ons op:
            </p>
            <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-6">
              <p className="text-slate-900 font-bold mb-2">Contact</p>
              <p className="text-slate-600">WhatsApp: <a href="https://wa.me/32494816714" className="text-sky-600 font-bold hover:underline">+32 494 81 67 14</a></p>
              <p className="text-slate-600 text-sm mt-4">
                Je hebt ook het recht om een klacht in te dienen bij de Belgische privacytoezichthouder:<br />
                <strong>Gegevensbeschermingsautoriteit (GBA)</strong><br />
                <a href="https://www.gegevensbeschermingsautoriteit.be" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">www.gegevensbeschermingsautoriteit.be</a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
