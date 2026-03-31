# Place Pages Handoff

Last updated: March 31, 2026

## Purpose

This file documents the hotspot/service modal-to-page migration and the follow-up SEO/UI work that has been implemented in the current worktree.

The goal is to make it easy to continue the project later without having to reverse-engineer:

- what changed
- why it changed
- what is good about the current state
- what is still weak
- what is incomplete
- what the most sensible next steps are

This document focuses on:

- hotspot detail pages
- service detail pages
- their routing, SEO, analytics value, and UI/UX

It does not try to document every unrelated part of the repo.

---

## Executive Summary

The project no longer uses business/service modals for the main hotspot and service experiences. Those entries now have dedicated detail pages with unique URLs:

- `/:city/hotspots/:slug`
- `/:city/diensten/:slug`

This means:

- pageviews can now be tracked per business/service via Vercel Analytics
- businesses, vets, and pet stores have crawlable URLs
- sitemap and prerender route generation can include these pages automatically
- detail pages are now better foundations for future SEO, galleries, and richer editorial content

The current implementation is already much stronger than the original modal approach, but it is still not a finished "premium directory" system. The foundation is good. The data enrichment layer is still thin.

---

## What Has Been Implemented

## 1. Dedicated Detail Routes

Implemented in:

- `App.tsx`
- `pages/PlaceDetail.tsx`
- `utils/placeRoutes.ts`

Current routes:

- `/hotspots`
- `/diensten`
- `/:city/hotspots/:slug`
- `/:city/diensten/:slug`

Important detail:

- The two detail routes are defined before the city catch-all route `/:slug`.
- This avoids the city route swallowing place detail URLs.

Why this matters:

- analytics now work per page URL
- pages are shareable
- pages are crawlable
- these pages can rank independently

---

## 2. Modal-to-Page Migration

Old approach:

- click a hotspot/service
- open a shared modal
- no unique URL
- weak analytics granularity

New approach:

- click a hotspot/service
- open a dedicated detail page
- every place has its own canonical page

Entry points updated to link to pages:

- city hotspot section
- city services section
- local hero / local tip section
- all-hotspots overview
- all-services overview

The old place modal component was removed:

- `components/PlaceModal.tsx` deleted

---

## 3. Slug-Based Place Architecture

Implemented in:

- `types.ts`
- `data/hotspots.ts`
- `data/services.ts`
- `utils/placeRoutes.ts`

Both `Hotspot` and `Service` now include:

- `slug: string`

Optional forward-compatible fields added:

- `summary?: string`
- `images?: string[]`
- `phone?: string`
- `websiteLabel?: string`
- `sameAs?: string[]`

Current slug approach:

- slugs are derived automatically from the place name
- hotspots and services are loaded from typed static arrays
- detail pages resolve by `city + slug`

Why this matters:

- URLs are stable and human-readable
- route generation is deterministic
- future CMS/data migration is easier

Current limitation:

- slug uniqueness is only as safe as the data
- there is no duplicate-slug protection layer yet
- if two entries in the same city ever end up with the same slug, one will effectively shadow the other

---

## 4. Shared Place Detail Template

Implemented in:

- `pages/PlaceDetail.tsx`

The detail page is shared between hotspots and services via:

- `kind="hotspot"`
- `kind="service"`

Current page structure includes:

- hero with image background
- breadcrumb-like top links
- title, type, city, summary
- quick-read panel: "Wat je hier mag verwachten"
- real in-page image/gallery block
- full description section
- kenmerken/tags
- related sections:
  - "Meer in [stad]"
  - "Gelijkaardige plekken"
- sidebar:
  - praktische info
  - address / directions
  - optional phone
  - website CTA
  - optional sameAs links
  - further navigation

Recent UI refinements already done:

- hero-aware header styling over dark hero sections
- wave divider in the place hero
- less repetitive editorial copy than before
- city image used in the quick-read panel background
- quick-read address tile opens Google Maps
- image modal/gallery support

---

## 5. Analytics Upgrade

Implemented conceptually via the routing change.

Important fact:

- `<Analytics />` from Vercel is already mounted in `App.tsx`

What improved:

- because each business/service now has a unique URL, pageview analytics can show which places are being visited

What this solves:

- "which business got clicks?" now becomes visible through pageview analytics

What this does not solve yet:

- direct outbound click tracking to website links
- direct outbound click tracking to Google Maps links
- "which CTA was clicked?" instrumentation

So right now:

- page-level analytics: yes
- CTA-level analytics: no

---

## 6. SEO Upgrade

Implemented in:

- `utils/seo.ts`
- `pages/PlaceDetail.tsx`

There is now a dedicated helper:

- `getPlaceSEO(place, city, kind)`

What it generates:

- page title
- page description
- canonical URL
- keywords
- breadcrumb structured data
- place structured data with schema type mapping

Current schema direction:

- hotspots map to types like:
  - `Restaurant`
  - `CafeOrCoffeeShop`
  - `LodgingBusiness`
  - `Store`
- services map to:
  - `VeterinaryCare`
  - `Store`

SEO strengths of current implementation:

- each place page is now indexable
- metadata is unique enough to be useful
- breadcrumb structure exists
- place schema exists

SEO weakness still remaining:

- many pages still rely on generic/generated summary behavior because most entries do not yet have custom `summary`
- descriptions are still mostly data-entry descriptions, not true editorial landing-page copy

---

## 7. Data-Driven Sitemap and Route Discovery

Implemented in:

- `scripts/place-data.cjs`
- `scripts/generate-sitemap.cjs`
- `package.json`
- `prerender.cjs`

New route helper script:

- `scripts/place-data.cjs`

It loads:

- hotspots
- services
- cities
- blog posts

And exposes:

- static routes
- place routes
- all routes

New sitemap script:

- `scripts/generate-sitemap.cjs`

Benefits:

- hotspot/service detail pages are no longer manual sitemap work
- the route inventory stays tied to real data

Current build script:

- `node scripts/generate-sitemap.cjs && vite build && node prerender.cjs`

Current known behavior:

- build passes
- prerender currently fails non-fatally in the sandbox because local port binding to `127.0.0.1:4173` is blocked
- this failure is intentionally non-fatal so builds still complete

Important note:

- this sandbox prerender issue does not automatically mean prerender is broken in a normal local environment or deployment environment

---

## 8. Shareable Filter URLs

Implemented in:

- `pages/AllHotspots.tsx`
- `pages/AllServices.tsx`

Before:

- filters lived in local component state only

Now:

- filters are encoded in query params
- filtered views can be shared
- filtered views can survive navigation more cleanly

Current behavior:

- `?city=...`
- `?type=...`

This is more professional and SEO-safe than client-only state, because:

- navigation is predictable
- the selected filter state can be linked
- users can go back/forward with less surprise

Important note:

- query-param filter URLs are not added to the sitemap
- canonical route strategy remains based on real pages, not filter variants

---

## 9. Header / Hero Readability Upgrade

Implemented in:

- `components/Header.tsx`
- `components/header/DesktopNav.tsx`
- multiple hero pages marked with `data-header-hero="light"`

Problem solved:

- the header text was unreadable on dark hero images unless the route was manually hardcoded

Current behavior:

- while the header sits over a marked hero region, the header uses the light version
- once it scrolls past that hero area, it returns to the normal header style

This is a better solution than route hardcoding because it is based on layout context rather than assumptions about the current path.

---

## 10. Legal Copy Alignment

Updated in:

- `pages/Cookies.tsx`
- `pages/Privacy.tsx`

Why:

- the previous legal copy implied there was effectively no analytics/tracking tooling
- the app does use Vercel Analytics

The legal text was updated so the product messaging is less contradictory.

---

## Important Files To Know

If you continue this work later, these are the most relevant files:

### Routing and app shell

- `App.tsx`
- `components/Header.tsx`
- `components/header/DesktopNav.tsx`

### Shared place page

- `pages/PlaceDetail.tsx`
- `components/ImageModal.tsx`

### Data model and route helpers

- `types.ts`
- `utils/placeRoutes.ts`
- `data/hotspots.ts`
- `data/services.ts`

### SEO

- `utils/seo.ts`

### Listing pages

- `pages/AllHotspots.tsx`
- `pages/AllServices.tsx`
- `components/Hotspots.tsx`
- `components/Services.tsx`
- `components/LocalHero.tsx`

### Build / sitemap / prerender

- `scripts/place-data.cjs`
- `scripts/generate-sitemap.cjs`
- `prerender.cjs`
- `package.json`

### Legal / policy

- `pages/Cookies.tsx`
- `pages/Privacy.tsx`

---

## Strengths Of The Current Implementation

## 1. Stronger information architecture

The biggest win is structural:

- hotspots and services are now real pages, not temporary overlays

This improves:

- analytics
- SEO
- linking
- shareability
- future scalability

## 2. The foundation is future-proof enough

The detail template already supports:

- slug-based URLs
- optional multi-image galleries
- optional custom summaries
- optional phone/social/web enrichment

That means future improvements do not require redoing the architecture.

## 3. The page template is much closer to a directory product

The detail page is no longer just "modal content stretched into a page."

It now has:

- hierarchy
- related content
- better internal linking
- richer image handling
- stronger SEO semantics

## 4. Build-time route generation is no longer brittle

Sitemap generation and place route enumeration are now data-driven.

That was necessary once the project moved from a handful of static pages to a larger directory model.

## 5. The current visual direction is much more branded

The detail experience now has:

- hero treatment
- wave divider
- branded sticky sidebar
- related cards
- city-image-backed quick-read panel

It no longer feels like a generic React list-detail conversion.

---

## Weaknesses Of The Current Implementation

## 1. Editorial quality still depends too much on raw data

This is the biggest remaining weakness.

Even though the template is better, most places still do not have:

- custom `summary`
- custom `websiteLabel`
- social links
- manually curated editorial intro copy

Result:

- many pages still sound "good enough" rather than premium
- the page structure is stronger than the content layer

## 2. Slugs are not collision-safe yet

Current slug generation is simple and clean, but not defensive.

Potential future issue:

- two places in the same city with the same or near-identical name

There is no collision resolution yet.

## 3. CTA analytics are still missing

You can now see which place pages are viewed, but not yet:

- which websites got clicked most
- which Maps links got clicked most
- whether users prefer site CTA vs route CTA

If the future goal is business intelligence rather than page-interest only, this still needs implementation.

## 4. Some UI details are still in refinement territory

The current place detail page is good, but still not "done forever."

Examples:

- sticky sidebar should be visually re-verified in a real browser, not only through code changes
- hero overlay values are still aesthetic balancing work
- the quick-read panel uses a city image background and now reads better, but that kind of design may still need per-city tuning

## 5. The data layer is still static and manual

Right now the system is still driven from hardcoded TS arrays.

That is acceptable for this stage, but it means:

- enrichment is manual
- consistency depends on disciplined editing
- scale will eventually become painful

---

## What Is Incomplete

These items are not finished, even if the foundation exists.

## 1. Multi-image "Aanrader" galleries are only partially implemented

What is done:

- `images?: string[]` exists
- the detail page supports a gallery
- the modal/lightbox supports multiple images

What is not done:

- data enrichment for actual multi-image place sets
- special gallery UI for premium listings
- differentiated treatment for "Aanrader" places beyond basic support

## 2. Editorial summaries are mostly missing

What is done:

- `summary?: string` exists
- SEO and UI prefer `summary` when present

What is not done:

- most entries do not have manually written summaries
- many pages still fall back to first sentence / derived text

This is the highest-value content improvement left.

## 3. CTA click analytics are not implemented

What is done:

- pageview-level analytics via unique URLs

What is not done:

- event tracking for:
  - website clicks
  - map clicks
  - phone clicks
  - sameAs/social clicks

## 4. Duplicate slug safety is not implemented

Needed eventually:

- duplicate detection at build time
- or deterministic fallback slug suffixing

## 5. Browser-level verification is still needed for some UX details

Code was adjusted, but these items still deserve visual verification in a browser:

- sticky sidebar behavior on real desktop scroll
- wave divider spacing under different hero image crops
- hero overlay readability across very bright and very dark images
- quick-read panel readability across all cities

## 6. Place-page content depth is not yet "editorial brand" level

Current state:

- structure is there
- related links are there
- SEO is there

Missing for true premium feel:

- curated, human-written lead summaries
- handpicked "why we recommend this" notes for top businesses
- more deliberate `websiteLabel` copy for some places

---

## Known Risks / Fragile Spots

## 1. Sticky behavior can be sensitive to ancestor overflow

Sticky layouts can break if a parent container has certain overflow settings.

This already came up during implementation.

Relevant places to watch:

- `pages/PlaceDetail.tsx`
- `App.tsx` (app shell still uses `overflowX: 'clip'` on the top-level container)

If sticky ever breaks again, inspect ancestor overflow first.

## 2. Hero readability is image-dependent

The place detail hero uses real business imagery.

That means:

- some images want darker overlays
- some want lighter overlays

A single universal overlay value is always a compromise.

Possible future improvement:

- per-place or per-image overlay tuning

## 3. Static route generation assumes data can be transpiled cleanly

`scripts/place-data.cjs` transpiles TS modules via `typescript` and executes them in a VM.

This is pragmatic and good enough now, but it is not a long-term data platform.

If data files become more complex or begin importing runtime dependencies, this script could become brittle.

## 4. The detail template is doing a lot of work

`pages/PlaceDetail.tsx` is now a fairly large shared template.

That is okay for now, but over time it may benefit from extraction into smaller subcomponents:

- hero
- quick-read panel
- related cards
- sticky sidebar
- gallery block

---

## Recommended Next Steps

If continuing this work, this is the most sensible order.

## Priority 1: Manual data enrichment for top places

Highest ROI next step.

Add custom values for the most important listings:

- `summary`
- `websiteLabel`
- `phone`
- `sameAs`
- eventually `images`

Why this should come first:

- the template is already strong
- the biggest gap is content quality
- a few premium entries will immediately lift the whole product feel

## Priority 2: Add outbound CTA analytics

Implement event tracking for:

- website button clicks
- Google Maps clicks
- phone clicks

Why:

- pageviews are useful, but this is what turns the system into business intelligence

## Priority 3: Add slug collision protection

At minimum:

- build-time duplicate slug detection within the same city and kind

Better:

- automatic suffixing strategy plus console warnings

## Priority 4: Break `PlaceDetail.tsx` into subcomponents

Recommended extractions:

- `PlaceHero`
- `PlaceQuickFacts`
- `PlaceGallery`
- `PlaceSidebar`
- `RelatedPlaceCard`

Why:

- easier maintenance
- easier visual iteration
- lower cognitive load for future work

## Priority 5: Curated "Aanrader" premium presentation

Future opportunity:

- custom gallery emphasis
- custom badge note
- better recommendation note than generic tag-derived logic
- maybe partner/business-tier visual treatment later

---

## Suggested Data Enrichment Strategy

Do not try to enrich all places at once.

Better rollout:

### Phase A

Manually enrich the top 10-20 most important listings:

- biggest cities
- strongest "Aanrader" entries
- places that already have the best descriptions

### Phase B

Add real multi-image galleries for the best "Aanrader" entries.

### Phase C

Fill remaining summaries gradually during normal content updates.

This keeps momentum high and avoids turning the project into a giant data-entry task.

---

## Testing Checklist For Future Work

Any time you continue work on place pages, check these:

- detail routes still resolve correctly
- city route does not swallow place routes
- invalid `city + slug` combinations show `NotFound`
- all hotspot cards link correctly
- all service cards link correctly
- local hero links correctly
- filters still round-trip through query params
- back navigation still feels right
- sticky sidebar still works on desktop
- header stays readable over hero and resets after hero
- sitemap still includes place detail pages
- SEO helper still emits canonical, breadcrumbs, and place schema
- gallery still works with one image and multiple images
- quick-read panel remains readable on bright city photos

---

## Build Notes

Current build command:

- `npm run build`

Current expected behavior in this environment:

- sitemap generation succeeds
- Vite build succeeds
- prerender step may fail non-fatally with:
  - `listen EPERM: operation not permitted 127.0.0.1:4173`

This behavior is already handled as non-fatal in the current setup.

If you want a pure local compile-only check:

- `npm run build:no-prerender`

---

## Worktree Status Note

As of this handoff, these changes are in the working tree and not necessarily committed.

Important consequence:

- before doing major new work, review `git status`
- avoid losing the current implementation by assuming it already exists in Git history

This is especially important because:

- `pages/PlaceDetail.tsx` is new
- `utils/placeRoutes.ts` is new
- `scripts/` contains new route/sitemap helpers
- `components/PlaceModal.tsx` has been deleted

---

## Bottom Line

This migration is no longer in the "idea" phase.

The project now has:

- real place detail pages
- slug-based routing
- pageview-ready analytics structure
- data-driven sitemap generation
- structured SEO metadata
- a significantly stronger visual and navigational experience

The main thing still separating it from a truly premium directory is not architecture anymore.

It is:

- content enrichment
- analytics depth
- a few final UX refinements

That is a good place to be.
