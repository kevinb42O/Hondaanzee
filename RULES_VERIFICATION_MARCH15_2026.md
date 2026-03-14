# Rules Verification - March 15, 2026 (Critical Day)

Goal: confirm there is zero ambiguity for dog access rules on the Belgian coast when seasonal rules switch.

## What was fixed in code

- City status no longer auto-switches to full `NEE` only because current time is inside a summer time window.
- Reason: several cities have exception zones, so city-level status must remain `DEELS` unless source data says `NEE`.

Changed file:
- components/StatusCheck.tsx

## Verification result (completed)

Status: official source pass completed on 14 March 2026.

Patched mismatches in `cityData.ts`:
- Zeebrugge: clarified that outside the 10:00-20:00 summer ban window, dogs are allowed on the full beach.
- Bredene: added daytime exception zones in July-August (Twins->Oostende + part strandpost 6) and clarified leash behavior.
- Koksijde-Oostduinkerke: corrected summer start date to 15 June and aligned wording with 3-zone daytime restriction.
- De Panne: corrected summer window/times to 15 June-15 September (10:30-18:30) and aligned zone-4 off-leash window + winter period wording.

Official sources used:
- https://www.knokke-heist.be/honden-op-het-strand
- https://www.blankenberge.be/honden-op-het-strand
- https://www.brugge.be/klimaat-milieu-natuur/dieren-dierenwelzijn/honden/honden-op-het-strand-van-zeebrugge
- https://www.oostende.be/honden
- https://bredene.be/nl/wat-je-moet-weten/strandinfo/honden-op-het-strand
- https://www.dehaan.be/Honden
- https://www.middelkerke.be/nl/toerisme/praktisch/honden
- https://www.nieuwpoort.be/honden-op-het-strand
- https://www.koksijde.be/nl/menu/afval-milieu/natuur/dieren/dieren-op-het-strand/honden-op-het-strand
- https://www.depanne.be/nl/praktisch/honden/wandelen-met-de-hond

## Priority cities for March 15 switch

These cities are configured to switch to summer period on 15 March:
- Blankenberge
- Zeebrugge
- Knokke-Heist

## Fast verification workflow (20-30 min)

1. Open each official city page.
2. Confirm date window, time window, and exception zones.
3. Compare with cityData.ts text and status.
4. If mismatch: update cityData.ts immediately and deploy.
5. Add note in updates page after deploy.

## Municipality checks

- [x] Knokke-Heist
  - Official: https://www.knokke-heist.be/honden-op-het-strand
  - Verify: 15 Mar-15 Oct, 10:00-20:00, Het Zoute exception
  - Repo target: cityData.ts (slug knokke-heist)

- [x] Blankenberge
  - Official: https://www.blankenberge.be/honden-op-het-strand
  - Verify: zone split, West always free, East period details, midden zone wording
  - Repo target: cityData.ts (slug blankenberge)

- [x] Zeebrugge
  - Official: https://www.brugge.be/klimaat-milieu-natuur/dieren-dierenwelzijn/honden/honden-op-het-strand-van-zeebrugge
  - Verify: red zone ban 15 Mar-15 Oct 10:00-20:00, green zone behavior
  - Repo target: cityData.ts (slug zeebrugge)

- [x] Oostende
- [x] Bredene
- [x] De Haan
- [x] Wenduine
- [x] Middelkerke-Westende
- [x] Nieuwpoort
- [x] Koksijde-Oostduinkerke
- [x] De Panne

## Deployment safety sequence

1. npm run build:no-prerender
2. npm run build
3. Deploy
4. Hard-refresh homepage + three city pages + map
5. Quick smoke check on mobile

## Tomorrow morning smoke test

- [ ] Check 3 switch cities on website
- [ ] Check map color status for same 3 cities
- [ ] Check one strict city (Nieuwpoort) still shows strict behavior in summer period when applicable
- [ ] Post short update on /updates with timestamp

## Message template for community post

"Vandaag zijn de strandregels geverifieerd voor alle kuststeden. We hebben de data gecheckt op basis van de officiele gemeentelijke bronnen. Zie je lokaal een afwijkend bord of een nieuwe verordening? Stuur ons meteen een foto + locatie, dan passen we het dezelfde dag aan."
