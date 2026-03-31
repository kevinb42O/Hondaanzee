import React, { useEffect } from 'react';
import { Sparkles, Zap, Wrench, BookOpen, Calendar, Users, MapPin, Star, PawPrint, Rocket } from 'lucide-react';
import { useSEO } from '../utils/seo.ts';

interface UpdateTag {
  label: string;
  color: 'cyan' | 'amber' | 'emerald' | 'blue' | 'violet' | 'rose';
}

interface UpdateEntry {
  text: string;
  tag: UpdateTag;
}

interface UpdateRelease {
  version: string;
  date: string;
  title: string;
  subtitle: string;
  isLaunch?: boolean;
  entries: UpdateEntry[];
}

const TAG_STYLES: Record<string, string> = {
  cyan: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  amber: 'bg-amber-100 text-amber-700 border-amber-200',
  emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  violet: 'bg-violet-100 text-violet-700 border-violet-200',
  rose: 'bg-rose-100 text-rose-700 border-rose-200',
};

const VERSION_ACCENT: Record<string, string> = {
  cyan: 'border-cyan-400 bg-cyan-50',
  amber: 'border-amber-400 bg-amber-50',
  gold: 'border-yellow-500 bg-yellow-50',
};

const releases: UpdateRelease[] = [
  {
    version: '2.1',
    date: '1 april 2026',
    title: 'Nieuw: Meldpunt Gif & Overlast voor de hele Belgische kust',
    subtitle: 'Een nieuwe publieke meldpagina waar je verdachte stoffen, vuil of gevaarlijke situaties meteen kan melden en opvolgen',
    entries: [
      { text: 'Het nieuwe Meldpunt Gif & Overlast is live op HondAanZee.be, met een aparte pagina voor de hele Belgische kust', tag: { label: 'Nieuw', color: 'cyan' } },
      { text: 'Je kan nu zelf meldingen plaatsen van gif of verdachte stof, afval, hondenpoep, gevaarlijke situaties en andere overlast', tag: { label: 'Nieuw', color: 'cyan' } },
      { text: 'Elke melding krijgt een eigen detailpagina en deelbare link, zodat waarschuwingen makkelijker kunnen worden doorgestuurd', tag: { label: 'Nieuw', color: 'cyan' } },
      { text: 'Nieuwe meldingen verschijnen meteen in de publieke feed, zodat bezoekers eerst kunnen checken wat er al gemeld werd in hun stad', tag: { label: 'Verbeterd', color: 'amber' } },
      { text: 'Meldingen worden per gemeente doorgestuurd naar de bevoegde instantie, zodat ze niet alleen zichtbaar zijn voor bezoekers maar ook rechtstreeks bij de juiste dienst terechtkomen', tag: { label: 'Belangrijk', color: 'rose' } },
      { text: 'Op meldingen kan nu ook een publieke update verschijnen, bijvoorbeeld wanneer iets werd doorgestuurd of opgeruimd', tag: { label: 'Nieuw', color: 'cyan' } },
      { text: 'Er is ook een eenvoudige beheerflow toegevoegd om meldingen intern op te volgen zonder rechtstreeks in databanktabellen te moeten werken', tag: { label: 'Verbeterd', color: 'amber' } },
      { text: 'De nieuwe meldpuntpagina kreeg een volledige visuele uitwerking in de stijl van HondAanZee, maar met een formelere look zodat meldingen serieus en duidelijk leesbaar blijven', tag: { label: 'Verbeterd', color: 'amber' } },
      { text: 'De pagina werd ook mobiel bijgeschaafd: terugknoppen, header-ruimte en leesvolgorde zitten nu correct op kleine schermen', tag: { label: 'Opgelost', color: 'emerald' } },
    ],
  },
  {
    version: '2.0',
    date: '31 maart 2026',
    title: 'Hotspots & diensten kregen hun eigen detailpagina’s',
    subtitle: 'De grote update van vandaag: beter zoeken, beter lezen, beter volgen',
    entries: [
      { text: 'Hotspots en diensten openen niet langer in modals, maar op volwaardige detailpagina’s per zaak, dierenarts of dierenwinkel', tag: { label: 'Nieuw', color: 'cyan' } },
      { text: 'Elke plaats heeft nu een eigen, deelbare URL zodat we eindelijk per zaak kunnen zien waar bezoekers op klikken en welke pagina’s het meeste bekeken worden', tag: { label: 'Verbeterd', color: 'amber' } },
      { text: 'Nieuwe detailpagina-opbouw: compactere hero, echte fotosectie, duidelijke praktische info, terugnavigatie en een veel rustiger leesritme dan vroeger', tag: { label: 'Verbeterd', color: 'amber' } },
      { text: '“Wat je hier mag verwachten” werd volledig herwerkt tot een snelle overzichtssectie die meteen de belangrijkste info toont zonder dat je door lange tekstblokken moet', tag: { label: 'Verbeterd', color: 'amber' } },
      { text: 'Adresblokken op detailpagina’s zijn nu rechtstreeks klikbaar naar Google Maps', tag: { label: 'Nieuw', color: 'cyan' } },
      { text: 'Praktische info en “Verder kijken” blijven op desktop zichtbaar terwijl je scrolt, zodat je minder moet terugzoeken', tag: { label: 'Verbeterd', color: 'amber' } },
      { text: 'Headertekst schakelt nu slim naar een leesbare hero-variant op donkere beeldblokken en keert daarna terug naar de gewone stijl', tag: { label: 'Opgelost', color: 'emerald' } },
      { text: 'De nieuwe zaakpagina’s kregen betere SEO: unieke titels, beschrijvingen, breadcrumbs en gestructureerde gegevens per hotspot of dienst', tag: { label: 'Verbeterd', color: 'amber' } },
      { text: 'Sitemap en prerender-routes worden nu automatisch opgebouwd op basis van alle hotspots en diensten, zodat nieuwe detailpagina’s niet meer manueel moeten worden toegevoegd', tag: { label: 'Verbeterd', color: 'amber' } },
      { text: 'Hotspots-overzicht heeft nu een naamzoeker met suggesties tijdens het typen, zodat je snel een specifieke zaak terugvindt wanneer de gids verder groeit', tag: { label: 'Nieuw', color: 'cyan' } },
      { text: 'Filters op hotspots en diensten worden bewaard in de URL, zodat je zoek- en filterkeuzes netjes blijven bestaan bij terugnavigatie of delen van links', tag: { label: 'Verbeterd', color: 'amber' } },
      { text: '“Waarom dit een aanrader is” leest nu veel menselijker: geen geforceerde labelzinnen meer, maar natuurlijke aanbevelingstekst in echt Vlaams-Nederlands', tag: { label: 'Opgelost', color: 'emerald' } },
      { text: 'Sterke adressen in Oostende en Blankenberge kregen uitgebreidere, nauwkeurigere beschrijvingen en verfijnde Aanrader-copy op basis van actuele publieke info', tag: { label: 'Verbeterd', color: 'amber' } },
      { text: 'De site is technisch al voorbereid op meerdere foto’s per zaak, zodat Aanraders later een rijkere galerij kunnen krijgen zonder nieuwe ombouw', tag: { label: 'Nieuw', color: 'cyan' } },
      { text: 'Privacy- en cookiepagina’s werden aangepast zodat de tekst eindelijk klopt met het huidige gebruik van analytics op de site', tag: { label: 'Opgelost', color: 'emerald' } },
    ],
  },
  {
    version: '1.11',
    date: '31 maart 2026',
    title: 'Homepage sneller, stabieler en scherper op mobiel',
    subtitle: 'Gebaseerd op de GitHub-updates van 31 maart',
    entries: [
      { text: 'Homepage-kaarten kregen een verfijnde herindeling, soepelere interacties en een strakkere hover-animatie', tag: { label: 'Verbeterd', color: 'amber' } },
      { text: 'Mobiele instorting van de responsive stedenlayout opgelost — kaartblokken blijven nu stabiel staan op kleine schermen', tag: { label: 'Opgelost', color: 'emerald' } },
      { text: 'Contrast van de resultaatstotalen verbeterd voor leesbaarheid en toegankelijkheid', tag: { label: 'Verbeterd', color: 'amber' } },
      { text: 'Homepage-LCP verder geoptimaliseerd door render-blocking CSS te verminderen', tag: { label: 'Verbeterd', color: 'amber' } },
    ],
  },
  {
    version: '1.10',
    date: '24–30 maart 2026',
    title: 'Routering, FAQ en witte-schermfixes',
    subtitle: 'Belangrijke technische correcties uit GitHub voor betrouwbaarder laden',
    entries: [
      { text: 'Nieuwe FAQ-sectie toegevoegd op de homepage, met natuurlijkere uitleg én gestructureerde data voor zoekmachines', tag: { label: 'Nieuw', color: 'cyan' } },
      { text: 'Homepage-routing verder gehard voor mobiel en directe paginaladingen', tag: { label: 'Opgelost', color: 'emerald' } },
      { text: 'Wit scherm op Android in-app browsers en op de homepage aangepakt door routering en hydration veiliger te maken', tag: { label: 'Opgelost', color: 'emerald' } },
      { text: 'Runtime-crash door nested router conflict opgelost', tag: { label: 'Opgelost', color: 'emerald' } },
      { text: 'Community-prerender conflict weggewerkt en zichtbaarheid van de homepage-hero hersteld', tag: { label: 'Opgelost', color: 'emerald' } },
      { text: 'Agenda-events kregen betere SEO-markup met performer- en validFrom-info', tag: { label: 'Verbeterd', color: 'amber' } },
      { text: 'Fallback van de homepage-hero werkt nu ook correct wanneer de prerender-versie tijdelijk niet beschikbaar is', tag: { label: 'Opgelost', color: 'emerald' } },
    ],
  },
  {
    version: '1.9.5',
    date: '22 maart 2026',
    title: 'Stadspagina’s visueel herwerkt',
    subtitle: 'Minder onrust, betere leesbaarheid en een nettere mobiele ervaring',
    entries: [
      { text: 'Verborgen menu-overlays die inhoud konden afdekken op mobiel en in webviews zijn weggewerkt', tag: { label: 'Opgelost', color: 'emerald' } },
      { text: 'Zwevende homepage-CTA verwijderd om mobiel rustiger en robuuster te maken', tag: { label: 'Verbeterd', color: 'amber' } },
      { text: 'Stadspagina’s gebruiken nu de stadsafbeelding veel slimmer in de hero, zonder verschuiving van de layout', tag: { label: 'Verbeterd', color: 'amber' } },
      { text: 'Wave-overgangen en footerafwerking herschikt zodat secties vloeiender op elkaar aansluiten', tag: { label: 'Verbeterd', color: 'amber' } },
      { text: 'Leesbaarheid van back button, statuskleuren en banner/footer verder verfijnd', tag: { label: 'Verbeterd', color: 'amber' } },
    ],
  },
  {
    version: '1.9.4',
    date: '16–18 maart 2026',
    title: 'PWA-reset, community-update & Blankenberge-aanvulling',
    subtitle: 'GitHub-updates die inhoud én updatebetrouwbaarheid tegelijk vooruit duwden',
    entries: [
      { text: 'ABC Hotel en Au Pengouin toegevoegd in Blankenberge, met ook een upgrade voor Belgium Pier Brasserie', tag: { label: 'Nieuwe zaken', color: 'cyan' } },
      { text: 'My Home My Coffee kreeg extra inhoudelijke verfijning en een Aanrader-badge', tag: { label: 'Verbeterd', color: 'amber' } },
      { text: 'Community-topper vernieuwd naar Tila & Xia, met betere beeldpresentatie en zonder storende watermarktekst', tag: { label: 'Community', color: 'violet' } },
      { text: 'Meerdere losloopzonebeelden en crops vernieuwd, onder meer voor Ankerstraat, Raversijde, Brigade Pironlaan, Provinciedomein en Maria Hendrikapark', tag: { label: 'Verbeterd', color: 'amber' } },
      { text: 'Agenda-styling, wave-uitlijning en homepage FAQ-achtergrond visueel bijgeschaafd', tag: { label: 'Verbeterd', color: 'amber' } },
      { text: 'PWA-cache en service worker kregen een stevige reset om hardnekkige updateproblemen en witte schermen weg te werken', tag: { label: 'Opgelost', color: 'emerald' } },
      { text: 'No-cache headers en homepage direct load verder gecorrigeerd zodat nieuwe versies betrouwbaarder doorkomen', tag: { label: 'Opgelost', color: 'emerald' } },
    ],
  },
  {
    version: '1.9',
    date: '14 maart 2026',
    title: 'Regelverificatie + kaartstatus nu volledig synchroon',
    subtitle: 'Betere betrouwbaarheid op kritieke strandwissels',
    entries: [
      { text: 'Alle 11 kustgemeenten opnieuw geverifieerd op basis van officiële bronnen voor de seizoenswissel in maart', tag: { label: 'Verbeterd', color: 'amber' } },
      { text: 'Kustkaart en stadspagina gebruiken nu dezelfde statuslogica, zodat kleurstatus en detailregel overal overeenkomen', tag: { label: 'Opgelost', color: 'emerald' } },
      { text: 'Nieuwe hotspots in Blankenberge: ABC Hotel (eco-hotel, hond welkom bij ontbijt) en Au Pengouin (reuzenwafels & pannenkoeken)', tag: { label: 'Nieuwe zaken', color: 'cyan' } },
      { text: 'Belgium Pier Brasserie (Blankenberge) voorzien van een sterk verrijkte beschrijving en de Aanrader-badge', tag: { label: 'Verbeterd', color: 'amber' } },
      { text: 'Homepage-kaarten kregen directe statusbadges per stad voor snellere leesbaarheid', tag: { label: 'Nieuw', color: 'cyan' } },
      { text: 'Dubbele weergave van speciale regeltekst op stadspagina verwijderd', tag: { label: 'Opgelost', color: 'emerald' } },
      { text: 'Sitemap, robots en prerendering bijgewerkt voor betere indexatie van nieuwe en actuele pagina\'s', tag: { label: 'Verbeterd', color: 'amber' } },
    ],
  },
  {
    version: '1.8',
    date: '8 maart 2026',
    title: 'iOS-stijl navigatie & deze updatepagina',
    subtitle: 'Gepolijste interface, meer transparantie over wat er groeit',
    entries: [
      { text: 'Volledig nieuwe navigatiebeleving: de menubalk gedraagt zich nu zoals je gewend bent van iOS en moderne apps — transparant en subtiel bij het laden, dan vloeiend inzoomend naar de volledige stijl zodra je begint te scrollen', tag: { label: 'Verbeterd', color: 'amber' } },
      { text: 'Menuknoppen tonen nu een zachte, doorzichtige tekst bij het openen van de pagina — zodra je scrolt, kleuren ze in naar hun volledige kleur. Subtiel, maar het voelt meteen een stuk gelikter', tag: { label: 'Verbeterd', color: 'amber' } },
      { text: 'Deze updatepagina is live — voortaan kan je hier rustig nalezen wat er allemaal verbeterd, toegevoegd of opgelost is op HondAanZee.be. Geen code, gewoon wat jij als bezoeker merkt', tag: { label: 'Nieuw', color: 'cyan' } },
      { text: '"Wat is er nieuw?"-knop toegevoegd in de footer met een levend, knipperend icoontje zodat je nooit een update mist', tag: { label: 'Nieuw', color: 'cyan' } },
    ],
  },
  {
    version: '1.7',
    date: '4 maart 2026',
    title: 'Koffiebar & Blankenberge uitbreiding',
    subtitle: 'Nieuwe categorie, nieuwe gezichten',
    entries: [
      { text: 'Koffiebar toegevoegd als volwaardige categorie in de hotspot-gids', tag: { label: 'Nieuw', color: 'cyan' } },
      { text: 'Restaurant Koekie\'s, Brasserie Cappuccino en Two For You toegevoegd in Blankenberge', tag: { label: 'Nieuwe zaken', color: 'cyan' } },
      { text: 'Skateshop Daily Grind (Blankenberge) — eerste skate & surf shop in de gids', tag: { label: 'Nieuwe zaken', color: 'cyan' } },
      { text: 'Overview-pagina herindeling: hotspots beter georganiseerd per categorie', tag: { label: 'Verbeterd', color: 'amber' } },
      { text: 'Dubbele hotspot-IDs verwijderd: filterpagina toonde geen fantoomkaartjes meer', tag: { label: 'Opgelost', color: 'emerald' } },
    ],
  },
  {
    version: '1.6',
    date: '1 maart 2026',
    title: 'Hondenpsychologie, Topper van de Week & Nieuwpoort',
    subtitle: 'Blog, community en kuststeden groeien verder',
    entries: [
      { text: 'Nieuw blogartikel: hondenpsychologie aan zee — hoe de 4C-methode (Change, Communication, Consistency, Control) helpt op het strand, m.m.v. Guillaume Dervaux & PawControl', tag: { label: 'Blog', color: 'blue' } },
      { text: 'Plaza d\'Amanté toegevoegd in De Haan', tag: { label: 'Nieuwe zaken', color: 'cyan' } },
      { text: 'Topper van de Week: Jason uit Zeebrugge — Katherine geeft haar verhaal', tag: { label: 'Community', color: 'violet' } },
      { text: 'Continu confetti-animatie bij de Topper van de Week-kaart', tag: { label: 'Verbeterd', color: 'amber' } },
      { text: 'In \'t Dorp (Koksijde) voorzien van PawControl 4C-methode info', tag: { label: 'Verbeterd', color: 'amber' } },
    ],
  },
  {
    version: '1.5',
    date: '27–28 februari 2026',
    title: 'AI-klaar, slim zoeken & Nieuwpoort',
    subtitle: 'De site begrijpt ook zoekmachines en AI-assistenten',
    entries: [
      { text: '5 nieuwe hondvriendelijke zaken in Nieuwpoort: Au Blason, Cremerie Artisanaal Ijs, Bar Buvette, De Vismarkt Aan Zee en Cosmopolite Hotel', tag: { label: 'Nieuwe zaken', color: 'cyan' } },
      { text: 'Nieuw: autocomplete zoekbalk op de startpagina — typ een stadsnaam en see suggesties verschijnen', tag: { label: 'Nieuw', color: 'cyan' } },
      { text: 'AI-leesbare versie van de site beschikbaar (llms.txt) — zoekassistenten zoals ChatGPT en Perplexity kunnen de site nu correct lezen', tag: { label: 'Nieuw', color: 'cyan' } },
      { text: 'Zichtbare FAQ-sectie toegevoegd op de startpagina met 6 veelgestelde vragen', tag: { label: 'Nieuw', color: 'cyan' } },
      { text: 'SEO-gestructureerde gegevens (FAQ schema) in de paginacode voor betere vindbaarheid', tag: { label: 'Verbeterd', color: 'amber' } },
      { text: 'Madam Caravan, De Frietboetiek en verbeterde beschrijvingen voor bestaande zaken', tag: { label: 'Verbeterd', color: 'amber' } },
      { text: 'Dubbele FAQ-markup verwijderd die Google Search Console meldde', tag: { label: 'Opgelost', color: 'emerald' } },
    ],
  },
  {
    version: '1.4',
    date: '21–26 februari 2026',
    title: 'Agenda, Community & Koksijde voltooid',
    subtitle: 'De kust wordt steeds completer',
    entries: [
      { text: 'Koksijde volledig uitgebreid met 16 nieuwe hondvriendelijke zaken: hotels, restaurants, koffiebars en tearooms (Lehouck, Eglantier, Akoté, \'t Zoet Genot, Cafelito, Chopin...)', tag: { label: 'Nieuwe zaken', color: 'cyan' } },
      { text: 'In \'t Dorp en \'t Blekkertje toegevoegd in Koksijde', tag: { label: 'Nieuwe zaken', color: 'cyan' } },
      { text: 'Visrestaurant Odé en Brasserie De Barkentijn toegevoegd in Koksijde', tag: { label: 'Nieuwe zaken', color: 'cyan' } },
      { text: 'Agenda-pagina gelanceerd — hondvriendelijke evenementen aan de kust op één plek', tag: { label: 'Nieuw', color: 'cyan' } },
      { text: 'LocalHero-component: highlights per stad, zichtbaar op de stadspagina\'s', tag: { label: 'Nieuw', color: 'cyan' } },
      { text: 'Community "Topper van de Week" systeem gelanceerd — wekelijkse hondenspotlight i.p.v. maandelijks', tag: { label: 'Verbeterd', color: 'violet' } },
      { text: 'Community-pagina volledig herontworpen: gouden naamplaatje, maandthema-kaart', tag: { label: 'Verbeterd', color: 'violet' } },
      { text: 'Agora Bar Food & Drinks toegevoegd in De Panne', tag: { label: 'Nieuwe zaken', color: 'cyan' } },
      { text: 'Modal scroll op mobiel opgelost met verbeterde viewport-eenheden', tag: { label: 'Opgelost', color: 'emerald' } },
    ],
  },
  {
    version: '1.3',
    date: '13–22 februari 2026',
    title: 'Blog & grote prestatieverbetering',
    subtitle: 'Content en snelheid gaan hand in hand',
    entries: [
      { text: 'Blog gelanceerd met het eerste artikel "De Mentale Leiband — Vrijheid met Connectie" (m.m.v. Marc Serneels van VZW Verantwoord Los)', tag: { label: 'Nieuw', color: 'blue' } },
      { text: 'YouTube-video\'s ingebouwd in blogteksten', tag: { label: 'Nieuw', color: 'blue' } },
      { text: 'Uitgelichte artikel-badges (Aanrader) op de blogpagina', tag: { label: 'Nieuw', color: 'blue' } },
      { text: 'Eerste Zeebrugge-hotspot: Club North by Icarus (met Aanrader-badge)', tag: { label: 'Nieuwe zaken', color: 'cyan' } },
      { text: 'Seascape Penthouse toegevoegd in Blankenberge', tag: { label: 'Nieuwe zaken', color: 'cyan' } },
      { text: 'Lighthouse-prestaties omhooggeschoten van score 49 naar 90+ — sneller laden via afbeeldingsoptimalisatie, lazy loading en CLS-aanpassingen', tag: { label: 'Verbeterd', color: 'amber' } },
      { text: 'Afbeeldingen gecomprimeerd: -86 KiB bespaard op de hoofdpagina', tag: { label: 'Verbeterd', color: 'amber' } },
      { text: 'Open Graph afbeeldingen voor social media optimaal ingesteld', tag: { label: 'Verbeterd', color: 'amber' } },
      { text: 'Zeehonden-blog aangevuld met feedback van het NorthSealTeam', tag: { label: 'Verbeterd', color: 'blue' } },
      { text: 'Keurmerk-stickersectie gelanceerd voor aangesloten partners', tag: { label: 'Nieuw', color: 'cyan' } },
      { text: '28 kwaliteitsverbeteringen doorgevoerd: toegankelijkheid, TypeScript-correcties, aria-labels', tag: { label: 'Opgelost', color: 'emerald' } },
    ],
  },
  {
    version: '1.2',
    date: '1–11 februari 2026',
    title: 'Grote uitbreiding: Oostende, Blankenberge & meer',
    subtitle: 'Tientallen nieuwe zaken en slimmere functies',
    entries: [
      { text: '8+ nieuwe hotspots in Oostende: La Vie, De Witte Ezel, Manuscript café (71 Belgische bieren), Restaurant De Golf (hondenmaaltijden & hondenijsjes 🍦), Le Touquet en anderen', tag: { label: 'Nieuwe zaken', color: 'cyan' } },
      { text: 'Gastro Na\'Jo toegevoegd in Oostende — verborgen parel met creatief menu', tag: { label: 'Nieuwe zaken', color: 'cyan' } },
      { text: 'Losloopweide Schorrepark (Oostende) en update Stille Meers (Middelkerke)', tag: { label: 'Nieuwe zaken', color: 'cyan' } },
      { text: '10 nieuwe zaken in Blankenberge (restaurants, cafés, hotels)', tag: { label: 'Nieuwe zaken', color: 'cyan' } },
      { text: 'New Poseidon (Blankenberge), De Zeegeuzen (Oostende), Hippo 12 (Bredene), Brasserie Eloïse (Wenduine), Bar Delta (Knokke-Heist) toegevoegd', tag: { label: 'Nieuwe zaken', color: 'cyan' } },
      { text: 'Nieuwe vakantiewoningen: Sea Sparkle, Pancho (Blankenberge), Vakantiehuis Zee-Hond (De Panne), Maison Clementine, Bungalowpark Jonckershof (Middelkerke)', tag: { label: 'Nieuwe zaken', color: 'cyan' } },
      { text: 'Vercel Analytics geïntegreerd — anonieme bezoekersstatistieken', tag: { label: 'Nieuw', color: 'amber' } },
      { text: 'Categorie "Hotel" hernoemd naar "Slapen" voor bredere inclusiviteit (flats, b&b\'s, bungalows)', tag: { label: 'Verbeterd', color: 'amber' } },
      { text: 'Afbeeldingen gecomprimeerd: 14,8 MB bespaard (98% kleiner)', tag: { label: 'Verbeterd', color: 'amber' } },
      { text: '"Code van de Goede Kustvriend" uitgebreid met zeehondenregels en strandreinigingsgids', tag: { label: 'Verbeterd', color: 'amber' } },
    ],
  },
  {
    version: '1.1',
    date: '27–30 januari 2026',
    title: 'Modals, kaart & nieuwe zaken',
    subtitle: 'Interactie en inhoud verbeterd',
    entries: [
      { text: 'Detailmodal toegevoegd op de Hotspots- en Diensten-overzichtspagina\'s — klik op een zaak voor volledige info zonder de pagina te verlaten', tag: { label: 'Nieuw', color: 'cyan' } },
      { text: 'Interactieve kustkaart verbeterd: eigen locatiepinpunt, dynamische kleurstatussen per stad', tag: { label: 'Verbeterd', color: 'amber' } },
      { text: 'Aantrekkelijke afbeeldingsplaceholder voor zaken zonder foto', tag: { label: 'Verbeterd', color: 'amber' } },
      { text: 'Stijlvolle onderstreepte stadsnaam-titels op de stadspagina\'s', tag: { label: 'Verbeterd', color: 'amber' } },
      { text: 'Instagram-knop toegevoegd in de footer', tag: { label: 'Nieuw', color: 'cyan' } },
      { text: 'Bel\'air, Beach Palace en Cozy Moments toegevoegd in Blankenberge', tag: { label: 'Nieuwe zaken', color: 'cyan' } },
    ],
  },
  {
    version: '1.0',
    date: '22–23 januari 2026',
    title: 'HondAanZee.be is live 🎉',
    subtitle: 'Dag één. Alles begint hier.',
    isLaunch: true,
    entries: [
      { text: 'Lancering van HondAanZee.be — dé gids voor een zorgeloos verblijf met je hond aan de Belgische kust', tag: { label: 'Lancering', color: 'rose' } },
      { text: 'Complete stadsgidsen voor alle 11 badsteden, van De Panne tot Knokke-Heist', tag: { label: 'Nieuw', color: 'cyan' } },
      { text: 'Hotspots, Diensten en Losloopzones per stad', tag: { label: 'Nieuw', color: 'cyan' } },
      { text: 'Moderne responsive design — volledig geoptimaliseerd voor mobiel', tag: { label: 'Nieuw', color: 'cyan' } },
      { text: 'SEO-geoptimaliseerd met sitemap, meta-tags en gestructureerde gegevens', tag: { label: 'Nieuw', color: 'cyan' } },
      { text: 'Juridische pagina\'s: privacybeleid, cookies en algemene voorwaarden', tag: { label: 'Nieuw', color: 'cyan' } },
      { text: 'WebP-geoptimaliseerde afbeeldingen voor alle zaken en locaties', tag: { label: 'Nieuw', color: 'cyan' } },
    ],
  },
];

const tagIcon = (label: string) => {
  switch (label) {
    case 'Nieuw': return <Sparkles size={11} />;
    case 'Nieuwe zaken': return <MapPin size={11} />;
    case 'Verbeterd': return <Zap size={11} />;
    case 'Opgelost': return <Wrench size={11} />;
    case 'Blog': return <BookOpen size={11} />;
    case 'Agenda': return <Calendar size={11} />;
    case 'Community': return <Users size={11} />;
    case 'Lancering': return <Rocket size={11} />;
    default: return <Star size={11} />;
  }
};

interface ReleaseStyles {
  dotClass: string;
  cardClass: string;
  headerClass: string;
  badgeClass: string;
}

function getReleaseStyles(isLaunch: boolean, isNewest: boolean): ReleaseStyles {
  if (isLaunch) {
    return {
      dotClass: 'border-yellow-400 bg-yellow-50 text-yellow-700',
      cardClass: 'border-yellow-200 shadow-yellow-100',
      headerClass: 'border-yellow-100 bg-yellow-50/60',
      badgeClass: 'bg-yellow-100 text-yellow-700',
    };
  }
  if (isNewest) {
    return {
      dotClass: 'border-cyan-400 bg-cyan-50 text-cyan-700',
      cardClass: 'border-cyan-200 shadow-cyan-100',
      headerClass: 'border-cyan-100 bg-cyan-50/40',
      badgeClass: 'bg-cyan-100 text-cyan-700',
    };
  }
  return {
    dotClass: 'border-slate-300 bg-white text-slate-500',
    cardClass: 'border-slate-100',
    headerClass: 'border-slate-100',
    badgeClass: 'bg-slate-100 text-slate-500',
  };
}

const Updates: React.FC = () => {
  useSEO({
    title: 'Updates & Nieuwigheden | HondAanZee.be',
    description: 'Ontdek alle updates, nieuwe hondvriendelijke zaken en verbeteringen die we hebben doorgevoerd op HondAanZee.be — jouw gids voor de Belgische kust.',
    keywords: 'updates hondaanzee, nieuw, changelog, verbeteringen, nieuwe zaken kust',
    canonical: 'https://hondaanzee.be/updates',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-slate-50">
      <div data-header-hero="light" className="relative overflow-hidden pb-24 pt-24 text-white sm:pb-32 sm:pt-28 md:pb-40 md:pt-32">
        <div className="absolute inset-0">
          <img
            src="/lexi.webp"
            alt="Hond op het strand aan zee"
            className="h-full w-full object-cover"
            style={{ objectPosition: 'center 30%' }}
          />
          <div className="absolute inset-0 bg-slate-950/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-950/20 to-slate-950/55" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_28%),radial-gradient(circle_at_left_center,rgba(255,255,255,0.08),transparent_22%)]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm">
              <Sparkles size={14} />
              Laatste grote update: vandaag
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
              Wat is er{' '}
              <span className="relative inline-block text-sky-300">
                nieuw?
                <svg className="absolute -bottom-1 left-0 h-3 w-full text-sky-300/35 sm:-bottom-2 sm:h-4" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 25 0 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="8" />
                </svg>
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-100 sm:text-lg md:text-xl">
              Elke verbetering, elke nieuwe zaak en elk nieuw idee: hier houden we bij wat er groeit op HondAanZee.be. Geen codepraat, wel wat jij als bezoeker echt merkt.
            </p>
          </div>
        </div>

        <div className="absolute -bottom-3 left-0 w-full overflow-hidden leading-[0]">
          <div className="wave-animation" style={{ display: 'flex', width: '200%' }}>
            <svg
              className="block h-[60px] sm:h-[80px] md:h-[110px]"
              style={{ minWidth: '100%', flex: '0 0 50%' }}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <path
                d="M0,60 C200,20 400,100 600,60 C800,20 1000,100 1200,60 L1200,120 L0,120 Z"
                className="fill-current text-slate-50"
              />
            </svg>
            <svg
              className="block h-[60px] sm:h-[80px] md:h-[110px]"
              style={{ minWidth: '100%', flex: '0 0 50%' }}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <path
                d="M0,60 C200,20 400,100 600,60 C800,20 1000,100 1200,60 L1200,120 L0,120 Z"
                className="fill-current text-slate-50"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto -mt-20 max-w-3xl px-4 pb-20 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-16 rounded-[2rem] border border-slate-200 bg-white/96 p-6 text-center shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-8">
          <div className="inline-flex items-center justify-center p-4 bg-cyan-100 text-cyan-600 rounded-2xl mb-6 shadow-sm">
            <Sparkles size={40} strokeWidth={2} />
          </div>

          {/* Snapshot stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-2xl border border-slate-100 shadow-sm px-4 py-5 flex flex-col items-center">
              <span className="text-3xl font-black text-cyan-600">{releases.length}</span>
              <span className="text-xs text-slate-500 mt-1 font-medium">releases</span>
            </div>
            <div className="bg-slate-50 rounded-2xl border border-slate-100 shadow-sm px-4 py-5 flex flex-col items-center">
              <span className="text-3xl font-black text-sky-600">10+</span>
              <span className="text-xs text-slate-500 mt-1 font-medium">dagen verbeterd</span>
            </div>
            <div className="bg-slate-50 rounded-2xl border border-slate-100 shadow-sm px-4 py-5 flex flex-col items-center">
              <span className="text-3xl font-black text-emerald-600">120+</span>
              <span className="text-xs text-slate-500 mt-1 font-medium">aangesloten zaken</span>
            </div>
            <div className="bg-slate-50 rounded-2xl border border-slate-100 shadow-sm px-4 py-5 flex flex-col items-center">
              <span className="text-3xl font-black text-amber-500">11</span>
              <span className="text-xs text-slate-500 mt-1 font-medium">badsteden</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mb-10 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Labels</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Nieuw', color: 'cyan' },
              { label: 'Nieuwe zaken', color: 'cyan' },
              { label: 'Verbeterd', color: 'amber' },
              { label: 'Opgelost', color: 'emerald' },
              { label: 'Blog', color: 'blue' },
              { label: 'Community', color: 'violet' },
              { label: 'Lancering', color: 'rose' },
            ].map(t => (
              <span
                key={t.label}
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${TAG_STYLES[t.color]}`}
              >
                {tagIcon(t.label)}
                {t.label}
              </span>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[22px] top-8 bottom-8 w-px bg-gradient-to-b from-cyan-300 via-sky-200 to-slate-200 hidden sm:block" aria-hidden="true" />

          <div className="space-y-10">
            {releases.map((release, idx) => {
              const { dotClass, cardClass, headerClass, badgeClass } = getReleaseStyles(!!release.isLaunch, idx === 0);
              return (
              <article key={release.version} className="relative sm:pl-14">
                {/* Timeline dot */}
                <div
                  className={`absolute left-0 top-5 w-11 h-11 rounded-full border-2 items-center justify-center font-black text-xs hidden sm:flex shadow-sm ${dotClass}`}
                  aria-hidden="true"
                >
                  {release.isLaunch ? <Rocket size={18} /> : `v${release.version}`}
                </div>

                {/* Card */}
                <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${cardClass}`}>

                  {/* Card header */}
                  <div className={`px-6 pt-6 pb-5 border-b flex items-start justify-between gap-4 ${headerClass}`}>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${badgeClass}`}>
                          {release.isLaunch ? '🚀 v1.0' : `v${release.version}`}
                        </span>
                        {idx === 0 && !release.isLaunch && (
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-500 text-white">Nieuwste</span>
                        )}
                      </div>
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">{release.title}</h2>
                      <p className="text-sm text-slate-500 mt-0.5">{release.subtitle}</p>
                    </div>
                    <time className="text-xs font-mono text-slate-400 whitespace-nowrap pt-1 shrink-0">{release.date}</time>
                  </div>

                  {/* Entries */}
                  <ul className="px-6 py-5 space-y-3">
                    {release.entries.map((entry) => (
                      <li key={entry.text} className="flex items-start gap-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border shrink-0 mt-0.5 ${TAG_STYLES[entry.tag.color]}`}
                        >
                          {tagIcon(entry.tag.label)}
                          {entry.tag.label}
                        </span>
                        <span className="text-sm text-slate-700 leading-relaxed">{entry.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
              );
            })}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-16 bg-gradient-to-br from-sky-600 to-cyan-500 rounded-3xl p-8 text-center text-white shadow-xl shadow-sky-200">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-3 rounded-2xl">
              <PawPrint size={32} strokeWidth={2.5} />
            </div>
          </div>
          <h3 className="text-2xl font-black mb-3">Elke week groeit de gids verder</h3>
          <p className="text-sky-100 leading-relaxed max-w-md mx-auto mb-6">
            Ken jij een hondvriendelijke zaak die hier nog niet bij staat? Laat het ons weten — samen maken we de kust completer.
          </p>
          <a
            href={`https://wa.me/32494816714?text=${encodeURIComponent('Dag! 👋\n\nIk ken een hondvriendelijke zaak die nog niet op HondAanZee.be staat. Mogen jullie dit toevoegen?\n\nBedankt!')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-sky-700 font-bold px-6 py-3 rounded-xl hover:bg-sky-50 transition-colors shadow-lg"
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
              <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Zm0 0a5 5 0 0 0 5 5m0 0h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1Z" />
            </svg>
            Zaak aanmelden via WhatsApp
          </a>
        </div>

      </div>
    </div>
  );
};

export default Updates;
