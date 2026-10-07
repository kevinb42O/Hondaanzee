# SEO-herstel en GSC-notificaties — 7 oktober 2026

## Actuele sitemapconfiguratie — vervolgcontrole 7 oktober

De extra kustgidsen-sitemap bleek onnodig: alle 14 URL's staan al in de volledige, succesvol verwerkte sitemap. Google ondersteunt meerdere sitemaps; het aantal sitemaps is geen aangetoonde oorzaak van de fetchfout. Opnieuw indienen na de geslaagde Google-live-test werd bevestigd met 'Sitemap ingediend', maar de status bleef 'Onbekend / Kan niet ophalen / 0'. Er kwam geen specifieke technische foutcode beschikbaar.

Daarom is de sitemapconfiguratie vereenvoudigd in productiecommit `6343f82`: [geslaagde deployment](https://vercel.com/lanternnetworks-projects/hondaanzee/9tkZUMGAzpmVsiYLY3iFkgtQsT1V).

- De generator maakt uitsluitend de volledige `sitemap.xml`; de bestaande generatie en de lokale XML zijn ongewijzigd.
- `robots.txt` noemt uitsluitend `https://hondaanzee.be/sitemap.xml`.
- Het oude extra sitemapadres geeft een permanente 308 naar de volledige sitemap; geen ontbrekend bestand of HTML-fallback.
- Live verificatie 13:40 Brussel: hoofdsitemap HTTP 200 / application/xml / 242 unieke URL's. Exact dezelfde URL-verzameling als de vorige productiepublicatie; geen pagina verwijderd. De productiebuild gebruikt de actuele catalogus, waardoor URL-volgorde en vier zaak-lastmods kunnen afwijken van de lokale Git-fallback. De live catalogusrelease en hash zijn ongewijzigd.
- De eerdere www-root-reparatie werkt nog steeds (308 naar de HTTPS-homepage zonder www).
- GSC toont de hoofdsitemap nog steeds als 'Succesvol', 242 pagina's, laatst gelezen 6 oktober.

Na expliciet akkoord van de gebruiker is de overbodige extra registratie uit GSC verwijderd. Google bevestigde 'Sitemap verwijderd'. Het rapport toont nu precies één inzending ('1-1 van 1'): `https://hondaanzee.be/sitemap.xml`, type Sitemap, status 'Succesvol', 242 ontdekte pagina's, laatst gelezen 6 oktober. De GSC-opruiming is daarmee voltooid. Dit verwijdert geen websitepagina's of Google-indexering. Het bestaande fetchprobleem van de extra inzending wordt niet als opgelost gepresenteerd: de onnodige extra sitemap is uitgefaseerd ten gunste van de werkende hoofdsitemap.

Bewijs: [live sitemapconfiguratie](search-console-sitemap-herstel-2026-10-07.json). Bron: [Google ondersteunt meerdere sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/large-sitemaps), [GSC-verwerking en betekenis van verwijderen](https://support.google.com/webmasters/answer/7451001?hl=en).

De onderstaande secties documenteren de eerste publicatie en GSC-controles van eerder vandaag; de extra sitemapconfiguratie daar is inmiddels vervangen door bovenstaande configuratie.

## Gepubliceerd

Commit `b8eab83` is gepusht naar main. Vercel bevestigt de productiepublicatie als Ready / Current: [deployment](https://vercel.com/lanternnetworks-projects/hondaanzee/5VZZ5BXTCuCurhpVva5JJ9VPgXhn).

- Expliciete permanente 308 voor de www-homepage toegevoegd. Live gecontroleerd: de homepage zonder query en met een query gaat naar dezelfde HTTPS-URL zonder www, met behoud van queryparameters. De HTTP/www-keten eindigt eveneens op de bedoelde homepage zonder www; geen lus.
- Een afzonderlijke `sitemap-kustgidsen.xml` toegevoegd voor de homepage, alle 11 gemeenten, kaart en losloopzones: 14 bestaande canonieke URL's. De datums komen uit dezelfde revisies als de volledige sitemap; geen verzonnen wijzigingsdatums. De sitemap wordt bij iedere build gegenereerd en staat in robots.txt.
- Door de normale build zijn de SEO-/AI-exports van zes inmiddels afgelopen evenementen bijgewerkt naar 'Voorbije editie'. Geen evenementeninhoud, hero of afbeeldingen gewijzigd.

De live catalogusrelease voor en na de publicatie is gelijk: `0549afbd-fc3d-450c-b17a-e1ea87bb13ac`, SHA-256 `c45e4c14d7ac2c1f3e9a46e84f4c30c9fc25eee46d182352f2e048751d929ec2`.

## Verificatie

- Volledige productiebuild: designcontrole, web/API/edge-typechecks, alle 242 publieke HTML-pagina's, 157 zaakpagina's, 11 strandgidsen en 21 evenementen slagen.
- Browsercontrole met en zonder JavaScript: volledige inhoud, consistente SEO, kaartwerking en echte 404/noindex-gevallen slagen; geen runtimefouten.
- Alle 242 URL's uit de nieuwe live sitemap opnieuw opgehaald met een Googlebot-user-agent: 242 HTTP 200, 242 eigen canonicals, 242 unieke titels, H1 en geen noindex. Dit simuleert een HTTP-client met die user-agent; het is geen indexeringsbeslissing van Google. Zie [live bewijs](search-console-herstel-live-2026-10-07.json).
- Kustgidsen-sitemap geeft HTTP 200, application/xml en geldige XML met alle 14 URL's.

## GSC uitgevoerd

Indexering is rechtstreeks aangevraagd voor **Oostende, Koksijde en Blankenberge**. Voor alle drie bevestigde Google na zijn livecontrole: 'Indexering aangevraagd' en toegevoegd aan een prioriteitscrawlwachtrij. De opgeslagen indexstatus blijft voorlopig niet geïndexeerd; de eerdere crawls en de verkeerde De Panne-canonical dateren van vóór de HTML-reparatie. Een bevestigde aanvraag is geen bevestigde indexering.

De nieuwe kustgidsen-sitemap is ingediend op 7 oktober. GSC bevestigde 'Sitemap ingediend', maar het verwerkingsrapport toont aanvankelijk **Onbekend / Kan niet ophalen / 0 pagina's**. Dit is niet als geslaagde sitemapverwerking gerapporteerd. Daarom is dezelfde exacte URL via Google URL-inspectie live getest:

- Live-test op 7 oktober, 13:20:57 (Brussel).
- URL beschikbaar voor Google; crawl toegestaan: ja; ophalen: geslaagd.
- De bron die Google zelf teruggeeft bevat de juiste XML met alle 14 URL's.

Er is geen aangetoonde toegangs- of XML-fout. Verwerking door de sitemapcrawler is nog niet bevestigd. De bestaande volledige sitemap blijft **Succesvol, 242 pagina's**, laatst gelezen 6 oktober. De afzonderlijke sitemap is een extra rapportage-/ontdekkingsingang; alle 14 URL's staan ook in die bestaande succesvolle sitemap.

De lopende duplicaatvalidatie is niet opnieuw gestart. De gewenste HTTP/www-redirects en correcte filtercanonicals zijn behouden; die hoeven niet uit het uitsluitingsrapport te verdwijnen. De afgewezen validatie voor 'Pagina met omleiding' is niet opnieuw gestart met een onjuist doel om omleidingen te verwijderen.

## Notificaties gelezen en beoordeeld

Alle ongelezen berichten in de property zijn geopend en gelezen. Het berichtenpaneel bevestigt **0 van 61 ongelezen**.

| Datum | Melding | Bevinding / behandeling |
| --- | --- | --- |
| 7 oktober | Gecrawld, momenteel niet geïndexeerd: validatie mislukt | De nieuwe Dierenzegening Knokke-fiche is gecrawld op 3 oktober maar niet geïndexeerd; geen aangetoond nieuw breed technisch defect. Inmiddels voorbije editie. Alle live eventpagina's technisch gecontroleerd. |
| 7 oktober | Pagina met omleiding: validatie mislukt | De HTTP-homepage redirect correct naar HTTPS. Deze URL hoort geen zelfstandige indexpagina te worden. De aparte www-root-inconsistentie is live hersteld. |
| 7 oktober | Nieuwe sitemapuitsluitingen: duplicaat / alternatief met canonical | Echte gemeentepagina's vereisen herverwerking; correcte filter-/www-varianten mogen uitgesloten blijven. Drie prioriteitsverzoeken bevestigd, alle gemeenten in aparte sitemap opgenomen. |
| 4 oktober | Evenementen: ontbrekend offers / performer | Beide niet-kritieke waarschuwingen voor Hondenwandeling Zwarteberg 2026, gecrawld 3 oktober. GSC: 0 ongeldige items, 1 geldig item. Er is geen bevestigd ticketbedrag/boekingsaanbod of artiest; de wandeling is inmiddels voorbij. Geen onjuiste prijs, aanbod of performer toegevoegd om waarschuwingen cosmetisch te laten verdwijnen. |
| 4 oktober | Septemberprestaties | 632 klikken (volledige september), circa 12K vertoningen; homepage 541, hotspots 32, agenda 15. Dit is een andere periode dan de eerdere vergelijking over september 1–29 (616 klikken). |

## Overige GSC-controles

- Handmatige acties: geen problemen gedetecteerd.
- Beveiligingsproblemen: geen problemen gedetecteerd.
- HTTPS (rapport tot 29 september): 0 niet-HTTPS-URL's, geen kritieke problemen; 12 HTTPS-URL's in dit rapport. Dit getal is geen telling van alle publiek beschikbare HTTPS-pagina's.
- Broodkruimels (6 oktober): 0 ongeldige items, 1 geldig item, geen problemen in afgelopen 90 dagen. Nog geen bewijs dat Google alle nieuwe HTML heeft verwerkt.
- Core Web Vitals (5 oktober): onvoldoende gebruiksgegevens voor zowel mobiel als desktop. Geen uitspraak over goede praktijkscores mogelijk vanuit dit rapport.

## Nog niet bevestigd

Google moet de prioriteitsverzoeken verwerken en de gemeentepagina's opnieuw beoordelen. Het indexeringsoverzicht en zoekverkeer vormen nog geen bewijs van herstel. De afzonderlijke sitemap is inmiddels uitgefaseerd en uit het GSC-rapport verwijderd; de volledige hoofdsitemap staat op Succesvol. Geen hersteltermijn of rankingverbetering beloofd.

Bronnen: [Google: sitemaps en live-fetchdiagnose](https://support.google.com/webmasters/answer/7451001?hl=en), [eventgegevens en aanbevolen velden](https://developers.google.com/search/docs/appearance/structured-data/event), [indexeringsrapport](https://support.google.com/webmasters/answer/7440203?hl=en).
