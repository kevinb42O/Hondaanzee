# Plan: consistente velden en zichtbaarheid in zakenbeheer

Onderzocht op 2 oktober 2026. Dit document beschrijft de oorzaak en de voorgestelde implementatie; de applicatie en productiegegevens zijn tijdens deze audit niet gewijzigd.

## Vastgestelde oorzaak

De huidige implementatie koppelt drie verschillende beslissingen aan elkaar: de collectie waarin een zaak staat (`hotspot`/`service`), de gegevens die mogen worden opgeslagen en de informatie die publiek verschijnt. Daardoor is de collectie een onbedoelde beperking voor inhoudelijk vergelijkbare zaken.

| Onderdeel | Bewijs in de code | Gevolg |
| --- | --- | --- |
| Formulier | `pages/AdminPlaceEditor.tsx:105`: openingsuren alleen bij `kind === 'hotspot'`. | Shoppen kan uren krijgen; Dierenspeciaalzaak en Dierenarts krijgen geen urenvelden. |
| Backend | `supabase/functions/_shared/contentDraft.ts:35`: alle urenvelden voor services worden afgewezen. | Alleen het formulier aanpassen is onvoldoende; opslaan zou blijven mislukken. |
| Gegevensmodel | `types.ts`: Hotspot heeft uren, Service niet. | Dezelfde onbedoelde beperking bestaat ook in de types. |
| Preview | `pages/AdminPlaceEditor.tsx:100`: preview maakt altijd zeven dagwaarden aan voor een hotspot, ook wanneer ze leeg zijn. | Concept zonder bevestigde uren kan een leeg urenblok tonen; preview en opgeslagen inhoud verschillen. |
| Leegmaken | `pages/AdminPlaceEditor.tsx:77`: leeg invoerveld wordt als lege string opgeslagen. `PlacePractical.tsx:14` filtert alleen `undefined`. | Een gewiste dag blijft een lege publieke rij. Een leeg object is ook voldoende om het urenblok te tonen. |
| Weersafhankelijk | Het veld wordt geladen, ingevuld en opgeslagen; geen publieke component verwerkt de vlag. | Dashboardkeuze heeft geen zichtbaar effect. Dit is met een renderproef bevestigd. |
| Praktische tekst | `utils/placePresentation.ts:13` en `PlacePractical.tsx`: standaardadvies per categorie staat in de code. | Geen zelfstandige override of zichtbaarheid voor dat advies per zaak. `recommendationNote` is een ander veld: de redactionele tip. |
| Kenmerken | `utils/placePresentation.ts:23`: reguliere expressie groepeert vrije tags als hondeninformatie of overige kenmerken. | De beheerder kan de tekst aanpassen, maar bepaalt niet expliciet in welk blok een kenmerk verschijnt. |
| Titel | `pages/PlaceDetail.tsx:33`: slug `cozy-moments` krijgt altijd de titel `COZY Moments`. | Een naamswijziging vanuit het dashboard wijzigt voor die zaak de grote titel niet. |
| Publieke export | `scripts/generate-llms-full.cjs:31`: telefoon en uren alleen bij hotspots met een urenopmerking; services hebben een afzonderlijke, beperktere export. | Openbare HTML, JSON-LD en tekstexport verwerken dezelfde inhoud verschillend. |
| Tests | `utils/adminContent.test.ts:20` verwacht expliciet dat service-uren worden geweigerd. | De huidige beperking is vastgelegd als gewenst gedrag; slagen van bestaande tests bewijst geen consistent beheer. |

De andere bestaande tekstvelden hebben in de huidige zaakeditor dezelfde invoer voor hotspots en services. Niet iedere waargenomen afwijking is dus een afzonderlijk ontbrekend invoerveld: sommige verschillen ontstaan door opgeslagen inhoud, publieke voorwaarden of de aparte zone-editor.

De lokaal beschikbare catalogus bevat 133 hotspots en 24 services, waaronder 10 dierenspeciaalzaken. Er zijn 12 hotspots met een urenschema en één met alleen een urenopmerking. `data/dashboardCatalog.json` bevat lokaal geen actieve release, dus deze aantallen beschrijven de Git-catalogus; actuele productieconcepten zijn niet opgevraagd.

## Gewenst gedrag

Een zaaktype geeft een passend uitgangspunt voor presentatie. Het verhindert niet dat een beheerder relevante algemene informatie toevoegt of de publieke zichtbaarheid ervan bepaalt.

- Alle zaken hebben dezelfde basis: naam, categorie, introductie, beschrijving, adres, contactgegevens, officiële links, kenmerken, tip, foto's en openingstijden/beschikbaarheid.
- Optionele onderdelen krijgen drie weergavekeuzes: **Automatisch**, **Tonen**, **Verbergen**. Automatisch toont bruikbare ingevulde inhoud. Tonen vereist bruikbare inhoud of een expliciete inhoudelijke status. Verbergen bewaart de inhoud in het concept, maar sluit haar uit van de publieke voorstelling.
- De inhoudelijke status blijft afzonderlijk: onbekende uren, niet van toepassing, vaste uren, op afspraak en variabele/seizoensuren zijn verschillende situaties. Een onbekende dag is geen gesloten dag.
- Categoriewijzigingen bewaren ingevulde gegevens en expliciete weergavekeuzes. Het dashboard toont welk standaardprofiel nu geldt; de beheerder kan keuzes terugzetten op Automatisch.
- Een ingevuld maar verborgen onderdeel blijft bereikbaar om te bewerken. Relevante velden verdwijnen niet stilzwijgend door de collectie of doordat ze nog leeg zijn.
- Naam, categorie, adres en beschrijving blijven de vereiste basis voor een volledige zaakpagina. Optionele onderdelen en contactacties zijn afzonderlijk te sturen.

Voorbeelden:

| Zaak | Mogelijke dashboardkeuze | Publieke uitkomst |
| --- | --- | --- |
| Café | Vaste weekuren + tonen | Alleen bevestigde dagen en gesloten dagen in een urenschema. |
| Dierenwinkel onder Diensten | Vaste weekuren + tonen | Dezelfde urensupport als een winkel onder Hotspots. |
| Dierenarts | Op afspraak + consultatietoelichting | Afspraaktekst; geen gefabriceerd weekschema of spoedclaim. |
| Hotel | Uren niet van toepassing; praktische verblijfstekst | Relevant verblijfsadvies zonder leeg urenblok. |
| Seizoensbrasserie | Variabele uren + toelichting + weersafhankelijk | Uitleg over beschikbaarheid; alleen bevestigde tijdvakken als die ook zijn ingevuld. |
| Elke zaak | Bestaande uren bewaren + verbergen | Geen publiek urenblok of openingHoursSpecification; gegevens blijven beheersbaar. |

## Technisch ontwerp

### 1. Eén gedeelde definitie voor velden en categorieprofielen

Voeg een kleine, vaste TypeScript-definitie toe, bijvoorbeeld `supabase/functions/_shared/placeFields.ts`, zonder React- of browserafhankelijkheden. De editor, backend en build kunnen dezelfde definitie gebruiken. Zij bevat veldnamen, limieten, groepen, optionele blokken en standaardteksten/profielen. Er komt geen generieke paginabouwer of willekeurige HTML-invoer.

Maak een gedeelde `PlaceBase` voor Hotspot en Service; categorieën blijven per collectie gevalideerd. Verplaats algemene urenvelden naar die basis. Gebruik een strikte allowlist voor nieuwe instellingen; behoud onbekende bestaande JSON-properties bij het opslaan.

Voeg een optionele `presentation`-configuratie toe met weergavekeuzes voor openingstijden, hondeninformatie, overige kenmerken, redactionele tip, praktisch advies, galerij en telefoon-/website-/sociale acties. Geen instellingen op basis van een specifieke slug. Een eigen `practicalNote` kan het categorieadvies vervangen. `name` wordt leidend voor de titel; de huidige COZY-uitzondering wordt expliciet afgehandeld als inhoudsverschil in de migratiecontrole.

Voor kenmerken: behoud `tags` voor bestaande filters, zoekfuncties en aanbevelingslabels, maar bied expliciete groepskeuzes voor hondeninformatie en overige kenmerken. Bewaar overrides naast de tags. De bestaande groepering is alleen de compatibiliteitsfallback voor records zonder overrides. Behandel het label Aanrader en de geschreven tip als aparte keuzes; verzin geen tip op basis van dat label.

### 2. Eén bewerkingstraject voor laden, preview, opslaan en teruglezen

Vervang verspreide conversies in `AdminPlaceEditor` door gedeelde functies voor formulierwaarden, gevalideerde patches en effectieve conceptinhoud. De preview gebruikt exact die effectieve inhoud plus dezelfde publieke resolver als de echte pagina.

Maak uren daadwerkelijk verwijderbaar: ontbrekende dag = onbekend, `null` = expliciet gesloten, geldig tijdvak = bevestigde uren. Een lege invoer verwijdert de dag; een leeg schema levert geen blok op. De patch ondersteunt expliciet het wissen van een heel schema. Leg vast of urenpatches een geheel schema vervangen of dagen afzonderlijk aanpassen; gebruik één geteste overeenkomst aan beide kanten. Een veld niet in de patch betekent behouden, niet verwijderen.

Voeg beschikbaarheidsmodi toe: onbekend, vaste uren, op afspraak, variabel en niet van toepassing. Bewaar een eventueel eerder schema wanneer een andere modus wordt gekozen, maar publiceer het alleen bij een toepasselijke modus. Valideer tijdvakken serverzijdig, inclusief meerdere perioden en eindtijd na middernacht. Bestaande vrije tekst wordt eerst geïnventariseerd; onleesbare legacywaarden blijven behouden voor handmatige correctie en worden niet als gevalideerde SEO-uren uitgegeven.

Laat de backend de canonieke opgeslagen inhoud teruggeven, zodat trimming en normalisatie direct in de editor terugkomen. Nieuwe en bestaande zaken gebruiken dezelfde regels. Behoud atomaire versiecontrole, conceptisolatie en revisies.

### 3. Eén publieke resolver voor alle afnemers

Een pure functie bepaalt de effectieve zichtbaarheid, toepasselijke beschikbaarheid, tekstfallbacks en groepen. Gebruik haar voor de conceptpreview, React-detailpagina, statische HTML, contactknoppen, kaarten waar die velden voorkomen, JSON-LD en `llms-full.txt`.

Toepassen van Verbergen moet consequent zijn: een telefoon verdwijnt uit beide contactlocaties en JSON-LD; verborgen uren verdwijnen uit HTML en JSON-LD; verborgen kenmerken komen niet alsnog terug in keywords of tekstexport. Een verborgen galerij verandert de zichtbaarheid van de galerij; de verplichte hoofdfoto voor lijstkaarten/sociale preview blijft een apart gegeven met een duidelijk label in de editor.

Houd volledige concepten en revisies serverzijdig. Maak tijdens catalogusvoorbereiding een publieke projectie voor de frontend en exports, zodat deze afnemers dezelfde beslissingen krijgen. Bewaar de bestaande verificatie van de originele releasesnapshot/hash; bereken de publieke projectie pas na integriteitscontrole. Bouw en fallback op de Git-catalogus moeten hetzelfde pad gebruiken.

Neem de nieuwe resolver en velddefinities mee in de templatevingerafdruk voor paginawijzigingsdatums. Preview mag geen publieke analytics of echte contactacties uitvoeren.

### 4. Herkenbare bediening in het dashboard

Gebruik vaste secties: **Basis**, **Contact**, **Openingstijden & beschikbaarheid**, **Met je hond**, **Kenmerken**, **Praktisch advies**, **Onze tip**, **Foto's** en **Weergave**. Toon per optioneel onderdeel de effectieve toestand, bijvoorbeeld: “Automatisch · zichtbaar”, “Verborgen · inhoud bewaard” of “Nog niet ingevuld”. Laat naast de inhoud de weergavekeuze zien.

Voorkom een muur van losse vinkjes. Geef de belangrijkste keuzes per blok en per contactactie; maak alleen bij kenmerken individuele groepskeuzes beschikbaar. Een verborgen blok is inklapbaar en blijft bereikbaar. De preview toont de effectieve uitkomst van niet-opgeslagen wijzigingen.

## Losloopzones en vaste identiteit

Losloopzones blijven een eigen inhoudstype: hun dagelijkse toegang, kaartcoördinaten, voorzieningen en sluitingen zijn andere gegevens dan zaakuren. Hergebruik de bediening voor zichtbaarheid en heldere toestanden; dwing hun `{open, close}`-schema niet in het weekmodel voor zaken. Voeg de nieuwe veldregeling eerst voor zaken toe en controleer daarna de zone-editor en alle zonekaarten op hetzelfde principe. Bestaande zonevelden zijn reeds vanuit de aparte editor beheersbaar.

De huidige beperking op soort/collectie, gemeente en URL-slug bij bestaande zaken is bewust: database-identiteit, links, favorieten, geplande uitstapjes en bij zones reviews hangen eraan. Geef dit als **Vaste identiteit** weer in de editor, zodat het onderscheid met inhoudelijke velden duidelijk is. Collectiewissels en URL-verhuizingen vragen een afzonderlijke migratie met redirects en referentiecontrole; dat is geen noodzakelijke stap om het hier onderzochte veldprobleem te verhelpen.

## Implementatievolgorde

1. **Algemene veldsupport en directe fouten.** Gedeelde basis en velddefinitie; backend laat service-uren toe; lege uren kunnen worden verwijderd; weersafhankelijk heeft een publieke uitkomst; preview en opslaan volgen hetzelfde traject; opgeslagen canonical inhoud teruggeven. Tests die service-uren verbieden vervangen door tests voor consistente ondersteuning.
2. **Inhoud en weergave apart instelbaar.** Strikte presentation-instellingen, beschikbaarheidsmodi, praktisch advies en expliciete kenmerkgroepen. Dashboardsecties en effectieve status. Categoriewissel wist niets. Hardcoded zaaktitel verwijderen.
3. **Alle publieke afnemers aansluiten.** Gedeelde resolver/projectie in detailpagina's, contactknoppen, relevante kaarten, statische build, JSON-LD, metadata en tekstexport. Check zichtbaarheid op alle plekken, geen lege blokken en geen onjuiste uren.
4. **Compatibiliteit en productiecontrole.** Maak vóór de uitrol een alleen-lezen inventaris van de werkelijke Supabase-concepten en publicaties. Records zonder nieuwe instellingen krijgen de compatibele standaard. Geen bulkoverschrijving van historische revisies. Eventuele gegevenscorrecties zijn nieuwe conceptrevisies. Rol backendcompatibiliteit vóór de nieuwe editor uit, controleer een previewdeployment en publiceer daarna een geselecteerde testvermelding via de bestaande publicatieketen.

`content_place_revisions.content` is JSONB: nieuwe optionele inhoudsvelden vereisen op zichzelf geen nieuwe tabel of databaseherbouw. Controleer alle RPC's en publicatiesnapshotconstructies op roundtripbehoud; voeg alleen een SQL-migratie toe wanneer een aangetroffen constraint of publicatiefunctie dat werkelijk nodig maakt.

## Acceptatie en verificatie

- Alle acht bestaande categorieën kunnen relevante algemene velden toevoegen, wijzigen, wissen, verbergen en opnieuw tonen, ook wanneer die nooit eerder ingevuld waren.
- Test minstens café, hotel, hotspotwinkel, dierenspeciaalzaak, dierenarts en een losloopzone op desktop en mobiel. Controleer ook een nieuwe service en een bestaand record zonder nieuwe instellingen.
- Preview van niet-opgeslagen wijzigingen, opgeslagen concept na herladen, gepubliceerde React-pagina en HTML zonder JavaScript stemmen inhoudelijk overeen.
- Verbergen en later weer tonen bewaart de oorspronkelijke waarde. Categoriewissel bewaart inhoud en overrides. Een gewijzigde naam stuurt alle titels.
- Onbekend, gesloten, vaste uren, meerdere perioden, nachtovergang, alleen toelichting, variabel, weersafhankelijk en niet van toepassing krijgen correcte uitkomsten. Geen leeg schema, geen onbekende dag als gesloten en geen afspraaktekst als openingHoursSpecification.
- Dezelfde visibility-beslissing geldt voor contactknoppen, JSON-LD, keywords en tekstexport. De hoofdfoto-/galerijgrens is expliciet getest.
- Snapshotintegriteit, onveranderlijke revisies, niet-aangeraakte velden, oorspronkelijke foto-URLs, galerievolgorde, vaste routes, favorieten en versieconflicten blijven intact.
- Bestaande adminbrowsercontrole uitbreiden met uren bij services, per-blok weergave, legen, categoriewissel en roundtrip. Publieke browsercontrole uitbreiden met beide winkelcollecties en de zichtbaarheidsgevallen. Voer vervolgens de relevante unitchecks, TypeScriptcontrole, volledige build en admin-/publieke browserchecks uit.

Auditvalidatie: de bestaande gerichte Vitest-run rapporteerde **14 geslaagde testbestanden en 66 geslaagde tests**. Aanvullende tijdelijke Node-renderproeven bevestigden de serverblokkade voor service-uren, de lege publieke urenrij en het ontbreken van een publiek effect van weersafhankelijk. Er is geen nieuwe applicatietest toegevoegd en geen build of productiemutatie uitgevoerd voor dit plandocument.

## Uitvoering

De fix is gebouwd in `codex/place-field-control`. Algemene velden, beschikbaarheidsmodi, weergave per onderdeel, kenmerkgroepen, canonieke serverrespons en een gedeelde publieke projectie zijn geïmplementeerd. De zaaknaam stuurt ook de voormalige COZY-uitzondering. Losloopzonekaarten tonen bewaarde uren alleen wanneer de toegangsmodus die uren daadwerkelijk gebruikt.

Productie is vóór de uitrol alleen-lezen geïnventariseerd: 133 hotspots, 24 diensten, 27 losloopzones en geen ongepubliceerde concepten. Bestaande revisies zijn niet herschreven. Nieuwe optionele velden passen in de bestaande JSONB-opslag; een SQL-migratie is niet nodig.

Validatie in de afzonderlijke releasewerkmap: 23 testbestanden / 112 tests geslaagd; volledige build van 224 publieke pagina's en verificatie van 157 zaakpagina's geslaagd; admin- en publieke browsercontroles geslaagd. De browsercontrole omvat nu service-uren, verbergen/herladen/tonen, weersafhankelijkheid, categoriewissel, op afspraak, schema leegmaken en nieuwe diensten. Beide winkelcollecties worden publiek op desktop en mobiel gecontroleerd. De algemene TypeScriptcontrole heeft exact dezelfde 56 bestaande diagnoses als de ongewijzigde basis, zonder nieuwe diagnoses.

### Live verificatie

De backend en frontend zijn op productie uitgerold. Op de bestaande dienst Snuffels is een echte save, herlaadcontrole en publicatie uitgevoerd. Alleen `openingHours: null`, `openingHoursMode: unknown` en `presentation.hours: auto` zijn toegevoegd; alle oorspronkelijke zakelijke gegevens bleven exact behouden. De openbare voorstelling blijft zonder onbevestigde uren. De publicatie is live, haar release-ID en SHA-256 komen overeen met de marker op hondaanzee.be, en er zijn geen ongepubliceerde testconcepten achtergebleven. De latere analyticsdeployment bevat dezelfde gepubliceerde catalogus en behoudt deze fix.

De openbare Git-versie met de fix staat op main (implementatie `3223fbf`, afronding `f402309`). De afzonderlijke releasewerkmap blijft beschikbaar voor inspectie. Het verificatierapport en de screenshot staan lokaal onder `.admin-local/place-fields-live-verification.json` en `.admin-local/place-field-control-live.jpg`.
