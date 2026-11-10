# Recording the paid pet drawing (for docent's raw clips)

Used on 10 Nov 2026 for site/media/comiccover-pet-capture.mp4. Nothing here is
deployed. It shows the paid page without paying and without opening a checkout.

1. Copy `../public` and `../src` into a scratch folder with
   `wrangler.capture.jsonc` (as `wrangler.jsonc`). In that folder write a
   `.dev.vars` with the two image keys from `.git-credentials` (grep them, never
   source the file) plus `STRIPE_API=http://127.0.0.1:8894` and
   `STRIPE_RESTRICTED_KEY=standin`. Delete `.dev.vars` when done.
2. `node fakestripe.mjs` answers "paid" for any `cs_test_…` id on port 8894.
   `npx wrangler@4 dev` in the scratch folder serves the app on port 8893.
3. `Xvfb :97 -screen 0 1200x2400x24 -nolisten tcp`, then
   `S=<scratch> CHROME=<chrome for testing> DISPLAY=:97 OY=261 node rec.mjs take1 cs_test_<new id>`.
   Needs playwright-core and ffmpeg-static in `node_modules`. The pet photo is
   read from `$S/dl/pug.jpg`. Each take is one real image call (a few cents) and
   needs a new id so the page shows "3 of 3".
4. The take and its tap times land in `$S/footage/`. Cut the draw wait with
   ffmpeg (hard cuts, no speed change), keep it under 60 s with a 2 s still tail.
5. The clip's JSON must say: nobody paid, Stripe's answer was stood in, the
   drawing is a real model call, where the photo came from and its licence.
