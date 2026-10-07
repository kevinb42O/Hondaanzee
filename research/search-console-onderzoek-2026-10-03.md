# Search Console-onderzoek — 3 oktober 2026

Onderzocht in de ingelogde domeinproperty `hondaanzee.be`: prestaties voor Web (tekst), zoekopdrachten, pagina’s, apparaten, landen, indexering, URL-inspectie, live-tests, sitemap en handmatige acties. Daarnaast zijn zes publieke productiepagina’s rechtstreeks opgehaald en zijn de bestaande indexeringsaudit en bijbehorende Git-geschiedenis gelezen.

## Conclusie

De daling is reëel en kan niet uitsluitend als seizoen worden uitgelegd. Er zijn aanwijzingen voor afgenomen zoekvraag op belangrijke termen, maar er is ook rechtstreeks bevestigd dat gemeentepagina’s niet afzonderlijk zijn geïndexeerd doordat Google een andere gemeente als canonical kiest. De technische reparatie is op 2 oktober gepubliceerd; de prestatiegegevens eindigen op 29 september en bevatten dus nog geen effect van die reparatie.

De proporties van seizoenseffect, indexeringsverlies en rankingverlies kunnen niet betrouwbaar uit deze gegevens worden berekend. Er is geen historie uit 2025 in deze property om het jaarlijkse patroon te bevestigen. Er is geen Google Trends-reeks onderzocht.

## Vergelijking met even lange periodes

Alle kolommen omvatten dag 1 t/m 29 van de genoemde maand in 2026. De exacte klik- en vertoningstotalen zijn gelezen uit de toegankelijke rapportlabels; CTR en positie worden weergegeven zoals Search Console ze afrondt.

| Meetwaarde | Juli | Augustus | September |
| --- | ---: | ---: | ---: |
| Klikken | 1.477 | 1.060 | 616 |
| Vertoningen | 35.370 | 16.841 | 11.709 |
| CTR | 4,2% | 6,3% | 5,3% |
| Gemiddelde positie | 7,0 | 7,0 | 7,7 |

- September versus juli: klikken −58,3%, vertoningen −66,9%.
- September versus augustus: klikken −41,9%, vertoningen −30,5%, CTR −1 procentpunt.
- Het geringe verschil in de totale gemiddelde positie sluit een ernstig probleem op specifieke pagina’s niet uit. Pagina’s die niet meer worden vertoond leveren geen normale positie-observaties meer op.

[September versus augustus](https://search.google.com/search-console/performance/search-analytics?resource_id=sc-domain%3Ahondaanzee.be&start_date=20260901&end_date=20260929&compare_start_date=20260801&compare_end_date=20260829&metrics=CLICKS%2CIMPRESSIONS%2CCTR%2CPOSITION&breakdown=page)

[September versus juli](https://search.google.com/search-console/performance/search-analytics?resource_id=sc-domain%3Ahondaanzee.be&start_date=20260901&end_date=20260929&compare_start_date=20260701&compare_end_date=20260729&metrics=CLICKS%2CIMPRESSIONS%2CCTR%2CPOSITION&breakdown=page)

## Waar het verkeer verdwijnt

| Pagina | Klikken juli 1–29 | Augustus 1–29 | September 1–29 |
| --- | ---: | ---: | ---: |
| Homepage | 825 | 933 | 527 |
| Oostende | 68 | Niet afzonderlijk genoteerd | 0 |
| Blankenberge | 59 | Niet afzonderlijk genoteerd | 0 |
| Wenduine | 54 | 4 | 0 |
| De Haan | 46 | Niet afzonderlijk genoteerd | 0 |
| Middelkerke | 40 | Niet afzonderlijk genoteerd | 0 |
| Hotspots | 68 | 27 | 32 |
| Agenda | 50 | 11 | 15 |
| Kaart | 37 | 22 | 7 |
| Losloopzones | 35 | 6 | 8 |

Ook Bredene (27 → 0), Zeebrugge (16 → 0), Knokke-Heist (9 → 0) en Nieuwpoort (6 → 0) verliezen hun juli-klikken. De Panne gaat van 2 naar 0 klikken; de vertoningen dalen van 165 naar 123 en de positie verslechtert van 17,4 naar 41,2. Koksijde had in juli 239 vertoningen zonder klikken en in september geen vertoningen.

De gemeentepagina’s samen hadden in juli 1–29 327 klikken, tegenover nul in september. Dat is een verschil in geregistreerd verkeer, geen berekening van het aantal klikken dat uitsluitend door indexering verloren ging: seizoen en canonical-toerekening kunnen de cijfers eveneens beïnvloeden.

De homepage veroorzaakt 406 van de 444 netto verloren klikken tussen augustus en september, circa 91%. In september levert de homepage 527 van de 616 klikken, circa 86%. De site steunt daardoor sterk op één pagina.

De kaart verdient aandacht: gemiddelde positie 9,2 in juli, 13,6 in augustus en 20,8 in september. Losloopzones verslechtert van 7,9 in juli naar 14,6 in september. Dit zijn pagina-gemiddelden over veranderende zoektermsets; verifieer concrete termen voordat inhoud wordt aangepast.

## Aanwijzingen voor veranderde zoekvraag

Augustus 1–29 versus september 1–29:

| Zoekterm | Vertoningen augustus → september | Positie augustus → september |
| --- | ---: | ---: |
| honden aan zee | 75 → 31 | 3,5 → 1,6 |
| waar mag hond op strand in belgië | 119 → 53 | 2,6 → 1,6 |
| waar mag je met de hond op het strand | 83 → 24 | 2,0 → 1,7 |
| hondenstrand belgie | 79 → 37 | 3,0 → 2,0 |
| wanneer mogen honden op het strand | 100 → 148 | 5,0 → 4,1 |
| vanaf wanneer mogen honden op het strand | 18 → 99 | 2,0 → 2,3 |
| waar mogen honden op het strand | 204 → 71 | 2,3 → 4,0 |

Verschillende belangrijke termen krijgen minder vertoningen ondanks een betere positie. Vragen over wanneer honden weer op het strand mogen groeien. Dit ondersteunt een verschuiving van zomerplanning naar najaarsregels, maar bewijst niet hoeveel van de totale daling door seizoen komt. De laatste rij toont daarnaast daadwerkelijk positie-verlies.

## Apparaten en landen

September versus augustus: mobiel 883 → 493 klikken, desktop 152 → 107 en tablet 25 → 16. Het verlies is het grootst op mobiel, zonder aanwijzing uit dit rapport voor uitsluitend een mobiel probleem. De gemiddelde mobiele positie verandert van 6,1 naar 6,5.

September versus juli: België 1.405 → 585 klikken en Nederland 50 → 26. De daling speelt dus ook in het primaire Belgische publiek.

## Indexering en de bestaande reparatie

Het algemene indexeringsrapport is laatst bijgewerkt op **21 september** en toont 40 geïndexeerde URLs en 107 uitgesloten URLs:

| Reden | Aantal |
| --- | ---: |
| Dubbele pagina zonder door gebruiker geselecteerde canonical | 51 |
| Alternatieve pagina met correcte canonical | 21 |
| Pagina met omleiding | 13 |
| Gecrawld, momenteel niet geïndexeerd | 22 |

Niet alle uitsluitingen zijn fouten. Filtervarianten, redirects en www-versies kunnen terecht uitgesloten zijn. De 51 duplicaten bevatten echter ook echte gemeenten en zaken.

Rechtstreeks via URL-inspectie bevestigd:

- **Koksijde:** niet geïndexeerd; laatste crawl 21 september; geen opgegeven canonical in die crawl; Google koos `https://hondaanzee.be/de-panne`.
- **Oostende:** niet geïndexeerd; laatste crawl 21 augustus; geen opgegeven canonical in die crawl; Google koos eveneens De Panne.
- **Koksijde live-test op 3 oktober, 19:31:** URL beschikbaar voor Google, pagina kan worden geïndexeerd, één geldig breadcrumb-item. Dit bevestigt indexeerbaarheid, geen afgeronde opname of canonical-keuze.
- **Oostende live-test op 3 oktober, 19:33:** eveneens beschikbaar voor Google, pagina kan worden geïndexeerd en één geldig breadcrumb-item.

De bestaande audit en Git-commit `cd09a90` tonen dat op 2 oktober volledige eigen HTML en metadata per openbare route zijn gepubliceerd. Bij de huidige controle geven homepage, Koksijde, kaart, hotspots, Dierenartsencentrum Anoa en Restaurant De Concessie HTTP 200, eigen canonical, eigen titel, een H1 en indexeerbare robotsmetadata. Zie [de zes HTTP-controles](search-console-live-check-2026-10-03.json).

De validatie van foutieve duplicaten staat op **Gestart**, met startdatum 2 oktober. De sitemap is op 3 oktober verzonden én gelezen, status **Succesvol**, **242 ontdekte pagina’s**. Dat ontdekte aantal is geen geïndexeerd aantal.

De afzonderlijke rapporten **Handmatige acties** en **Beveiligingsproblemen** tonen allebei **Geen problemen gedetecteerd**. Dit sluit geen algoritmische veranderingen uit.

## Beschikbare historie

Ook bij de selectie van 16 maanden toont het rapport slechts gegevens vanaf 20 januari 2026, tot en met 29 september 2026. Totalen: 5.504 klikken en 131.714 vertoningen.

| Maand | Dagen beschikbaar | Klikken | Vertoningen |
| --- | ---: | ---: | ---: |
| Januari | 12 | 30 | 51 |
| Februari | 28 | 283 | 1.994 |
| Maart | 31 | 210 | 4.126 |
| April | 30 | 275 | 10.355 |
| Mei | 31 | 580 | 21.215 |
| Juni | 30 | 849 | 28.097 |
| Juli | 31 | 1.541 | 36.377 |
| Augustus | 31 | 1.120 | 17.790 |
| September | 29 | 616 | 11.709 |

De vergelijkingstabel bovenaan gebruikt steeds 29 dagen; deze tabel bevat volledige beschikbare kalendermaanden.

## Prioriteiten

1. Beoordeel de verwerking van de reeds gepubliceerde HTML/canonical-reparatie. Controleer of Google de gemeenten opnieuw crawlt, hun eigen canonical kiest en de pagina’s indexeert. De beschikbare prestatiecijfers zijn van vóór de reparatie.
2. Beoordeel herstel van gemeentepagina’s afzonderlijk van de homepage. Het totale gemiddelde kan hun afwezigheid maskeren.
3. Onderzoek de zoektermen die kaart en losloopzones sinds juli verloren; hun verslechterde pagina-posities geven een tweede concrete onderzoekslijn.
4. Bouw inhoudelijke groei op rond gemeentegidsen, hondvriendelijke zaken, losloopzones en relevante najaarsvragen. Baseer eventuele nieuwe pagina’s op echte, verifieerbare informatie en specifieke zoekintentie.

Geen websitecode aangepast, geen nieuwe publicatie uitgevoerd en geen nieuwe indexatieaanvragen of validaties gestart tijdens dit onderzoek.

## Interpretatiebronnen

- [Google: dalend zoekverkeer onderzoeken](https://developers.google.com/search/docs/monitor-debug/debugging-search-traffic-drops)
- [Google: URL-inspectie, opgeslagen crawl versus live-test](https://support.google.com/webmasters/answer/9012289)
- [Google: canonieke URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
