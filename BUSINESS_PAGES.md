# Zaakpagina’s: SEO en bezoekersmeting

Gecontroleerd op 2 oktober 2026: **133 hotspots en 24 diensten, samen 157 zaakpagina’s**. Dit omvat alle vermeldingen uit de centrale catalogus, inclusief winkels, accommodaties, restaurants, dierenartsen en dierenspeciaalzaken. Gemeentepagina’s, de overzichten en lokale tips gebruiken dezelfde catalogus. De zaakverwijzing naar In ’t Dorp in het blog linkt rechtstreeks naar de zaakpagina.

## Wat de productiebuild garandeert

- Elke zaak heeft een permanente URL. De expliciete `slug` blijft behouden als de weergavenaam wijzigt.
- Elke URL krijgt volledige statische HTML uit het bestaande React-sjabloon, inclusief de zakelijke beschrijving, het adres en links. Hiervoor is geen Chromium of productie-server nodig.
- Elke pagina heeft een unieke titel en beschrijving, eigen canonical, sociale metadata, BreadcrumbList en het toepasselijke schema (zoals Restaurant, Store of VeterinaryCare).
- De exacte zaaknaam staat vooraan in de zoekresultaattitel, gevolgd door gemeente en HondAanZee.be. De snippet gebruikt de eigen zakelijke beschrijving; er worden geen nieuwe claims of contactgegevens verzonnen.
- Het WebPage-schema verwijst naar de juiste zakelijke entiteit. Adres, postcode en plaats worden afzonderlijk vermeld; subgemeenten worden behouden. Openingstijden en officiële links worden alleen opgenomen wanneer ze in de vermelding beschikbaar zijn.
- De sitemap bevat elke zaak. De overzichten bevatten gewone HTML-links naar **alle** zaken, ook als de kaarten achter “toon meer” staan.
- Vercel serveert deze bestanden voor bezoekers en crawlers. De zaakroutes worden vóór de sociale proxy afgehandeld; Googlebot wordt niet langer naar die beperkte proxy omgeleid.
- Dubbele URLs/IDs, ontbrekende slugs, onbekende gemeenten en ontbrekende inhoud stoppen de build. Ontbrekende HTML, metadata, schema of indexlinks stoppen de build eveneens.

`npm run build` genereert en controleert **alle 224 publieke URLs**, waaronder de 157 zaakpagina’s, twee volledige overzichten, alle gemeenten, blogs, evenementen en losloopzones. `vercel.json` serveert het bijbehorende HTML-bestand voor elke route. Dezelfde bestaande React-pagina levert de tekst en SEO voor zowel de build als de browser. De build gebruikt geen Chromium, netwerkaanvragen of GitHub Actions. Framer Motion toont de statische inhoud meteen; Leaflet initialiseert alleen in de browser.

Onbekende URLs krijgen HTTP 404 met de bestaande foutpagina en `noindex`. Dynamische meldingen behouden een aparte app-shell zonder homepage-canonical. Adminroutes krijgen een afzonderlijke `noindex`-shell. De algemene rewrite naar de homepage is verwijderd.

De sitemap en het WebPage-schema gebruiken dezelfde echte wijzigingsdatum per zaak. `data/placePageRevisions.json` bewaart een inhoudsvingerafdruk; een ongewijzigde herbouw wijzigt de datum niet. Commit bij inhoudswijzigingen ook de gegenereerde revisiestatus, `data/placePageDates.ts` en sitemap. Een wijziging aan de gedeelde zaakinhoud of het zaak-SEO-sjabloon krijgt een nieuwe wijzigingsdatum.

`data/publicPageRevisions.json` bewaart ook de revisies van de overige sitemaproutes. De eerste volledige HTML-publicatie krijgt de datum van deze wijziging. Herbouwen zonder gewijzigde bronbestanden verhoogt die datum niet.

## Vercel Analytics gebruiken

Open het Vercel-project → **Analytics → Pages**. Filter op de concrete zaak-URL, bijvoorbeeld `/blankenberge/hotspots/lakaiann` of `/oostende/diensten/dierenarts-frederik-galle`. Kies de gewenste periode en bekijk bezoekers en pageviews. De concrete URL wordt ook als route doorgestuurd, zodat verschillende zaken niet onder één algemene route verdwijnen.

De SDK verstuurt één pageview per navigatie naar een ander pad. Queryparameters, ankers en een afsluitende slash leveren geen aparte zaakstatistieken op. De browsercontrole onderschept de SDK-oproepen lokaal en controleert de initiële view, verdere React-navigatie en contactklikken; zij verstuurt geen echte meetdata.

Het aanvullende event **Zaakcontact** heeft precies twee eigenschappen:

| Eigenschap | Waarde |
| --- | --- |
| `zaak` | Permanente zaak-URL |
| `actie` | `website`, `route`, `telefoon` of `social` |

Custom events vereisen volgens [Vercel](https://vercel.com/docs/analytics/custom-events) Pro of Enterprise. De gewone paginameting staat hier los van. Analytics moet in het productieproject ingeschakeld zijn; deze wijziging wijzigt geen abonnement of dashboardinstelling. Eerdere bezoeken worden niet met terugwerkende kracht aangevuld. Adblockers en de meetlimieten van Vercel kunnen de telling beïnvloeden.

## Controle en publicatie

```sh
npm run build
npm test
npm run test:places
node scripts/check-public-browser.cjs
npm run test:search
```

De controles verifiëren alle 157 HTML-bestanden en testen in Chromium ook inhoud zonder JavaScript, navigatie tussen zaken, pageviews, een websiteklik, foutieve routes en een mobiel scherm. Alle bestaande zaak-URLs en hun zakelijke gegevens zijn behouden.

Publicatie verloopt rechtstreeks via de Vercel Git-integratie bij een push naar `main`. Er zijn geen GitHub Actions nodig; de oude GitHub Pages-workflow is verwijderd. Vercel voert de productiebuild en de controle van alle statische zaakpagina’s zelf uit. De lokale browsercontrole bewijst de SDK-aanroepen, geen ontvangst in het productie-dashboard. Google beslist uiteindelijk over crawling, indexering en ranking; [technisch correcte pagina’s bieden geen indexeringsgarantie](https://developers.google.com/search/docs/fundamentals/how-search-works).

## Presentatie per zaaktype

`pages/PlaceDetail.tsx` gebruikt gedeelde onderdelen in `components/places/` voor contactacties, fotografie, hondeninformatie, praktische gegevens en suggesties. `utils/placePresentation.ts` onderscheidt eten en drinken, verblijven, dierenartsen en winkels. Dezelfde gegevens voeden zowel de React-pagina als de statische HTML.

- Website, route en eventueel bellen staan vóór de lange beschrijving, ook op mobiel.
- De fotogalerij heeft één vaste hoofdfoto en maximaal drie thumbnails. Alle foto's blijven bereikbaar in de toegankelijke beeldviewer; er is geen automatische carrousel.
- Hondenkenmerken komen uitsluitend uit de ingevulde labels. Een terras of waterbak impliceert geen toegang binnen. Ontbrekende voorwaarden worden als ontbrekend vermeld.
- Alleen een ingevulde `recommendationNote` verschijnt als redactionele tip. Een label `Aanrader` genereert geen aanbevelingsverhaal of kwaliteitsclaim.
- De praktische informatie verschilt per categorie: bezoek, verblijf, consultatie of winkelbezoek. De websiteknop belooft geen boekings- of afspraakfunctie die de link niet biedt.
- Openingstijden worden getoond zoals ingevuld, zonder tijdafhankelijke `Nu open`-status in de statische HTML.
- De originele beschrijvingen blijven behouden. De drie ontwerpvoorbeelden hebben korte introducties op basis van bestaande gegevens; er is geen algemene inhoudsverrijking of verificatie van alle zaken uitgevoerd.

De inhoudsvingerafdruk voor de wijzigingsdatum omvat ook de gedeelde presentatie-onderdelen. De browsercontrole test koffiebar, hotel en dierenarts op mobiel en desktop, zonder horizontale overflow, plus de fotoviewer en navigatie met toetsenbord.

## Google Search Console: één sitemap voor alle zaken

Na publicatie: open de property van `hondaanzee.be`, ga naar **Sitemaps** en dien `https://hondaanzee.be/sitemap.xml` in als die nog niet geregistreerd is. Voor een URL-prefix-property van `https://hondaanzee.be/` kan het invoerveld al het domein tonen; voer dan alleen `sitemap.xml` in. Een bestaande succesvolle sitemap op ditzelfde adres hoeft niet voor elke nieuwe zaak opnieuw te worden ingediend. Nieuwe zaken komen bij de volgende build automatisch in hetzelfde bestand, dat ook in robots.txt is vermeld.

Je hoeft geen 157 afzonderlijke indexeringsverzoeken te doen. [Google raadt een sitemap aan voor veel URLs tegelijk](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl). Controleer hoogstens enkele representatieve zaakpagina’s met URL-inspectie en volg daarna **Pagina-indexering** en **Prestaties** op. Een individuele inspectie of indexeringsaanvraag is optioneel en vervangt de sitemap niet.

Crawling kan volgens Google enkele dagen tot enkele weken duren. Het label “indexeerbaar” betekent dat de techniek indexering toelaat, niet dat iedere zaak al in Google is opgenomen of een bepaalde positie krijgt. De daadwerkelijke indexstatus en zoekprestaties moeten in Search Console worden nagekeken.
