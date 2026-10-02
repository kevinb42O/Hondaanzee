# Communicatie en meldpunt in de beheeromgeving

Vernieuwde interface op `/admin/notificaties`, `/admin/meldpunt` en `/admin/log`. De pagina’s gebruiken de bestaande werkruimte, paginaopmaak, kleuren, knoppen en formulieren. Geen tweede navigatie, loginblok of losse oude admin-shell binnen de werkruimte.

## Notificaties

- Schrijven en verzendhistoriek zijn afzonderlijke weergaven. Een rustige editor en lichte live voorvertoning vervangen de oude stapeling van templates, emoji’s en telefoonmock-up.
- Sjablonen, bestemmingskeuze en invoegen op de cursor blijven beschikbaar. Emoji’s staan achter een disclosure. Een bestaand concept vervangen of wissen vereist een keuze in een toegankelijke dialoog.
- De bestaande lokale conceptopslag wordt hergebruikt. De interface meldt een opslagfout eerlijk en behoudt het bericht na een mislukte verzending.
- De controle toont de exacte titel, berichttekst, bestemming en huidige abonnementen. Alleen de expliciete laatste knop roept `send-push` aan. Hergebruiken opent uitsluitend een concept.
- Native modale dialoog maakt de achtergrond inert, houdt de focus binnen de dialoog, ondersteunt Escape en herstelt de focus. Tijdens verzending zijn sluiten en opnieuw verzenden geblokkeerd.
- Resultaten onderscheiden volledige, gedeeltelijke en nul aflevering. Een volledig mislukte poging houdt het concept; een verzonden bericht wist het concept en bewaart de resultaatmelding. Aflevering is geen bewijs dat iemand de notificatie las.
- Serverstatistieken tonen geregistreerde toestellen en de laatste 25 verzendingen. Geen verzonnen leden-/unieke-personentelling of lifetime-verzendtotaal.
- Linkvalidatie blokkeert onder andere script-/data-URL’s, protocolrelatieve links, credentials in een link en backslashes. Onveilige links worden niet klikbaar in de voorvertoning of historie.

## Meldpunt en logboek

- Eén compacte lijst en één geselecteerd detailpaneel. De actieve werkvoorraad en het logboek gebruiken dezelfde component. Locatie, categorie, gemeente, tekst, status, publieke zichtbaarheid, bevestigingen en signaleringen zijn afzonderlijk leesbaar.
- Zoeken, status-/categorie-/gemeentefilters, weergaven met aantallen en lokale paginering per 15 meldingen. De bestaande API haalt de laatste 100 meldingen op; zodra deze grens wordt bereikt, vermeldt de UI dat aantallen en filters die geladen set betreffen.
- De selectie en weergave staan in de URL. Geen automatisch opslaan bij selectie, filteren of sluiten.
- Opvolging toont expliciet dat status en terugkoppeling openbaar worden. Tekenlimiet 300; korte voorbeeldteksten blijven beschikbaar. Geslaagde opslag verwerkt het echte serverantwoord. Mislukte opslag houdt de bewerkte tekst.
- Concepten blijven in sessionStorage van het tabblad bewaard. Bij wisselen naar een andere melding vraagt de interface of je verder wilt; vernieuwen houdt concepten. Als vernieuwde servergegevens van de opgeslagen basis afwijken, wordt opslaan geblokkeerd tot de actuele versie is overgenomen. Dit is een UI-controle, geen nieuwe atomaire serverversiegarantie.
- ‘Uit meldpunt halen’ gebruikt de bestaande soft-removal na een modale bevestiging. De oorspronkelijke melding en opgeslagen opvolging blijven in het logboek. Het logboek is read-only en noemt zichzelf geen volledige auditgeschiedenis.
- Verborgen en verwijderde meldingen krijgen geen misleidende link naar een publieke detailpagina. Actieve publieke meldingen kunnen in een apart tabblad bekeken worden.

## Compatibiliteit en verificatie

Bestaande serverfuncties, adminrechten, publieke meldpuntpagina’s, historische pushlogs en afbeeldingen blijven behouden. Geen database- of mediaverplaatsing voor deze wijziging. Nieuwe foto’s blijven via de bestaande R2-route gaan.

`npm run build`, 98 Vitest-tests en `npm run test:admin` controleren onder andere de editor op desktop/mobiel, behoud van originele teksten, opslagfouten, bevestiging vóór soft-removal, geen automatische verzending bij controle/hergebruik, onveilige links, concept na herladen, gedeeltelijke/nul aflevering, oude routes en afwezig adminmeetverkeer. Browsertests onderscheppen alle externe verzoeken en sturen geen echte pushberichten.
