
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Cookie } from 'lucide-react';
import { useSEO, SEO_DATA } from '../utils/seo.ts';

const Cookies: React.FC = () => {
  useSEO(SEO_DATA.cookies);
  
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
              <Cookie size={24} />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight">
              Cookiebeleid
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
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">1. Wat zijn cookies?</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Cookies zijn kleine tekstbestanden die op je apparaat (computer, tablet of smartphone) worden geplaatst wanneer je een website bezoekt. 
              Ze helpen websites om jouw voorkeuren te onthouden en je ervaring te verbeteren.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">2. Welke cookies gebruikt HondAanZee.be?</h2>
            
            <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-6 mb-6">
              <p className="text-sky-900 font-bold text-lg mb-3">✨ Goed nieuws!</p>
              <p className="text-sky-800 leading-relaxed mb-3">
                HondAanZee.be gebruikt momenteel <strong>GEEN cookies of tracking tools</strong>.
              </p>
              <p className="text-sky-800 leading-relaxed">
                We plaatsen geen marketing cookies, analytics cookies of tracking pixels van derden. 
                Je privacy is veilig bij ons!
              </p>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-3">Wat we WEL gebruiken:</h3>
            <ul className="list-disc pl-6 text-slate-600 space-y-3">
              <li>
                <strong>LocalStorage / SessionStorage:</strong> Je browser kan tijdelijk informatie opslaan zoals je filterinstellingen (bijv. welke stad je hebt geselecteerd). 
                Dit blijft lokaal op je apparaat en wordt <strong>niet</strong> naar onze servers gestuurd of gedeeld met derden.
              </li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">3. Toekomstige gebruik van cookies</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              In de toekomst kunnen we besluiten om cookies te gebruiken voor:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li><strong>Analytics:</strong> Om te begrijpen hoe bezoekers onze website gebruiken (bijv. Google Analytics)</li>
              <li><strong>Voorkeuren:</strong> Om je instellingen en voorkeuren te onthouden</li>
              <li><strong>Functionaliteit:</strong> Om bepaalde features beter te laten werken</li>
            </ul>
            <p className="text-slate-600 leading-relaxed">
              <strong>Mochten we cookies gaan gebruiken, dan vragen we eerst expliciet je toestemming via een cookie banner.</strong> 
              Dit cookiebeleid zal dan worden bijgewerkt met meer details.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">4. Cookies van derden</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Externe diensten die we gebruiken kunnen hun eigen cookies plaatsen:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>
                <strong>WhatsApp:</strong> Wanneer je op de WhatsApp-link klikt, word je doorgestuurd naar WhatsApp. 
                WhatsApp (Meta) kan dan cookies plaatsen volgens hun eigen cookiebeleid.
              </li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-4">
              Wij hebben geen controle over cookies van derden. Raadpleeg de privacyverklaringen van deze diensten voor meer informatie.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">5. Hoe beheer je cookies?</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Je kan zelf bepalen of je cookies wilt accepteren of blokkeren via de instellingen van je browser:
            </p>
            <div className="grid gap-4 mb-4">
              <div className="border border-slate-200 rounded-xl p-4">
                <p className="font-bold text-slate-900 mb-2">Google Chrome</p>
                <p className="text-slate-600 text-sm">Instellingen → Privacy en beveiliging → Cookies en andere sitegegevens</p>
              </div>
              <div className="border border-slate-200 rounded-xl p-4">
                <p className="font-bold text-slate-900 mb-2">Firefox</p>
                <p className="text-slate-600 text-sm">Opties → Privacy en beveiliging → Cookies en sitegegevens</p>
              </div>
              <div className="border border-slate-200 rounded-xl p-4">
                <p className="font-bold text-slate-900 mb-2">Safari</p>
                <p className="text-slate-600 text-sm">Voorkeuren → Privacy → Cookies en website-gegevens</p>
              </div>
              <div className="border border-slate-200 rounded-xl p-4">
                <p className="font-bold text-slate-900 mb-2">Microsoft Edge</p>
                <p className="text-slate-600 text-sm">Instellingen → Cookies en sitemachtigingen</p>
              </div>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Let op: Het blokkeren van cookies kan invloed hebben op de functionaliteit van sommige websites.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">6. Wijzigingen in dit cookiebeleid</h2>
            <p className="text-slate-600 leading-relaxed">
              We kunnen dit cookiebeleid van tijd tot tijd aanpassen, bijvoorbeeld wanneer we nieuwe cookies gaan gebruiken. 
              De meest recente versie vind je altijd op deze pagina met de bijbehorende datum bovenaan.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">7. Vragen?</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Heb je vragen over ons cookiebeleid of privacy? Neem contact met ons op:
            </p>
            <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-6">
              <p className="text-slate-900 font-bold mb-2">HondAanZee.be</p>
              <p className="text-slate-600">WhatsApp: <a href="https://wa.me/32494816714" className="text-sky-600 font-bold hover:underline">+32 494 81 67 14</a></p>
              <p className="text-slate-600 text-sm mt-3">
                Meer over je rechten? Bekijk ons <Link to="/privacy" className="text-sky-600 font-bold hover:underline">Privacybeleid</Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Cookies;
