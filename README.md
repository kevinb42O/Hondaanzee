<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1-Ej0wcGKZMnJ0ri3k6Pn-2Lk1kfnrwNl

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Verification before publication

`npm run typecheck` checks all TypeScript sources in their own runtime: the webapp, build helpers and tests through `tsc`, Node endpoints through a separate `NodeNext` configuration that requires valid ESM import extensions, and all Supabase functions and shared modules through the pinned Deno compiler. Shared modules imported by the webapp are also checked by `tsc`. `npm run build` and `npm run build:no-prerender` run all three checks before generating production assets; a type error stops publication.

`npm test` runs the repository's unit tests. Temporary checkouts and previews under `.admin-local` are excluded so copied tests are not counted as separate source tests. After building, run `npm run test:public` for public page rendering, SEO and the deprecated `/community` route's 404/noindex behavior. The admin, account and hotspot review browser checks are available through `npm run test:admin`, `npm run test:members` and `npm run test:community`.

Edge dependencies are pinned in `supabase/functions/deno.lock`. The regular check keeps that lockfile frozen. When intentionally changing edge imports, update it with `npm run typecheck:edge -- --update-lock`, inspect the resulting dependency changes, then run `npm run typecheck` again.
