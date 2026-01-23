
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { useSEO, SEO_DATA } from '../utils/seo.ts';

const Terms: React.FC = () => {
  useSEO(SEO_DATA.terms);
  
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
              <FileText size={24} />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight">
              Algemene Voorwaarden
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
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">1. Algemeen</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Deze algemene voorwaarden zijn van toepassing op het gebruik van de website <strong>HondAanZee.be</strong> en alle informatie, diensten en functionaliteiten die via deze website worden aangeboden.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Door gebruik te maken van onze website, ga je akkoord met deze voorwaarden. Lees ze dus aandachtig door.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">2. Diensten en informatie</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              HondAanZee.be biedt:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li>Informatie over hondvriendelijke stranden, regels en voorschriften aan de Belgische kust</li>
              <li>Een overzicht van losloopzones en hondenweides</li>
              <li>Een lijst van hondvriendelijke hotspots (cafés, restaurants, hotels)</li>
              <li>Een platform voor ondernemers om hun hondvriendelijke zaak te promoten</li>
            </ul>
            <p className="text-slate-600 leading-relaxed">
              Al deze diensten zijn <strong>gratis</strong> toegankelijk voor bezoekers.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">3. Juistheid van de informatie</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Wij streven ernaar om de meest actuele en correcte informatie te verstrekken over strandregels, toegankelijkheid en hondvriendelijke locaties. 
              <strong> Echter, regels kunnen veranderen en fouten kunnen voorkomen.</strong>
            </p>
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 mb-4">
              <p className="text-amber-900 font-bold mb-2">⚠️ Belangrijke disclaimer</p>
              <p className="text-amber-800 leading-relaxed">
                Wij zijn <strong>niet aansprakelijk</strong> voor eventuele boetes, schade of andere gevolgen die voortvloeien uit het gebruik van de informatie op deze website. 
                Controleer altijd de lokale signalisatie en regelgeving ter plaatse. Bij twijfel, neem contact op met de plaatselijke overheid of politie.
              </p>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Heb je een fout ontdekt? Laat het ons weten via WhatsApp zodat we de informatie kunnen updaten.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">4. Intellectueel eigendom</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Alle inhoud op HondAanZee.be, inclusief teksten, afbeeldingen, logo's, en de structuur van de website, is beschermd door auteursrecht en andere intellectuele eigendomsrechten.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Je mag de informatie op deze website gebruiken voor <strong>persoonlijk, niet-commercieel gebruik</strong>. 
              Het kopiëren, reproduceren of hergebruiken van content zonder schriftelijke toestemming is niet toegestaan.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">5. Gebruikersgedrag</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Bij het gebruik van onze website verbind je je ertoe om:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li>De website niet te gebruiken voor illegale doeleinden</li>
              <li>Geen schadelijke of kwaadaardige code te uploaden of te verspreiden</li>
              <li>Geen acties te ondernemen die de werking van de website kunnen verstoren</li>
              <li>Respectvol om te gaan met anderen en geen beledigende of discriminerende inhoud te delen</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">6. Links naar externe websites</h2>
            <p className="text-slate-600 leading-relaxed">
              Onze website kan links bevatten naar externe websites (zoals WhatsApp of gemeentelijke websites). 
              Deze links worden aangeboden voor jouw gemak, maar wij hebben <strong>geen controle</strong> over de inhoud van deze externe sites en zijn daar ook niet verantwoordelijk voor. 
              Het gebruik van externe websites gebeurt op eigen risico.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">7. Ondernemers en hotspot-listings</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Ondernemers kunnen hun hondvriendelijke zaak gratis laten vermelden op HondAanZee.be. Voorwaarden:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
              <li>De verstrekte informatie moet correct en actueel zijn</li>
              <li>De zaak moet daadwerkelijk hondvriendelijk zijn (honden welkom, faciliteiten voorzien)</li>
              <li>Wij behouden ons het recht voor om listings te weigeren of te verwijderen zonder opgave van reden</li>
              <li>Er is geen garantie op zichtbaarheid of ranking binnen de website</li>
            </ul>
            <p className="text-slate-600 leading-relaxed">
              Geïnteresseerd? Neem contact op via WhatsApp: <a href="https://wa.me/32494816714" className="text-sky-600 font-bold hover:underline">+32 494 81 67 14</a>
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">8. Aansprakelijkheid</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              HondAanZee.be streeft naar een betrouwbare en veilige website, maar wij kunnen niet garanderen dat de website te allen tijde foutloos en ononderbroken beschikbaar is.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              <strong>Wij zijn niet aansprakelijk voor:</strong>
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Directe of indirecte schade als gevolg van het gebruik van de website</li>
              <li>Onjuistheden in de verstrekte informatie</li>
              <li>Technische storingen of onderbrekingen</li>
              <li>Acties van hondeneigenaars of ondernemers die via onze website contact maken</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">9. Wijzigingen</h2>
            <p className="text-slate-600 leading-relaxed">
              Wij behouden ons het recht voor om deze algemene voorwaarden op elk moment te wijzigen. 
              De meest recente versie vind je altijd op deze pagina. Het is jouw verantwoordelijkheid om regelmatig deze voorwaarden te controleren.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">10. Toepasselijk recht</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Op deze algemene voorwaarden is het <strong>Belgisch recht</strong> van toepassing. 
              Eventuele geschillen worden voorgelegd aan de bevoegde rechtbanken in België.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">11. Contact</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Heb je vragen over deze algemene voorwaarden? Neem contact met ons op:
            </p>
            <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-6">
              <p className="text-slate-900 font-bold mb-2">HondAanZee.be</p>
              <p className="text-slate-600">WhatsApp: <a href="https://wa.me/32494816714" className="text-sky-600 font-bold hover:underline">+32 494 81 67 14</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
