# HondAanZee

[HondAanZee.be](https://hondaanzee.be) is een gids voor een dag aan de Belgische kust met je hond. Het project combineert strandregels per kustgemeente, hondvriendelijke hotspots en diensten, losloopzones, kaarten, een evenementenagenda en praktische informatie.

Gratis accounts bieden favorieten, persoonlijke uitstapjes, gevolgde gemeenten en hondenprofielen. Bezoekers kunnen uitstapjes delen en met een account likes en reviews plaatsen. Het openbare meldpunt verzamelt meldingen over gif en overlast. De beheeromgeving ondersteunt contentbewerking, concepten, publicatie, moderatie, ledenbeheer, statistieken en pushmeldingen.

## Techniek

- **Webapp:** React 19, TypeScript, React Router en Vite.
- **Interface:** Tailwind CSS, eigen stylesheets, Framer Motion en Lucide.
- **Kaarten:** Leaflet en een eigen kustkaart.
- **Backend:** Supabase Auth, PostgreSQL met Row Level Security en Edge Functions.
- **Media:** lokale bestanden in `public/` en Cloudflare R2 voor de mediaworkflow van het beheer.
- **Hosting:** Vercel, met statisch gegenereerde publieke pagina’s en Node API-endpoints.
- **Verificatie:** Vitest, Puppeteer en controles voor data, HTML, SEO en types.

## Lokaal starten

Gebruik Node.js 22.12 of hoger binnen de 22-reeks, of Node.js 24, met npm.

```sh
npm ci
npm run dev
```

De ontwikkelserver draait op [localhost:3000](http://localhost:3000).

Voor het bekijken van de publieke gids zijn geen lokale geheime sleutels nodig. De webapp gebruikt de publieke Supabase-configuratie in `utils/supabasePublicConfig.ts`. Accounts, reviews, het meldpunt en beheeracties communiceren met die geconfigureerde backend. `npm run dev` start alleen de frontend; Supabase-functies en Vercel-endpoints worden daarmee niet lokaal gestart.

## Configuratie

`.env.admin.example` beschrijft de serverconfiguratie voor Supabase, Cloudflare R2, publicatie via Vercel en statistieken. Bewaar lokale geheimen in de door Git genegeerde `.env.local` en stel productiegeheimen in bij de betreffende Vercel- of Supabase-omgeving. Geef servergeheimen geen `VITE_`-prefix.

De Node-buildscripts lezen variabelen uit de **procesomgeving**. Alleen `.env.local` invullen maakt die variabelen niet automatisch beschikbaar voor deze scripts.

De catalogusbuild kent twee situaties:

- Zonder `CATALOG_BUILD_TOKEN` gebruikt een lokale build de catalogus uit Git.
- Met `CATALOG_BUILD_TOKEN` haalt de build een catalogussnapshot op bij de backend. `HAZ_RELEASE_ID` selecteert een specifieke, onveranderlijke release. Een Vercel-productiebuild vereist `CATALOG_BUILD_TOKEN`.

Een build met een expliciete release controleert de release-identiteit en de integriteit van de snapshot. De beheeromgeving gebruikt deze route om geselecteerde concepten te publiceren.

## Build en preview

```sh
npm run build
npm run preview
```

`npm run build` voert de ontwerp- en typecontroles uit, bereidt de catalogus voor, genereert sitemap-, AI-export- en Open Graph-data, bouwt de webapp en rendert de publieke routes naar volledige HTML. Daarna worden zaak-, strand- en evenementpagina’s gecontroleerd op inhoud en SEO. De uitvoer staat in `dist/`.

`npm run preview` toont de gebouwde bestanden lokaal. Vercel-rewrites, API-endpoints en de Supabase-backend draaien daarmee niet als lokale productieserver.

`npm run build:no-prerender` stopt na de voorbereidende controles, datageneratie en Vite-build. Gebruik de volledige `npm run build` voor de publieke HTML-pagina’s. `npm run build:prerender` voegt na de volledige build nog de afzonderlijke Puppeteer-prerenderstap toe; Vercel gebruikt standaard `npm run build`, zoals vastgelegd in `vercel.json`.

## Controles

Voer vóór publicatie minimaal uit:

```sh
npm test
npm run build
npm run test:public
```

De aanvullende browserchecks gebruiken de gebouwde bestanden in `dist/`. Bouw dus eerst na wijzigingen.

| Commando | Controleert |
| --- | --- |
| `npm test` | Alle unit tests. |
| `npm run typecheck` | TypeScript voor de webapp, Node API en Supabase Edge Functions. |
| `npm run check:design` | De projectregel die spark- en sparkle-iconen in de interface verbiedt. |
| `npm run test:public` | Publieke pagina’s met en zonder JavaScript, SEO, kaarten en 404/noindex-gedrag. |
| `npm run test:places` | Zaakpagina’s, statische HTML en browsergedrag. |
| `npm run test:beaches` | Strandregellogica en gegenereerde strandpagina’s. |
| `npm run test:events` | Evenementlogica en gegenereerde evenementpagina’s. |
| `npm run test:search` | Zoeklogica en zoekgedrag op desktop en mobiel. |
| `npm run test:admin` | Beheertoegang, concepten, publicatieverzoeken, moderatie en beheerflows. |
| `npm run test:members` | Accountlogica, registratie, favorieten, uitstapjes, delen en accountverwijdering. |
| `npm run test:community` | Hotspotlikes, reviews, wijzigingen en foutafhandeling. |

De browserchecks voor beheer, leden en hotspotcommunity onderscheppen externe verzoeken en gebruiken testdata. De afzonderlijke `*-live.mjs`-scripts zijn controles tegen de echte backend en horen niet bij deze standaard testreeks.

Edge-afhankelijkheden staan vast in `supabase/functions/deno.lock`. De typecontrole gebruikt de via npm vastgelegde Deno-versie en houdt het lockbestand bevroren. Bij een bewuste wijziging van Edge-imports:

```sh
npm run typecheck:edge -- --update-lock
npm run typecheck
```

Controleer de dependencywijzigingen in het lockbestand vóór publicatie. Vitest sluit `dist/`, `dist-ssr/` en tijdelijke checkouts in `.admin-local/` uit.

## Projectstructuur

| Pad | Inhoud |
| --- | --- |
| `App.tsx` | Routing, paginalayout en centrale foutafhandeling. |
| `pages/` | Publieke pagina’s, accountpagina’s en beheerpagina’s. |
| `components/` | Herbruikbare interface, kaarten, zoekvelden, reviews en account-/beheercomponenten. |
| `data/` en `cityData.ts` | Catalogus, gemeenten, strandregels, evenementen en redactionele inhoud. |
| `utils/` en `shared/` | Logica, hooks, validatie, SEO en bijbehorende unit tests. |
| `supabase/functions/` | Backend-endpoints en gedeelde serverlogica. |
| `supabase/migrations/` en `supabase/tests/` | Databaseschema, toegangsbeleid en SQL-controles. |
| `api/` | Vercel Node-endpoints voor keepalive en Open Graph-responses. |
| `scripts/` | Catalogusverwerking, statische rendering, SEO-generatie en browserchecks. |
| `public/` | Afbeeldingen, video, service worker en andere publieke bestanden. |
| `vercel.json` | Buildcommando, headers, redirects, rewrites en cronconfiguratie. |

## Verdere documentatie

- [Zaakpagina’s en hun opbouw](BUSINESS_PAGES.md)
- [Beheeromgeving en publicatie](ADMIN_DASHBOARD_PLAN.md)
- [Bewerkbare zaakvelden](ADMIN_PLACE_FIELD_CONTROL_PLAN.md)
- [Losloopzones en reviewbeheer](ADMIN_ZONES_REVIEWS.md)
- [Accounts en persoonlijke uitstapjes](MEMBER_ACCOUNTS.md)
- [Hotspotlikes en reviews](HOTSPOT_COMMUNITY_IMPLEMENTATION.md)
- [Communicatie en meldpuntbeheer](ADMIN_COMMUNICATION_WORKSPACE.md)
- [Pushmeldingen instellen](PUSH_NOTIFICATIONS_SETUP.md)
- [SEO-strategie](SEO_STRATEGY.md) en [indexeringsaudit](INDEXING_AUDIT.md)
- [Projectafspraken voor wijzigingen](AGENTS.md)

Deze documenten bevatten ook plannen en gedateerde verificaties. Raadpleeg de relevante code, configuratie en testresultaten om de actuele status van een onderdeel vast te stellen.
