# Websiteanalytics: paginaweergaven en bezoekers

Aanvulling van 3 oktober 2026 op bronversie `812c7c2`. Kevin heeft gekozen voor een schatting zonder cookies. Database, collector en dashboard staan live. De definitieve dashboardversie `752a1bb` is op productie bevestigd via deployment `dpl_E7RZzYnmqguXYv6o9fK6gph1tUwz`. De daaropvolgende gelijktijdige zaakaanmeldingsrelease behoudt deze implementatie.

## Gebruik en betekenis

`/admin/analytics` → **Website** → **Eigen meting**. De knoppen **Paginaweergaven** en **Bezoekers** schakelen grafiek, pagina's, herkomst, apparaten en CSV samen om. Beide totalen blijven naast elkaar zichtbaar. Op Kevins verzoek staan uitleg en meetstart uitsluitend achter een inklapbare knop; de lange start- en uurmetingstekstblokken zijn verwijderd. Contactacties blijven aparte tellingen. Periodes: 24 uur, 7/30/90 dagen en 12 maanden; daggrenzen Brussel, opslag van uurgrenzen in UTC.

Bezoekers zijn dagelijkse schattingen: dezelfde IP/browsercombinatie telt per dag één keer voor de hele website. Een nieuwe pagina bekijken telt die combinatie daarnaast één keer voor die pagina. Pagina-aantallen mogen niet worden opgeteld tot websitebezoekers. Herkomst en apparaat worden voor de website bij het eerste bezoek van die dag toegekend.

Over meerdere dagen is het totaal de **som van dagelijkse schattingen**, geen aantal unieke personen in de gekozen periode. Een terugkerende bezoeker kan op een andere dag opnieuw meetellen. In de 24-uursgrafiek worden bezoekers toegewezen aan hun eerste gemeten bezoek van die dag; dit is geen telling van alle actieve browsers per uur. Gedeelde verbindingen of veranderende IP/browsergegevens kunnen onder- of overschatten.

De bezoekersmeting begon bij het eerste normale websitebezoek op **3 oktober 2026 om 18:37:36 Brussels tijd**. Oudere bezoekerscijfers worden niet teruggevuld. Grafieken tonen ontbrekende dekking als onbekend; de eerste dag en het eerste uur zijn gedeeltelijk. Vercel-historiek blijft apart met zijn eigen meetdefinitie.

## Verwerking en retentie

De server verwerkt een aparte, gezouten dagelijkse hash van IP-adres en maximaal 512 tekens HTTP-browserinformatie. Geen cookies of browseropslag voor bezoekersherkenning; geen blijvende bezoeker-ID en geen accountkoppeling. De bestaande IP-gebaseerde misbruikbegrenzing blijft apart. Do Not Track en Global Privacy Control worden op client en server gerespecteerd; bekende bots, admin en preview zijn uitgesloten.

`analytics_visitor_seen` bewaart tijdelijk dag/hash/pagina om dubbele dagtellingen te voorkomen. Bij de dagelijkse opschoning verdwijnen records van eerdere dagen. De rapporttabellen bewaren uitsluitend dag/uur/pagina/herkomst/apparaat/totaal. Uurdetails worden na 8 dagen verwijderd, dagtotalen na 397 kalenderdagen. Hashing maakt de tijdelijke gegevens niet automatisch anoniem. Privacy- en cookiebeleid beschrijven de gewijzigde verwerking met datum 3 oktober.

RLS staat aan; tabellen en registratie-RPC zijn uitsluitend toegankelijk voor `service_role`. Adminrapporten vereisen de bestaande servercontrole van het beheeraccount en bevatten geen hashes. Registratie en deduplicatie zijn één databasetransactie; een afgewezen pageview telt geen bezoeker.

## Validatie

- Migratie `20261003190000_cookie_free_visitors.sql` en migratieregister atomair uitgevoerd.
- SQL-testbestand bevat zelf `BEGIN` en `ROLLBACK`; gecontroleerd op herhaalde pagina's, meerdere pagina's, andere browsers, actie-uitsluiting, eerste herkomst, uur/dagtotalen, misbruiklimiet, retentie en service-only rechten. Voor/na-tellingen en startdekking waren identiek; geen testrecords behouden.
- Vier nieuwe berekeningstests controleren website versus paginatotalen, onbekende historiek, Brusselse daggrenzen, uurdekking en CSV-bereik/methode.
- 340 tests in 31 bestanden geslaagd. Volledige web/API/edge-typechecks en build van alle 242 openbare pagina's geslaagd.
- Browsertests controleren beide totalen, omschakelen van grafiek/herkomst, 24-uursbezoekers, terugschakelen naar paginaweergaven, kalenderlabels, mobiel en Vercel-historiek. Alle backendverzoeken onderschept; geen fictieve productiebezoeken.
- De bestaande agendabrowsertests en openbare actiecontroles blijven geslaagd.
- Een normaal bezoek in Chrome is door de echte collector verwerkt; startdekking en site/paginatelling gecontroleerd via de database. Dit echte bezoek blijft als eigen websiteverkeer meetellen.

## Productiecontrole

Met het echte ingelogde adminaccount zijn de zichtbare knoppen **Paginaweergaven** en **Bezoekers** gebruikt. De grafiek, herkomst en paginalijst veranderen mee; beide totalen blijven zichtbaar. Gecontroleerd voor 7 dagen en 24 uur, inclusief terugschakelen. De gevraagde lange start- en uurmetingstekstblokken staan niet meer in de pagina. De methode is standaard ingeklapt.

De CSV-knop exporteerde daadwerkelijk `hondaanzee-visitors-24-uur.csv`; het gedownloade bestand is gecontroleerd op website/pagina-bereik, de dagelijkse meetdefinitie en startdekking. Het bevat geen pageviewrijen of bezoekerhashes. Live adminfuncties weigeren anonieme toegang met 403. DNT, GPC en bekende bots geven 204 zonder registratie; ongeldige payloads en adminroutes geven 400.

Privacy- en cookiebeleid zijn live met datum 3 oktober 2026 en de beschrijving van de nieuwe verwerking. Alle 21 agenda-URL's zijn opnieuw gecontroleerd; de exacte catalogus-release en hash blijven behouden. Zie [het geaggregeerde bezoekersbewijs](research/website-visitors-live-2026-10-03.json) en [de agenda-verificatie](research/agenda-admin-live-verificatie-2026-10-03.json).

De publieke browsertest had twee tijdelijke time-outs tijdens het wachten op volledige netwerkstilte op gemeentepagina's. Een aanvullende run met verzoekdiagnostiek slaagde voor alle pagina's, statische en interactieve SEO, kaarten en 404's zonder runtimefouten. De tijdelijke diagnostiek is verwijderd; de volledige admintest en de gerichte analytics-/agendatests slagen.
