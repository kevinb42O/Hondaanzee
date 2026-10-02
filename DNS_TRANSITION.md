# DNS-overgang voor Hond aan Zee

Stand: 2 oktober 2026. Kevin heeft de nameserverwissel, tijdelijke DNSSEC-onderbreking en herstel, en openbare koppeling van uitsluitend de R2-mediabucket expliciet goedgekeurd. Deze toestemming hoeft niet opnieuw gevraagd te worden zolang bestemming en risico niet wijzigen.

## Uitgevoerd

- De negen functionele bestaande DNS-records zijn exact voorbereid in de gratis Cloudflare-zone; website-records staan DNS only. De bestaande Vercel-hosting en Mailprotect-mail blijven het uitgangspunt.
- Easyhost-DNSSEC is tijdelijk uitgezet op 2 oktober rond 18.49 uur CEST. Registrar lock en automatisch vernieuwen zijn behouden.
- Alle zes autoritatieve .be-servers bevestigden op 2 oktober om 19.09.12 uur CEST dat het oude DS-record afwezig is. Zijn oorspronkelijke TTL was 86400 seconden.
- Nameservers zijn nog steeds ns1.easyhost.be, ns2.easyhost.be, ns3.easyhost.be.
- Het verbinden van media.hondaanzee.be gaf een fout bij de nog inactieve Cloudflare-zone. Geen domeinkoppeling toegevoegd. Beide R2-buckets blijven privé; r2.dev is uitgeschakeld.

## Niet omschakelen vóór 3 oktober 2026, 19.15 uur CEST

Deze grens is 24 uur plus vijf minuten na de bevestigde DS-verwijdering. Op hervatting opnieuw controleren dat alle parentservers geen DS teruggeven en de huidige DNS-records nog overeenkomen met de voorbereide kopie. Gebruik de oorspronkelijke TTL, niet alleen de kortere resterende TTL van één resolver.

## Nog uit te voeren

1. Eerst verifiëren hoe Easyhost DNSSEC met externe Cloudflare-nameservers ondersteunt. De zichtbare instellingen tonen alleen een automatische DNSSEC-schakelaar, geen externe DS-invoer. De officiële help beschrijft automatische sleutels maar bevestigt externe DS-registratie niet. Niet aannemen dat opnieuw aanklikken de juiste Cloudflare-DS publiceert. Indien support nodig is: bericht vooraf concreet voorbereiden en toestemming vragen om dat bericht namens Kevin te verzenden.
2. Na de cachetermijn en bevestigde herstelroute de nameservers in het domeinbeheer wijzigen naar gerardo.ns.cloudflare.com en nelly.ns.cloudflare.com. Niet alleen NS-records in de DNS-zone wijzigen. Domeinregistratie blijft bij Easyhost.
3. Cloudflare-zoneactivatie, autoritatieve antwoorden en Vercel-domeinen controleren. Vergelijk A, WWW-CNAME, beide MX, vier SRV en TXT met de vooraf vastgelegde waarden. Controleer dat website-records DNS only blijven.
4. Alleen hondaanzee-media verbinden met media.hondaanzee.be, minimaal TLS 1.2. De stagingbucket hondaanzee-uploads blijft privé; r2.dev blijft uitgeschakeld.
5. DNSSEC bij Cloudflare activeren en de bijbehorende DS via de geverifieerde Easyhost-route registreren. Verifieer de keten bij de .be-parent en validerende resolvers. Publiceer nooit de oude Easyhost-DS voor de nieuwe zone.
6. Pas na werkende HTTPS-mediadomeinkoppeling R2_PUBLIC_BASE_URL configureren en een eigen tijdelijk mediaobject als eindcontrole gebruiken. Bestaande foto's worden niet verplaatst of gewijzigd.

De controlewaarden staan in de genegeerde .admin-local/dns-prepared-audit.json en .admin-local/dns-transition-state.json. Daar staan geen geheime sleutels in. Er is geen automatische vervolgtaak ingepland.
