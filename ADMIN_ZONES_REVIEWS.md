# Losloopzones, reviews en interactieve analytics

Uitbreiding van het bestaande dashboard op `/admin`. De productiesite blijft op Vercel en de database op Supabase. Bestaande afbeeldingen en oorspronkelijke inhoud blijven behouden. Nieuwe afbeeldingen gaan uitsluitend door de gecontroleerde R2-upload.

## Bediening

- `/admin/losloopzones`: alle 27 oorspronkelijke zones, zoeken, gemeentefilter, publicatie-/controlefilters, reviewaantallen en bezoekersscore.
- Een zone-editor met inhoud, sleepbare kaart, bevestigde openingstijden, tijdelijke sluiting, voorzieningen, bron, controledatum, R2-foto's, gekoppelde reviews en inhoudsgeschiedenis.
- Slug en gemeente blijven bij bestaande zones vast. Opslaan maakt een concept. Publiceren bouwt de volledige catalogus, routes, kaarten, sitemap en pagina's op productie.
- Archiveren is een publicatiekeuze: de zone, foto's en reviews blijven in de database. Herstellen werkt via een nieuw concept en publicatie.
- `/admin/reviews`: alle huidige en toekomstige reviews, status-/zone-/sterrenfilters, zoeken, CSV, expliciet geselecteerde goedkeuring en moderatiedetail.
- Nieuwe reviews zijn `pending`. De vier oorspronkelijke reviews blijven `published` met `needs_review=true`, totdat de beheerder ze beoordeelt.
- Goedkeuren, verbergen, afwijzen, terugzetten naar beoordeling, noodzakelijke tekstredactie, interne notities en bezoekersmeldingen afhandelen. Verbergen/afwijzen/redactie vereisen een reden.
- De oorspronkelijke naam, tekst en sterren blijven onveranderlijk. Redactie verandert uitsluitend publieke tekst, met revisie en moderatiegeschiedenis. Lage sterren zijn op zichzelf geen reden om een review te verbergen.
- Moderatie werkt meteen op nieuwe publieke verzoeken. Reeds geopende pagina's verversen bij terugkeer en ongeveer elke 30 seconden. Een bezoekersmelding verbergt een review niet automatisch.
- Beide analyticsgrafieken gebruiken dezelfde tooltip met datum, aantallen, bron en aanduiding van een gedeeltelijke dag. Cursor, aanraking en toetsenbord worden ondersteund. Dagen vóór de eigen meting worden als niet gemeten getoond.

## Database en toegang

`content_places.kind='offleash'` houdt een vaste identiteit met een wereldwijd unieke zone-slug. De oorspronkelijke 27 JSON-objecten werden ongewijzigd geïmporteerd. De oudere `?area=N`-links gebruiken de bevroren oorspronkelijke slugvolgorde, zodat nieuwe zones, sortering of archivering geen verkeerde selectie veroorzaken.

Na de frontenduitrol activeert migratie `20261002192000_review_public_access.sql` de publieke afsluiting. Anonieme en gewone ingelogde gebruikers hebben geen rechtstreekse tabeltoegang tot reviews of moderatie. Publieke lees-RPCs geven alleen goedgekeurde, publieke velden en echte aantallen/gemiddelden terug. Ze pagineren met datum en UUID. De `site-reviews`-functie valideert nieuwe inzendingen en meldingen; accountidentiteit komt uitsluitend uit een gecontroleerde sessie.

Beheerfuncties controleren de echte Supabase-sessie en het beheeraccount op de server. Optimistisch versiebeheer voorkomt dat twee geopende editors of beoordelaars elkaar stilzwijgend overschrijven. Moderatiegegevens, notities, originele inhoud en misbruikgegevens zijn privé.

Dagelijkse limieten begrenzen inzendingen/meldingen, met een honeypot, duplicaatcontrole en een dagelijks gezouten IP-hash. Er worden geen ruwe IP-adressen opgeslagen. De limiettabellen worden dagelijks opgeschoond. Een CAPTCHA is momenteel niet nodig voor deze beperkte stroom, maar kan later worden toegevoegd bij aantoonbaar misbruik.

## Migratie en herstel

De bestaande zone-import vond plaats tussen de content- en reviewmigratie. Voor een verse database kan `node scripts/prepare-zone-import.cjs --output /private/path/zones.sql` dezelfde niet-destructieve import voorbereiden. Voer die SQL vóór de reviewmigratie uit. Een herhaalde import voegt uitsluitend ontbrekende identiteiten toe en vervangt geen concepten of oorspronkelijke afbeeldingsverwijzingen.

De publicatieketen gebruikt een bevroren catalogussnapshot en verifieert zowel Vercel-productie als de release-identiteit op het echte domein voordat een job `live` krijgt. Reviewmoderatie is een afzonderlijke directe databaseactie; ze hoeft geen websitebuild af te wachten.

## Verificatie

- Unitcontroles voor invoervalidatie, onveranderlijke velden, grafiekselectie, ontbrekende meetdagen, Brussels zomer-/wintertijd, nachturen, oude geïndexeerde links en veilige Leaflet-tekst.
- Browsercontroles voor desktop/mobiel, tooltipbeweging en schermgrenzen, toetsenbord, zoneconcept opslaan, ongewijzigde legacyfoto, moderatiereden, geschiedenis en afwezig adminmeetverkeer.
- `scripts/review-security-check.sql` test pending/hidden privacy, publieke redactie met behouden origineel, bezoekersmeldingen, versieconflicten, onveranderlijke sterren en archiveren/herstellen na publicatie. Alle testwijzigingen rollen terug.
- Publieke tabelrechten, private beheerfuncties en goedgekeurde publieke RPCs worden na uitrol met echte HTTP-verzoeken gecontroleerd.

Het R2-mediadomein is nog afhankelijk van de lopende DNS-overgang. De upload blijft expliciet onbeschikbaar tot dit domein aantoonbaar gereed is; bestaande afbeeldingen blijven werken.
