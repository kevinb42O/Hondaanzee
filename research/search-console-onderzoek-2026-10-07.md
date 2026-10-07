# Search Console-controle — 7 oktober 2026

Bronnen: de geopende ingelogde domeinproperty hondaanzee.be in Chrome, het onderzoek van 3 oktober en rechtstreekse HTTP-controles van productie. Alleen onderzoek uitgevoerd; geen websitecode, deployment, indexeringsaanvraag of validatie gewijzigd.

## Actuele indexering

Het rapport is bijgewerkt tot 4 oktober. De vorige controle gebruikte het rapport van 21 september; dit zijn dus twee rapportmomenten, geen vergelijking van verkeer over even lange periodes.

| Reden/status | Vorige controle | Nu |
| --- | ---: | ---: |
| Geïndexeerd | 40 | 38 |
| Niet geïndexeerd | 107 | 252 |
| Pagina met omleiding | 13 | 13 |
| Gecrawld, momenteel niet geïndexeerd | 22 | 23 |
| Dubbel zonder geselecteerde canonical | 51 | 51 |
| Alternatief met correcte canonical | 21 | 21 |
| Gevonden, momenteel niet geïndexeerd | 0 | 144 |

De stijging van 145 uitsluitingen bestaat uit 144 gevonden maar nog niet gecrawlde URL's en één extra gecrawlde maar niet geïndexeerde URL. Dit betekent niet dat 145 bestaande pagina's uit de index zijn verdwenen. De zichtbare eerste tien voorbeelden van de 144 zijn agendafiches met crawldatum N.v.t.; de volledige lijst is niet geëxporteerd of geclassificeerd. Welke twee URL's het verschil van 40 naar 38 veroorzaken, is met de beschikbare vorige momentopname niet vastgesteld.

## Validaties

- **Omleidingen:** gestart 3 oktober, mislukt 5 oktober. De ene mislukte URL is `http://hondaanzee.be/`, laatst gecrawld 4 oktober. De huidige controle bevestigt een permanente 308 naar `https://hondaanzee.be/`, gevolgd door HTTP 200. Dit is de gewenste richting; de HTTP-URL hoort niet zelf geïndexeerd te worden. Een validatie om deze categorie leeg te maken is daarom ongeschikt.
- **Gecrawld, momenteel niet geïndexeerd:** gestart 3 oktober, mislukt 5 oktober. Eén mislukte URL: `https://hondaanzee.be/agenda/dierenzegening-knokke-2026`, laatst gecrawld 3 oktober; 22 andere URL's staan in behandeling. De fiche stond op 3 oktober in het eerdere onderzoek nog als onbekend bij Google. Het huidige niet-indexeren is geen aangetoonde verwijdering van een eerder geïndexeerde fiche.
- **51 duplicaten:** validatie staat nog op Gestart.
- **21 alternatieven:** validatie staat op Gestart. Correcte filtercanonicals hoeven niet te verdwijnen.

## Gemeentepagina's

URL-inspectie blijft voor beide onderzochte gemeenten de oude canonical-problemen tonen:

| URL | Laatste crawl | Opgegeven canonical | Google-canonical | Indexstatus |
| --- | --- | --- | --- | --- |
| Koksijde | 21 september, 07:03:53 | Geen | De Panne | Niet geïndexeerd |
| Oostende | 21 augustus, 04:27:18 | Geen | De Panne | Niet geïndexeerd |

Deze crawls dateren van vóór de route-HTML-reparatie van 2 oktober. Er is voor deze twee gemeenten dus nog geen bevestigde verwerking van de reparatie. De actuele productie-HTML geeft voor beide wel de eigen canonical, titel, H1 en indexeerbare robotsmetadata.

## Verkeer

De selectie 7 dagen omvat 28 september t/m 4 oktober: 80 klikken, circa 1.830 vertoningen, CTR 4,4%, gemiddelde positie 6,6.

| Dag | Klikken | Vertoningen |
| --- | ---: | ---: |
| 28 september | 19 | 293 |
| 29 september | 9 | 274 |
| 30 september | 8 | 157 |
| 1 oktober | 4 | 186 |
| 2 oktober | 13 | 241 |
| 3 oktober | 17 | 348 |
| 4 oktober | 10 | 332 |

Dit korte venster bewijst geen herstel, geen oorzakelijk effect van de reparatie en geen nieuwe verkeersinstorting na publicatie. De langere daling uit het eerdere onderzoek blijft relevant; lage aantallen en veranderende zoekvraag vereisen een langere, vergelijkbare meetperiode en pagina-/zoektermcontrole.

## Live technische controle

Alle 242 URL's uit de huidige live sitemap zijn opgehaald met een Googlebot-user-agent. Alle 242 geven HTTP 200, exact één eigen canonical, een titel, een H1 en geen noindex in robotsmetadata of X-Robots-Tag. Er zijn 242 unieke titels. Dit is een HTTP-controle met die user-agent, geen daadwerkelijke crawl of indexbeslissing van Google. Zie `search-console-sitemap-check-2026-10-07.json`.

Een aanvullende inconsistentie: `https://www.hondaanzee.be/` geeft HTTP 200 met canonical naar de homepage zonder www, maar redirect niet. HTTP met www redirect eerst naar HTTPS met www en eindigt daar eveneens op 200. De gecontroleerde www-gemeentepagina's redirecten wel met 308 naar de versie zonder www. De root-redirect verdient afzonderlijk herstel; deze observatie bewijst niet dat dit de verkeersdaling veroorzaakt. Zie `search-console-live-check-2026-10-07.json`.

## Vervolgprioriteiten

1. Gericht hercrawlen van belangrijke gemeenten en vervolgens de opgeslagen crawldatum, opgegeven canonical, Google-canonical en indexstatus controleren. Technische indexeerbaarheid mag niet als indexeringsherstel worden gerapporteerd.
2. De inconsistentie van de www-root oplossen en de redirectketen na publicatie controleren.
3. Belangrijke ontbrekende zaken en gemeentepagina's afzonderlijk beoordelen; nieuwe agendafiches en verwachte URL-varianten beïnvloeden het totale uitsluitingsaantal.
4. Verkeer vergelijken over even lange periodes en per pagina/zoekterm, zodra voldoende gegevens na de wijziging beschikbaar zijn.

Interpretatie: [Google: pagina-indexeringsrapport](https://support.google.com/webmasters/answer/7440203?hl=en), [canonical-signalen](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [hercrawlen aanvragen](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl).
