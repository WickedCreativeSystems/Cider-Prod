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

## On a retake
- Clear the default big line first. The app fills it with "He fixed the Wi-Fi.
  Now he must save Christmas!", and it stays on screen until it is retyped, so
  the 10 Nov take is seasonal from 9.7 s to about 20 s (docent's measure).
- The slab's default grader note names Christmas too. Retype it, or end the
  clip before the slab.

## Checking the paid page after a change to the maker page
`paid-look.mjs` opens the staged copy not paid and paid, at a phone and a laptop size, and prints what the order
box shows in each. No drawing call. How to run it is at its top. Since 15 Nov 2026 the order box's first line has
a resting sentence in the page's source ("This box opens after you pay…") for readers who take the words without
running the page; the script puts "Checking your order…" there before the box is shown, so a buyer never sees the
resting one. If the script that shows the box is ever changed, run this.

## The free maker, on the live page (`rec-free.mjs`, 15 Nov 2026)
This is the clip `site/media/comiccover-maker-capture.mp4`: press "Add a photo", the photo lands on the cover, type
the title and the big line, back to the cover, press "Download the cover". One take, no cuts, about 31 s. No staged
copy, no keys, no drawing call, no checkout. How to run it is at its top (`probe`, then `measure`, then `take <name>`);
copy it into the scratch folder that holds `node_modules` and run it there. Do not pipe it into `head`.

What it took four takes to learn, all now in the script:
- **The default big line names Christmas** and no route keeps it out of frame (it is on the cover and in its box), so
  the script empties the box before the camera starts. The clip's JSON says so. `CLEAR=0` leaves it in.
- **Desktop Chrome opens its downloads panel over the page** at the press on "Download the cover", with a made-up
  file name. A fresh profile with `download_bubble.partial_view_enabled: false` keeps it shut; the file is still saved.
- **Desktop Chrome also flies a download arrow up the left edge of the page** for a third of a second.
  `--animation-duration-scale=0` removes it (`--force-prefers-reduced-motion` does not). Check the half second after
  the press at full size, frame by frame; a one-frame-a-second sheet does not show it.
- **One stop at the form** (the Title label 27 px down) holds the title box, the big line, the colours and the effect,
  and keeps the file box above and the $9 sample picture below out of the held frame. The file's name (cat.jpg) still
  crosses the frame during the two scrolls.
- The page gives no sign when "Download the cover" is pressed, so the clip's last 10 seconds are one still picture.
  The JSON gives the second of the press.
- Still on screen and said in the JSON: the page's starting date "Dec 2026" (cover and form) and the "$9" link in the
  first paragraph (first 7 s).
