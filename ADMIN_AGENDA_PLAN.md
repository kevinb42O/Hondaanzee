# Agenda beheren en meten vanuit /admin

Opgesteld op 3 oktober 2026, op verzoek van Kevin. Gecontroleerde bronversie: `d2e4889a163a1de8d9bd543ea249c29a50d9299c`. De remote-defaultbranch `main` wees bij de controle naar dezelfde commit. Dit document bewaart het oorspronkelijke uitvoeringsplan. Uitvoering op 3 oktober 2026: de databasebasis en collector zijn uitgerold, de editor en rapporten zijn gebouwd en lokaal geverifieerd; de laatste productiepublicatie en ingelogde controle worden uitgevoerd. De hieronder beschreven beginsituatie is de situatie vóór deze implementatie.

## Huidige situatie en prioriteit

De vernieuwde publieke agenda staat live met 21 evenementfiches: 18 komende evenementen en 3 voorbije edities. Alle 21 fiches zijn op 3 oktober rechtstreeks via HTTP gecontroleerd: status 200, unieke titel en beschrijving, één canonical naar de eigen URL, geen noindex, volledige inhoud in de eerste HTML, één Event-object dat overeenkomt met de brongegevens, een link vanuit de agenda en opname in de sitemap. Bewijs: [live controlerapport](research/agenda-live-indexatie-2026-10-03.json). De bestaande lokale evenementcontrole en 15 evenementtests slagen eveneens.

De technische voorbereiding voor indexatie is in orde. Daadwerkelijke Google-indexering, zoekposities, impressies en zoektermen zijn niet gecontroleerd in Search Console. Een technisch correcte pagina of sitemap garandeert geen opname. Zie [Google over opnieuw crawlen](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl). De bijzondere Google-evenementervaring vermeldt België en Nederland niet in de huidige landenlijst; gewone zoekresultaten blijven het primaire doel. Zie [Google Event-documentatie](https://developers.google.com/search/docs/appearance/structured-data/event).

Het adminprobleem is een ontbrekende integratie:

| Onderdeel | Aangetroffen in de code | Gevolg |
| --- | --- | --- |
| Agenda-inhoud | `data/events.ts` en `data/futureEvents.ts`; type `DogEvent` in `data/events.ts` | Aanpassen vereist nu een codewijziging en deployment. |
| Adminnavigatie en routes | `components/admin/AdminWorkspace.tsx` en `App.tsx` bevatten geen agendaonderdeel | Geen overzicht, editor, nieuwe fiche of agendarapport. |
| Contentbeheer | `admin-content` beheert hotspots/diensten; `admin-zones` beheert zones | Evenementen hebben geen admin-API of revisiebeheer. |
| Publiceren | Snapshot en buildimport ondersteunen hotspots, diensten en losloopzones | Een agendaconcept kan niet via de bestaande publicatiestroom live gaan. |
| Eigen analytics | `App.tsx` verstuurt openbare paginaweergaven; `site-analytics` valideert routes | De serverlijst `analyticsRoutes.ts` bevat alleen de drie oude evenementfiches. Volgens deze code worden de 18 nieuwe fiches met HTTP 400 geweigerd. De live Edge Function is niet afzonderlijk geverifieerd. |
| Acties op fiches | Organisator-, telefoon-, e-mail- en ticketlinks hebben geen evenementtracking | Klikinteresse per evenement is niet beschikbaar. |
| Adminanalytics | `pages/AdminAnalytics.tsx` toont algemene statistieken | `/agenda` en toegelaten oude fiches kunnen tussen populaire pagina's staan; er is geen agenda-uitsplitsing. |

**Prioriteit:** eerst de meetdekking herstellen, daarna een volledig werkende keten van import → bewerken → preview → publiceren → live controle, met analytics per evenement. Alleen een extra menu-item lost dit niet op.

## Wat Kevin moet kunnen doen

| Scherm | Functies |
| --- | --- |
| `/admin/agenda` | Alle evenementen zoeken en filteren op periode, regio, categorie, informatiezekerheid en publicatiestatus. Per rij: titel, plaats, datum, status, laatste inhoudscontrole, bewerken, publieke pagina en analytics. |
| `/admin/agenda/nieuw` | Een evenement als concept aanmaken; dupliceren naar een nieuwe editie met een eigen identiteit en URL. |
| `/admin/agenda/:id` | Alle bestaande evenementvelden bewerken, concept opslaan, echte preview bekijken, revisies vergelijken en een oude revisie als nieuw concept herstellen. |
| `/admin/agenda/analytics` | Agenda-overzicht en evenementfiches afzonderlijk meten; grafiek, populaire evenementen, bronnen, apparaten en CSV. |
| `/admin/agenda/:id/analytics` | Weergaven en klikken voor één specifieke editie, meetdekking en dezelfde periodekeuze. |
| `/admin/publiceren` | Agendaconcepten selecteren naast zaken en zones, verschillen bekijken en de build- en livestatus opvolgen. |
| `/admin` | Agenda-aantallen en shortcuts; signalen voor gewijzigde concepten en ontbrekende praktische gegevens. |

Gebruik de huidige adminstijl en een kalendericoon. Geen sparkle-iconen. De agenda-hero, afbeeldingen en huidige uitsneden blijven buiten deze opdracht. Bestaande fotobestanden en beeldbronnen worden exact behouden bij de import.

### Editorvelden

| Groep | Te beheren inhoud |
| --- | --- |
| Identiteit | Titel, subtitel, categorie, tags; bestaande slug en editie-identiteit blijven vast. |
| Datum | Begin- en einddatum, bekende uren, onbekende uren, hele dag, meerdaags evenement; lokale tijdzone voor de locatie. |
| Plaats | Locatienaam, adresvelden, plaatsnaam, land BE/NL, regio en optionele koppeling aan een bestaande kustgemeentegids. Niet elke activiteit ligt in een kustgemeente. |
| Inhoud | Beschrijving, uitgelichte tekst, highlights, praktische opmerkingen, hondenvoorwaarden en toegankelijkheid. |
| Organisator | Naam, website, contactgegevens, extra links, informatiebronnen en datum van de laatste echte controle. |
| Prijs | Zichtbare prijsomschrijving, expliciet gratis/betalend/onbekend, bevestigde ticketprijs en ticket-URL waar beschikbaar. |
| Beelden | Hoofdfoto of poster, alttekst, uitsnede, bijschrift, credit, bron-URL en volledige galerij met volgorde en credits. Bestaande R2-mediabibliotheek en uploadfunctie hergebruiken. |
| SEO | Preview van de automatisch gegenereerde titel, beschrijving, canonical en evenementgegevens; meldingen over ontbrekende gegevens. |

Datumtekst, seizoen en schema-datums uit gestructureerde invoer afleiden, met behoud van bestaande betekenisvolle datum-/uurteksten zoals afzonderlijke programmaonderdelen. Gebruik expliciete onbekend-waarden: geen verzonnen middernacht, adres, prijs of gratis toegang. Test zomer-/wintertijd voor Brussel en Amsterdam. `lastVerified` verandert alleen bij een expliciete inhoudscontrole, niet bij elke save.

## Statussen en behoud van URL's

Drie verschillende zaken krijgen een eigen aanduiding:

- **Publicatie:** concept, wijzigingen klaar, aangevraagd, bouwen, live, mislukt. Opslaan maakt een concept; het wijzigt de live pagina niet.
- **Informatiezekerheid:** bevestigd, aangekondigd of save the date, overeenkomstig de bestaande gegevens.
- **Evenementverloop:** komend/bezig/afgelopen op basis van de datum, plus expliciet geannuleerd/uitgesteld/verplaatst waar nodig. De huidige schemafunctie gebruikt altijd `EventScheduled`; die wordt uitgebreid voor echte statuswijzigingen.

Een afgelopen editie blijft met dezelfde URL bereikbaar als archief, staat in de sitemap en krijgt geen nieuw jaartal. Een nieuwe editie krijgt een nieuwe URL en verwijzingen tussen de edities. Dupliceren kopieert geen bevestigingsstatus, controledata, ticketbeschikbaarheid of jaargebonden informatie als nieuwe waarheid.

Voor de eerste versie gebruiken we archiveren als behoud van een voorbije editie. Opzettelijk een gepubliceerde fiche intrekken is een afzonderlijke publicatiehandeling met een reden, verwijdering uit navigatie/sitemap en een echte 404/410 of een inhoudelijk juiste redirect. Geen stille redirect van alle ontbrekende fiches naar de agenda; ook de huidige clientfallback in `EventDetail.tsx` wordt daarop gecontroleerd. Nooit een gepubliceerde editie hard verwijderen vanuit de gewone editor.

## Technische uitvoering

### 0. Herstel meetdekking als eerste, onafhankelijke stap

1. Controleer de gedeployde collector en vergelijk zijn routevalidatie met de live sitemap, zonder nepbezoekevents in productie te schrijven.
2. Voeg de 18 nieuwe evenementroutes toe via een uit de agenda gegenereerde routemanifest en rol de collector daadwerkelijk uit. Een frontendbuild wijzigt de reeds gedeployde Supabase Edge Function niet automatisch.
3. Voeg een controle toe die alle publieke evenementroutes vergelijkt met de collectorvalidatie. Een nieuwe agenda-editie mag nooit stil uit de eigen meting vallen.
4. Label de start van volledige meetdekking. Ontbrekende eerdere cijfers zijn onbekend, niet nul. Het bestaande Vercel-archief blijft een afzonderlijke bron; niet optellen bij de eigen meting.

**Klaar wanneer:** `/agenda` en alle 21 live fiches door de collectorvalidatie geaccepteerd worden, onbestaande routes geweigerd blijven en de dekking zichtbaar is in het rapport.

### 1. Contentbasis en verliesvrije import

Gebruik afzonderlijke `content_events` en `content_event_revisions`, met hetzelfde concept-/revisiepatroon als zaken. Evenementen hebben een eigen datum-, editie- en plaatsmodel; ze worden niet als hotspot met een kunstmatige kustgemeente opgeslagen. Houd `media_assets`, `content_releases`, `publication_jobs` en het bestaande logboek gedeeld.

- Stabiele interne UUID, bestaande numerieke ID, unieke slug, versie, conceptrevisie en gepubliceerde revisie.
- Volledige `DogEvent`-inhoud in onveranderlijke revisies; gerichte zoek-/filtervelden waar nodig. Alle huidige optionele velden blijven behouden.
- Herhaalbare import van de actuele 21 objecten, met vergelijking van elk veld, elke URL en galerijvolgorde. Niet importeren uit de oudere onderzoeks-JSON als actuele bron.
- Een ingevoerde baseline telt pas als gepubliceerde revisie wanneer de inhoud met de live editie is vergeleken; import maakt geen automatische inhoudsrelease.
- RLS zonder directe anon-/authenticated-toegang, serverzijdige admincontrole, transactionele save en versieconflicten. Bij een conflict blijft het lokale formulier behouden en kan Kevin de nieuwe versie vergelijken.
- `admin-events` met list/get/create/save/history/restore; auditlog uitbreiden met evenementverwijzingen.

**Klaar wanneer:** alle 21 fiches exact geïmporteerd zijn, een concept los van live inhoud kan worden bewerkt en een verouderde save geen nieuwere wijziging overschrijft.

### 2. Publicatieketen en openbare bron

- Voeg `events` en een afzonderlijke evenementrevisiemap toe aan de onveranderlijke release-snapshot. Behoud compatibiliteit met bestaande releases die nog geen `events` bevatten.
- Breid de publicatie-RPC en `admin-publication` uit met evenementselecties en versiecontrole. Neem geselecteerde concepten plus de reeds gepubliceerde revisies van overige inhoud op in één atomische snapshot.
- Breid `scripts/prepare-catalog.cjs` en `data/dashboardCatalog.json` uit. Splits de statische baseline indien nodig naar `data/eventDefaults.ts`; `data/events.ts` blijft de gedeelde publieke export voor zowel React als buildtools. Gebruik de baseline alleen bij oude releases zonder evenementveld, nooit als vervanging van een expliciet lege evenementlijst.
- Agenda, detailpagina's, gemeentelinks, gerelateerde evenementen, sitemap, OG en AI-overzichten lezen exact dezelfde releasegegevens.
- Publicatiestatus wordt pas live na bevestiging van release-ID/hash op `hondaanzee.be`, overeenkomstig de bestaande publicatieketen. Test ook retry na een mislukte build en terugzetten via een nieuwe release.
- Controleer dat een zaken- of zonepublicatie de agenda niet terugzet naar Git-data. Tijdens de overgang worden inhoudelijke agendawijzigingen niet langs twee concurrerende bronnen beheerd.
- Vervang daarna de tijdelijke agenda-routemanifest in de collector door validatie tegen de daadwerkelijk gepubliceerde evenementidentiteiten. Concepten krijgen geen publieke meetroute. Laat collectoracceptatie en de live bevestiging aansluiten op dezelfde release.

**Klaar wanneer:** een gewijzigd én een nieuw evenement via `/admin` live gaan met juiste HTML, metadata, schema, sitemap, interne links en meetroute; zaken en zones blijven werken.

### 3. Beheerinterface en preview

Voeg `utils/adminEvents.ts`, `pages/AdminEvents.tsx`, `pages/AdminEventEditor.tsx` en de routes/navigatie toe. Gebruik de bestaande formuliervormgeving, mediafuncties en foutafhandeling. De preview rendert de echte `EventDetailContent` met conceptdata binnen de afgeschermde, niet-indexeerbare admin; openbare pagina's blijven de gepubliceerde revisie gebruiken.

Alle editorvelden, galerijen, bronvermeldingen en lijsten moeten bruikbaar zijn. Voeg duidelijke meldingen voor onopgeslagen wijzigingen, lege resultaten, fouten en ontbrekende gegevens toe. Redactionele waarschuwingen blokkeren een eerlijk aangekondigde save the date niet; ongeldige datums, dubbele slugs en onveilige URLs blokkeren wel.

**Klaar wanneer:** Kevin zonder code een fiche kan aanmaken, alle bestaande velden kan aanpassen, foto's kan beheren, de preview kan bekijken, een revisie kan herstellen en wijzigingen kan publiceren.

### 4. Agenda-analytics

Hergebruik de eigen collector, dagelijkse/uuraggregaties, grafiekcomponent en periodekeuze: 24 uur, 7/30/90 dagen en 12 maanden. Voeg agenda-filters toe aan `admin-analytics`, liefst serverzijdig zodat grote periodes geen ongefilterde records hoeven te laden. CSV volgt exact de gekozen periode en evenementselectie.

| Metriek | Definitie |
| --- | --- |
| Agendaweergaven | Weergaven van `/agenda`, afzonderlijk van detailpagina's. |
| Evenementweergaven | Weergaven van één editie op `/agenda/:slug`; totaaltelling en ranglijst. |
| Organisatorklikken | Klik naar de zichtbare organisatorwebsite. |
| Ticketklikken | Klik naar de specifieke boekings-/inschrijfpagina. Geen bewijs van aankoop of deelname. |
| Contactklikken | Telefoon en e-mail, afzonderlijk van de websiteklik. |
| Routeklikken | Alleen wanneer er een echte routeknop met een bekende bestemming beschikbaar is. |
| Herkomst en apparaat | Bestaande categorieën, met dezelfde beperkingen van privacyvoorkeuren en adblockers. |

Voeg `ticket` en `email` toe aan de gedeelde validatie en beide SQL-eventconstraints; website/route/telefoon blijven bestaande types. Gebruik een evenementhelper voor de verschillende links op de fiche, inclusief de knop in de bovenste sectie. Eén gebruikersklik telt één actie, ook als ticket- en organisator-URL gelijk zijn. Geen indrukken van agenda-kaarten als detailpaginaweergaven tellen.

Geen unieke bezoekers of sessieconversies tonen zolang de eigen meting daarvoor geen betrouwbare gegevens verzamelt. Weergaven en klikacties zijn tellingen; historische actiegegevens kunnen niet worden teruggevuld. Preview-, admin- en geautomatiseerd testverkeer blijven uitgesloten. Bewaar de huidige bewaartermijnen en DNT/GPC-regels.

**Klaar wanneer:** echte agendaweergaven en actieklikken verschijnen op het overzicht én per editie, met periode, meetstart, lege/fouttoestanden en overeenstemmende CSV-totalen.

### 5. Zoekzichtbaarheid en live oplevering

- Behoud en breid de bestaande 21-pagina-SEO-controle uit voor conceptisolatie, gewijzigde datums, nieuwe fiches, archief, annulering en verwijderde URLs.
- Controleer na de eerste agendapublicatie opnieuw alle live fiches en de sitemap, inclusief foto-URLs en pagina's zonder JavaScript.
- Controleer in Search Console of de sitemap is verwerkt en inspecteer `/agenda` en een selectie van nieuwe evenement-URL's. Vraag waar passend indexatie aan. Noteer de echte Google-status en laatst bekende crawldatum apart van technische gereedheid.
- Search Console-impressies, Google-klikken en zoektermen zijn een aparte gegevensbron. Het eigen rapport kan herkomstcategorie Google tonen, maar kent geen zoektermen of Google-indexstatus. Een automatische Search Console-koppeling is een vervolguitbreiding met eigen accountautorisatie; de eerste oplevering hangt daar niet van af.

**Klaar wanneer:** technische publicatie en meetdekking live zijn bewezen; Search Console-resultaten zijn vastgelegd als gecontroleerd of expliciet nog onbekend.

## Verificatie en volgorde

Voer stap 0 eerst uit om verdere meetgaten te beperken. Bouw daarna 1 en 2, vervolgens 3 en 4, en sluit af met 5. Lever geen lege agendamenuknop als afgerond werk op.

Gerichte verificatie tijdens uitvoering:

- Database: importintegriteit, RLS/admincontrole, versieconflict, revisieherstel en conceptisolatie.
- Publicatie: gemengde selectie van zaak/zone/evenement, oude snapshotcompatibiliteit, fout/retry en exacte releasebevestiging.
- Evenementgedrag: meerdaags, onbekende uren, klokwissels, save the date, annulering en behoud van oude editie-URL's.
- Analytics: alle gepubliceerde routes geaccepteerd, onbekende routes geweigerd, geen dubbelklikregistratie door meerdere handlers, correcte uur/dagtotalen en CSV, geen previewmetingen.
- Adminbrowser: volledige bewerk-/preview-/publiceerflow, mobiel gebruik, echte fout- en conflictreacties.
- `npm run typecheck`, gerichte tests, `npm run build`, publieke HTML-controles en één gecontroleerde volledige productieflow.

Kevin heeft na de planopdracht opdracht gegeven tot volledige uitvoering. Database-, publicatie- en validatiefuncties zijn gebouwd en uitgerold. De volledige testset (336 tests), typechecks, SQL-tests met rollback en browserflows voor de nieuwe agenda en bestaande adminfuncties slagen. Nieuwe beelden gebruiken uitsluitend de bestaande R2-upload; de 21 ingevoerde evenementobjecten, inclusief alle geneste fotometadata, zijn exact met de bron vergeleken. De uiteindelijke productiecontrole wordt afzonderlijk vastgelegd zodra de live release is bevestigd.
