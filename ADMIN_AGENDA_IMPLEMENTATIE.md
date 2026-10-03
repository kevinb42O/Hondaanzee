# Agenda: live beheer, analytics en Google-status

Opgeleverd op 3 oktober 2026. De implementatiecode staat op `main` (`75829dc`, gevolgd door testafscherming `bca4b8b`). De agenda is voortaan onderdeel van dezelfde database- en publicatieketen als zaken en zones.

## Navigatie

Op verzoek van Kevin zijn de rapporten onder **Analytics** ondergebracht, met submenu **Website** en **Agenda** en dezelfde tabknoppen bovenaan beide rapporten. De hoofdknop **Agenda** opent uitsluitend het beheer. Een rapport per editie hoort ook bij Analytics. Bestaande links onder `/admin/agenda/.../analytics` leiden automatisch naar de nieuwe rapport-URL. De algemene websitetotalen omvatten ook de agenda; het agendarapport geeft de uitsplitsing.

De websiteanalytics heeft daarnaast een schakelaar voor paginaweergaven en dagelijks geschatte bezoekers zonder cookies. Zie [de afzonderlijke meetdefinitie](ADMIN_ANALYTICS_METING.md). Het agendarapport behoudt zijn tellingen van weergaven en klikacties.

## Gebruik

- `/admin/agenda`: alle 21 fiches, zoekfunctie en filters; bewerken, publieke pagina en analytics per editie.
- `/admin/agenda/nieuw`: privéconcept aanmaken of een bestaande editie dupliceren. Jaargebonden gegevens en bevestigingen worden niet als nieuwe waarheid gekopieerd.
- Editor: inhoud, lokale datums en uren, plaats, organisator, prijzen, bronnen, hondenvoorwaarden, foto's en galerijgegevens. Slug en editie-identiteit blijven vast. Preview, revisievergelijking en herstel als nieuw concept zijn beschikbaar.
- `/admin/publiceren`: selecteer opgeslagen agendaconcepten. Niet-geselecteerde concepten blijven privé; de volledige gepubliceerde catalogus gaat mee. De status wordt pas live na controle van de exacte release-ID en hash op het echte domein.
- `/admin/analytics/agenda`: weergaven voor overzicht en fiches, organisator-, ticket-, telefoon-, e-mail-, route- en sociale klikken, periodes, grafiek, bronnen, apparaten en CSV. Dezelfde gegevens zijn per editie beschikbaar. Dit zijn paginaweergaven en klikinteresse, geen unieke bezoekers, ticketverkopen of Search Console-impressies.

Nieuwe dashboardfoto's gaan rechtstreeks naar Cloudflare R2 en worden via `media.hondaanzee.be` geserveerd. Supabase bevat metadata en toegangscontrole. Bestaande foto's, credits, uitsneden en galerijvolgorde zijn behouden. De agenda-hero is niet aangepast.

## Publicatiebewijs

Met het bestaande ingelogde adminaccount is een ongewijzigde fiche opgeslagen en uitsluitend dat agendaconcept gepubliceerd. Release `0549afbd-fc3d-450c-b17a-e1ea87bb13ac` is op 3 oktober om 18:02:17 Brussels tijd live bevestigd, via deployment `dpl_7rQNTnxwoJER6GdRkoGjPhnjrhpj`.

Snapshot-hash: `c45e4c14d7ac2c1f3e9a46e84f4c30c9fc25eee46d182352f2e048751d929ec2`.

Alle 21 evenementobjecten zijn veld voor veld gelijk aan de oorspronkelijke agenda. De snapshot bevat ook 133 hotspots, 24 diensten en 27 losloopzones. Er zijn na publicatie geen openstaande agendaconcepten. De 21 fiches zijn live opnieuw gecontroleerd op HTML, metadata, schema, canonical, sitemap en links. Zie [het machineleesbare bewijs](research/agenda-admin-live-verificatie-2026-10-03.json).

De volledige dekking voor ficheweergaven is conservatief geregistreerd vanaf de import op 3 oktober. De nieuwe actiecollectie voor alle 21 fiches begint bij deze bevestigde livepublicatie, 18:02:17. Ontbrekende eerdere dekking wordt aangeduid als onbekend. Adminpagina's en conceptpreviews sturen geen openbare metingen.

## Google

Search Console bevestigt dat `/agenda` geïndexeerd is. De nieuwe Knokke- en Zwarteberg-fiches waren bij controle nog onbekend bij Google; beide indexatieaanvragen zijn door Google bevestigd. De bijgewerkte sitemap is opnieuw ingediend. De eerdere sitemap was succesvol verwerkt, maar laatst op 2 oktober gelezen met 224 ontdekte pagina's. Zie [de vastgelegde Google-status](research/agenda-google-status-2026-10-03.json). Verwerking van de nieuwe sitemap en de overige individuele fiche-indexstatussen zijn nog niet bevestigd.

Alle 21 fiches zijn technisch indexeerbaar. Indexeerbaarheid, een ingestuurde sitemap en een indexatieaanvraag garanderen geen opname of zoekpositie. Zie [Google over crawlen en indexatieaanvragen](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl).

## Validatie en incidentregistratie

- 336 unit-/integratietests in 30 bestanden geslaagd; volledige web-, API- en edge-typechecks geslaagd.
- Productiebuild: alle 242 publieke pagina's, 157 zaakpagina's, 11 strandpagina's en 21 evenementfiches gecontroleerd.
- Bestaande admin- en publieke browsertests geslaagd; nieuwe agendabrowsertests omvatten conflictbehoud, revisieherstel, verliesvrij foto- en galerijbeheer, nieuwe editie, publicatieselectie, filters, 24-uursrapport, fouten en mobiel.
- Kliktests gebruiken onderschepte verzoeken en schrijven geen productiebezoekerscijfers. Geen dubbele ticket- of route-events.
- Live anonieme verzoeken naar de drie adminfuncties worden met HTTP 403 geweigerd; databaseprivileges zijn gecontroleerd. De collector valideert nieuwe fiches tegen gepubliceerde database-identiteiten.
- Databasetests controleren versieconflicten, onveranderlijke geschiedenis, conceptisolatie, volledige snapshots, intrekken, publicatiestatus en actieopslag. Het SQL-bestand bevat zelf `BEGIN` en `ROLLBACK`; vóór/na-versies en revisiepointers zijn vergeleken en identiek.

Bij een aanvullende testrun ontbrak aanvankelijk de transactie-wrapper in de aanroep. Hierdoor ontstonden twee testrevisies, een testteller en twee testpublicatiestatussen. De oorspronkelijke inhoud en publicatiereferenties zijn hersteld, testtellers verwijderd en testjobs afgesloten met een expliciete toelichting. De onveranderlijke testrevisies en het auditspoor zijn behouden. De definitieve release bevat uitsluitend de oorspronkelijke 21 evenementobjecten; alle zijn opnieuw vergeleken en live geverifieerd. De verplichte rollback staat nu in het testbestand zelf om herhaling te voorkomen.

De code is geïsoleerd gepubliceerd; gelijktijdige lokale wijzigingen aan gemeentepagina's zijn behouden en niet meegenomen in deze release.
