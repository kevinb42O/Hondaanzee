import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUpRight, Camera, Heart, MessageCircle } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb.tsx';
import { useSEO, SEO_DATA } from '../utils/seo.ts';
import './About.css';

const WHATSAPP_URL = `https://wa.me/32494816714?text=${encodeURIComponent('Dag Kevin en Jax! Ik heb een vraag of een tip voor HondAanZee.')}`;

const About: React.FC = () => {
  useSEO(SEO_DATA.about);

  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo(0, 0);
      return;
    }
    let cancelled = false;
    // Align after loading and font layout, including the browser's scroll restoration.
    const alignHash = () => {
      document.fonts.ready.then(() => requestAnimationFrame(() => requestAnimationFrame(() => {
        if (!cancelled) document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: 'auto' });
      })));
    };
    if (document.readyState === 'complete') alignHash();
    else window.addEventListener('load', alignHash, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener('load', alignHash);
    };
  }, []);

  return (
    <div className="about-page">
      <header className="about-hero">
        <div className="about-shell">
          <Breadcrumb className="about-breadcrumb" items={[{ label: 'Home', to: '/' }, { label: 'Over ons' }]} />
          <div className="about-hero__layout">
            <div className="about-hero__copy">
              <p className="about-eyebrow">De mens en de hond achter HondAanZee</p>
              <h1><span>Eén developer.</span><em>Eén hond.</em><span>Een kust vol plannen.</span></h1>
              <p className="about-hero__intro">
                Hoi, ik ben Kevin. <strong>Software developer, technologist en kustbewoner.</strong> Ik bouw graag dingen die het leven eenvoudiger maken. Naast mij staat Jax, mijn Australische Herder en de reden waarom dit project bestaat.
              </p>
              <p className="about-hero__aside">Ik bouw de website. Hij herinnert me eraan dat we ook nog naar buiten moeten.</p>
              <div className="about-hero__actions">
                <a href="#ons-verhaal" className="about-button">Lees ons verhaal <ArrowDown size={17} aria-hidden="true" /></a>
                <a href="#contact" className="about-text-link">Zeg eens hallo <ArrowUpRight size={17} aria-hidden="true" /></a>
              </div>
            </div>
            <figure className="about-hero__photo">
              <img src="/jaxenikV5.webp" alt="Kevin en zijn Australische Herder Jax samen op het strand." width={800} height={1108} sizes="(min-width: 1400px) 480px, (min-width: 900px) 38vw, calc(100vw - 3rem)" fetchPriority="high" decoding="async" />
              <figcaption><span>Kevin &amp; Jax</span> Het hele team, inclusief zandpoten.</figcaption>
            </figure>
          </div>
          <div className="about-reach" aria-label="Over HondAanZee">
            <p><strong>Duizenden hondeneigenaars</strong><span>vinden hier maandelijks de weg</span></p>
            <p><strong>Van De Panne tot Knokke-Heist</strong><span>fijne dagen langs de hele Belgische kust</span></p>
            <p><strong>Persoonlijk gemaakt</strong><span>door Kevin, met Jax als vaste compagnon</span></p>
          </div>
        </div>
      </header>

      <section id="ons-verhaal" className="about-story about-shell" aria-labelledby="about-story-title">
        <div className="about-story__heading">
          <p className="about-eyebrow">Van strandwandeling tot softwareproject</p>
          <h2 id="about-story-title">Dit moest<br /><em>eenvoudiger kunnen.</em></h2>
          <p className="about-story__side-note">We vertrokken voor een wandeling.<br />Ik kwam terug met een idee voor een website.</p>
        </div>
        <div className="about-story__copy">
          <p>Als kustbewoner dacht ik de weg wel te kennen. Tot ik met Jax telkens weer op dezelfde vragen botste: mag hij hier los? Is dit strand in de zomer toegankelijk? En waar kunnen we na de wandeling samen iets gaan drinken?</p>
          <p>Ik was het beu om daarvoor gemeentewebsites af te schuimen en PDF’s uit te pluizen. Je wilt een wandeling plannen, geen avondopleiding gemeentereglementen volgen.</p>
          <p>Dus deed ik wat ik als software developer en technologist graag doe: een praktisch probleem uitzoeken en er iets bruikbaars voor bouwen. Ik bracht strandregels, losloopzones en hondvriendelijke adressen samen in één gids. Wat begon als een project voor Jax en mezelf, groeide uit tot HondAanZee.</p>
          <p>Vandaag helpt HondAanZee <strong>maandelijks duizenden hondeneigenaars</strong> de weg te vinden aan de Belgische kust. Zodat je je vooral nog druk hoeft te maken over de zandpoten in de auto.</p>
        </div>
      </section>

      <section className="about-method" aria-labelledby="about-method-title">
        <div className="about-shell">
          <div className="about-method__heading">
            <div>
              <p className="about-eyebrow">Met zorg gebouwd. Met de voeten in het zand.</p>
              <h2 id="about-method-title">Een fijne wandeling begint<br /><em>met informatie die klopt.</em></h2>
            </div>
            <p>Achter de gids zitten brononderzoek, persoonlijke bezoeken en heel wat onderhoud. Mijn technische achtergrond helpt me om die informatie overzichtelijk en bruikbaar te maken.</p>
          </div>
          <ol className="about-method__steps">
            <li>
              <span className="about-method__number" aria-hidden="true">01</span>
              <h3>Eerst de bronnen</h3>
              <p>Voor strandregels vertrek ik van gemeentelijke bronnen en politieverordeningen. In de strandgidsen vind je de bronnen en de datum waarop we ze controleerden.</p>
            </li>
            <li>
              <span className="about-method__number" aria-hidden="true">02</span>
              <h3>Ook zelf op pad</h3>
              <p>Jax en ik leren hondvriendelijke plekken persoonlijk kennen. Zo weten we wat baasjes en hun honden er mogen verwachten.</p>
            </li>
            <li>
              <span className="about-method__number" aria-hidden="true">03</span>
              <h3>Blijven verbeteren</h3>
              <p>Regels veranderen, nieuwe plekken komen erbij en bezoekers sturen tips. Ik werk de gids bij en blijf sleutelen aan de website.</p>
            </li>
          </ol>
          <p className="about-method__note">Zie je iets dat niet meer klopt? <a href="#contact">Laat het ons weten.</a> Ook een zorgvuldig gebouwde gids kan een update gebruiken.</p>
        </div>
      </section>

      <section className="about-companion about-shell" aria-labelledby="about-companion-title">
        <div>
          <p className="about-eyebrow">Onze taakverdeling</p>
          <h2 id="about-companion-title">Ik schrijf de code.<br /><em>Jax doet het veldwerk.</em></h2>
        </div>
        <div className="about-companion__copy">
          <p>Ik onderzoek, bouw en onderhoud HondAanZee. Jax zorgt dat we de kust ook in het echt blijven ontdekken. Hij beoordeelt nieuwe plekken op ontvangst, waterbakjes en de beschikbaarheid van koekjes.</p>
          <p className="about-companion__joke">Vooral dat laatste maakt zijn onafhankelijkheid als recensent soms discutabel.</p>
          <p>Dit blijft een persoonlijk project dat ik in mijn vrije tijd onderhoud. Een nieuwe plek toevoegen of een wijziging nakijken kan dus even duren. Maar er wordt met aandacht aan gewerkt, tussen de wandelingen door.</p>
        </div>
      </section>

      <section className="about-closing" aria-label="Steun en contact">
        <div className="about-shell about-closing__layout">
          <div className="about-support">
            <p className="about-eyebrow">Help de gids op weg</p>
            <h2>Een uit de hand<br /><em>gelopen hobbyproject.</em></h2>
            <p>HondAanZee is gratis te gebruiken. De hosting, domeinnaam en het onderhoud kosten geld, en het uitzoeken en bijwerken van alle informatie vraagt tijd.</p>
            <p>Vind je de gids nuttig? Met een bijdrage help je me om hem te onderhouden en verder uit te bouwen. Het hondenkoekje is symbolisch. Jax betreurt dat laatste.</p>
            <Link to="/steun-ons" className="about-button">Trakteer een koekje <Heart size={17} aria-hidden="true" /></Link>
          </div>
          <div id="contact" className="about-contact" aria-labelledby="about-contact-title">
            <p className="about-eyebrow">We horen graag van je</p>
            <h2 id="about-contact-title">Een tip, een vraag,<br /><em>een goed verhaal?</em></h2>
            <p>Een fijn adresje ontdekt? Een strandregel die veranderd is? Of gewoon een mooie foto van jullie dag aan zee? Stuur ze gerust door.</p>
            <a href="mailto:info@hondaanzee.be" className="about-contact__email">info@hondaanzee.be <ArrowUpRight size={19} aria-hidden="true" /></a>
            <div className="about-contact__links">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} aria-hidden="true" /> WhatsApp <ArrowUpRight size={15} aria-hidden="true" /></a>
              <a href="https://www.instagram.com/hondaanzee/" target="_blank" rel="noopener noreferrer"><Camera size={17} aria-hidden="true" /> Instagram <ArrowUpRight size={15} aria-hidden="true" /></a>
              <a href="https://www.facebook.com/hondaanzee" target="_blank" rel="noopener noreferrer">Facebook <ArrowUpRight size={15} aria-hidden="true" /></a>
            </div>
            <p className="about-contact__signoff">Groetjes van Kevin &amp; Jax.<br />Eén van ons heeft waarschijnlijk nog zand tussen de tenen.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
