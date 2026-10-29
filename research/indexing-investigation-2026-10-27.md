# Indexeringsonderzoek — 27 oktober 2026

De gebruiker meldde 39 URL's uit de Search Console-groep ‘Gecrawld - momenteel niet geïndexeerd’. De groep bevat 38 HTML-pagina's en één afbeelding (`/zee-hond2.avif`).

## Waarom de mislukte validatie misleidend was

Het overzicht was bijgewerkt op 23 oktober. De validatie van 10 oktober stopte op 24 oktober met **3 mislukt en 36 in behandeling**. Die drie waren Snuffels, Dierenarts Frederik Galle en Dierenkliniek AniCura.

Op 27 oktober gaf individuele URL-inspectie voor **alle drie ‘URL is geïndexeerd door Google’**. Voor Snuffels bevestigde Google daarnaast een geslaagde smartphonecrawl op 24 oktober om 21:57:45, toegestane indexering en de gecontroleerde URL als canonical. De mislukte validatiestatus beschreef dus niet hun actuele individuele indexstatus.

Lakaiann was werkelijk nog niet geïndexeerd. Google toonde een oude crawl van **22 mei 2026**, zonder aangegeven canonical. De live pagina heeft nu wel volledige HTML en een eigen canonical. De individuele indexstatus van de overige 34 HTML-pagina's is in deze sessie niet vastgesteld; hun oude overzichtsdatums zijn geen bewijs van hun huidige indexstatus.

## Productiecontrole

Alle 38 HTML-pagina's opgevraagd met Googlebot-user-agent:

- HTTP 200, eigen canonical en eigen unieke titel.
- H1 in de oorspronkelijke HTML, zonder afhankelijkheid van JavaScript voor die heading.
- Geen noindex in robots/googlebot-metatags of X-Robots-Tag.
- Alle 38 opgenomen in de live sitemap en bereikbaar via gewone HTML-links vanaf de gecontroleerde gemeente-, overzichts- of homepagepagina's.
- robots.txt blokkeert deze publieke paden niet.
- De afbeelding levert HTTP 200 en `image/avif`, en staat niet als webpagina in de sitemap.

Search Console bevestigde voor de sitemap **Succesvol**, laatst gelezen **22 oktober 2026**, **242 ontdekte pagina's**. Er is geen aanwijzing dat opnieuw indienen of een extra sitemap nodig is.

## Uitgevoerde acties

1. Voor Lakaiann indexering aangevraagd. Google bevestigde ‘Indexering aangevraagd’ en toevoeging aan de prioriteitscrawlwachtrij.
2. De validatie van de volledige groep opnieuw gestart. Google bevestigde **‘Validatie gestart’, gestart 27-10-2026, 39 in behandeling en 0 mislukt**. Die nul is de beginstand van de nieuwe ronde, geen bewijs dat de 39 URL's zijn geïndexeerd.
3. Productiemetingen en concrete Google-bevindingen opgeslagen in `indexing-live-2026-10-27.json`, met screenshots van de aanvraag en de nieuwe validatie.

Er is geen nieuwe codewijziging of deployment uitgevoerd: deze controles vonden geen actuele technische indexeringsblokkade die een nieuwe wijziging rechtvaardigt. Het eerdere herstel van volledige HTML staat al op productie. De agenda-hero, afbeeldingen en zaakgegevens zijn ongewijzigd.

## Grenzen van deze uitkomst

De live controles bewijzen technische bereikbaarheid en de onderzochte indexeringssignalen, geen opname in Google. Alleen de drie genoemde diensten zijn individueel bevestigd als geïndexeerd. Lakaiann heeft een bevestigde crawl-aanvraag; de overige URL's hebben een opnieuw gestarte groepsvalidatie. De definitieve uitkomst vereist verdere verwerking door Google.

Google adviseert individuele URL-inspectie voor de status van een concrete pagina: https://support.google.com/webmasters/answer/7440203. Over het verschil tussen indexstatus, live tests en indexeringsaanvragen: https://support.google.com/webmasters/answer/9012289.
