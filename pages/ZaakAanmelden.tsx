import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUpRight, Check, Mail, MapPin, MessageCircle, PawPrint } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb.tsx';
import { useSEO } from '../utils/seo.ts';
import './ZaakAanmelden.css';

const COMMUNITIES = ['De Panne', 'Koksijde', 'Nieuwpoort', 'Middelkerke', 'Oostende', 'Bredene', 'De Haan', 'Wenduine', 'Blankenberge', 'Zeebrugge', 'Knokke-Heist'];
const EMPTY_DETAILS = { name: '', community: '', address: '', welcome: '' };

const ZaakAanmelden: React.FC = () => {
  useSEO({
    title: 'Gratis je zaak aanmelden | HondAanZee.be',
    description: 'Zijn honden welkom in jouw zaak aan de Belgische kust? Meld je gratis aan. Vertel ons over je zaak, maak kennis met Kevin en Jax en krijg een plek in onze gids.',
    canonical: 'https://hondaanzee.be/zaak-aanmelden',
  });

  const [details, setDetails] = useState(EMPTY_DETAILS);
  const formRef = useRef<HTMLFormElement>(null);
  const message = [
    'Dag Kevin en Jax!',
    '',
    'Ik wil mijn hondvriendelijke zaak graag aanmelden op HondAanZee.be.',
    '',
    `Naam zaak: ${details.name.trim()}`,
    `Gemeente: ${details.community}`,
    `Adres of website: ${details.address.trim() || 'Nog niet ingevuld'}`,
    '',
    'Zo zijn honden welkom bij ons:',
    details.welcome.trim(),
    '',
    'Graag hoor ik van jullie. Bedankt!',
  ].join('\n');
  const mailUrl = `mailto:info@hondaanzee.be?subject=${encodeURIComponent('Zaak aanmelden op HondAanZee.be')}&body=${encodeURIComponent(message)}`;
  const whatsappUrl = `https://wa.me/32494816714?text=${encodeURIComponent(message)}`;

  const validateMessage = (event: React.MouseEvent<HTMLAnchorElement>) => {
    formRef.current?.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input[required], textarea[required]').forEach(field => {
      field.setCustomValidity(field.value.trim() ? '' : 'Vul dit veld in.');
    });
    if (!formRef.current?.reportValidity()) event.preventDefault();
  };
  const updateDetails = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    event.target.setCustomValidity('');
    setDetails(current => ({ ...current, [event.target.name]: event.target.value }));
  };

  useEffect(() => {
    // Preserve direct links to the form; the shared hash scroller handles them.
    if (!window.location.hash) window.scrollTo(0, 0);
  }, []);

  return (
    <div className="business-page">
      <header className="business-hero">
        <div className="business-shell">
          <Breadcrumb className="business-breadcrumb" items={[{ label: 'Home', to: '/' }, { label: 'Zaak aanmelden' }]} />
          <div className="business-hero__layout">
            <div className="business-hero__copy">
              <p className="business-eyebrow">Voor hondvriendelijke zaken aan de kust</p>
              <h1>Bij jou zijn<br /><em>honden welkom.</em><br />Laat het zien.</h1>
              <p className="business-hero__description">
                Een koffie met zand aan de poten. Samen uit eten. Een fijn adresje om te blijven slapen. Is jouw zaak zo’n plek? Dan hoort ze thuis op HondAanZee.
              </p>
              <div className="business-hero__actions">
                <a className="business-button" href="#aanmelden">Meld je zaak gratis aan <ArrowUpRight size={19} aria-hidden="true" /></a>
                <a className="business-text-link" href="#hoe-werkt-het">Hoe werkt het? <ArrowDown size={16} aria-hidden="true" /></a>
              </div>
              <p className="business-hero__note"><Check size={16} aria-hidden="true" /> Een gratis vermelding. Een persoonlijk contact.</p>
            </div>
            <figure className="business-hero__photo">
              <img
                src="/images/heroes/hotspots-1024.webp"
                srcSet="/images/heroes/hotspots-480.webp 480w, /images/heroes/hotspots-800.webp 800w, /images/heroes/hotspots-1024.webp 1024w"
                sizes="(min-width: 1400px) 590px, (min-width: 900px) 43vw, calc(100vw - 3rem)"
                width={1024}
                height={650}
                alt="Een hond aan de tafel van een café, met een gebakje naast zich."
                fetchPriority="high"
                decoding="async"
              />
              <figcaption><PawPrint size={18} aria-hidden="true" /><span>Voor plekken waar ook de hond erbij hoort.</span></figcaption>
            </figure>
          </div>
          <ul className="business-qualities" aria-label="Over je vermelding">
            <li><Check size={18} aria-hidden="true" /><span>Gratis in onze gids</span></li>
            <li><PawPrint size={18} aria-hidden="true" /><span>Kevin &amp; Jax komen langs</span></li>
            <li><MapPin size={18} aria-hidden="true" /><span>Van De Panne tot Knokke-Heist</span></li>
          </ul>
        </div>
      </header>

      <section id="aanmelden" className="business-registration" aria-labelledby="business-registration-title">
        <div className="business-shell business-registration__layout">
          <div className="business-registration__intro">
            <p className="business-eyebrow">Jouw zaak in de gids</p>
            <h2 id="business-registration-title">Vertel ons<br /><em>over jouw zaak.</em></h2>
            <p>Een paar gegevens zijn genoeg om kennis te maken. Jij vult ze in, wij zetten ze klaar in een bericht.</p>
            <p className="business-registration__explanation">Kies daarna e-mail of WhatsApp. Daar kun je je bericht nog aanpassen, foto’s toevoegen en zelf versturen.</p>
            <div className="business-registration__direct">
              <span>Liever meteen een mailtje?</span>
              <a href="mailto:info@hondaanzee.be">info@hondaanzee.be <ArrowUpRight size={15} aria-hidden="true" /></a>
            </div>
          </div>
          <form ref={formRef} className="business-form" onSubmit={event => event.preventDefault()} aria-label="Gegevens voor je aanmeldbericht">
            <div className="business-form__heading"><h3>Even voorstellen</h3><span>Velden met * zijn verplicht</span></div>
            <div className="business-form__row">
              <div className="business-field">
                <label htmlFor="business-name">Naam van je zaak <span aria-hidden="true">*</span></label>
                <input id="business-name" name="name" autoComplete="organization" required maxLength={120} value={details.name} onChange={updateDetails} placeholder="Hoe heet jouw zaak?" />
              </div>
              <div className="business-field">
                <label htmlFor="business-community">Gemeente <span aria-hidden="true">*</span></label>
                <select id="business-community" name="community" autoComplete="address-level2" required value={details.community} onChange={updateDetails}>
                  <option value="" disabled>Kies je kustgemeente</option>
                  {COMMUNITIES.map(community => <option key={community} value={community}>{community}</option>)}
                </select>
              </div>
            </div>
            <div className="business-field">
              <label htmlFor="business-address">Adres of website <span className="business-field__optional">optioneel</span></label>
              <input id="business-address" name="address" maxLength={250} value={details.address} onChange={updateDetails} placeholder="Waar kunnen we je vinden?" />
            </div>
            <div className="business-field">
              <label htmlFor="business-welcome">Hoe zijn honden welkom bij jou? <span aria-hidden="true">*</span></label>
              <textarea id="business-welcome" name="welcome" required maxLength={1500} rows={4} value={details.welcome} onChange={updateDetails} aria-describedby="business-welcome-hint" placeholder="Vertel ons kort wat kan en wat handig is om te weten." />
              <p id="business-welcome-hint">Bijvoorbeeld: binnen of op het terras, waterbakjes, voorzieningen of afspraken voor bezoekers met een hond.</p>
            </div>
            <div className="business-form__send">
              <p>Open je ingevulde bericht in:</p>
              <div className="business-form__actions">
                <a href={mailUrl} onClick={validateMessage} className="business-button"><Mail size={18} aria-hidden="true" /> E-mail <ArrowUpRight size={17} aria-hidden="true" /></a>
                <a href={whatsappUrl} onClick={validateMessage} target="_blank" rel="noopener noreferrer" className="business-button business-button--outline"><MessageCircle size={18} aria-hidden="true" /> WhatsApp <ArrowUpRight size={17} aria-hidden="true" /></a>
              </div>
              <p className="business-form__privacy">Deze pagina bewaart je invoer niet. Je opent een concept in je mailapp of WhatsApp en verstuurt het daar zelf. <Link to="/privacy">Privacybeleid</Link></p>
              <noscript><p>Voor het overnemen van je gegevens is JavaScript nodig. Mail je zaaknaam, gemeente en uitleg rechtstreeks naar info@hondaanzee.be.</p></noscript>
            </div>
          </form>
        </div>
      </section>

      <section id="hoe-werkt-het" className="business-story business-shell" aria-labelledby="business-story-title">
        <div className="business-story__intro">
          <p className="business-eyebrow">Klein project. Persoonlijk contact.</p>
          <h2 id="business-story-title">Aangenaam.<br /><em>Wij zijn Kevin &amp; Jax.</em></h2>
          <p>We zoeken fijne adressen waar honden écht welkom zijn. Een waterbakje, een plekje op het terras of een warm onthaal: vertel ons hoe het bij jou werkt.</p>
          <div className="business-story__portrait">
            <img src="/jaxenikV5.webp" alt="Kevin en zijn hond Jax op het strand." width={800} height={1108} loading="lazy" decoding="async" />
            <div>
              <p>Na je aanmelding komen Jax en ik zelf langs. Zo leren we jouw zaak kennen en weten we welke plek we aan andere baasjes aanraden.</p>
              <span>Kevin, de mens achter HondAanZee</span>
            </div>
          </div>
        </div>
        <ol className="business-steps" aria-label="Van aanmelding tot vermelding">
          <li><span className="business-steps__number" aria-hidden="true">01</span><div><h3>Vertel ons over je zaak</h3><p>Vul de basisgegevens in en stuur je bericht via e-mail of WhatsApp. Foto’s mag je in je bericht toevoegen.</p></div></li>
          <li><span className="business-steps__number" aria-hidden="true">02</span><div><h3>We maken kennis</h3><p>We nemen contact op en komen persoonlijk langs met Jax. Samen bekijken we wat bezoekers met hun hond bij jou mogen verwachten.</p></div></li>
          <li><span className="business-steps__number" aria-hidden="true">03</span><div><h3>Een plekje in de gids</h3><p>Is je zaak hondvriendelijk? Dan maken we een gratis vermelding met de praktische info die baasjes nodig hebben.</p></div></li>
        </ol>
      </section>

      <section className="business-extra business-shell" aria-labelledby="business-extra-title">
        <div className="business-sticker">
          <img src="/sticker.webp" alt="De HondAanZee-sticker op het raam van een zaak." width={600} height={400} loading="lazy" decoding="async" />
          <div><p className="business-eyebrow">Ook zichtbaar aan je deur</p><h2 id="business-extra-title">Een klein teken.<br /><em>Een warm welkom.</em></h2><p>Wil je aan je raam laten zien dat honden welkom zijn? Je kunt ook een HondAanZee-sticker aanvragen. Je vermelding in de gids is altijd gratis, ook zonder sticker.</p><Link className="business-text-link" to="/steun-ons#sticker">Meer over de sticker <ArrowUpRight size={17} aria-hidden="true" /></Link></div>
        </div>
        <div className="business-faq">
          <h3>Goed om te weten</h3>
          <details><summary>Welke zaken kunnen zich aanmelden?</summary><p>Hondvriendelijke cafés, restaurants, logies, winkels en diensten aan de Belgische kust. Honden hoeven niet overal binnen te mogen: vertel duidelijk waar ze welkom zijn en welke afspraken gelden.</p></details>
          <details><summary>Wat kost een vermelding?</summary><p>Een vermelding op HondAanZee.be is gratis. Een sticker is optioneel en staat los van je aanmelding.</p></details>
          <details><summary>Mijn zaak staat al in de gids. Wat nu?</summary><p>Stuur ons de naam van je zaak en wat je wilt aanpassen via <a href="mailto:info@hondaanzee.be?subject=Gegevens%20van%20mijn%20zaak%20aanpassen">e-mail</a> of <a href="https://wa.me/32494816714" target="_blank" rel="noopener noreferrer">WhatsApp</a>. Dan kunnen we je bestaande vermelding bijwerken.</p></details>
        </div>
      </section>
    </div>
  );
};

export default ZaakAanmelden;
