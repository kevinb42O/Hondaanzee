import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import LegalPage, { LegalContact, type LegalSection } from '../components/LegalPage.tsx';
import { useSEO, SEO_DATA } from '../utils/seo.ts';

const sections: LegalSection[] = [
  { id: 'verantwoordelijke', title: 'Wie is verantwoordelijk?', content: <>
    <p>Hond aan Zee helpt je hondvriendelijke plekken, strandregels en uitstapjes aan de Belgische kust te vinden. Kevin Bourguignon is de verwerkingsverantwoordelijke voor de persoonsgegevens die Hond aan Zee voor deze dienstverlening verwerkt.</p>
    <LegalContact />
    <p>Dit beleid geldt voor de openbare website, Mijn Hond aan Zee, reviews, het meldpunt en onze eigen communicatie. Externe websites en diensten hebben daarnaast hun eigen privacybeleid.</p>
  </> },
  { id: 'account', title: 'Je account en persoonlijke kustgids', content: <>
    <p>Een account is optioneel. De openbare gids, regels, reviews en het meldpunt blijven zonder account toegankelijk. Voor registratie zijn je e-mailadres en een wachtwoord verplicht. Je voert je wachtwoord tweemaal in om typfouten te voorkomen. Onze authenticatiedienst Supabase bewaart een beveiligde wachtwoordhash; het beheer kan je wachtwoord niet lezen.</p>
    <p><strong>We vragen geen e-mailbevestiging en gebruiken geen magic link voor registratie of login.</strong> Je kunt meteen met je wachtwoord inloggen. Een geregistreerd e-mailadres betekent daarom niet dat we het eigendom van dat adres of je identiteit hebben gecontroleerd.</p>
    <ul>
      <li><strong>Basisprofiel:</strong> e-mailadres, accountstatus, aanmaakdatum en laatste accountactiviteit. De laatste activiteit wordt maximaal eenmaal per uur bijgewerkt. Voornaam of bijnaam en thuisbasis zijn optioneel.</li>
      <li><strong>Je kustgids:</strong> opgeslagen plekken, gevolgde gemeenten, uitstapjes met titel en eventuele datum, gekozen plekken en persoonlijke notities.</li>
      <li><strong>Hondenprofielen:</strong> de naam, eventueel het ras en de gekozen avatar van je hond, als je deze functie gebruikt.</li>
    </ul>
    <p>Deze gegevens dienen om je account en de functies die je kiest op je toestellen aan te bieden. De rechtsgrond is de uitvoering van de overeenkomst voor deze dienstverlening (artikel 6, lid 1, b AVG). Zonder e-mailadres en wachtwoord kunnen we geen account aanmaken; de andere profielgegevens zijn niet verplicht.</p>
    <p>Het ledenbeheer toont je basisprofiel, status, activiteit, hondenprofielen, gevolgde gemeenten en aantallen opgeslagen plekken en uitstapjes. Het biedt geen inzage in je persoonlijke notities of de inhoud van je privécollecties. Het beheer ziet daarnaast geaggregeerde aantallen favorieten per plek, soort en gemeente, inclusief hoeveel huidige favorieten recent zijn toegevoegd. Deze populariteitsstatistiek bevat geen namen, e-mailadressen of individuele favorietenlijsten. Bevoegde technische beheerders en dienstverleners kunnen gegevens wel verwerken wanneer dat nodig is voor ondersteuning, onderhoud of beveiliging.</p>
  </> },
  { id: 'delen', title: 'Wat wordt openbaar of gedeeld?', content: <>
    <p><strong>Uitstapjes zijn standaard privé.</strong> Maak je zelf een deellink aan, dan kan iedereen met die link de titel, datum en gekozen plekken bekijken. Je e-mailadres, hondenprofielen en persoonlijke notitie worden niet via die link getoond. De ontvanger kan de link verder doorsturen. Je kunt de link intrekken; eerder gemaakte kopieën of schermafbeeldingen verdwijnen daardoor niet.</p>
    <p><strong>Reviews:</strong> we bewaren je beoordeling, opgegeven naam, tekst, datum en moderatiestatus. Als je ingelogd bent, kan de review aan je account worden gekoppeld; een review kan ook zonder account worden ingediend. Na goedkeuring zijn de beoordeling, openbare naam, openbare tekst en datum zichtbaar. Je e-mailadres en de accountkoppeling worden niet getoond. Het beheer kan de openbare naam of tekst aanpassen om bijvoorbeeld persoonsgegevens te beschermen; de oorspronkelijke inzending en beheerhistoriek blijven intern bewaard.</p>
    <p><strong>Meldpunt:</strong> categorie, kustgemeente, locatieomschrijving, beschrijving, waarnemingstijd en afhandeling kunnen openbaar worden getoond. Een melding vereist geen account, naam of e-mailadres. Zet geen telefoonnummers, namen van anderen, medische gegevens of andere gevoelige informatie in openbare tekstvelden. Wanneer een beschikbare koppeling een melding naar een stadsdienst doorstuurt, kunnen ook de locatie, beschrijving, tijd en openbare meldingslink worden meegestuurd. Dit is geen garantie dat een overheid de melding ontvangt of behandelt.</p>
    <p>Het aanbieden van openbare reviews en meldingen, de moderatie, meldingen over misbruik en de bijbehorende historiek dienen ons gerechtvaardigd belang om bezoekers ervaringen en risico’s te laten delen en de gids bruikbaar, veilig en betrouwbaar te houden (artikel 6, lid 1, f AVG). Deel geen onnodige persoonsgegevens van anderen.</p>
  </> },
  { id: 'push', title: 'Optionele pushmeldingen', content: <>
    <p>Pushmeldingen activeer je afzonderlijk met toestemming in je browser. We bewaren het technische afleveradres van je browser, de sleutels voor veilige aflevering, browserinformatie en de aanmaak- en laatste registratiedatum van het abonnement. We gebruiken deze gegevens om siteberichten te bezorgen, op basis van je toestemming (artikel 6, lid 1, a AVG).</p>
    <p>Het abonnement is gekoppeld aan je browser, niet aan je ledenaccount. Registreren of een gemeente volgen schrijft je niet automatisch in voor pushmeldingen of een nieuwsbrief. De pushdienst van je browserleverancier, zoals Apple, Google of Mozilla, verzorgt de aflevering. Het beheer bewaart ook de verzonden berichtinhoud en aantallen geslaagde of mislukte verzendingen.</p>
    <p>Je kunt je afmelden via de meldingenfunctie op de site en meldingen blokkeren via de browserinstellingen. Accountverwijdering beëindigt een afzonderlijk pushabonnement niet automatisch. Het intrekken van toestemming verandert niets aan de rechtmatigheid van eerdere verwerking.</p>
  </> },
  { id: 'statistieken', title: 'Statistieken, beveiliging en locatie', content: <>
    <p>We gebruiken Vercel Web Analytics en een eigen statistiekendashboard voor openbare pagina&apos;s en contactacties, zoals klikken op een zaakwebsite, route, telefoonnummer of sociale link. Accountpagina&apos;s, beheerpagina&apos;s en gedeelde uitstapjes worden van deze metingen uitgesloten. We verkopen geen persoonsgegevens en gebruiken geen advertentietrackers of marketingcookies.</p>
    <p>Onze eigen meting bewaart totalen per openbare pagina, actie, apparaatklasse en herkomstcategorie, zoals zoekmachine of direct bezoek. Deze totalen bevatten geen accountgegevens, bezoeker-ID, IP-adres, URL-queryparameters of volledige verwijzende URL. Bij de dagelijkse opschoning worden uurstatistieken ouder dan 8 dagen en dagtotalen ouder dan 397 kalenderdagen (ongeveer 13 maanden) verwijderd. Onze eigen meting respecteert Do Not Track en Global Privacy Control.</p>
    <p>Voor begrenzing van die meting verwerken we tijdelijk een dagelijks wisselende hash van het IP-adres; oude daggegevens worden bij de dagelijkse opschoning verwijderd. Vercel beschrijft zijn eigen cookie-loze meetmethode in het <a href="https://vercel.com/docs/analytics/privacy-policy" target="_blank" rel="noopener noreferrer">privacyoverzicht van Web Analytics</a>. Technische verwerking voorafgaand aan geaggregeerde statistieken dient ons gerechtvaardigd belang om gebruik en werking van de website te begrijpen (artikel 6, lid 1, f AVG).</p>
    <p>Hosting- en beveiligingsdiensten verwerken ook technische verbindingsgegevens, zoals IP-adres, browsertype en tijdstip. Reviews, meldingen, bevestigingen en misbruikmeldingen gebruiken gehashte IP-gegevens om spam en dubbele acties te beperken. De bewaartermijnen verschillen: een hash bij een melding of misbruikmelding wordt niet noodzakelijk dagelijks gewist. Hashing maakt dergelijke gegevens niet automatisch anoniem. Beveiliging en moderatie steunen op ons gerechtvaardigd belang om misbruik te voorkomen.</p>
    <p>Als je locatietoegang toestaat, gebruikt de website je coördinaten in je browser om een nabijgelegen kustgemeente te vinden. Deze optionele functie steunt op je toestemming (artikel 6, lid 1, a AVG). We slaan deze coördinaten niet in je account op. Je kunt de browsertoestemming intrekken en een gemeente zelf kiezen. Er is geen persoonlijke reclameprofilering of uitsluitend geautomatiseerde besluitvorming die rechtsgevolgen of vergelijkbare aanzienlijke gevolgen voor jou heeft.</p>
  </> },
  { id: 'contact', title: 'Contact, zaken en vrijwillige steun', content: <>
    <p>Bij e-mail of WhatsApp verwerken we je contactgegevens, berichtinhoud en eventuele bijlagen om te antwoorden, een zaakvermelding te behandelen of een fout op te lossen. Zakelijke contactgegevens en aangeleverde informatie of beelden kunnen na afstemming in de gids worden gepubliceerd. De gids kan ook zakelijke informatie uit openbare bronnen gebruiken, zoals de website van een zaak of een gemeente. Waar zulke gegevens een persoon identificeren, bijvoorbeeld een zelfstandige, behandelen we ze als persoonsgegevens. De verwerking steunt op ons gerechtvaardigd belang om vragen te beantwoorden en de gids te onderhouden (artikel 6, lid 1, f AVG), of op het behandelen van je verzoek voor een overeengekomen dienstverlening (artikel 6, lid 1, b AVG).</p>
    <p>Een vrijwillige overschrijving verloopt via je bank. Wij ontvangen geen banklogin of kaartgegevens via de website. De rekeninghouder kan wel de gegevens van de overschrijving ontvangen, zoals naam, rekeningnummer, bedrag en mededeling, om de bijdrage te beheren (gerechtvaardigd belang, artikel 6, lid 1, f AVG) en, waar van toepassing, wettelijke administratieverplichtingen na te komen (artikel 6, lid 1, c AVG).</p>
  </> },
  { id: 'dienstverleners', title: 'Dienstverleners en internationale verwerking', content: <>
    <ul>
      <li><strong>Supabase:</strong> authenticatie, database, serverfuncties en opslag van accounts, bijdragen en pushabonnementen. De primaire database van dit project staat in Ierland (EU).</li>
      <li><strong>Vercel:</strong> hosting, aflevering van pagina&apos;s, technische werking en Web Analytics.</li>
      <li><strong>Cloudflare:</strong> opslag en aflevering van websitebeelden.</li>
      <li><strong>Externe bronnen:</strong> Google Fonts voor lettertypes, OpenStreetMap en CARTO voor kaarttegels waar gebruikt, en leveranciers van extern geladen afbeeldingen. Bij het laden ontvangt de aanbieder technische verzoekgegevens, zoals je IP-adres en browserinformatie.</li>
      <li><strong>Communicatie en push:</strong> je e-maildienst, WhatsApp/Meta als je daar contact opneemt, en de pushdienst van je browser.</li>
    </ul>
    <p>Onze technische dienstverleners kunnen gegevens buiten de Europese Economische Ruimte verwerken, bijvoorbeeld voor wereldwijde aflevering, ondersteuning of infrastructuur. De EU-locatie van de database betekent dus niet dat alle verwerking binnen de EU blijft. Voor zulke doorgiften voorzien de betrokken dienstverleners in hun gegevensverwerkingsvoorwaarden waarborgen, zoals Europese standaardcontractbepalingen of, waar van toepassing, een erkend adequaatheidsbesluit. Meer informatie staat in de <a href="https://supabase.com/legal/customer-resources/data-processing-addendum" target="_blank" rel="noopener noreferrer">Supabase-verwerkingsvoorwaarden</a>, de <a href="https://vercel.com/legal/dpa" target="_blank" rel="noopener noreferrer">Vercel-verwerkingsvoorwaarden</a> en het <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">Cloudflare-privacybeleid</a>. Je kunt ons ook om toelichting over een concrete doorgifte vragen.</p>
    <p>Gegevens kunnen daarnaast worden verstrekt wanneer dat wettelijk verplicht is of noodzakelijk is om een rechtmatig verzoek van een bevoegde instantie te behandelen. Een externe website die je via een link bezoekt, verwerkt gegevens volgens haar eigen beleid.</p>
  </> },
  { id: 'bewaren', title: 'Bewaartermijnen en accountverwijdering', content: <>
    <ul>
      <li><strong>Account en kustgids:</strong> zolang je account bestaat. Via Mijn profiel kun je je ledengegevens downloaden en je account verwijderen. Daarbij verdwijnen je ledenprofiel, favorieten, gevolgde gemeenten, hondenprofielen, uitstapjes en deellinks uit de actieve ledendatabase.</li>
      <li><strong>Reviews na accountverwijdering:</strong> de accountkoppeling wordt verwijderd, maar de review, opgegeven openbare naam en tekst verdwijnen niet automatisch. Dat maakt de inhoud niet noodzakelijk anoniem. Vraag afzonderlijk om verwijdering of afscherming als deze inhoud persoonsgegevens bevat.</li>
      <li><strong>Openbare bijdragen en beheerhistoriek:</strong> reviews, meldingen, moderatiebeslissingen en beveiligingsgegevens hebben momenteel geen vaste automatische vervaldatum. We beoordelen bewaring op de relevantie van de bijdrage, afhandeling van misbruik, privacyverzoeken en de noodzaak om geschillen te behandelen. Verbergen op de site is niet hetzelfde als wissen uit de database.</li>
      <li><strong>Push:</strong> tot afmelding of verwijdering van een ongeldig abonnement. Verzendhistoriek blijft voor beheer en het onderzoeken van afleverproblemen bewaard zolang daarvoor een noodzaak bestaat.</li>
      <li><strong>Statistieken:</strong> uurgegevens ouder dan 8 dagen en dagtotalen ouder dan 397 kalenderdagen worden bij de dagelijkse opschoning verwijderd; oude daggegevens voor analytics-misbruikbeperking worden dagelijks opgeruimd.</li>
      <li><strong>Contact, technische logs en back-ups:</strong> afhankelijk van de afhandeling van het verzoek, beveiligingsnoodzaak, toepasselijke wettelijke verplichtingen en de bewaarschema&apos;s van de betrokken dienstverlener. Gegevens in back-ups kunnen tot de normale rotatie blijven bestaan; ze zijn geen actieve publicatie.</li>
    </ul>
    <p>Voor een verzoek dat verder gaat dan je ledengegevens, bijvoorbeeld over een review, melding of correspondentie, kun je ons mailen. De download in Mijn profiel is geen volledige export van elke afzonderlijke dienst die je hebt gebruikt.</p>
  </> },
  { id: 'rechten', title: 'Je rechten en privacyverzoeken', content: <>
    <p>Onder de voorwaarden van de AVG heb je recht op inzage, verbetering, verwijdering, beperking van verwerking en overdraagbaarheid van gegevens. Je kunt bezwaar maken tegen verwerking op grond van een gerechtvaardigd belang en toestemming intrekken voor verwerking die daarop steunt. Deze rechten zijn niet in elke situatie onbeperkt; wettelijke bewaarplichten en de rechten van anderen kunnen meewegen.</p>
    <p>Mail <a href="mailto:info@hondaanzee.be">info@hondaanzee.be</a> met je verzoek en voldoende informatie om de betrokken gegevens te vinden. Deel geen wachtwoord. Indien nodig vragen we proportionele informatie om je identiteit of de band met een bijdrage te controleren. We antwoorden in beginsel binnen een maand; een wettelijk toegestane verlenging leggen we uit.</p>
    <p>Je kunt een klacht indienen bij de Belgische <a href="https://www.gegevensbeschermingsautoriteit.be/burger/acties/klacht-indienen" target="_blank" rel="noopener noreferrer">Gegevensbeschermingsautoriteit (GBA)</a>. Je hoeft daarvoor niet eerst akkoord van ons te krijgen.</p>
  </> },
  { id: 'beveiliging', title: 'Beveiliging en wijzigingen', content: <>
    <p>We gebruiken HTTPS, beveiligde authenticatie, toegangsregels voor ledengegevens en afgeschermde beheertoegang. Alleen bevoegde personen horen beheergegevens te verwerken. Gebruik een uniek wachtwoord en log uit op gedeelde toestellen. Geen online dienst kan absolute beveiliging garanderen.</p>
    <p>Bij nieuwe functies of gewijzigde verwerking passen we dit beleid aan. De datum bovenaan toont de laatste versie. Materiële wijzigingen brengen we onder de aandacht op de website; wanneer nieuwe toestemming nodig is, vragen we die voordat die verwerking start. Meer over browseropslag lees je in het <Link to="/cookies">cookiebeleid</Link>.</p>
  </> },
];

const Privacy: React.FC = () => {
  useSEO(SEO_DATA.privacy);
  return <LegalPage title="Privacybeleid" icon={Shield} intro="Welke gegevens je deelt, waarvoor we ze gebruiken en welke keuzes jij hebt."
    summary={<><p>Je kiest zelf of je een account maakt. Je kustgids is privé totdat je zelf een uitstaplink deelt. Reviews en meldingen kunnen openbaar zijn.</p><p>Je kunt je ledengegevens downloaden en je account verwijderen. Openbare bijdragen en een afzonderlijk pushabonnement vragen een aparte actie. Voor privacyvragen: <a className="font-bold underline" href="mailto:info@hondaanzee.be">info@hondaanzee.be</a>.</p></>} sections={sections} />;
};

export default Privacy;
