# Hotspotcommunity — uitvoering op 2 oktober 2026

Alle gepubliceerde hotspots ondersteunen openbare likeaantallen en gemodereerde reviews met 1–5 sterren. Actieve leden kunnen bijdragen. Privéfavorieten behouden hun eigen hartje; een duim geeft een publieke like. Diensten krijgen geen hotspotbeoordeling.

## Bezoeker en auteur

- Een compacte samenvatting op de hotspotpagina en kaarten haalt echte cijfers op. Geen reviews betekent geen sterrenwaarde. Laadfouten tonen geen verzonnen nulwaarden.
- De reviewsectie toont het gemiddelde, aantal, sterrenverdeling, ervaringen en een kleine waarschuwing bij minder dan drie beoordelingen.
- Een gast krijgt bij liken of reviewen een korte accountdialoog. Registreren en inloggen keren terug naar dezelfde hotspot. Een onthouden like wordt één keer uitgevoerd; een review wordt nooit automatisch verzonden.
- Een review vraagt een publieke naam, 1–5 sterren, 20–1000 tekens, optioneel een bezoekmaand en een eigen-ervaringverklaring. Het e-mailadres blijft privé.
- Een account heeft één review per hotspot. Nieuwe versies wachten op controle. De eerdere goedgekeurde tekst en sterren blijven zichtbaar tijdens die controle; afgewezen wijzigingen wijzigen de publieke score niet.
- Bij een afgewezen wijziging ziet de auteur expliciet dat de vorige review publiek blijft en de wijziging niet werd gepubliceerd.
- Versiecontrole voorkomt stil overschrijven vanuit twee tabbladen. De auteur kan een conflict vergelijken en kiezen welke tekst verdergaat.
- Het formulier bewaart een concept per eigenaar, hotspot en versie in `sessionStorage` gedurende maximaal 24 uur. Mislukte inzendingen behouden de invoer.
- De auteur kan intrekken en later opnieuw insturen. Intrekken verwijdert direct de publieke review en scorebijdrage.
- De accountdownload bevat de eigen likes en alle eigen hotspotreviewversies. Accountverwijdering wist likes, reviews, versies, meldingen en moderatiehistorie via cascades. Lokale concepten worden ook gewist.

## Beheer

`/admin/reviews` gebruikt één werkruimte voor hotspot- en losloopzonereviews, met soort, gemeente, plek, sterren, status en zoekfilters. Filters worden vóór de paginalimiet in de database toegepast. Cursorpaginering voorkomt een begrensde selectie die ten onrechte als compleet wordt gepresenteerd.

De werkruimte ondersteunt goedkeuren, afwijzen, verbergen, herstellen, tekstredactie, interne notities, meldingen en CSV. Een wachtende wijziging toont de nieuwe inzending naast de huidige gepubliceerde versie. De oorspronkelijke auteurtekst blijft in de private geschiedenis. Beheer kan sterren niet redigeren. Ook de huidige likes, goedgekeurde score, wachtende reviews en aandachtspunten per hotspot zijn zichtbaar.

Nieuwe losloopzonereviews vereisen eveneens een actief account. Historische gastreviews blijven behouden; de bestaande retentie/unlink bij accountverwijdering voor die oude zonefunctie blijft van toepassing.

## Techniek en grenzen

- Migratie: `supabase/migrations/20261002223000_hotspot_community.sql`.
- Auteurstatus na afwijzing: `supabase/migrations/20261002224500_hotspot_review_author_state.sql`.
- Nieuwe tabellen: `place_likes`, `hotspot_reviews`, `hotspot_review_versions`, `hotspot_review_actions`, `hotspot_review_flags`, `community_limits`.
- De bestaande zonetabellen zijn behouden. Het nieuwe model gebruikt stabiele `content_places.id`-identiteiten en eigen immutable versies in plaats van een risicovolle ombouw van historische reviews.
- Publiek leesbaar zijn alleen `public_hotspot_summaries` en `public_hotspot_reviews`; directe tabellen en private functies zijn niet toegankelijk voor bezoekers of leden.
- `site-community` valideert het lid met het access token en leidt de eigenaar server-side af. De client mag geen eigenaar, status of publieke score meegeven.
- Likes gebruiken gewenste toestand en een unieke sleutel. Locks, versiecontrole en transacties beschermen tegen dubbele of gelijktijdige schrijftoegang.
- Accountschorsing blokkeert writes en sluit bijdragen uit van publieke tellingen; herstel respecteert afzonderlijke moderatie en intrekking.
- Intakegrenzen per dag: 300 likeacties per account / 1000 per IP-hash, 10 reviewversies per account / 30 per IP-hash / 1000 totaal, 20 meldingen per IP-hash. Dagelijks gezouten hashes worden opgeschoond; ruwe IP-adressen worden niet opgeslagen.
- Kaartsamenvattingen worden gebundeld per maximaal 200 plekken. Publieke gegevens verversen bij terugkeer en ongeveer elke 30 seconden. Open auteurformulieren worden niet door achtergrondverversing vervangen.
- Een account bewijst geen bezoek. Geen verificatiebadge, populariteitsrangschikking of review-SEO-markup toegevoegd; zichtbare ervaringen en moderatie staan centraal.

## Controle en uitrol

De migratie en drie edgefuncties (`site-community`, `admin-reviews`, `site-reviews`) zijn vóór de frontend uitgerold. Alle vier bestaande zonereviews zijn vóór en na de migratie exact vergeleken en behouden.

Herhaalbare controles:

| Controle | Opdracht / bestand | Dekking |
| --- | --- | --- |
| Unit + browser | `npm run test:community` | Accountterugkeer, één hervatte like, fouten, concepten, download, publicatie, wijzigingen, intrekken, melden, mobiel, toetsenbord, kaartbatches |
| Database | `supabase/tests/hotspot_community.sql` binnen `BEGIN` / `ROLLBACK` | Eigenaarisolatie, privacy, conflicten, status/score, redactie, schorsing, cascades, oude reviews en grants |
| Live backend, expliciet | `node scripts/check-hotspot-community-live.mjs --run` | Eén wegwerpaccount, gelijktijdige likes, private review, export, denied toegang, conflict, intrekken en accountverwijdering |
| Bestaande flows | `npm run test:members`, `npm run test:admin`, `npm run test:places` | Accounts/favorieten/uitstapjes, bestaande moderatie en publieke zaakpagina's |
| Publicatie | `npm run build` | 224 publieke URLs met volledige initiële HTML, inclusief 133 hotspots en 24 diensten |

De browserchecks onderscheppen externe writes. De SQL-fixtures worden volledig teruggedraaid. De livecontrole publiceert geen testreview, verstuurt geen e-mail en verwijdert het tijdelijke account in `finally`.

De resterende TypeScript-fouten zijn daarna hersteld. `npm run typecheck` controleert de webapp, buildhelpers en tests met TypeScript, Node-endpoints met een aparte `NodeNext`-configuratie, en alle Supabase-functies en gedeelde modules met Deno. Alle drie controles zijn verplicht vóór iedere productiebuild. De verouderde, niet-gerouteerde Community-pagina is verwijderd; `/community` blijft een 404 met `noindex`.

## Dashboardwaardering — 3 oktober 2026

Het menu **Likes & reviews** opent `/admin/reviews?view=insights`. Dit overzicht toont alle hotspots en losloopzones met huidige likes, nog aanwezige likes van de laatste 7/30 dagen, reviews over alle statussen, goedgekeurde scorebijdragen, aandachtspunten, goedgekeurde sterren en de laatste auteurbijdrage. Filters, sortering, paginering en CSV gebruiken dezelfde volledige servermomentopname. Iedere plek verwijst naar zijn gefilterde moderatielijst. Bij Zaken staan likes en reviews naast Bewaard; de hotspoteditor verwijst naar de cijfers en inzendingen van die plek.

De private `admin_review_insights()` RPC (`20261003100000_admin_review_insights.sql`) aggregeert likes en reviews afzonderlijk, om vermenigvuldiging door joins te voorkomen. Hotspotsterren gebruiken de goedgekeurde versie en actieve accounts. Historische zonereviews volgen hun bestaande publieke scoreregels. Geschorste likes worden apart uitgesloten; concepten en gearchiveerde plekken blijven traceerbaar. De snapshot bevat geen accountidentiteiten. Alleen de bestaande, met beheertoegang beschermde `admin-reviews` functie kan het overzicht opvragen.

De laatste bijdrage telt auteurversies mee, zonder dat moderatie of redactie de datum opschuift. Een verdwenen like of verwijderd hotspotaccount telt niet meer mee. Dit is de huidige stand, geen historiek van iedere likeactie. Laadfouten tonen geen nulwaarden; een mislukte verversing bewaart zichtbaar de vorige momentopname en blokkeert CSV totdat verversen lukt.

Controle: `utils/reviewInsights.test.ts`, `supabase/tests/admin_review_insights.sql` (transactioneel teruggedraaid) en de uitgebreide `npm run test:admin` voor filters, links, cijfers bij Zaken, foutafhandeling en mobiele overflow. De publieke `/community` route blijft een 404 met `noindex`.
