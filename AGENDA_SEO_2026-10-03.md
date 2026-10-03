# SEO-controle agenda — 3 oktober 2026

De lokale productiebuild bevat 21 evenementfiches: 18 komende evenementen en 3 voorbije edities. Dit rapport bevestigt de technische implementatie en controles; het bevestigt geen Google-indexering.

## Wat is aangepast

- Unieke titels met de oorspronkelijke editie, de plaats en HondAanZee.be. Lichtgolf vermeldt de volledige periode 2026–2027. Een archiefpagina krijgt nooit automatisch het huidige jaar.
- Unieke, beknopte beschrijvingen met evenement, datum en plaats. Voorbije edities zijn herkenbaar als archief.
- Dezelfde metadata in de volledige eerste HTML, na navigatie in de browser en in de sociale previews.
- Eén Event per fiche, gekoppeld aan WebPage en BreadcrumbList. De overzichtspagina verwijst naar de individuele fiches.
- Datum, plaats, land, hondenvoorwaarden en prijs blijven gebaseerd op de zichtbare evenementgegevens. Er worden geen uren, adressen of gratis toegang verzonnen.
- Ticketoffers uitsluitend voor een bevestigde prijs en een echte, zichtbaar gelinkte boekingspagina. Momenteel: De Haan, Juttepaardje en Dogsurvival. Onzekere vanafprijzen, mogelijke extra kosten en algemene organisatorsites worden niet als boekbaar aanbod gepubliceerd.
- Alle 21 fiches staan in de sitemap en hebben een gewone link in de eerste HTML van de agenda. Het archief gebruikt een native uitklapbaar overzicht.
- Vier komende kustevenementen zijn ook bereikbaar vanuit hun gemeentegids: Knokke-Heist, De Haan, Oostende en Bredene.
- Elke fiche verwijst naar maximaal drie relevante komende evenementen; een oude Bredene-editie verwijst naar de nieuwe editie.
- Fotobronnen en bijschriften blijven zichtbaar. De metadata claimt geen vaste afmetingen voor foto's waarvan de afmetingen niet zijn opgegeven.
- De compacte en volledige AI-overzichten bevatten de actuele fiches en hun eigen URL's. Dit is geen claim over een Google-rankingvoordeel.

De hero-component, hero-stijlen en hero-afbeeldingen zijn bij deze SEO-wijziging niet bewerkt. De bestaande hero-aanpassingen in de werkmap blijven behouden.

## Controle

| Controle | Resultaat |
| --- | --- |
| Volledige testset | 29 bestanden, 326 tests geslaagd |
| Productiebuild | Geslaagd, inclusief web-, API- en edge-typechecks |
| Alle publieke pagina's | 242 pagina's met eigen titel, canonical en volledige HTML |
| Specifieke evenementcontrole | 21 van 21 geslaagd |
| Browser zonder JavaScript | Inhoud en alle 21 agenda-links beschikbaar |
| Browser met JavaScript | Metadata blijft gelijk; navigatie naar een fiche werkt; geen runtimefouten |

De evenementcontrole draait voortaan automatisch tijdens `npm run build`. Los uitvoeren: `npm run test:events`. Het volledige controlebestand staat in [research/agenda-seo-controle-2026-10-03.json](research/agenda-seo-controle-2026-10-03.json).

## Publicatiestatus

De live agenda gaf tijdens deze controle HTTP 200 maar bevatte de nieuwe De Haan-fiche nog niet. De nieuwe detail-URL's voor De Haan en Bredene gaven HTTP 404. Er is tijdens deze SEO-opdracht geen productiepublicatie uitgevoerd.

Voor het effect in Google moet de nieuwe versie gepubliceerd zijn. Daarna kunnen de sitemap en de nieuwe URL's gecontroleerd worden in Search Console. Een verzoek tot indexering garandeert geen opname; Google bepaalt de verwerking en positie. Zie [Googles SEO-uitleg](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) en [opnieuw laten crawlen](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl).

De implementatie volgt [Googles Event-richtlijnen](https://developers.google.com/search/docs/appearance/structured-data/event). De speciale Google-evenementervaring heeft volgens die documentatie een beperkte landen- en taallijst; Nederlandstalig België en Nederland staan daar niet bij. Gewone zoekresultaten en de technische indexeerbaarheid blijven het doel.

## Gecontroleerde fiches

| Evenementfiche | Zoekresultaattitel | Editie |
| --- | --- | --- |
| `kwispelfestival-de-panne-2026` | Kwispelfestival De Panne 2026 \| HondAanZee.be | Archief |
| `groot-oostends-hondenfestival-2026` | Groot Oostends Hondenfestival 2026 in Oostende \| HondAanZee.be | Archief |
| `grote-hondenwandeling-bredene-2026` | Grote Hondenwandeling Bredene 2026 \| HondAanZee.be | Archief |
| `dierenzegening-knokke-2026` | Dierenzegening Knokke-Heist 2026 \| HondAanZee.be | Komend |
| `grote-dierenfeest-koolkerke-2026` | Het Grote Dierenfeest 2026 in Koolkerke \| HondAanZee.be | Komend |
| `zwarteberg-2026` | Hondenwandeling Zwarteberg 2026 in Westouter (Heuvelland) \| HondAanZee.be | Komend |
| `marke-2026` | Hondenwandeling met Gianna en Maxim 2026 in Marke (Kortrijk) \| HondAanZee.be | Komend |
| `hondenwandeling-de-schelde-2026` | Hondenwandeling en welzijnsmarkt De Schelde 2026 in Berendrecht-Zandvliet-Lillo \| HondAanZee.be | Komend |
| `stokroos-2026` | Honden- en paardencafé De Stokroos 2026 in Nieuwerkerk \| HondAanZee.be | Komend |
| `titan-paw-2026` | Titan Paw 2026 in Lille (Gierle) \| HondAanZee.be | Komend |
| `fotoshoot-de-haan-2026` | Hondenwandeling + fotoshoot De Haan 2026 \| HondAanZee.be | Komend |
| `howl-o-ween-dudzele-2026` | Howl-O-ween Het Blauwe Kruis Brugge 2026 in Dudzele (Brugge) \| HondAanZee.be | Komend |
| `halloween-wevelgem-2026` | Heksenbos / Halloweentocht Juttepaardje 2026 in Wevelgem \| HondAanZee.be | Komend |
| `hondenhalloween-balen-2026` | Hondenhalloween Balen-Olmen 2026 \| HondAanZee.be | Komend |
| `canicross-genendijk-2026` | Canicross Genendijk 2026 \| HondAanZee.be | Komend |
| `lichtgolf-oostende-2026` | Lichtgolf Oostende 2026–2027 \| HondAanZee.be | Komend |
| `zeeuwse-winterfair-2026` | Zeeuwse Winterfair aan Zee 2026 in Noordwelle \| HondAanZee.be | Komend |
| `dogsurvival-winter-2026` | Dogsurvival Therapy4Dogs — wintereditie 2026 in Merksplas \| HondAanZee.be | Komend |
| `dierenfestival-waregem-2027` | Dierenfestival Waregem 2027 \| HondAanZee.be | Komend |
| `dogs-friends-2027` | Dogs & Friends 2027 in La Hulpe (Terhulpen) \| HondAanZee.be | Komend |
| `hondenwandeling-bredene-2027` | Hondenwandeling Bredene 2027 \| HondAanZee.be | Komend |
