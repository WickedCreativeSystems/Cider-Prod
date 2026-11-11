# Recording the Dailies home page (for docent's raw clips)

Used on 11 Nov 2026 for site/media/dailies-home-capture.mp4. It records the
live page at phone width. Nobody is signed in, nothing goes to Buffer, and
the visit counter is blocked so a take counts no visit.

1. A scratch folder with `footage/` and `shots/`, and `node_modules` holding
   playwright-core and ffmpeg-static. Copy `rec-home.mjs` into it.
2. `Xvfb :97 -screen 0 1200x2400x24 -nolisten tcp`
3. `S=<scratch> CHROME=<chrome for testing> DISPLAY=:97 node rec-home.mjs probe`
   prints the layout and saves `shots/probe.png`. The page starts 261 pixels
   down the screen (the browser's own bars), so takes use `OY=261`.
4. `S=<scratch> CHROME=<chrome> DISPLAY=:97 OY=261 node rec-home.mjs take1`
   The take and its times land in `footage/`. `WATCH=<ms>` sets how long the
   example short plays (12 s by default; the short is 23 s).
5. The example short is started with the player's own play button. A press on
   the picture itself does nothing at this width. The script pauses it, with
   no press, before scrolling on.
6. The clip's JSON must say: no sign-in, nothing sent to Buffer, the dates the
   page itself shows, and that the short plays muted, so the clip is silent.
