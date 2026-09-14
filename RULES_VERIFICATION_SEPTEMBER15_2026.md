# Rules Verification - September 15/16, 2026 (Major Seasonal Transition)

Doel: 101% feitelijke en juridische zekerheid over de strandregels voor honden aan de Belgische kust bij het aflopen van het officiële badseizoen.

---

## Wat is er gecorrigeerd in code (14 september 2026)

1. **Bredene (`cityData.ts`)**:
   - Gecorrigeerd naar officieel gemeentereglement: zomerverbod (10u30–18u30) loopt van **15 juni t.e.m. 15 september** (was onjuist ingesteld op juli-augustus).
   - Najaars-tussenseizoen gezet op **16 september t.e.m. 14 oktober** (overal aan de leiband).
   - Voorjaars-tussenseizoen gezet op **16 maart t.e.m. 14 juni** (overal aan de leiband).

2. **Nieuwpoort (`cityData.ts`)**:
   - Zomerreglement gecorrigeerd van fictief 24/7 verbod naar het officiële politiereglement:
     - Verboden tussen **10u30 en 18u30**.
     - Toegelaten vóór **10u30 en na 18u30** (aan de leiband, max. 5m).
     - Zomerstatus aangepast van `NEE` naar `DEELS`.
     - Winterreglement: de hele dag toegelaten, verplicht aan de leiband (max. 5m).

3. **Blankenberge (`cityData.ts`)**:
   - Najaars-override toegevoegd voor **16 september t.e.m. 15 oktober** (`Najaarsregeling`):
     - Zone West: 24/7 vrij loslopen.
     - Zone Midden: sinds 16 september weer toegelaten aan de leiband!
     - Zone Oost: aan de leiband (tot 15 oktober; daarna loslopen).

4. **Regellabel neutralisatie (`utils/rules.ts`)**:
   - Winterlabel gewijzigd van `'Vrije toegang: Winterregeling'` naar `'Winterregeling van kracht'`.
   - Reden: voorkomt dat bezoekers in gemeenten met een strikte winterleibandplicht (Koksijde, Nieuwpoort, Middelkerke) denken dat de hond overal mag loslopen.

5. **Juridische micro-disclaimer (`components/StatusCheck.tsx`)**:
   - Toegevoegd aan zowel desktop- als mobiele antwoordkaart:
     *« Let op: Plaatselijke politieborden aan de strandopgang hebben altijd voorrang. »*
   - `LAST_VERIFIED_DATE` bijgewerkt naar 15 september 2026.

6. **Tests & documentatie (`utils/rules.test.ts` & `public/llms-full.txt`)**:
   - 18 tests groen, inclusief specifieke grensgevallen voor 15 september vs 16 september.
   - `llms-full.txt` opnieuw gegenereerd conform de gecorrigeerde data.

---

## Statusoverzicht per gemeente voor 15 vs 16 september

| Gemeente | 15 september (Zomer) | Vanaf 16 september (Najaar/Winter) | Leibandplicht najaar/winter |
| :--- | :--- | :--- | :--- |
| **De Panne** | `DEELS` (10u30–18u30) | `JA` (Winterregeling) | Zone 1 & 2 & 3: leiband; Zone 4: **24/7 vrij loslopen** |
| **Koksijde - Oostduinkerke** | `DEELS` (10u30–18u30) | `JA` (Winterregeling) | Volledige strand: **altijd leiband (max. 10m)** (geen losloopstrand) |
| **Nieuwpoort** | `DEELS` (10u30–18u30) | `JA` (Winterregeling) | Volledige strand: **altijd leiband (max. 5m)** (geen losloopstrand) |
| **Middelkerke - Westende** | `DEELS` (3 hondenzones) | `JA` (Winterregeling) | Volledige strand: **korte leiband (max. 2m)**; Zone Carlton: **vrij loslopen** |
| **De Haan & Wenduine** | `DEELS` (10u00–19u00) | `JA` (Winterregeling) | Volledige strand: **vrij loslopen!** |
| **Bredene** | `DEELS` (10u30–18u30) | `DEELS` (Tussenseizoen) | Overal op strand en in duinen: **aan de leiband** (pas vanaf 15 okt los) |
| **Blankenberge** | `DEELS` (Zomerregeling) | `DEELS` (Najaarsregeling) | Zone West: **vrij loslopen**; Zone Midden & Oost: **aan leiband** |
| **Oostende** | `DEELS` (10u00–18u30) | `DEELS` (Zomer t/m 30 sept) | Hoofdstrand verboden 10u–18u30; Oosteroever: **24/7 vrij los** |
| **Zeebrugge** | `DEELS` (10u00–19u00) | `DEELS` (Zomer t/m 15 okt) | Groene zone: **vrij los**; Rode zone: leiband buiten uren |
| **Knokke-Heist** | `DEELS` (10u00–20u00) | `DEELS` (Zomer t/m 15 okt) | Hoofdstrand verboden 10u–20u; Het Zoute: **24/7 vrij los** |

---

## Officiële bronnen (Geverifieerd op 14 september 2026)

- **De Panne:** https://www.depanne.be/nl/praktisch/honden/wandelen-met-de-hond
- **Koksijde - Oostduinkerke:** https://www.koksijde.be/nl/menu/afval-milieu/natuur/dieren/dieren-op-het-strand/honden-op-het-strand
- **Nieuwpoort:** https://www.nieuwpoort.be/honden-op-het-strand
- **Middelkerke - Westende:** https://www.middelkerke.be/nl/toerisme/praktisch/honden
- **De Haan & Wenduine:** https://www.dehaan.be/Honden
- **Bredene:** https://bredene.be/nl/wat-je-moet-weten/strandinfo/honden-op-het-strand
- **Blankenberge:** https://www.blankenberge.be/honden-op-het-strand
- **Oostende:** https://www.oostende.be/honden
- **Zeebrugge:** https://www.brugge.be/klimaat-milieu-natuur/dieren-dierenwelzijn/honden/honden-op-het-strand-van-zeebrugge
- **Knokke-Heist:** https://www.knokke-heist.be/honden-op-het-strand
