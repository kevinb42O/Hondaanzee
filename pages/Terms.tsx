import React from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import LegalPage, { LegalContact, type LegalSection } from '../components/LegalPage.tsx';
import { useSEO, SEO_DATA } from '../utils/seo.ts';

const sections: LegalSection[] = [
  { id: 'algemeen', title: 'Over Hond aan Zee', content: <>
    <p>Hond aan Zee wordt beheerd door Kevin Bourguignon. Deze voorwaarden beschrijven het gebruik van hondaanzee.be, Mijn Hond aan Zee en de functies voor bijdragen en meldingen. Bij registratie vragen we je uitdrukkelijk met deze voorwaarden akkoord te gaan. Het <Link to="/privacy">privacybeleid</Link> legt uit hoe we persoonsgegevens verwerken; het lezen daarvan is geen algemene toestemming voor alle verwerkingen.</p>
    <LegalContact />
  </> },
  { id: 'dienstverlening', title: 'Wat de website aanbiedt', content: <>
    <p>Je vindt hier strandregels, losloopzones, hondvriendelijke zaken, diensten, evenementen, reviews en een meldpunt voor risico&apos;s aan de kust. Met een gratis account kun je plekken bewaren, gemeenten volgen, hondenprofielen toevoegen en uitstapjes plannen of delen.</p>
    <p>De openbare gids en huidige ledenfuncties zijn gratis. Een account is niet nodig om de gids te raadplegen. Een favoriet of uitstapplan is geen reservering, aankoop, toegangsrecht of toezegging van een zaak. Een gevolgde gemeente wordt in je kustgids bewaard; dat schrijft je niet automatisch in voor berichten.</p>
    <p>We zijn een onafhankelijke informatiegids. We zijn geen gemeentelijke overheid, hulpdienst, dierenarts of boekingsplatform.</p>
  </> },
  { id: 'regels', title: 'Controleer regels en informatie ter plaatse', content: <>
    <p>We proberen informatie actueel en correct te houden, maar regels, openingsuren, hondenbeleid, beschikbaarheid en plaatselijke omstandigheden kunnen wijzigen. De gids, filters, kaart en uitstapplannen kunnen onvolledig zijn of fouten bevatten.</p>
    <p><strong>Controleer officiële gemeentelijke regels, signalisatie en aanwijzingen ter plaatse.</strong> Een samenvatting of bewaarde plek vervangt die informatie niet. Vraag bij twijfel de gemeente of de betrokken zaak om bevestiging. Je blijft verantwoordelijk voor het begeleiden van je hond en het naleven van de geldende regels.</p>
    <p>Een fout kun je melden via <a href="mailto:info@hondaanzee.be">info@hondaanzee.be</a> of WhatsApp. We beoordelen het signaal en passen informatie waar nodig aan.</p>
  </> },
  { id: 'accounts', title: 'Registratie en veilig accountgebruik', content: <>
    <p>Voor registratie geef je een e-mailadres dat je mag gebruiken en een wachtwoord van minstens 8 tekens op. Het herhaalde wachtwoord moet exact overeenkomen. Je logt daarna in met je e-mailadres en wachtwoord.</p>
    <p><strong>We sturen geen bevestigingsmail of magic link voor deze registratie.</strong> We controleren dus niet automatisch of een e-mailadres werkelijk van jou is. Gebruik geen adres van een ander, doe je niet voor als iemand anders en maak geen accounts om beperkingen of een schorsing te omzeilen.</p>
    <p>Houd je wachtwoord geheim, gebruik bij voorkeur een uniek wachtwoord en log uit op gedeelde toestellen. Meld vermoedelijk misbruik bij ons. Wij vragen nooit om je wachtwoord. Er is momenteel geen automatische wachtwoordherstelprocedure per e-mail; neem contact op bij toegangsproblemen. We kunnen geen toegang overdragen zonder voldoende controle dat het account van jou is.</p>
    <p>In Mijn profiel kun je ledengegevens downloaden en je account verwijderen. Daarbij verdwijnen je persoonlijke kustgids en gedeelde uitstaplinks. Openbare reviews verdwijnen niet automatisch: de accountkoppeling wordt losgemaakt. Voor de openbare naam of tekst kun je een afzonderlijk privacy- of moderatieverzoek indienen.</p>
  </> },
  { id: 'uitstapjes', title: 'Favorieten, notities en deellinks', content: <>
    <p>Je favorieten, hondenprofielen en uitstapjes zijn persoonlijke hulpmiddelen. Bewaar geen gevoelige gegevens, wachtwoorden of informatie over anderen in notities. Gebruik de functies voor normale persoonlijke planning en houd zelf een kopie van informatie die je absoluut nodig hebt.</p>
    <p>Je beslist zelf of je een uitstap deelt. Iedereen met een geldige deellink kan de titel, eventuele datum en gekozen plekken bekijken en de link doorsturen. De link toont geen e-mailadres, hondenprofielen of persoonlijke notitie. Intrekken blokkeert toekomstige toegang via die link, maar verwijdert geen kopieën die ontvangers al maakten.</p>
  </> },
  { id: 'bijdragen', title: 'Reviews en andere bijdragen', content: <>
    <p>Schrijf reviews op basis van je eigen ervaring en houd ze relevant, eerlijk en respectvol. Een beoordeling is de ervaring van een gebruiker; we bevestigen daarmee geen aankoop, bezoek of identiteit. Reviews worden beoordeeld voordat ze openbaar verschijnen.</p>
    <ul>
      <li>Geen verzonnen ervaringen, misleidende beoordelingen, verborgen reclame of manipulatie van scores.</li>
      <li>Geen bedreigingen, discriminatie, intimidatie, onrechtmatige beschuldigingen, spam of schadelijke code.</li>
      <li>Geen onnodige persoonsgegevens van jezelf of anderen, zoals privé-adressen, telefoonnummers of medische informatie.</li>
      <li>Deel alleen tekst en materiaal waarvoor je de nodige rechten hebt.</li>
    </ul>
    <p>We kunnen bijdragen weigeren, tijdelijk verbergen, verwijderen of de openbare naam en tekst aanpassen om privacy te beschermen of deze regels toe te passen. De oorspronkelijke inzending en moderatiehistoriek kunnen intern blijven bestaan. Een melding over een review leidt tot beoordeling, niet automatisch tot verwijdering. Meld problematische inhoud via de beschikbare meldfunctie of mail ons met de betrokken link en reden.</p>
    <p>Je behoudt je rechten op je eigen bijdrage. Door deze in te dienen geef je ons een niet-exclusieve toestemming om haar binnen deze dienst op te slaan, te publiceren, technisch weer te geven en te modereren zolang dat voor de dienstverlening en rechtmatige afhandeling nodig is. Deze toestemming neemt je privacyrechten niet weg.</p>
  </> },
  { id: 'meldpunt', title: 'Het meldpunt is geen noodkanaal', content: <>
    <p>Het meldpunt laat bezoekers risico&apos;s signaleren en meldingen bevestigen of als problematisch markeren. Beschrijf alleen wat je hebt waargenomen, met een zo bruikbaar mogelijke locatie en tijd. Plaats geen persoonsgegevens of beschuldigingen tegen herkenbare personen in de openbare melding.</p>
    <p>Meldingen kunnen snel openbaar verschijnen en zijn niet allemaal vooraf gecontroleerd. Bevestigingen en aantallen meldingen zijn signalen van bezoekers, geen bewijs of officiële vaststelling. Een melding kan worden verborgen na misbruiksignalen en vervolgens door het beheer worden bekeken.</p>
    <p><strong>Bij acuut gevaar gebruik je de bevoegde hulpdiensten; voor een dier in nood neem je onmiddellijk contact op met een dierenarts.</strong> Wacht niet op reactie via deze site. Een status zoals doorgestuurd of opgelost is een beheersignaal en geen garantie dat een plek veilig is of een overheid actie heeft ondernomen. Eventuele doorsturing via een beschikbare koppeling vervangt geen eigen contact met de bevoegde dienst.</p>
  </> },
  { id: 'moderatie', title: 'Beheer, misbruik en beschikbaarheid', content: <>
    <p>Om de site betrouwbaar te houden, gebruiken we toegangsbeperkingen, spamlimieten en moderatie. Het beheer kan een account bij misbruik of beveiligingsproblemen schorsen en schadelijke of onrechtmatige bijdragen beperken. Waar redelijk en mogelijk geven we uitleg. Denk je dat een beslissing onjuist is, mail dan de betrokken account- of paginagegevens en je toelichting naar <a href="mailto:info@hondaanzee.be">info@hondaanzee.be</a>.</p>
    <p>We onderhouden en verbeteren de site, maar kunnen niet garanderen dat elke functie steeds foutloos of ononderbroken werkt. Onderhoud, een storing of een verandering bij een leverancier kan toegang tijdelijk beperken. Materiële veranderingen aan de ledenfuncties brengen we waar redelijk mogelijk vooraf onder de aandacht.</p>
  </> },
  { id: 'zaken', title: 'Zaken, externe links en vrijwillige steun', content: <>
    <p>Ondernemers kunnen een gratis vermelding aanvragen. Aangeleverde gegevens moeten juist zijn en een hondvriendelijke vermelding moet overeenkomen met het werkelijke beleid van de zaak. Lever alleen beelden en tekst waarvoor je publicatierechten hebt en meld wijzigingen. We kunnen een vermelding beoordelen, aanpassen of verwijderen als de informatie niet passend of betrouwbaar is; er is geen gegarandeerde positie of bezoekersaantal.</p>
    <p>Een vermelding, sticker of link is geen garantie voor kwaliteit, veiligheid of toegang op elk moment. Contact, reserveringen en overeenkomsten met zaken of externe diensten verlopen rechtstreeks met die partij en onder haar voorwaarden.</p>
    <p>Steun via een bankoverschrijving is vrijwillig en geen voorwaarde voor een account of een betere beoordeling. De betaling wordt door je bank uitgevoerd. Vragen of vergissingen bij een bijdrage kun je bij ons melden.</p>
  </> },
  { id: 'rechten-inhoud', title: 'Rechten op website-inhoud', content: <>
    <p>Websiteontwerp, eigen teksten, logo&apos;s en beelden kunnen beschermd zijn door intellectuele eigendomsrechten. Rechten op materiaal van gebruikers en externe bronnen blijven bij hun respectieve rechthebbenden. Kaartmateriaal en andere bronnen kunnen eigen licentievoorwaarden hebben.</p>
    <p>Je kunt de gids voor persoonlijk gebruik raadplegen en links delen. Voor het overnemen van beschermde inhoud buiten wat de wet of een toepasselijke licentie toestaat, heb je toestemming van de rechthebbende nodig. Vermijd geautomatiseerde acties die de dienst overbelasten of afgeschermde gegevens proberen te verzamelen.</p>
  </> },
  { id: 'aansprakelijkheid', title: 'Aansprakelijkheid en toepasselijk recht', content: <>
    <p>De site biedt informatie en hulpmiddelen. Houd rekening met de beschreven beperkingen en controleer beslissende informatie bij de officiële bron of betrokken aanbieder. Voor zover wettelijk toegestaan zijn wij niet aansprakelijk voor gevolgen van onjuiste informatie van derden, handelen van gebruikers of zaken, of storingen buiten onze redelijke controle.</p>
    <p>Deze voorwaarden sluiten geen aansprakelijkheid uit die volgens dwingend recht niet mag worden uitgesloten, waaronder waar van toepassing aansprakelijkheid voor opzettelijke of zware fouten. Je wettelijke rechten, waaronder toepasselijke consumenten- en privacyrechten, blijven behouden.</p>
    <p>Belgisch recht is van toepassing, met behoud van dwingende bescherming die je volgens toepasselijk recht geniet. Bij een geschil proberen we eerst samen een oplossing te vinden. Als dat niet lukt, gelden de wettelijk bevoegde rechtbanken; deze voorwaarden beperken geen dwingende regels over hun bevoegdheid.</p>
  </> },
  { id: 'wijzigingen', title: 'Wijzigingen en contact', content: <>
    <p>We passen deze voorwaarden aan wanneer de dienst of de regels veranderen. De datum bovenaan geeft de laatste update aan. Materiële wijzigingen communiceren we op de website en, waar nodig, vragen we opnieuw akkoord voordat je de betrokken dienst verder gebruikt. Een wijziging neemt geen reeds bestaande wettelijke rechten weg.</p>
    <LegalContact />
  </> },
];

const Terms: React.FC = () => {
  useSEO(SEO_DATA.terms);
  return <LegalPage title="Algemene voorwaarden" icon={FileText} intro="Duidelijke afspraken voor de kustgids, je account en de bijdragen die je met anderen deelt."
    summary={<><p>De gids en huidige accounts zijn gratis. Gebruik je eigen e-mailadres, houd je wachtwoord geheim en deel eerlijke, respectvolle informatie.</p><p>Controleer altijd de officiële regels ter plaatse. Een uitstapplan is geen reservering en het meldpunt is geen noodkanaal. Jij kiest of je een uitstap via een link deelt.</p></>} sections={sections} />;
};

export default Terms;
