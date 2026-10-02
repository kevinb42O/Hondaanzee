# Hotspotreviews, sterren en likes

Ontwerp opgesteld op 2 oktober 2026 en daarna uitgevoerd. Dit document bewaart de oorspronkelijke productkeuzes; de concrete architectuur, controles en uitrol staan in [HOTSPOT_COMMUNITY_IMPLEMENTATION.md](HOTSPOT_COMMUNITY_IMPLEMENTATION.md).

## Productkeuze

Elke gepubliceerde hotspot krijgt openbare bezoekersreviews, een gemiddelde sterrenbeoordeling en een openbaar aantal likes. Alleen ingelogde, actieve leden kunnen een like geven of een review insturen. Iedereen kan de goedgekeurde reviews en totalen lezen.

De drie acties hebben elk een eigen betekenis:

| Actie | Betekenis | Gedrag |
| --- | --- | --- |
| Bewaren | Ik wil deze plek onthouden. | Bestaande privéfavoriet, bestaande accountfunctie. |
| Like | Ik vind dit een leuke plek. | Aparte publieke waardering; één actieve like per account en hotspot. |
| Review met 1–5 sterren | Dit was mijn ervaring met mijn hond. | Eén review per account en hotspot, met tekst en moderatie. |

De bestaande favorieten worden niet naar likes geconverteerd. Een like mag zonder review; een review geeft niet automatisch een like. Het publieke aantal betreft huidige likes van actieve accounts, geen historische klikken of bevestigde bezoeken. Een ingetrokken like verlaagt het aantal.

Het bestaande hartje blijft de bewaaractie. De like krijgt een duim en het label ‘Vind ik leuk’, zodat twee gelijkende hartjes geen verschillende acties voorstellen.

## Waarom dit de moeite waard is

- Bezoekers vinden ervaringen van andere hondenbezitters op het moment dat ze een zaak overwegen.
- Accounts krijgen een direct gebruiksdoel buiten het verzamelen van favorieten.
- Reviews voegen praktische informatie toe over ontvangst, binnen/terras, meerdere honden en eventuele toeslagen.
- Likes tonen belangstelling; sterren en reviewtekst tonen een bezoekervaring. De verschillende signalen vullen elkaar aan.
- Het bestaande admin-dashboard biedt al de basis om ongewenste inzendingen te beoordelen en meldingen af te handelen.

De belangrijkste nadelen zijn extra moderatiewerk, beïnvloeding door nepaccounts, een onstabiel gemiddelde bij weinig beoordelingen en discussies met zaken over negatieve ervaringen. Deze nadelen zijn beheersbaar en vormen geen reden om de functie uit te stellen. Een registratie bewijst geen bezoek. De huidige wachtwoordregistratie verifieert bovendien geen e-mailbezit; een badge ‘geverifieerd bezoek’ of ‘geverifieerde reviewer’ is daarom niet gerechtvaardigd.

## Bezoekerservaring op de hotspotpagina

Bij de naam komt een compacte samenvatting, bijvoorbeeld ‘4,6/5 · 12 reviews’ en ‘23 likes’. Deze cijfers zijn uitsluitend voorbeelden voor de interface; productie toont echte tellingen. De score linkt naar het reviewgedeelte.

Bij de acties staan ‘Bewaar deze plek’, ‘Vind ik leuk’ met aantal en ‘Schrijf een review’. Op mobiel mogen de acties over meerdere regels lopen. De huidige contact- en navigatieknoppen blijven goed bereikbaar.

Het reviewgedeelte bevat:

- Gemiddelde op één decimaal, totaal aantal gepubliceerde reviews en verdeling over 1–5 sterren.
- Een lijst van gepubliceerde reviews, standaard de nieuwste eerst, met paginering.
- Publieke schermnaam, sterren, bezoekmaand indien ingevuld, tekst, publicatiedatum en eventueel ‘Bijgewerkt’.
- Een meldknop voor spam, persoonsgegevens, belediging/bedreiging, niet ter zake of andere reden.
- De eigen inzending en status voor de auteur: wacht op controle, gepubliceerd, wijziging wacht op controle of afgewezen.

Zonder beoordelingen staat er ‘Nog geen reviews — deel jouw ervaring’. Er verschijnt geen 0/5. Eén gepubliceerde review mag een score opleveren, met expliciet ‘1 review’ en ‘Eerste beoordeling’. Onder drie reviews krijgt het gemiddelde het label ‘Weinig beoordelingen’. In deze eerste versie wijzigen beoordelingen of likes de standaardvolgorde van hotspots niet.

Bij een laadfout verschijnt ‘Beoordelingen tijdelijk niet beschikbaar’, niet nul reviews of nul likes. Een mislukte schrijfactie toont geen bevestigde like of verzonden review en behoudt invoer.

## Registratie en reviewformulier

Een bezoeker zonder sessie kan alles lezen. Bij ‘Schrijf een review’ opent de aanmeld-/registratiestap met een veilige terugkeer naar deze hotspot en het formulier. Voor een like wordt de gekozen actie kort lokaal onthouden en na geslaagde login één keer uitgevoerd. Geen automatische reviewinzending na registratie.

Reviewvelden:

- Verplicht: 1–5 sterren, gehele waarden.
- Vraag bij sterren: ‘Hoe was je ervaring bij deze zaak met je hond?’ Dit is één totaalscore voor het bezoek met hond; er komen geen aparte scores voor eten, bediening en prijs in v1.
- Verplicht: 20–1000 tekens eigen ervaring. Suggestie: ‘Was je hond binnen welkom? Hoe werden jullie ontvangen? Wat moeten andere baasjes weten?’
- Optioneel: bezoekmaand en -jaar, niet in de toekomst. Dit is zelf opgegeven en geen bezoekbewijs.
- Publieke schermnaam uit het account; als die ontbreekt eerst laten kiezen. E-mailadres en interne account-ID zijn nooit publiek.
- Expliciete verklaring dat de review op een eigen bezoekervaring berust. Geen automatische claim van verificatie.

Per account en hotspot bestaat één review-identiteit. Een volgende inzending wijzigt die review via een nieuwe versie. Bij een wijziging blijft de laatst goedgekeurde versie zichtbaar en tellen haar sterren mee totdat de nieuwe versie is goedgekeurd. Een afgewezen wijziging verandert de gepubliceerde versie niet. Zonder eerdere goedkeuring blijft alles privé.

De auteur kan de eigen review intrekken; die verdwijnt direct uit lijst, aantal en gemiddelde. Daarna kan dezelfde review-identiteit opnieuw worden ingezonden voor controle. De beheerder kan sterren niet aanpassen. Auteurwijzigingen van sterren worden als nieuwe, te beoordelen versie bewaard.

## Moderatie en accounts

Nieuwe reviews en wijzigingen beginnen als ‘pending’. Dezelfde beoordelingsregels gelden voor positieve en negatieve reviews. Een lage score is op zichzelf nooit een reden voor verbergen of afwijzen.

Reviews over eigen zaken, van medewerkers over hun werkgever, betaalde reviews en campagnes tegen concurrenten worden niet toegestaan. Geen beloningen koppelen aan een positieve review. Controle op belangenverstrengeling gebeurt op basis van beschikbare informatie; het systeem pretendeert geen uitbatersidentiteit te kennen zolang daar geen koppeling voor bestaat.

Uitbreiding van `/admin/reviews`:

- Filters voor soort plek (hotspot/losloopzone), gemeente, plek, sterren, status en gemelde reviews.
- Directe links naar de openbare hotspot en de zaak-editor.
- Beoordelen, publiceren, verbergen, afwijzen, noodzakelijke tekstredactie en meldingen afhandelen.
- Verplichte reden voor verbergen, afwijzen en redactie; originele inhoud en moderatiegeschiedenis blijven volgens de huidige moderatieprincipes beschermd.
- Een schermnaam of persoonsgegevens redigeren mag de betekenis van de ervaring niet veranderen.
- Samenvatting per hotspot: huidige likes, gepubliceerde reviews, gemiddelde, wachtende inzendingen en openstaande meldingen.

Accountstatus wordt op de server gecontroleerd bij elke schrijfactie, ook bij bestaande sessies. Schorsing voorkomt nieuwe likes en inzendingen. Likes en nieuwe accountreviews van geschorste leden worden uitgesloten van publieke tellingen en zichtbaarheid; herstel herstelt alleen bijdragen die niet afzonderlijk verborgen, afgewezen of ingetrokken zijn.

Bij accountverwijdering verdwijnen nieuwe hotspotlikes en nieuwe hotspotreviews uit de publieke weergave. De verwijderroute wist ook de persoonsgegevens en teksten uit hun private versies; hiervoor komt een expliciete privacy-verwijderroute die de reguliere onveranderlijkheid van moderatiegeschiedenis niet per ongeluk doorbreekt. Alleen minimale, niet-persoonlijke auditmetadata mogen overblijven. Dit gedrag wordt in de accountinterface uitgelegd.

Bestaande losloopzonereviews worden behouden en niet achteraf als ingezonden door een lid gepresenteerd. De huidige unlink/retentie van historische zonereviews verandert niet stilzwijgend. Nieuwe inzendingen voor losloopzones vereisen voortaan eveneens een actief account. Eventuele historische dubbele zonereviews worden eerst geïnventariseerd en nooit automatisch verwijderd om een nieuwe unieke constraint te kunnen plaatsen.

## Aansluiting op de huidige techniek

De huidige code is op de volgende punten bruikbaar:

- `pages/PlaceDetail.tsx`: gezamenlijk hotspot-/dienstentemplate en bestaand accountbewaren.
- `components/member/MemberProvider.tsx` en `SavePlaceButton.tsx`: sessie, actieve profielstatus en de eerste bewaaractie via registratie.
- `components/ReviewForm.tsx`, `ReviewList.tsx`, `ReviewSection.tsx` en `StarRating.tsx`: bestaande reviewweergave voor zones.
- `utils/zoneReviews.ts`: publieke samenvattingen, aanvraagfunctie en verversen bij terugkeer.
- `supabase/functions/site-reviews/index.ts`: huidige intake accepteert nog gasten en controleert een account alleen wanneer een token is meegestuurd. Deze controle moet verplicht worden en ook schorsingen afwijzen.
- `supabase/functions/admin-reviews/index.ts` en `pages/AdminReviews.tsx`: bestaande moderatie is nog gekoppeld aan `zone_id`, zones en maximaal 500 tekens.
- `content_places`: stabiele identiteit van hotspots, diensten en zones.
- `member_favorites` en `admin-favorites`: bestaande privéfavorieten en privébeheerstatistieken; geen publieke likebron.

### Database en API

1. Nieuwe `place_likes` met `place_id`, `member_id` en serverdatum; unieke sleutel `(member_id, place_id)`, verwijzingen naar stabiele identiteiten en index voor tellingen.
2. Schrijfactie gebruikt gewenste toestand (`liked: true/false`), geen blind toggle-verzoek. Herhalen of dubbele tabbladen kunnen daardoor geen dubbele like of toevallige unlike opleveren.
3. Reviewmodel uitbreiden van zone naar algemene `place_id`; bestaande `zone_id`/sluginterfaces blijven als compatibiliteitsroute voor zones bestaan totdat hun callers veilig zijn omgezet.
4. Een review heeft een auteur, plaats, te beoordelen versie en eventueel goedgekeurde versie. De goedgekeurde versie bepaalt tekst én sterren in publieke gemiddelden. De huidige onveranderlijke originele rating mag daardoor niet de scorebron voor een gewijzigde review blijven.
5. Historische zone-inhoud, moderatieacties en redactie eerst exact vergelijken vóór en na de migratie. Nieuwe uniciteit voor accountreviews invoeren zonder historische gastreviews of duplicaten te verliezen.
6. Publieke leesfuncties geven alleen gepubliceerde reviewvelden en totalen voor gepubliceerde, niet-gearchiveerde hotspots. Ze geven geen e-mails, account-ID's, likerslijst, concepttekst, interne notities of misbruikgegevens terug.
7. De eigen like en eigen reviewstatus zijn alleen opvraagbaar voor de geauthenticeerde eigenaar. De server leidt de auteur af uit een gecontroleerde sessie; nooit uit een meegestuurd account-ID.
8. Unieke constraints, transacties, versiecontrole en begrensde account-/IP-inname voorkomen dubbel tellen, gelijktijdig overschrijven en eenvoudige bulkspam. Bestaande dagelijks gezouten IP-hashes kunnen worden hergebruikt; geen ruwe IP-opslag.
9. Beheer gebruikt de bestaande servercontrole op adminrechten. Publieke schrijftoegang tot reviewstatus, scoretotalen en moderatiegegevens blijft uitgesloten.
10. Publieke tellingen volgen direct de database. Een review goedkeuren of verbergen vereist geen Vercel-publicatie. Geopende pagina's verversen bij terugkeer en met de bestaande korte cachetermijn.

Archiveren bewaart inhoud en historie maar maakt een plek niet publiek beoordeelbaar. Nieuwe hotspots worden automatisch ondersteund zodra ze gepubliceerd zijn. Wijziging van naam of inhoud verandert hun review-/like-identiteit niet.

### Integratie en presentatie

Een gedeelde reviewcomponent krijgt een expliciete plaatsreferentie en passende formuliertekst. De hotspotvariant wordt alleen op `kind='hotspot'` geplaatst. Dierenartsen en andere diensten krijgen niet automatisch dezelfde sterrenbeoordeling; dat valt buiten deze eerste uitbreiding.

Op hotspotkaarten komen een compacte score met reviewaantal en een likeaantal. Samenvattingen worden in batches opgehaald voor de zichtbare plaatsen; geen afzonderlijk netwerkverzoek per kaart. Voorload, fout en nulwaarden blijven verschillende toestanden.

De nieuwe communitygegevens zijn geen velden die een uitbater of zaak-editor vrij kan veranderen. De lopende wijzigingen aan zaakvelden en presentatie in de werkboom worden bij uitvoering eerst bekeken en behouden; dit plan wijzigt geen bestaande bronbestanden.

## Uitvoering in vier stappen

### 1. Database en server

Migratie, likes, algemeen reviewmodel, accountcontrole, publieke samenvattingen, auteuracties en accountverwijdering bouwen. Compatibiliteit met bestaande zones controleren voordat de nieuwe UI actief wordt.

### 2. Hotspotpagina en accountflow

Likes, score, reviewlijst, formulier, eigen review beheren, melden en terugkeer na login integreren. Daarna kaartjes voorzien van compacte samenvattingen. Desktop, mobiel en toetsenbord ondersteunen.

### 3. Admin en bestaande zones

De huidige moderatiewerkruimte uitbreiden naar hotspots en zones. Nieuwe zonereviews accountplichtig maken. Historische reviews, scorebetekenis en routes behouden. CSV en tekstvalidatie aanpassen aan het nieuwe model.

### 4. Verificatie en uitrol

Veiligheid en gebruikersflows testen; database en backend compatibel uitrollen vóór de frontend; productie met eigen verwijderbare testdata controleren. Bij uitschakelen van de nieuwe UI blijven bestaande catalogus, favorieten en zonefuncties bereikbaar en blijft nieuwe communitydata bewaard.

## Oplevercriteria en betekenisvolle tests

- Een gast kan lezen en krijgt bij schrijven de accountflow; een rechtstreekse gastaanvraag wordt geweigerd.
- Een actief lid kan liken, de like intrekken, reviewen en de eigen review wijzigen/intrekken.
- Dubbele of gelijktijdige likeaanvragen geven maximaal één like. Een tweede account heeft zijn eigen toestand.
- Een ander lid kan geen review of like van de auteur aanpassen en kan private reviewversies niet lezen.
- Een geschorst account krijgt ook met een oude sessie geen schrijftoegang; uitsluiting en herstel van totalen kloppen.
- Accountverwijdering verwijdert de publieke nieuwe bijdragen en wist hun private persoonsgegevens conform de beschreven verwijderroute.
- Alleen goedgekeurde versies tellen; pending, rejected, hidden en withdrawn doen niet mee. Een wijziging telt nooit als tweede review.
- Goedkeuren, verbergen, redigeren en melden werken voor hotspots én bestaande zones. Moderators kunnen geen sterren wijzigen.
- Een fout in laden of opslaan presenteert geen verzonnen nulwaarden of succes en verliest geen formuliertekst.
- Registratie keert veilig terug naar de juiste plek; een onthouden like wordt één keer verwerkt en een review wordt nooit vanzelf verzonden.
- Mobiele layout, toetsenbordbediening, screenreaderlabels en verplaatsen naar het reviewgedeelte werken.
- Bestaande favorieten, reviews, URLs, cataloguspublicatie en openbare zaakpagina's blijven functioneren.

Validatie bij uitvoering: relevante Vitest-tests, teruggedraaide SQL-beveiligingschecks, browserflows met onderschepte externe writes, `npm run build`, en relevante bestaande member-/place-/admin-browserchecks. De eerste echte publieke telling en moderatieactie worden daarna met verwijderbare productietestdata gecontroleerd.

## Succes meten

Gebruik echte aantallen leden die hotspots liken, leden die reviews insturen, hotspots met minstens één gepubliceerde review, wachttijd voor moderatie en aandeel gemelde/afgewezen reviews. Houd likes, privéfavorieten, reviews en contactkliks afzonderlijk. Een like of routeklik is geen bevestigd bezoek.

## Latere uitbreidingen

Foto's bij reviews, uitbatersreacties en ‘nuttige review’ kunnen later volgen. Voor een rangschikking op sterren zijn meer beoordelingen en een methode die rekening houdt met kleine aantallen nodig.

Review-structured-data voor zoekmachines kan na de eerste versie worden toegevoegd. Google ondersteunt beoordelingen op onafhankelijke sites over lokale zaken, maar vereist zichtbare, echte reviews en correcte markup; zoekresultaatsterren zijn niet gegarandeerd. Eerst de bestaande statische HTML, clientweergave en moderatieverversing op één consistente bron aansluiten. Likes horen nooit in `AggregateRating`.

Bronnen ter referentie:

- [Google: review snippet en AggregateRating](https://developers.google.com/search/docs/appearance/structured-data/review-snippet)
- [Google Maps: regels over fake engagement en belangenverstrengeling](https://support.google.com/contributionpolicy/answer/7400114?hl=en-GB) — referentie voor moderatiekeuzes, geen automatisch toepasselijke platformregels voor Hond aan Zee.
