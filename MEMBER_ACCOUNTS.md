# Mijn Hond aan Zee

Implemented 2 October 2026. Public visitors retain access to the guide. Free accounts add private favourites, outing plans, followed towns and optional dog profiles.

## Entry points

- `/account?mode=register`: registration with email and two matching password fields; email/password sign-in.
- `/account`: overview, favourites (list/map), trips, followed towns and settings.
- Heart buttons on place details, directories, city cards and off-leash details preserve a visitor's first favourite through signup on the same browser.
- `/uitstap/:token`: read-only shared outing. Only its title, date and selected public places are returned. Private notes and account details remain private. Owners can revoke the link.
- `/admin/leden`: server-authorized member search, pagination, new/active/saved counts, basic member details and suspension/reactivation.

## Backend and authentication

Migration `20261002185024_member_accounts.sql` is installed on Supabase project `zpllibfxaizavcvztnut`. Functions `admin-members` and `member-account` are deployed. An auth trigger creates/backfills member profiles and synchronizes email confirmation.

Migration `20261002191032_member_password_registration.sql` removes email confirmation as a condition for authenticated member access and replaces the misleading verified-email count with new accounts in the last 30 days. It is installed. The password flow's account-deletion endpoint is deployed.

The six member tables use ownership policies and require an authenticated, active account for member content. Administrative fields cannot be modified by members. Suspensions apply to existing sessions and shared links. Server limits are 500 favourites, 10 dogs, 100 outings and 100 places per outing. Account deletion checks the authenticated user's own email and explicit confirmation, protects the admin account, and cascades member data.

Password registration requires signup and the email provider enabled, with **Confirm email disabled**. Registration and sign-in do not use SMTP, magic links or OTP codes. Passwords are handled by Supabase Auth; the application does not store or log them. The admin UI does not present account emails as verified.

This configuration is applied and has been verified through the public Auth settings endpoint. `node scripts/check-member-auth-live.mjs --run` passed: direct registration, immediate account access, favourite persistence, wrong-password rejection, repeat login, admin denial and deletion of the disposable test account. The check refuses to register while confirmation is enabled, so it sends no mail and logs no credentials.

Without SMTP, there is no automated password-reset mail in this release; the sign-in page offers a contact link for assistance. Email ownership must not be treated as verified when using these accounts. Site URL is `https://hondaanzee.be`; allowed account callbacks are:

```
https://hondaanzee.be/account**
https://www.hondaanzee.be/account**
http://localhost:3000/account**
```

No wildcard preview-host redirect is configured. Password registration works directly on any deployment once the project setting above is applied; it does not depend on callback URLs. The saved callback URLs are retained for existing auth flows.

The password flow is covered by automated browser tests for matching passwords, direct signup, logout, wrong credentials, subsequent sign-in and preservation of the first favourite. These tests intercept auth and do not send emails.

Local preview: `http://localhost:3000/account?mode=register`. The earlier magic-link preview is superseded by this password release.

## Validation

`npm run build` checks public prerendering and SEO as well as the frontend build. `npm run test:members` runs member unit checks and browser journeys, including the first save, dog/profile edits, town following, outing edits, sharing/revocation, administrator denial/search, failed saves and account deletion. Its synthetic sessions and data never reach the live backend.

`scripts/member-security-check.sql` can be run through a privileged database client inside `BEGIN` / `ROLLBACK`. It refuses existing fixture IDs, creates only temporary test users inside the transaction, and checks ownership isolation, administrative field protection, password-account access, limits, suspension, share visibility and deletion cascades. It has passed against the installed database. Live anonymous REST and function requests also confirm rejection of private data and administrator access.

Map pins group favourites by municipality; they do not imply precise business coordinates. Followed-town rules and events use existing public site data. Dog photos, notification emails and community badges are outside this release.
