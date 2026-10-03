# Hond aan Zee: uitvoering van het admin-dashboard

Opgesteld en bijgewerkt op 2 oktober 2026. Het door Kevin goedgekeurde interactieve ontwerp is de visuele referentie. De onderstaande voortgang maakt onderscheid tussen lokaal gebouwde onderdelen, live ingerichte infrastructuur en nog te bouwen functies.

Gerichte aanvulling van 3 oktober 2026: het ontbrekende agendabeheer en de evenementanalytics hebben nu een eigen [uitvoeringsplan](ADMIN_AGENDA_PLAN.md), gecontroleerd tegen bronversie `d2e4889` en de live agenda. Dat plan beschrijft de beginsituatie en de uitvoering. De 21 publieke fiches zijn technisch indexeerbaar. De agenda-editor, revisies, publicatiesnapshots en rapporten staan live. Opslaan en publiceren zijn met het echte adminaccount gecontroleerd; de release is op productie bevestigd. Zie [het implementatierapport](ADMIN_AGENDA_IMPLEMENTATIE.md). Analytics valideert evenementen nu tegen gepubliceerde database-identiteiten. Deze aanvulling actualiseert uitsluitend de agendastatus, niet alle overige onderdelen van dit historische dashboardplan.

Aanvulling websiteanalytics van 3 oktober 2026: Kevin koos voor dagelijks geschatte bezoekers zonder cookies. De eigen meting krijgt een schakelaar tussen bezoekers en paginaweergaven; de meetdefinitie en dekking staan in [het actuele analyticsrapport](ADMIN_ANALYTICS_METING.md).

## Beslissingen die vaststaan

- De admin krijgt de visuele taal van het goedgekeurde concept: een lichte achtergrond, witte oppervlakken, een vaste zijbalk op desktop, duidelijke titels, subtiele randen en blauw als accentkleur.
- Nieuwe afbeeldingen die via het dashboard worden geüpload, worden uitsluitend opgeslagen in en geserveerd vanuit Cloudflare R2.
- Bestaande afbeeldingsbestanden, locaties, URL's, uitsneden en galerijvolgorde blijven behouden. Er komt geen automatische beeldmigratie of vervanging.
- Supabase verzorgt accounts, inhoud, verwijzingen naar afbeeldingen, publicatiestatus en compacte analytics. Er komen voor deze dashboarduploads geen Supabase Storage-buckets of afbeeldingsproxy's.
- De bestaande website, zaak-URL's, SEO, reviews, meldpunt en notificaties moeten blijven functioneren.
- Nieuwe functies krijgen echte gegevens en duidelijke lege, laad- en fouttoestanden. Voorbeeldcijfers uit het ontwerp worden geen productiegegevens.

## Gecontroleerde beginsituatie

De catalogus bevat 133 hotspots en 24 diensten. De brongegevens staan in `data/hotspots.ts` en `data/services.ts`. De types ondersteunen onder meer stabiele slugs, categorieën, beschrijvingen, tags, foto's, galerijen, adressen, contactgegevens en voor hotspots openingsuren.

Bij aanvang koppelde `App.tsx` `/admin` aan meldpuntbeheer, `/admin/log` aan het meldpuntlogboek en `/admin/notificaties` aan notificatiebeheer. De lokale dashboardbouw verplaatst het meldpunt naar `/admin/meldpunt`. De bestaande adminauthenticatie gebruikt Supabase; de Edge Functions controleren de gebruiker ook aan de serverkant.

Zaakpagina's en overzichten worden tijdens de build tot volledige HTML gerenderd. Sitemap, metadata, wijzigingsdatums en sociale previews gebruiken dezelfde catalogus. Een dashboardwijziging moet daarom zowel de openbare sitegegevens als de buildbronnen bijwerken.

Contactacties worden momenteel via `utils/placeAnalytics.ts` naar Vercel verstuurd. Het formulier voor zakelijke aanmeldingen verwijst momenteel naar WhatsApp en e-mail.

### Toegangsaudit

| Onderdeel | Gecontroleerd resultaat | Wat nog nodig is |
| --- | --- | --- |
| Repository | Lokale broncode is beschikbaar; Git-remote is `kevinb42O/Hondaanzee`. | Geen toegang nodig om lokaal te bouwen. Pushrechten zijn nog niet gecontroleerd. |
| Supabase productie | Browserlogin en Management API werken voor `zpllibfxaizavcvztnut`. Schema en policies gelezen; zes afgeschermde dashboardtabellen toegevoegd en 157 volledige zaakobjecten geïmporteerd. | Geen bijkomende projectlogin nodig. De tijdelijke bouwtoken vervalt op 9 oktober 2026. |
| Supabase MCP-configuratie | De lokaal geconfigureerde server `supabase-test` wijst naar `eycdnjdwovwtoepvhjsf`, een ander project. In deze sessie zijn geen Supabase-beheertools beschikbaar. | Juiste projectkoppeling beschikbaar maken in deze chat; het andere project ongemoeid laten. |
| Vercel | De Chrome-browser is ingelogd en toont project `hondaanzee` bij `lanternnetworks-projects`, productie op `hondaanzee.be` en gekoppelde repository. De eerdere CLI-token gaf HTTP 403; een normale Vercel CLI-login is op 2 oktober hersteld en account `kevinb42o` en het juiste project zijn via de CLI gecontroleerd. | CLI- en browserbeheer werken. Productie volgt main. De expliciet goedgekeurde token `hondaanzee-dashboard-publication` is beperkt tot dit project, vervalt 2 oktober 2027 en staat veilig in Supabase; toegang tot een ander project wordt geweigerd. |
| Cloudflare R2 | Account `f066c9835dfd45eb7d23db73b9beaff9`: `hondaanzee-uploads` en `hondaanzee-media` aangemaakt in EU-jurisdictie, beide privé. Objectsleutel uitsluitend voor deze twee buckets, geldig tot 2 oktober 2027. R2-secrets ingesteld in de bestaande Supabase Edge Function-omgeving. | Openbare mediadomeinkoppeling en de uploadfunctie zelf. S3-endpoint moet `.eu.r2.cloudflarestorage.com` gebruiken. |
| Easyhost / DNS | Ingelogde Chrome-sessie gelezen. Website verwijst naar Vercel; mail naar Mailprotect. Na expliciete toestemming is DNSSEC tijdelijk uitgezet bij Easyhost om 18.49 uur CEST. Om 19.09 uur CEST was het oude DS-record bij alle zes .be-servers afwezig. De huidige drie Easyhost-nameservers zijn behouden tijdens de cachetermijn. | Bevestigde route voor het openbare mediadomein. De gratis Cloudflare-zone is alleen voorbereid, nog niet autoritatief. |

De Supabase-bouwtoken heeft alleen projecttoegang: lezen van projectinstellingen, advisors, logs en usage; schrijven voor database, migraties, Edge Functions en hun secrets. Geen account-/billing-/Storage-/authconfiguratierechten of recht om Supabase-API-sleutels op te halen. De bestaande backend-servicekey blijft serverzijdig. Geheime lokale waarden staan met bestandsrechten `600` in de door Git genegeerde `.admin-local/credentials.local`; geen waarde is opgenomen in de broncode of chat.

### Live ingerichte databasebasis en R2

- Migratie `20261002162247_admin_content_foundation` voegt `content_places`, `content_place_revisions`, `media_assets`, `content_releases`, `publication_jobs` en `admin_activity_log` toe. Alle zes gebruiken RLS en weigeren anon/authenticated-tabeltoegang; toekomstige adminfuncties moeten de bestaande serverzijdige admincontrole gebruiken.
- De 133 hotspots en 24 diensten zijn exact geïmporteerd als volledige JSON-objecten. De oorspronkelijke IDs, slugs, gemeenten, optionele velden, foto-URLs en galerijvolgorde zijn vergeleken met de broncode. De openbare website gebruikt voorlopig nog steeds haar bestaande buildgegevens.
- Conceptopslaan heeft een atomische functie met versiecontrole en behoud van de oorspronkelijke route. Elke save voegt een revisie toe; geschiedenis en releases kunnen inhoudelijk niet worden overschreven. De eerste webformulieren en `admin-content`-Edge Function zijn gebouwd. De create-RPC is met migratie `admin_create_draft` toegevoegd; nieuwe zaken beginnen zonder gepubliceerde revisie. Echte adminlogin en geauthenticeerde backendaanvragen zijn op productie gecontroleerd.
- Schema, herhaalde import, conceptisolatie, versieconflict, vaste identiteit en onveranderlijke geschiedenis zijn eerst getest in een volledig teruggedraaide transactie. Daarna zijn de migratie en import toegepast. Werkelijke anonieme REST-verzoeken naar alle zes tabellen zijn geweigerd met HTTP 401 / `42501`.
- De aantallen in alle zeven bestaande tabellen waren vóór en na deze stap gelijk. Geen bestaande tabel of policy is door de migratie gewijzigd.
- R2 lezen en schrijven zijn met de nieuwe sleutel getest. Alleen een eigen tijdelijk controleobject in de nieuwe uploadbucket werd aangemaakt en opgeruimd. Geen bestaand beeld of andere bucket is gewijzigd.
- De private uploadbucket accepteert CORS PUT vanaf `https://hondaanzee.be`, `https://www.hondaanzee.be`, `http://localhost:3000` en `http://127.0.0.1:3000`, met `Content-Type` en `If-None-Match`. Preflight voor toegelaten origins werkt; een andere origin is geweigerd. Geen wildcard voor willekeurige Vercel-previews.
- Beide buckets hebben hun openbare ontwikkel-URL uitgeschakeld. Er is nog geen openbare beeld-URL actief.

### Mediadomein: goedgekeurde overgang, cachetermijn loopt

Een R2 custom domain vereist een Cloudflare-zone in hetzelfde account. Er is een gratis, inactieve zone voor `hondaanzee.be` voorbereid. De negen bestaande functionele records (A, CNAME, twee MX, vier SRV en TXT) zijn met Easyhost en de autoritatieve DNS vergeleken; de scan miste `_autodiscover._tcp`, dat in de inactieve kopie is aangevuld. Website-records staan in die kopie op DNS only, zodat Vercel ook na een eventuele omschakeling rechtstreeks blijft serven. De geïmporteerde records hebben voorlopig Auto TTL; het aangevulde SRV-record heeft de oorspronkelijke 3600 seconden.

Cloudflare stelde `gerardo.ns.cloudflare.com` en `nelly.ns.cloudflare.com` voor. Kevin heeft de nameserverwissel, tijdelijke DNSSEC-onderbreking, herstel van DNSSEC en het openbaar koppelen van uitsluitend `hondaanzee-media` aan `media.hondaanzee.be` expliciet goedgekeurd.

De Easyhost-DNSSEC-schakelaar is op 2 oktober om 18.49 uur CEST uitgezet. Op 2 oktober om 19.09.12 uur CEST bevestigden alle zes .be-nameservers dat het oude DS-record verwijderd is. Het oorspronkelijke DS-record had een autoritatieve TTL van **86400 seconden**. Daarom geen nameserverwissel vóór **3 oktober 2026, 19.15 uur CEST** (24 uur plus marge na bevestiging). De Easyhost-zone bleef daarna nog ondertekende antwoorden serveren; resolvers met de oude DS-cache konden de bestaande site dus nog valideren.

De domeinregistratie blijft bij Easyhost, webhosting bij Vercel en e-mail bij Mailprotect. De nameservers zijn nog niet gewijzigd. De negen functionele records blijven in de voorbereide Cloudflare-kopie behouden.

R2 laat de custom-domainreview toe nu de zone bestaat, maar de definitieve connectie gaf een fout tijdens de inactieve zone. De poging is afgesloten; geen custom domain toegevoegd, beide buckets blijven privé en hun r2.dev-URLs blijven uitgeschakeld. Herhaal pas na zoneactivatie, met minimaal TLS 1.2.

Het herstellen van DNSSEC voor externe Cloudflare-nameservers is nog niet geverifieerd bij Easyhost. Het zichtbare controlepaneel en de officiële help tonen alleen automatische DNSSEC en geen invoer voor externe DS-gegevens. Niet aannemen dat de Easyhost-schakelaar automatisch Cloudflare ondersteunt. Controleer de juiste DS-registratieroute vóór de definitieve omschakeling; schakel de oude Easyhost-DS niet opnieuw in op een Cloudflare-zone. Eventueel contact met support vereist afzonderlijke toestemming om namens Kevin een bericht te sturen. Geen supportbericht verzonden.

De openbare, niet-geheime verificatie staat ook in `.admin-local/dns-transition-state.json` voor hervatting. Er is geen automatische vervolgtaak ingepland.

## Gebouwd en gecontroleerd op 2 oktober 2026

- De dashboardlayout staat op main en productie op `https://www.hondaanzee.be/admin`, met mobiele navigatie, bestaande Supabase-login, noindex en uitsluiting van adminverkeer uit metingen.
- Alle 157 oorspronkelijke zaken zijn geïmporteerd. Gepubliceerde JSON-inhoud wordt vóór de eerste catalogusrelease volledig vergeleken met de oorspronkelijke bron. Afbeeldingen en vaste URL's blijven behouden.
- Zakenbeheer: bestaande zaken bewerken en nieuwe concepten maken; tekst, categorie, kenmerken, sociale links, openingstijden, galerijselectie en uitsnede. Alleen gewijzigde velden worden opgeslagen. Atomaire versiecontrole, revisies en waarschuwing bij niet-opgeslagen wijzigingen.
- De conceptpreview gebruikt het bestaande openbare zaaktemplate binnen de afgeschermde admin.
- R2-upload is gebouwd: browser bereidt statische WebP voor (maximaal 1800 px / 2 MB), rechtstreeks PUT naar private staging, server decodeert en hercodeert, verwijdert metadata en schrijft uitsluitend gecontroleerde nieuwe bestanden naar `hondaanzee-media`. Het gepinde npm-WASM-runtimebestand staat privé in R2 en wordt met SHA-256 gecontroleerd. De echte gedeployde decoder is getest. Bestaande afbeeldingen worden niet gemigreerd.
- **R2-upload blijft geblokkeerd totdat `media.hondaanzee.be` actief en geverifieerd is.** DNS-overgang volgt het afzonderlijke veilige tijdvenster hieronder; DNSSEC-herstel voor externe nameservers moet nog met Easyhost geverifieerd worden. Er is nog geen automatische staging-opruimregel ingesteld; configureer deze voor alleen nieuwe tijdelijke uploads vóór activering.
- Eigen analytics: paginaweergaven en contactacties, dag- en uurweergave, populaire pagina’s, bronnen, apparaten en CSV. Op 3 oktober uitgebreid met een schakelaar naar dagelijks geschatte bezoekers zonder cookies. Websitebezoekers worden apart ontdubbeld; periodetotalen zijn de som van dagelijkse schattingen. Tijdelijke dagelijkse hashes voor deduplicatie en misbruikbegrenzing worden dagelijks opgeruimd; rapporten bevatten uitsluitend totalen. Zie [meetdefinitie en validatie](ADMIN_ANALYTICS_METING.md). DNT/GPC en bestaande aggregaatretentie blijven behouden.
- Vercel-historiek is echt via de officiële API geïmporteerd en privé opgeslagen: 52.280 paginaweergaven, 16.093 unieke bezoekers volgens Vercel, oorspronkelijke totaaltelling vanaf 26 januari tot export op 2 oktober 2026 18:01 UTC. Dagdetails van 2 september tot exportmoment vandaag; laatste dag gedeeltelijk. Pagina-, bron- en apparaatdimensies hebben gecontroleerd hetzelfde weergavetotaal. Hobby geeft geen oudere dagdetails of custom events. Historiek en eigen meting staan afzonderlijk om overlap te voorkomen; unieke dagbezoekers worden niet opgeteld.
- Publiceren: onveranderlijke catalogussnapshot, beperkte projecttoken, productiebuild van main, dezelfde snapshot voor React/HTML/sitemap/sociale metadata. Status wordt pas live nadat Vercel de juiste productieassignment én het domein de exacte release/hash bevestigen. Een private cron controleert lopende publicaties ook nadat de browser sluit.
- Meldpunt, logboek en notificatiebeheer zijn in de layout geïntegreerd. Bestaande databasegegevens blijven behouden.

Authenticatie met het bestaande `admin@hondaanzee.be`-account en het door Kevin gevraagde nieuwe wachtwoord is via Supabase Auth succesvol getest. Het wachtwoord is niet opgenomen in deze documentatie of Git. De tijdelijk gebruikte server-Auth-credential is lokaal verwijderd.

Validatie: 137 tests, productiebuild van alle 224 openbare routes en 157 zaakpagina's, adminbrowsercontrole (nagebootste responses), echte geauthenticeerde backendaanvragen, private R2-runtime-integriteit en gedeployde decoder. De eerste echte cataloguspublicatie moet na deze main-push nog volledig worden gecontroleerd; pas daarna is de publicatieketen bewezen.

## Bouwvolgorde en oplevercriteria

### 1. Dashboardstructuur en bestaande admin integreren

- Een gedeelde adminlayout met zijbalk, kopbalk, sessiebeheer en mobiele navigatie.
- `/admin` wordt het nieuwe werkoverzicht; meldpuntbeheer krijgt `/admin/meldpunt`.
- `/admin/log`, `/admin/notificaties` en `/_meldpunt-admin` behouden een werkende route of expliciete redirect.
- Zaken, Analytics, Meldpunt en Notificaties krijgen navigatie. Strandregels en redactionele modules worden toegevoegd zodra ze bruikbaar zijn.
- Het overzicht toont de bestaande catalogus en beschikbare echte backendgegevens. Ontbrekende koppelingen worden herkenbaar weergegeven.
- Alle `/admin/*`-routes gebruiken de adminlayout en worden uitgesloten van openbare bezoekersmetingen en indexering.

**Klaar wanneer:** desktop en mobiel overeenkomen met de goedgekeurde richting, login en uitloggen werken en bestaande beheertaken bereikbaar blijven.

### 2. Centrale catalogus en zakenbeheer

- Eerst het echte databaseschema en bestaande policies controleren. De migratie voegt nieuwe tabellen toe en verandert geen bestaande meldpunt-, notificatie- of reviewtabellen zonder functionele noodzaak.
- De huidige 157 zaken één keer importeren met behoud van inhoud, bestaande IDs, permanente slugs en alle afbeeldingsverwijzingen. De import is herhaalbaar zonder dubbele zaken.
- De centrale catalogus ondersteunt concepten, gepubliceerde revisies en archiveren. De openbare inhoud leest alleen een gepubliceerde revisie.
- Formulieren voor gegevens die de huidige types werkelijk ondersteunen: naam, gemeente, categorie, samenvatting/beschrijving, hondvriendelijke kenmerken, adres, contacten, foto's en galerij. Openingstijden alleen waar het inhoudsmodel die ondersteunt.
- Slugs blijven behouden wanneer de naam wijzigt. Wijziging van een bestaande URL vereist een expliciete redirectstrategie.
- Filters en zoeken op naam, gemeente, categorie en publicatiestatus.
- Een voorbeeldweergave gebruikt hetzelfde zaakpaginasjabloon als de website. Opslaan van een concept verandert geen openbare pagina.
- Wijzigingsgeschiedenis en versiecontrole voorkomen het stil overschrijven van gelijktijdige aanpassingen.

**Klaar wanneer:** een bestaande zaak zonder inhoudsverlies kan worden bewerkt en een nieuwe zaak als concept kan worden opgeslagen en bekeken.

### 3. R2-upload en beeldbeheer

- Voorgesteld openbaar domein: `media.hondaanzee.be`. Kevin mag een bestaand domein of bestaande buckets aanwijzen.
- Voorkeur: een private stagingbucket voor nog niet gecontroleerde uploads en een publieke mediabucket voor goedgekeurde afbeeldingen. Beide zijn R2; Supabase bewaart alleen metadata en verwijzingen.
- Een geauthenticeerde serverfunctie verstrekt een kort geldige upload-URL voor één gegenereerde objectkey. De browser uploadt rechtstreeks naar het R2 S3-endpoint.
- In v1 ondersteuning voor JPEG, PNG en WebP. Afmetingen/oriëntatie corrigeren en waar passend WebP-versies maken; maximale bestandsgrootte en pixelafmetingen afdwingen.
- De definitieve uploadcontrole verifieert bestandsgrootte, echte beeldinhoud en afmetingen. Alleen gecontroleerde bestanden worden beschikbaar gemaakt onder een openbare URL. SVG en uitvoerbare inhoud zijn geen toegestane uploads.
- CORS toestaan voor de website en expliciete ontwikkel-/previeworigins. R2-sleutels en servercredentials komen nooit in de browserbundel.
- Nieuwe objecten krijgen unieke keys; een afbeelding vervangen overschrijft geen bestaand object.
- Galerijvolgorde, hoofdfoto, uitsnede en alttekst beheren.
- Alleen nieuwe, ongebruikte R2-objecten komen voor opruiming in aanmerking. Bestaande sitebestanden en door gepubliceerde revisies gebruikte beelden worden niet automatisch verwijderd.
- De v1 beeldbank toont ook bestaande verwijzingen, maar beheert uitsluitend nieuwe R2-uploads als R2-objecten.

**Klaar wanneer:** een geautoriseerde upload op een R2-URL verschijnt, ongeldige uploads worden geweigerd en alle oorspronkelijke afbeeldingsverwijzingen behouden zijn.

### 4. Publiceren met behoud van SEO

- Een publicatie maakt een onveranderlijke snapshot van de volledige gepubliceerde catalogus, inclusief de nieuw gekozen revisies.
- Eén release-ID bindt zaakpagina's, overzichten, gemeentegids, kaart, metadata, sitemap en wijzigingsdatums aan dezelfde gegevensversie. De build haalt die snapshot één keer op; browser en gegenereerde HTML gebruiken dezelfde snapshot.
- Tijdens de eerste implementatie kan de huidige databestandencatalogus als expliciete oude versie dienen. Bij een fout tijdens het ophalen van een geplande release stopt de build; geen stille terugval met verloren dashboardwijzigingen.
- Publicatiestatussen: concept, publicatie aangevraagd, bouwen, live en mislukt. Een gestart deployverzoek is nog geen succesvolle publicatie.
- Publicaties worden geordend zodat overlappende builds geen oudere revisie als nieuwste versie kunnen publiceren.
- Een Vercel-deployment voor het juiste project ontvangt de exacte release-ID. De dashboardstatus wordt pas live wanneer de bijbehorende deployment succesvol op het productiedomein staat.
- Bij een mislukte build blijft de bestaande siteversie bereikbaar en kan de publicatie opnieuw worden geprobeerd. Terugzetten van een release laat bijbehorende afbeeldingen beschikbaar.
- Bestaande zaak-URLs, SEO-velden, sitemapentries en beeldverwijzingen worden automatisch vergeleken bij de eerste overgang.

**Klaar wanneer:** een nieuwe zaak volledig in HTML, sitemap, kaart en overzichten staat; mislukte publicaties laten de vorige siteversie intact.

### 5. Eigen analytics en rapporten per zaak

- Nieuwe productiegegevens verzamelen vanaf de activering; historische Vercel-gegevens worden niet vanzelf overgenomen.
- Beginnen met paginaweergaven, zaakpaginaweergaven en contactacties: website, route, telefoon en social.
- De eerste versie gebruikt het label `paginaweergaven`. `Bezoeken`, `sessies` en `unieke bezoekers` verschijnen pas wanneer daarvoor een expliciete meetdefinitie en implementatie zijn vastgesteld.
- Interne adminroutes, ontwikkelverkeer en bekende automatische verzoeken uitsluiten. Metingen blijven indicatief; adblockers en onbekende bots kunnen de telling beïnvloeden.
- Een serverendpoint valideert routes en actietypes, beperkt misbruik en schrijft compacte records. Geen openbare leesrechten op analytics en geen rechtstreekse ongecontroleerde database-inserts vanuit de browser.
- Queryparameters, volledige referrer-URLs en vrije tekst niet opslaan. Alleen nuttige categorieën zoals referrerdomein, gemeente, apparaatklasse en zaak-ID.
- Voorlopige retentie: detailgegevens maximaal 30 dagen; dagaggregaties 13 maanden. Indexen, opschoning en opslagvolume controleren op het Supabase Free-project voordat de collector wordt ingeschakeld.
- Aggregaties voor 7 dagen, 30 dagen en vervolgens langere perioden zodra voldoende echte data beschikbaar zijn.
- Rapport per zaak: paginaweergaven en contactkliks, uitgesplitst naar actietype. Contactkliks worden nooit als bevestigde klanten, reserveringen of fysieke bezoeken gepresenteerd.
- Vercel-metingen blijven tijdens een korte validatieperiode beschikbaar. De overgang naar de eigen collector volgt zodra de nieuwe telling en beheerpagina werken.

**Klaar wanneer:** echte websiteacties verschijnen in het dashboard, adminverkeer wordt uitgesloten en de bewaartermijn aantoonbaar wordt uitgevoerd.

### 6. Aanmeldingen en informatiekwaliteit

- Een eigen zakelijk aanmeldformulier maakt een voorstel in een inbox; ontvangen is geen automatische publicatie.
- De bestaande contactmogelijkheden blijven bruikbaar.
- Strandregels krijgen officiële bronnen, controledata, seizoensinformatie en een controleworkflow. De huidige regels worden exact als uitgangspunt overgenomen.
- Agenda krijgt voorrang als afzonderlijke uitbreiding volgens [ADMIN_AGENDA_PLAN.md](ADMIN_AGENDA_PLAN.md), inclusief beheer, publicatie en analytics. Blog, homepageblokken en zakelijke rapportexports blijven vervolgstappen.
- Bestaande publieke workflows met afbeeldingen, zoals eventuele meldpuntfoto's, worden afzonderlijk geïnventariseerd. Hun bestaande foto's blijven behouden; nieuwe uploadondersteuning gebruikt hetzelfde R2-principe.

## Voorlopig datamodel

De zes content-/mediatabellen zijn na de live schema-audit toegevoegd zonder botsingen. Analytics en het private Vercel-archief zijn toegevoegd met RLS; geen openbare lees- of schrijfpolicy.

| Entiteit | Doel |
| --- | --- |
| `content_places` | Identiteit, type en permanente route van elke zaak; koppeling met bestaande IDs. |
| `content_place_revisions` | Bewerkbare concepten en onveranderlijke gepubliceerde inhoud. |
| `media_assets` | R2-key, openbare URL, afmetingen, alttekst en gebruik; legacy-verwijzingen blijven herkenbaar. |
| `content_releases` | Exacte catalogussnapshot per sitepublicatie. |
| `publication_jobs` | Release, Vercel-deployment en status/foutmelding. |
| `admin_activity_log` | Wie welke inhoud wanneer heeft gewijzigd. |
| `analytics_rate_limits` / `analytics_daily_budget` | Dagelijks begrensd misbruikbeheer. |
| `analytics_imports` | Afzonderlijk, authentiek Vercel-archief met bron, meetperiode en integriteitshash. |
| `analytics_daily` | Compacte rapportage per dag, pagina/zaak en actietype. |

Adminrechten worden aan de serverzijde afgedwongen. Het bestaande beheeraccount is het uitgangspunt. Nieuwe rollen en bijkomende beheerders worden pas toegevoegd wanneer nodig.

## Precies wat Kevin moet aanleveren of koppelen

1. **Supabase:** al geregeld. Geen wachtwoord of sleutel in de chat nodig. Tijdelijke beheertoegang is beschikbaar tot 9 oktober 2026.
2. **Cloudflare/R2:** buckets en beperkte credentials zijn geregeld. De DNS-/domeinroute is expliciet goedgekeurd. De cachetermijn loopt tot 3 oktober rond 19.15 uur CEST; de externe DNSSEC-herstelroute moet nog gecontroleerd worden. Easyhost blijft desgewenst registrar en Vercel de host.
3. **Vercel:** browsertoegang is aanwezig. CLI-authenticatie is hersteld. De beperkte projecttoken is na expliciete goedkeuring aangemaakt en in Supabase ingesteld; de private buildcredential staat alleen in Vercel productie en Supabase.

Geheime waarden worden via gekoppelde accounts of lokaal/extern secretbeheer ingesteld, niet in de chat of Git. `.env.admin.example` geeft de voorgestelde variabelen; echte lokale waarden horen in de reeds genegeerde `.env.local`.

Geen nieuwe keuze nodig voor het ontwerp, de bestaande afbeeldingen of het bestaande beheeraccount. De eerste lokale bouwstap kan beginnen terwijl deze toegang wordt hersteld.

## Verificatie vóór oplevering

- Desktop- en mobiele controle van adminnavigatie, login, formulieren, previews en uploads.
- Bestaande meldpunt-, logboek-, notificatie- en reviewflows controleren.
- Onbevoegde inhoudswijzigingen en uploads weigeren; nieuwe credentials niet in statische buildbestanden.
- Catalogusimport vergelijken met alle 157 huidige zaken; stabiele URLs en bestaande afbeeldingen behouden.
- Publicatie controleren als volledige keten: concept → snapshot → build → productie → dashboardstatus.
- Mislukte upload, mislukte build en gelijktijdig bewerken controleren.
- `npm test`, `npm run build` en `npm run test:places` uitvoeren waar relevant; browsercontrole uitbreiden voor de nieuwe adminflows.
- R2-upload, publieke afbeelding en CORS met echte configuratie controleren vóór de uploadfunctie als gereed wordt gemarkeerd.
- Productie-analytics controleren zonder meetverkeer uit de admin of testomgeving toe te voegen.

## Officiële referenties

- [R2 presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/): tijdelijke uploads via het S3-endpoint; custom domains zijn niet het endpoint voor ondertekende S3-verzoeken.
- [R2 CORS](https://developers.cloudflare.com/r2/buckets/cors/): browseruploads vereisen een geschikte CORS-configuratie.
- [R2 public buckets](https://developers.cloudflare.com/r2/buckets/public-buckets/): productiemedia via een custom domain; `r2.dev` is bedoeld voor ontwikkeling en kent beperkingen.
- [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started): projectbeheer vereist een werkende authenticatie en juiste projectkoppeling.
- [Vercel deploy hooks](https://vercel.com/docs/deploy-hooks): een hook kan een build starten; de release-identiteit en bevestiging van live publicatie moeten aanvullend worden geregeld.
