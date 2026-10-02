# Indexeringsonderzoek — 2 oktober 2026

Onderzocht via de ingelogde Google Search Console-property `hondaanzee.be`, de publieke productie-HTML en de lokale productiebuild. Dit document beschrijft de technische bevindingen; indexering blijft een beslissing van Google.

## Wat Search Console liet zien

Het pagina-indexeringsrapport was bijgewerkt op **21 september 2026**: 40 geïndexeerde URLs en 107 uitgesloten URLs.

| Reden | Aantal | Bevinding |
| --- | ---: | --- |
| Dubbel zonder geselecteerde canonical | 51 | Bevat echte gemeenten en zaken, naast filterlinks en de oude communityroute. URL-inspectie van Koksijde: geen opgegeven canonical, Google koos De Panne. |
| Alternatief met correcte canonical | 21 | 18 filterlinks, 2 `www`-varianten en Villa Odette. Filtervarianten hoeven niet afzonderlijk geïndexeerd te worden; Villa Odette heeft inmiddels zijn eigen zaakcanonical. |
| Pagina met omleiding | 13 | Alle voorbeelden zijn HTTP- of `www`-varianten. Hun permanente redirects naar HTTPS zonder `www` zijn gewenst. |
| Gecrawld, momenteel niet geïndexeerd | 22 | Echte zaken en een blog, maar ook 3 `www`-varianten en een afbeeldings-URL. Lakaiann was laatst gecrawld op 22 mei 2026. Dit zijn geen actuele live-tests van de aangepaste pagina’s. |

Het sitemaprapport toonde een succesvolle inzending, laatst gelezen op **31 maart 2026**, met **184 ontdekte URLs**. De huidige sitemap bevat **224 URLs**.

## Technische oorzaak en oplossing

Van de 224 sitemaproutes hadden 64 niet-zakelijke routes in hun oorspronkelijke productie-HTML de titel en canonical van de homepage. De browser corrigeerde deze pas na JavaScript. De initiële inhoud ontbrak eveneens op die pagina’s. Dit conflicteert met de afzonderlijke pagina’s die Google moet herkennen.

De normale Vercel-build genereert nu volledige HTML uit de bestaande React-pagina’s voor alle 224 sitemaproutes. Elke route heeft meteen zijn eigen titel, beschrijving, canonical, sociale metadata en aanwezige gestructureerde gegevens. De routing serveert die bestanden aan alle bezoekers en crawlers. Onbekende routes geven een echte 404. Dynamische meldingen en adminroutes gebruiken afzonderlijke shells.

Alle 133 hotspots en 24 diensten blijven afkomstig uit dezelfde catalogus. Geen zaakbeschrijvingen, adressen, contactgegevens, hondenvoorwaarden of openingstijden zijn herschreven. Bezoekersmeting per concrete zaak-URL blijft behouden.

## Controles

- Productiebuild: alle 224 routes, unieke titels, juiste canonicals, volledige HTML en statische routing.
- Bestaande zaakcontrole: alle 157 zaken, schema, sitemap, directorylinks en categoriepresentaties.
- Browser: representatieve publieke pagina’s zonder JavaScript zichtbaar; metadata blijft gelijk na het laden van React; Leaflet werkt; onbekende URLs en clientnavigatie krijgen de foutpagina met `noindex`.
- Analytics: bestaande lokale zaakcontrole verifieert paginameting, navigatie en contactklik zonder echte analyticsdata te versturen.
- Homepagezoeker: afzonderlijke browsercontrole na de overgang van statische HTML naar React.

De algemene TypeScript-controle bevat bestaande fouten in onder meer het oude communitybestand, bloganimatietypes, admincode en Supabase/Deno-functies. De productiebuild en gerichte controles beoordelen de wijzigingen hier afzonderlijk.

## Opvolging

Controleer na publicatie de live URL-inspectie van Koksijde en een zaak, dien de bestaande sitemap opnieuw in om de actuele lijst onder de aandacht te brengen en start validatie voor de foutieve duplicaten. Verwachte filtercanonicals en redirects hoeven niet te verdwijnen uit het uitsluitingsrapport. Een geslaagde live-test of sitemapinzending bewijst indexeerbaarheid en ontvangst, geen voltooide indexering of hogere ranking.

Zie [Google over canonicals](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) en [de uitleg van het indexeringsrapport](https://support.google.com/webmasters/answer/7440203).

## Uitgevoerd na publicatie

De technische wijziging is gepusht naar `main` als `cd09a90`. Vercel bevestigde een geslaagde productiepublicatie.

- Alle **224 productie-URLs** gecontroleerd met Googlebot-user-agent: HTTP 200, eigen canonical, een heading, geen `noindex` en **224 unieke titels**. Twee tijdelijke TLS-timeouts slaagden bij een gerichte herhaling.
- De oude communityroute en drie onbekende test-URLs geven HTTP 404 met de eigen foutpagina. Adminroutes geven hun `noindex`-shell; dynamische meldingen blijven bereikbaar.
- Search Console-live-test Koksijde op 2 oktober om 18:43: ophalen geslaagd, crawling en indexering toegestaan, opgegeven canonical `https://hondaanzee.be/koksijde`.
- Search Console-live-test Lakaiann op 2 oktober om 18:49: **URL is beschikbaar voor Google**, **Pagina kan worden geïndexeerd**, één geldig breadcrumb-item.
- De bestaande sitemap opnieuw ingediend op **2 oktober 2026**. Search Console bevestigt de nieuwe verzenddatum en de status **Succesvol**. De eerdere leesdatum en het oude aantal 184 zijn nog niet bijgewerkt; de live sitemap bevat 224 URLs.
- Validatie voor **Dubbele pagina zonder door de gebruiker geselecteerde canonieke versie** gestart op **2 oktober 2026**. Search Console toont **Validatie gestart**.

Er zijn geen 157 individuele indexeringsverzoeken nodig. De live-tests bewijzen dat Google de gewijzigde pagina’s kan ophalen en indexeren. De uiteindelijke indexkeuze, validatie-uitkomst en zoekposities zijn nog niet vastgesteld.
