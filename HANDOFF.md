# Handoff, 2026-11-02 (vibecider4)

No keys or secrets here. Everything below is also in git unless noted.

## Done since 24 Oct
- 26 Oct: told the boss what I needed (status list). Asked one question,
  **not yet answered**: will the boss post the Bobo draft
  (`outbox/2026-10-20-reddit-bobo.md`, gitignored) to r/aiArt, or should I
  change it first?
- 27 Oct: the boss's pulse visit counter. The tag
  `<script src="https://pulse.bananafest-destiny.com/p.js" data-site="vibecider.bananafest-destiny.com" defer></script>`
  is in the <head> of every HTML file in `site/` and
  `demo/comiccover/public/`. Both workers deployed; 14 live URLs checked.
  Commit 2effe80. **Any new page I make must carry this tag** (data-site =
  the hostname it is served from). roundrobin. and comiccover. hostnames
  only 301 to vibecider., so they serve no pages.
- 27 Oct: an old background job (music render wait) was stopped for low
  memory. Not needed; not restarted.
- 28 Oct: told the boss the Buffer Commit dates. Wrote market-nana's build
  order into `plan/2026-10-21-buffer-commit-channels.md`.
- 23 Oct (before the cut, for safety): new last sections in MAIL.md and
  RULES.md: questions for the boss can go to market-nana with
  `for_boss: yes`; a relayed answer is `from_boss: yes` + `quote:`, and only
  the quote goes in FACTS.md.

## In the middle of
- **Buffer Commit**, build window 28 Oct – 13 Nov 11:59 PM PT (submit app +
  write-up + demo video; judging from 16 Nov). The app is Dailies at
  tap.bananafest-destiny.com, signed in with the boss's Buffer OAuth client
  (credentials in `.git-credentials`). Plan: `plan/2026-10-28-buffer-commit-studio.md`;
  log: `actual/2026-10-28.md`.
- The UI plan (7 steps) is done and live by 28 Oct: one stylesheet
  (`public/ui.css`), one header, the home hero (a real short in
  `public/home/`, served with byte ranges by the worker for Safari).
- Live on /make/ by 28 Oct: link to shorts (several links, 1–10 videos,
  voiceover, music, Render all / Draft all), store mode (Shopify),
  the planner (Buffer Ideas), the Claude Code MCP at /mcp, and long video to
  clips (`public/make/clips.js`). Testing video needs Chrome for Testing,
  because Playwright's Chromium can't decode H.264.
- **"Put yourself in it"**, live 29 Oct on /make/ under a read page: the
  creator's own talking video, cut out of its background in the browser
  (MediaPipe selfie segmenter, `public/make/you.js`), over a real full-page
  screenshot of the site (Cloudflare Browser Rendering, worker routes
  `/api/shot` and `/api/scroll` in `src/make.js`) that scrolls to what they
  say. Plan `plan/2026-10-29-dailies-you-in-it.md`, log
  `actual/2026-10-29.md`. Worker secrets `BR_TOKEN` and `CF_ACCOUNT_ID`
  are set (values in `.git-credentials` as CLOUDFLARE_API_TOKEN and
  CLOUDFLARE_ACCOUNT_ID; a local dev run needs them in a `.dev.vars`,
  deleted after). Test clips are in the scratchpad only. Headless renders
  are slow because of software H.264 encode (387 ms a frame), not the
  cutout. Not tried with a real phone video yet: the boss's try.
- Same card, later 29 Oct (plan `plan/2026-10-29-dailies-record.md`, log in
  the second half of `actual/2026-10-29.md`): "Or record it here" (camera,
  teleprompter, "Write one for me" via `POST /api/say`), the screenshot
  taken ahead of time, music under the voice, and a gold pointer that
  presses the element a spoken instruction names (`tap` on the planner's
  keyframes). Then the boss rejected how the render looked ("I mean, thats
  not good enough. Look at those screenshots") and the frame was recomposed:
  page in a phone-shaped window on a blurred backdrop, person bottom-right
  under half the frame, captions in a dark box beside them, pointer in the
  window. Test scripts are in the scratchpad (`pwt/look.mjs` for stills in
  about a minute, `pwt/rec5.mjs` for a full render with forced taps and
  music, `pwt/rec4.mjs` for the recorder with a fake camera); the test
  footage is public-domain NASA video, never committed. **Always put frames
  of a render in front of the boss before shipping a look change.**
- Same day, after the boss's "Go for it." to the three edits a socials app
  is wanted for (plan `plan/2026-10-29-dailies-edit.md`, log in the third
  part of `actual/2026-10-29.md`): captions that pop the word being said,
  pauses cut out of a take or a clip (loudness kept while listening), and
  Fill on a wide clip following the person (the selfie segmenter, now
  shared in `public/make/seg.js`). A wide video defaults to Fill when a
  person is found in it. Live 29 Oct, after the boss was sent frame strips
  and a sample clip. Test script for clips: `pwt/tc2.mjs` in the
  scratchpad. `node --check` passes `.js` files here without parsing them;
  check a copy named `.mjs`.
- 29 Oct: the redeploy for vibe-cider was done (no 10013; mail sent) and
  tap has `/sitemap.xml` and `/robots.txt` for docent.
- 1 Nov: the Buffer Commit judging criteria are in FACTS.md (three
  Buffer people, 1–5 each on usefulness, Buffer-API craft, originality;
  9/15 qualifies; the public trail is not scored). The Dailies audit
  (function, design, ease) is done: `plan/2026-11-01-dailies-audit.md`,
  `actual/2026-11-01.md`. Fixed and live: a real 404 page, signed-out
  /make redirects, phone-width overflow after writing scripts, the read
  status under its button, /me counts closed by default. **Never set
  `not_found_handling` in tap's wrangler config** (it breaks every worker
  route; the worker fallback serves 404.html). To test signed in without
  OAuth: put a random 22-char sid into the live KV as `ses:<sid>` → the
  account id, with a TTL; cookie `tap_sid`. Test scripts in the
  scratchpad `pwt/` (`in*.mjs`, `ov3.mjs`, `card.mjs`).
- 2 Nov: two small additions live on /make (plan
  `plan/2026-11-02-dailies-additions.md`, log `actual/2026-11-02.md`):
  "Try it with an example" under the Read button (reads the Comic Cover
  page), and a choice at the Buffer step: drafts / into the queue / at a
  time (`timing()` and `timeError()` in `src/make.js`; the card says
  "scheduled for …" / "in your Buffer queue" / "in your Buffer drafts"
  and links Open Buffer). Queue and scheduled modes were **not** tested
  live (a real post would publish); the boss's first press is the test.
- 2 Nov: render time measured headless (8 cores, no GPU): all of it is the
  software H.264 encoder (~115 ms a frame at 1080×1920). 24 fps −35%,
  720p −50%, `latencyMode: realtime` −6%, four parallel encoders slower.
  Nothing shipped. Waiting on the boss's own render time and device to
  decide on an optional "Faster (720p)" tick (off by default).
- 2 Nov: post analytics. Buffer's board shows "API for Post Analytics"
  released, but the docs say metrics need `insightsRead`, which only
  personal API keys have; "App Clients cannot read them", and apps for
  other people should use OAuth, not take a key. Not building a key
  field. The boss posted the question "Is a metrics scope coming for
  OAuth apps?" on the Buffer Commit Discord (draft in
  `outbox/2026-11-02-discord-post-metrics.md`). **Answered 2 Nov:** no,
  by regulation (partner data can't go to third-party tools; personal
  keys only for the owner's own data). Nothing built; Keep this stays a
  button the user presses. Closed.
- 2 Nov, later: two look changes live after frames went to the boss
  ("that looks fine"): wide and square page images sit whole on a card
  above the caption instead of being cover-cropped to a sliver, and
  "The page, on a phone" is a scene's picture choice (the default for a
  scene without one): the real page in a phone-shaped window, scrolled
  to what the line is about, via `/api/shot`. Plan
  `plan/2026-11-02-dailies-phone-view.md`, log `actual/2026-11-02.md`.
- 2 Nov, later: a stranger's sweep of the untested paths (plan
  `plan/2026-11-02-dailies-sweep.md`, script `pwt/sweep.mjs`). Two fixes
  live: Draft all retries when Buffer fetches the video before KV has it
  everywhere, and **no Buffer tag per drafted video any more** (the
  boss's plan hit its tag limit; Keep this failed). Posts are tracked by
  id in `user.made[].posts`; Keep this makes one tag for a winner and
  survives a refusal. The boss has a walkthrough to delete the sweep's
  four Instagram drafts, one Idea and the "Dailies:" tags
  (`forboss/2026-11-02-delete-sweep-tests.md`).
- 2 Nov, latest: **the first real post through Dailies** (plan
  `plan/2026-11-02-dailies-first-real-post.md`, log at the end of
  `actual/2026-11-02.md`). The boss: "just do it now", after docent
  agreed (tag `dailies`, drafts only, TikTok and YouTube only, no AI
  flag, no user claims). One recorded run made two drafts in the house
  TikTok and YouTube (16:24Z); the capture is live at
  vibecider.bananafest-destiny.com/media/dailies-capture.mp4 with its
  JSON and index row; docent has "it is live" (thread vibecider4-clips
  is full at 6). The drafts are **untagged** (plan tag limit); the boss
  adds the tag and sends them: `forboss/2026-11-02-send-dailies-drafts.md`.
  Fixed on the way: bare hostnames in /api/read, the Worker reading its
  own pages (ASSETS, `pageFetch` in `src/make.js`), the tag asked for
  again on each draft. Recording method that works: headful Chrome for
  Testing under Xvfb at device scale 2 and ffmpeg x11grab
  (`pwt/xrec.mjs` in the scratchpad; cut recipe in the log). Earlier
  test draft pairs were deleted via Buffer `deletePost`; the KV record
  holds one made row. Test session key deleted.
- 2 Nov, latest: **the Commit demo video as a motion edit** in
  `demo/commit-video` (Remotion 4.0.536; plan
  `plan/2026-11-02-commit-demo-edit.md`, log end of `actual/2026-11-02.md`).
  `npm run still -- out/x.png --frame=N` for a frame, `npm run render` for
  the whole (scans `public/shorts`, remakes the music, renders). Footage
  lives in `public/` (gitignored): link.mp4, store.mp4, talk.mp4 (NASA,
  public domain, stand-in), shorts/*.mp4. Recorders `pwt/xstore.mjs`,
  `pwt/xclips.mjs` in the scratchpad. **Still to record after 00:00 UTC**
  (daily script runs used up): the clips run (save as shorts/clip0-2.mp4)
  and a plan run (don't save Ideas). A KV test session `ses:<sid>` (sid in
  scratchpad `sid.txt`) expires about 00:37 UTC; delete it and sid.txt
  when done. Two placeholder cards wait for the boss's recordings.
- The scratchpad (tmpfs) was wiped ~01:57 UTC 2 Nov and rebuilt:
  Playwright in `pwt/`, Chrome for Testing in `cft/` (**chmod +x the
  unzipped binaries** or crashpad fails at launch), ffmpeg-static in
  `ff/`. Scripts: `pwt/speed.mjs` (render variants), `pwt/ui2.mjs`
  (signed-in 390 px flow to the Buffer step). No KV test session is
  live; make a new one the same way when needed, and delete it after.
- Asked the boss: the monthly AI budget. Caps stay until they answer.
- The boss's open walkthroughs are in `forboss/` (gitignored, RULES
  "Walkthroughs for the boss"): delete the Buffer test idea ("Test idea from
  Tap, delete me"), rename the Buffer app to Dailies, the optional
  insights:read question, the Bobo Reddit post, and (1 Nov) deleting the
  three "Turn anyone into a comic cover" test drafts the audit put in
  Buffer. When the boss says "Done: …", tick it there.

## Next
0. **Promised docent (2 Nov mail check):** delete the sweep's "delete me"
   Instagram drafts through the Buffer API (deletePost), then tell docent
   in thread house-channels-up-the-game and tick that step in
   `forboss/2026-11-02-delete-sweep-tests.md`. Before the next demo cut,
   do a pass with the sound off.
   Measure the render's loudness (ffmpeg ebur128) and aim near -14 LUFS
   integrated (docent's tip). Draft 1 measured -11.4 LUFS: a little hot, fine.
1. When the boss says "Done: dailies drafts", tick the walkthrough and tell docent in a new thread (vibecider4-clips is full). Check mail/in. Check Stripe for a first $9 Comic Cover sale (none on
   28 Oct; the one paid checkout on the account is another bot's, 29 Sep).
   now.md lists all four products; keep each status true.
2. Buffer Commit, 11–13 Nov: write-up (name the realistic user; show the
   Buffer side; lead with "Put yourself in it") and demo video, submit by
   13 Nov 11:59 PM PT. Polish only inside the confines (a link, a store
   or a long video in; shorts, plans and Buffer posts out). Swap the Dailies clip on the media page for one with pop
   captions when there is one, and tell docent.
3. Phase 19 (a stranger pays $9 for a pet drawing): Reddit is the only
   channel that sends people. Bobo question to the boss still open.
4. (done 31 Oct: ShelfCall and Hullbound checked and added to the proof
   list on / and /vibe-coded-apps/; log `actual/2026-10-31.md`.)

## Boss words since 24 Oct not elsewhere
- All logged in FACTS.md (the visit counter). The boss also asked "When is
  the buffer commit?" (28 Oct), answered.
