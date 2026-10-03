import React from 'react';
import { Link } from 'react-router-dom';
import { Cookie } from 'lucide-react';
import LegalPage, { LegalContact, type LegalSection } from '../components/LegalPage.tsx';
import { useSEO, SEO_DATA } from '../utils/seo.ts';

const sections: LegalSection[] = [
  { id: 'browseropslag', title: 'Cookies en vergelijkbare browseropslag', content: <>
    <p>Cookies zijn kleine bestanden die een website via je browser bewaart. Daarnaast bestaan localStorage, sessionStorage, een service worker en cache-opslag. Dit beleid beschrijft ook die technieken, omdat er meer op je toestel kan worden opgeslagen dan alleen cookies.</p>
    <p>Hond aan Zee gebruikt geen marketingcookies of advertentietrackers. Voor je account gebruiken we lokale sessieopslag. We meten ook openbare pagina&apos;s met cookie-loze analytics. De afwezigheid van cookies betekent niet dat er geen gegevens worden verwerkt; daarvoor lees je het <Link to="/privacy">privacybeleid</Link>.</p>
  </> },
  { id: 'sessie', title: 'Je accountsessie en eerste favoriet', content: <>
    <p><strong>Accountsessie:</strong> Supabase bewaart de login in localStorage, doorgaans onder een sleutel van de vorm <code className="break-all">sb-…-auth-token</code>. De sessie wordt gebruikt en met de authenticatiedienst uitgewisseld om je ingelogd te houden en toegang tot je eigen gegevens te controleren. Dit is functionele opslag voor de accountdienst die je vraagt, geen uitsluitend lokale voorkeur.</p>
    <p>De sessie kan over meerdere bezoeken heen blijven bestaan en worden vernieuwd. Uitloggen verwijdert de lokale login. Alleen sitegegevens wissen of uitloggen verwijdert niet je account of de gegevens die in je kustgids op de server zijn opgeslagen.</p>
    <p><strong>Eerste favoriet:</strong> als je zonder account een plek wilt bewaren, onthouden we die keuze tijdelijk in localStorage zodat ze na het inloggen kan worden toegevoegd. Een keuze ouder dan 24 uur wordt niet meer gebruikt. Na een geslaagde opslag in je account wordt de tijdelijke keuze gewist. Een verlopen keuze kan fysiek in de browseropslag blijven staan totdat deze wordt gewist of overschreven.</p>
  </> },
  { id: 'voorkeuren', title: 'Voorkeuren en cache', content: <>
    <p>De kaart kan lokaal onthouden dat je de gebruiksuitleg hebt gesloten (<code className="break-all">mapInstructionsDismissed</code>). De steunpagina gebruikt geen lokale donatie- of stickertellers meer. Waarden uit eerdere versies (<code>haz_koekjes</code> en <code className="break-all">haz_sticker_meter</code>) kunnen nog in je browser staan totdat je sitegegevens wist; de site leest of verhoogt ze niet meer.</p>
    <p>Deze lokale voorkeuren hebben geen vaste automatische wisdatum. Ze blijven doorgaans staan totdat jij sitegegevens wist of de site de waarde vervangt. Beheerders kunnen daarnaast lokaal een concept voor een pushbericht bewaren; dat is geen bezoekersprofiel.</p>
    <p>Een service worker kan pagina&apos;s, publieke beelden, lettertypes en programmabestanden cachen om herhaald laden en een beperkte offlineweergave mogelijk te maken. Deze cache bevat websitebestanden; loginantwoorden en persoonlijke gegevens die via Supabase worden opgehaald, worden niet door deze service worker opgeslagen. Cachegegevens verdwijnen bij vervanging van een cacheversie, opruiming door de browser of het wissen van sitegegevens.</p>
  </> },
  { id: 'analytics', title: 'Cookie-loze statistieken', content: <>
    <p>We gebruiken Vercel Web Analytics en eigen geaggregeerde statistieken voor openbare pagina&apos;s en contactacties. Accountpagina&apos;s, beheerpagina&apos;s en gedeelde uitstapjes worden uitgesloten. De metingen gebruiken geen analyticscookies en onze eigen meting maakt geen bezoekerprofiel.</p>
    <p>Via Vercel meten we ook acties rond vrijwillige steun, zoals een steunlink openen, een bedragoptie kiezen, het rekeningnummer kopiëren of de QR-code bekijken. We sturen geen zelf ingevoerd bedrag of donorgegevens mee. Deze acties bevestigen geen betaling.</p>
    <p>De eigen meting verwijdert uurgegevens ouder dan 8 dagen en dagtotalen ouder dan 397 kalenderdagen bij de dagelijkse opschoning. Voor misbruikbeperking wordt tijdelijk een dagelijks wisselende IP-hash verwerkt. We schatten dagelijkse bezoekers met een aparte, dagelijks wisselende hash van IP-adres en browserinformatie, zonder cookies of opslag van een bezoeker-ID in je browser. Dezelfde combinatie telt op een dag één keer voor de website en per bezochte pagina; op een andere dag kan die opnieuw meetellen. Tijdelijke hashes en hun pagina&apos;s van eerdere dagen worden bij de dagelijkse opschoning verwijderd. Alleen de totalen blijven bewaard. Onze eigen meting respecteert Do Not Track en Global Privacy Control. Dit beschrijft onze meting en is geen garantie voor het gedrag van externe websites.</p>
    <p>Vercel licht zijn verwerking toe in het <a href="https://vercel.com/docs/analytics/privacy-policy" target="_blank" rel="noopener noreferrer">privacyoverzicht van Web Analytics</a>. Meer over de gegevens, doeleinden en rechtsgronden staat in het <Link to="/privacy">privacybeleid</Link>.</p>
  </> },
  { id: 'meldingen', title: 'Pushmeldingen en browsertoestemming', content: <>
    <p>Pushmeldingen vragen afzonderlijke browsertoestemming. Je browser en service worker houden een technisch abonnement bij; onze server bewaart de gegevens die nodig zijn voor de aflevering. Dit staat los van de accountsessie en wordt niet automatisch geactiveerd door registratie.</p>
    <p>Meld je af via de meldingenfunctie op de site om het abonnement te beëindigen. Je kunt meldingen ook blokkeren in de site- of notificatie-instellingen van je browser. Alleen lokale sitegegevens wissen kan de serverregistratie laten bestaan tot deze wordt afgemeld of als ongeldig wordt verwijderd. Accountverwijdering beëindigt dit afzonderlijke abonnement niet automatisch.</p>
  </> },
  { id: 'extern', title: 'Externe bronnen en links', content: <>
    <p>Lettertypes van Google Fonts, kaarttegels van OpenStreetMap of CARTO en extern geladen afbeeldingen veroorzaken verzoeken aan die leveranciers. Zij ontvangen daarbij technische gegevens, zoals IP-adres en browserinformatie, ook zonder dat je een externe link aanklikt.</p>
    <p>Als je een link naar bijvoorbeeld een zaak, sociale dienst, routeplanner of WhatsApp opent, gelden daar de eigen regels voor cookies en gegevensverwerking. Onze verklaring dat we geen marketingcookies inzetten, geldt voor onze eigen site en is geen belofte over die externe diensten.</p>
  </> },
  { id: 'beheer', title: 'Je browsergegevens beheren', content: <>
    <p>Via de privacy- of site-instellingen van je browser kun je cookies, lokale opslag en caches voor hondaanzee.be bekijken of wissen. Zoek naar “sitegegevens” of “websitegegevens”. Meldingen en locatietoegang beheer je via de afzonderlijke sitetoestemmingen.</p>
    <p>Wissen kan je uitloggen en lokale voorkeuren of offlinebestanden verwijderen. Het verwijdert geen servergegevens, openbare reviews of je account. Gebruik daarvoor Mijn profiel of stuur een privacyverzoek naar <a href="mailto:info@hondaanzee.be">info@hondaanzee.be</a>. Een browser die alle functionele opslag blokkeert, kan het ingelogd blijven verstoren.</p>
    <p>Als we opslag of tracking toevoegen waarvoor toestemming vereist is, vragen we die voordat we deze activeren en werken we dit beleid bij. De datum bovenaan vermeldt de laatste update.</p>
    <LegalContact />
  </> },
];

const Cookies: React.FC = () => {
  useSEO(SEO_DATA.cookies);
  return <LegalPage updatedAt="2026-10-03" title="Cookiebeleid" icon={Cookie} intro="Wat je browser onthoudt voor je account, voorkeuren, meldingen en het laden van de website."
    summary={<><p>We gebruiken geen marketingcookies. Je login heeft wel functionele browseropslag nodig. Publieke statistieken gebruiken geen analyticscookies.</p><p>Uitloggen, sitegegevens wissen, pushmeldingen uitschakelen en je account verwijderen zijn verschillende acties. Hieronder lees je wat elke actie doet.</p></>} sections={sections} />;
};

export default Cookies;
