# Push notificaties — setup

Web Push is volledig geïmplementeerd. Voordat het werkt in productie moet je
**VAPID-sleutels** instellen en de migratie + edge functions deployen.

## 1. VAPID-sleutels (al gegenereerd)

```
Public  : BFfI18UTP8F_RvqA2e3NYr_rXx4G6HmurtJy1bPMFLVv-9-3RibhjJsT2Eqzo2uXHZOAK3CPdj7BU1mgvaG3yaA
Private : J8ATICtqSSmL6yCCkkfvJmwX-zzTobOGRUyKDO7tonw
```

> Bewaar de private key veilig. Deel hem nooit publiek. Wil je opnieuw
> genereren: `npx web-push generate-vapid-keys --json`.

## 2. Vercel env var (frontend)

Voeg in Vercel → Project → Settings → Environment Variables toe:

| Naam                     | Waarde                                                                                                  | Scope            |
| ------------------------ | ------------------------------------------------------------------------------------------------------- | ---------------- |
| `VITE_VAPID_PUBLIC_KEY`  | `BFfI18UTP8F_RvqA2e3NYr_rXx4G6HmurtJy1bPMFLVv-9-3RibhjJsT2Eqzo2uXHZOAK3CPdj7BU1mgvaG3yaA`                | Production + Preview |

Daarna een nieuwe deploy uitvoeren. Lokaal kan je `.env.local` toevoegen met
dezelfde regel.

## 3. Supabase Edge Function secrets

```bash
supabase secrets set \
  VAPID_PUBLIC_KEY='BFfI18UTP8F_RvqA2e3NYr_rXx4G6HmurtJy1bPMFLVv-9-3RibhjJsT2Eqzo2uXHZOAK3CPdj7BU1mgvaG3yaA' \
  VAPID_PRIVATE_KEY='J8ATICtqSSmL6yCCkkfvJmwX-zzTobOGRUyKDO7tonw' \
  VAPID_SUBJECT='mailto:info@hondaanzee.be'
```

## 4. Database-migratie pushen

```bash
supabase db push
# of via SQL editor: voer supabase/migrations/20260502_create_push_subscriptions.sql uit
```

## 5. Edge functions deployen

```bash
supabase functions deploy subscribe-push
supabase functions deploy unsubscribe-push
supabase functions deploy send-push
supabase functions deploy list-push-stats
```

## 6. Testen

1. Open de site (productie of `npm run dev`).
2. Scroll naar de footer → klik **"Notificaties aanzetten"** → sta toe.
3. Ga naar `/admin` → log in als admin → klik **"Notificaties"** → tik titel + bericht in → **Verstuur**.

### iOS (iPhone / iPad)
Web Push werkt op iOS 16.4+ **alleen** als de site is toegevoegd aan het
beginscherm (Safari → Deel → Voeg toe aan beginscherm). Open de site dan vanaf
het beginscherm en zet daarna de notificaties aan.

### Android
Werkt rechtstreeks in Chrome/Edge. PWA installeren is niet verplicht maar
geeft de beste ervaring.

### Desktop
Werkt in Chrome, Edge, Firefox.

## Architectuur

```
 Browser ──(subscribe)──► /functions/v1/subscribe-push ─► push_subscriptions
                                                              │
 Admin UI ─(send)─► /functions/v1/send-push ──► web-push ─► alle subscribers
                          │                          │
                          ▼                          ▼
                  push_notifications_log     verlopen subs auto-verwijderd
```

- **Service worker** (`public/sw.js`) ontvangt `push` events en toont de
  notificatie. Klikken opent de meegestuurde URL.
- **Frontend opt-in** (`components/NotificationOptIn.tsx`) staat in de footer.
- **Admin pagina** (`/admin/notificaties`) is alleen toegankelijk voor het
  e-mailadres uit `REPORT_ADMIN_EMAIL` (default `admin@hondaanzee.be`).

## Veiligheid

- `push_subscriptions` en `push_notifications_log` hebben RLS aan met een
  "deny all" policy — alleen de service-role key (server-side) leest/schrijft.
- `send-push` valideert de admin-sessie via `requireAdminUser()`.
- Verlopen abonnementen (HTTP 404 / 410) worden automatisch verwijderd.
