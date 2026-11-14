# Handoff (vibecider4)

No keys or secrets here. Everything below is also in git unless noted.

## Start here: state at the end of the first wake, 14 Nov 00:18 UTC

This section is the newest. The rest of the file is the record in date
order (oldest first); the "Waiting on Walker" list is at the very end. The
job list for the next wake is the last "Next" in `plan/2026-11-14.md`.

**Nothing is half built and nothing is owed.** Every change I made is
committed, pushed and live. The sales-site deploy that Cloudflare refused
six times on 13 Nov went through first try at 00:07:56 UTC on 14 Nov.
`mail/in/` and `mail/out/` are empty.

**New on 14 Nov:** a shared link to Comic Cover's maker page shows a
picture of a real free cover and its pretend graded case; a shared link to
any of the eight sales pages shows a wide picture with that page's own
headline (the home page's carries the price sentence). How to remake and
check them is in "14 Nov, first wake" near the end of this file.

**Dailies is finished for judging.** The Buffer Commit build window closes
14 Nov 07:59 UTC (13 Nov 11:59 PM PT); judging starts 16 Nov. The boss
submitted it on 10 Nov. No change and no tap deploy unless something is
broken. Read at 00:08 UTC, signed out: `/` 200, `/make/` 302 to sign-in
(that is right).

**Stripe, read at 00:08 UTC on 14 Nov:** no sale of a bot or a drawing. The
newest checkout is the expired, unpaid one of 7 Nov.

**To deploy the sales site**, from the repo root (the `wrangler.jsonc`
there serves `site/`):
`export $(grep -E "^CLOUDFLARE_(API_TOKEN|ACCOUNT_ID)=" .git-credentials | xargs)`
then `npx wrangler@4 deploy`. Never `source` that file. Comic Cover is its
own worker: the same two lines from `demo/comiccover`, with
`-c wrangler.local.jsonc`. If Cloudflare answers code 10013, stop after a
couple of tries and come back later; it cleared by itself.

**Waiting on whom:**
- **Walker (the boss):** nine lines under "Waiting on Walker" at the end of
  this file, unchanged on 14 Nov. Three of them are also on his sheet
  through market-nana (threads `dailies-second-account`, `rules-offer-line`,
  `search-console-count`, all 12 Nov). The one with a date on it: a second
  Buffer account tried on Dailies' sign-in before 16 Nov. The monthly AI
  budget question is closed (FACTS, 10 Nov: prepaid, no number).
- **market-nana:** to relay his answers to those three. A relayed answer is
  `from_boss: yes` with a `quote:`; only the quote goes in FACTS.
- **docent** (a colleague; I owe it nothing right now): it has four raw
  clips of mine. Dailies' home page example (11 Nov); the bot's own public
  record (12 Nov); Comic Cover's $9 drawing, cut to 9.9 s and held until
  after 15 Nov; Round Robin (`roundrobin-capture-2`), which it cuts as shot
  and expects out on 23 Nov. It knows the Round Robin page gained one line
  after the shot. If it wants a reshoot it says so in a new thread.
- **cider2:** has the Sizecurve video (`/media/drafts/sizecurve-explainer-final2.mp4`)
  for its check and asks the boss to upload it. Until it is public, the
  Sizecurve reply and the naming question stay with the boss.
- **Cloudflare:** nothing.

**Not mine, left alone:** the uncommitted change to `CLAUDE.md` (the boss's
section on his email address; I follow it) and `pet.png` in the repo root.

**The price is $50 until the first dollar.** RULES.md section 0 still says
$100; that is old, and the lines to fix it are with the boss.

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

## Next (old: the list of 2 Nov, kept as record; the live list is the last Next in the newest plan/ file)
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

## Hack the Audience (market-nana, 2 Nov night)
Told market-nana "only if": not before 11-13; hosting off our subdomains
needs the boss; the boss holds the spot and signs; log stays public; English.
If their 11-06 gate passes and the boss says yes, scope the creator's brief
in a day, build 11-14 to 12-05.

## Shutdown for OptiServer hardware (3 Nov, 07:00 UTC)
Clean stop, nothing half-done. Mail: answered docent's commit-demo-source
(the edit's numbers written out; no reply needed) and market-nana. mail/in empty.
Pick up at Next item 0: delete the sweep's "delete me" Instagram drafts, tell
docent, tick forboss/2026-11-02-delete-sweep-tests.md. Check that KV ses:<sid>
(sid in the old scratchpad, which is gone after a reboot) has expired; its TTL
ended about 00:37 UTC 3 Nov. Then the clips and plan recordings (UTC caps are
fresh) and draft 2 of the demo. pet.png in the repo root is not mine: left
untracked.

## 5 Nov: which app to submit
Wrote forboss/2026-11-05-which-app-to-submit.md (recommends Came In; Dailies
too only if Buffer allows one person on two teams). Waiting on the boss's
decision. Don't change either app until then. If Dailies goes in, the first
fix is a no-sign-in example path, but only with the boss's go-ahead. The
scratchpad was rebuilt: pwt/ (playwright-core), cft/ (Chrome 157),
pwt/look.mjs, lookin.mjs, ring.mjs and run.mjs (blocks Buffer writes). No KV
test session is live.

## 7 Nov
Next 0 is done: the delete-me drafts were already gone; docent has been
told. The Dailies Buffer token was refreshed and kept in KV. Pass the KV
namespace id directly (see actual/2026-11-07.md). Still waiting on the
boss's which-app decision. Next is in plan/2026-11-07.md.

Later on 7 Nov: the boss chose Came In. Draft 1 of the demo video was
built (demo/camein-video, a Remotion project; the media in public/ is
gitignored, and the clips are also in the session scratchpad) and sent to
the boss. Waiting on their word. Next is in plan/2026-11-07.md.

## 8 Nov: what was in progress then, and who it waited on (old; see "Start here" at the top)
In progress: the Buffer Commit entry. The app is **Came In**, which belongs
to the build team (repo WickedCreativeSystems/came-in; I can't change it).
The entry is due **13 Nov, 11:59 PM PT**, and **the boss submits it**
(Buffer treats them as the team).
- Demo video: done and approved ("Love the video", FACTS 7 Nov). The file
  is demo/camein-video/out/camein-demo.mp4. **Waiting on the boss** to
  upload it to YouTube and paste the link here.
- Write-up: outbox/2026-11-07-camein-writeup.md. The boss asked why it
  needed their OK. I told them the wording doesn't need it. It waits only
  for (a) the YouTube link and (b) a builder line, if the boss wants one.
  When the link comes in, add it, take the "Before you submit" notes off
  the top, and tell the boss it's ready to paste.
- Also waiting on the boss: the Bobo Reddit question (since 26 Oct), the
  monthly AI budget, and the forboss/ walkthroughs.
- Not waiting on anyone: mail/in was empty on 8 Nov. Check Stripe again
  after the Commit (no VibeCider or Comic Cover sale as of 7 Nov).
Next is in plan/2026-11-08.md.

## 8 Nov, later: both apps go in
The boss: "I want both submitted" (FACTS 8 Nov). Dailies is a second
entry, and the boss submits both. For Dailies:
- Demo: demo/commit-video (Remotion; the badass quick-cut look the boss
  asked for on 2 Nov). Draft 1 is out/draft1.mp4. The boss said **cut the
  two placeholder cards** (Buffer's drafts screen, "Put yourself in it").
  The clips scene still uses stand-ins: record a real clips run
  (`pwt/xclips.mjs` in the old scratchpad, which is gone; rebuild it per the
  2 Nov notes; Chrome needs SwiftShader for WebGL) and a plan run (don't
  save Ideas). Use a KV test session and delete it after. Aim for -14
  LUFS and do a pass with the sound off. Send frames and the draft to the
  boss before calling it final.
- Write-up: outbox/2026-11-02-commit-writeup.md (from 2 Nov). Check it
  against what's live, against the cards being cut, and against the
  criteria. Keep it substantially different from Came In.
- No-sign-in example on the Dailies home page: the boss said "Whatever
  you think". My call: yes, but small and only after the video and
  write-up are done. It's a ready-made short plus its plan, from the
  Comic Cover page, and it writes nothing to Buffer. The plan file says how.

## 8 Nov, late: Dailies demo draft 2 sent
Draft 2 is at demo/commit-video/out/dailies-demo-draft2.mp4 (1080p,
-14 LUFS; a 720p copy and sheet2.png sit beside it). It went to the boss
about 23:35 UTC, and **waiting on the boss** for their word. The cards are
cut and the clips are real. The write-up has notes for the link and the
builder line. The KV test session is deleted. Next is in plan/2026-11-08.md.

## 9 Nov: no-sign-in example live on tap's home page
"What one link gave": a real run from the Comic Cover page (the short,
the script, the first six rows of the month plan), as static files in
demo/tap/public/home/example/ and plain HTML. Nothing went to Buffer.
The KV test session is deleted. Log in actual/2026-11-09.md. ui.css
already has a `.net` class, so don't reuse that name. Test tools are in old
scratchpad 05ad938d-…/ (pwt/node_modules, cft/ Chrome 157). Port 8765
on this machine is taken by something else.

## 9 Nov, third wake
Dailies is now on the sales page and on /vibe-coded-apps/, and the tap
sitemap no longer lists /make/ (commit d8e6f03). **Never source
.git-credentials** (line 1 is the git URL with its token). For deploys use
`export $(grep -E "^CLOUDFLARE_(API_TOKEN|ACCOUNT_ID)=" .git-credentials | xargs)`.
For tap, deploy from a temporary copy of wrangler.jsonc with `<kv-id>`
filled in from `wrangler kv namespace list` (title TAP), and delete the
copy afterwards. Next is in plan/2026-11-09.md (the last list).

## 9 Nov, fourth wake
mail/in empty; nothing new from the boss. Added the 2 Nov sent-post fact to
the Dailies write-up's "change on the day" note. Next is in plan/2026-11-09.md
(the last list).

## 10 Nov, first wake
mail/in empty; nothing new from the boss. All live pages and the pay link checked 200.
Next is in plan/2026-11-10.md.

## 10 Nov, with the boss
Both demos are on YouTube (public; links in FACTS). The boss is the builder on both
entries. Both write-ups are ready to paste in outbox/. The boss submits by 13 Nov 11:59 PM PT.

## 10 Nov: Buffer Commit is submitted
The boss submitted both entries ("Done, submitted", FACTS 10 Nov). Docent has the two
YouTube links. Nothing more to do for the Commit until judging (from 16 Nov). The job
is back to the first paying client. Next is the last list in plan/2026-11-10.md.

## 10 Nov, second wake
mail/in empty; no sale in Stripe. The sales page and /vibe-coded-apps/ now say Dailies
was entered in Buffer Commit, with the demo link. /app-ideas/ idea #5 (Secret Santa) no
longer says "It's October". Next is the last list in plan/2026-11-10.md.

## 10 Nov, third wake
mail/in empty; no sale in Stripe. A raw clip of the $9 pet drawing being made is live at
/media/comiccover-pet-capture.mp4 (+ .json, fifth row in /media/index.json) and docent is
told (thread comiccover-pet-capture, no reply needed). Nobody paid in it: local copy of
the app, Stripe's answer stood in, one real image call; the JSON says so. The slab at its
end names Christmas, so the last 5 s are seasonal. How it was recorded:
demo/comiccover/capture/README.md (Chrome for Testing and the node modules were in the
scratchpad f74e0069-.../ under pwt/ and cft/, if it still exists). Next is the last list
in plan/2026-11-10.md.

## 10 Nov, fourth wake
mail/in empty; no sale in Stripe. Three weeks of page loads read: no stranger is arriving
and Google sends nobody (LEARNED 10 Nov). A second pet post is ready for the boss that
doesn't use Bobo: outbox/2026-11-10-reddit-pug.md with its image, walkthrough
forboss/2026-11-10-post-pug-reddit.md. Next is the last list in plan/2026-11-10.md.

## 10 Nov, mail check 21:32 UTC
Docent has the pet clip cut (9.9 s), queued for YouTube only, held until after 15 Nov.
No reply was needed. Two small corrections to the clip's JSON wait for the next work
wake: they are the last section of plan/2026-11-10.md, to do before its Next list.

## 10 Nov, mail check 23:54 UTC
cider2 asked me to make a new Sizecurve explainer video and says the boss sent it my
way (its word, not the boss's). I said yes and asked what I need (thread
sizecurve-explainer-video). The work starts at the next work wake; the steps are the
last section of plan/2026-11-10.md. If the boss says no, stop and tell cider2.

## 11 Nov, first wake
The pet clip's notes are corrected and live. The boss wants the Sizecurve video made
and gave its music ("twangy rock", FACTS 11 Nov). A first full draft exists (51.5 s,
demo/sizecurve-video, scene list at the end of plan/2026-11-11-sizecurve-video.md). The
boss has the mp4 in the conversation; cider2 has the strip and the draft at unlisted
addresses under /media/drafts/ (thread sizecurve-explainer-video, message 5 of 6; the
final goes in a new thread). I can't hear the track: the boss judges the sound. No sale
in Stripe. Next is the last list in plan/2026-11-11.md.

## 11 Nov, mail check 00:41 UTC
cider2 has no changes to the Sizecurve draft's words, numbers or picture, and leaves the
sound to the boss. One small fix it named (order tags overlapping on the rail, about
2.5 s in) is the last section of plan/2026-11-11.md, to do with Next 1. The final file
waits only on the boss's word on the music; it goes to cider2 in a new thread.

## 11 Nov, second wake
Sizecurve draft 2 is rendered (demo/sizecurve-video/out/, and unlisted at
/media/drafts/sizecurve-explainer-draft2.mp4): the order tags no longer cross, which was
cider2's one fix; the music is the same to the sample. I measured the bass the way a
phone plays it and it is not buried (numbers in actual/2026-11-11.md), so I left it. If
the boss says the sound is right, draft 2 is the final: no new render. A new raw Dailies
clip (the home page's no-sign-in example, 53 s) is live in site/media and docent is told
(thread dailies-home-capture, no reply needed). Its recorder is demo/tap/capture/. No sale
in Stripe. The Dailies home page says "Being built now ... for Buffer Commit (28 October
to 13 November 2026)": change it to the past before judging starts on 16 Nov. Next is the
last list in plan/2026-11-11.md.

## 11 Nov, mail check 03:27 UTC
docent has the Dailies clip and will cut 17 to 31 s at its next work wake; nothing is
wrong with the take. I told it one thing my note missed: the sample cover's issue box
shows the year, half cut off, whenever the cover is on screen. First job next work wake:
add that to site/media/dailies-home-capture.json and deploy. Then Next as it stands.

## 11 Nov, mail check 03:34 UTC
docent: the year on the sample cover is fine for it, no crop, no retake. First job next
work wake is still the JSON note for dailies-home-capture: the year in the cover's issue
box, plus docent's test for what dates a clip (the last section of plan/2026-11-11.md),
then deploy.

## 11 Nov, third wake
The boss heard Sizecurve draft 2 and said "It's good" (FACTS 11 Nov). The video is
final: the same file, unlisted at /media/drafts/sizecurve-explainer-final.mp4, and
cider2 has the address in a new thread (sizecurve-explainer-final, no reply needed).
Uploading it is cider2's or the boss's. If cider2 asks for another shape (shorter cut,
thumbnail, captions file), that is real work for a work wake: demo/sizecurve-video. The
Dailies clip's JSON now carries the year on the sample cover and docent's test. No sale
in Stripe. Next is the last list in plan/2026-11-11.md.

## 11 Nov, mail check 07:09 UTC
The Sizecurve final is **not** to go up as it is. cider2 read the drawn shopper's pointer
(8.2 to 10.4 s) as a stray mouse from a recording. It is drawn on purpose, but it reads
as a mistake, so it comes out. First job next work wake: the five steps in the last
section of plan/2026-11-11.md (remove pointer and tag darkening, render, check every
frame, new name, tell cider2 in thread sizecurve-explainer-final and the boss in a line).

## 11 Nov, fourth wake
- Sizecurve video: pointer out, file is `/media/drafts/sizecurve-explainer-final2.mp4` on my site, with cider2 for its check; cider2 asks the boss to upload. About 2 s of picture changed since the file the boss called good; sound identical.
- Stripe 15:17Z: no sale.
- Drafted for the boss: `outbox/2026-11-11-reddit-sizecurve-video.md` + `forboss/2026-11-11-post-sizecurve-video.md` (after the video is public).
- NOT done: the site still says $18.09 / one stranger; the studio says $36.09 / four sales. First job on Next in plan/2026-11-11.md. Wake was cut short by the usage limit.

## 11 Nov, fifth wake
- The site's earnings lines are current: $36.09 from four sales, 20 live, read from the studio's page on 11 Nov. Mapsmith is on /vibe-coded-apps/ (ten cards) and on the home page. Deployed and read back live.
- Not changed: site/cards/short.html (October's card) and the October drafts in outbox/, which still say $18.09. If the boss posts an old draft, the number is $36.09 from four sales.
- Stripe 18:08Z: no sale. No mail. LEARNED has its four owed lines. Screenshots: `node scratch/shot.mjs <url> <out.png> <w> <h>` run from demo/sizecurve-video.
- Next is the last list in plan/2026-11-11.md.

## 11 Nov, sixth wake
- Home page has a second pay button under the price boxes (same link). IndexNow pinged for today's eight changed pages (200).
- Could not learn from here whether search holds my pages (Bing/DDG wall this machine). Still the boss's count.
- Stripe 21:07Z: no sale. No mail. Next is the last list in plan/2026-11-11.md; if nothing on it is ready, a short wake (mail, Stripe) is right.

## 12 Nov, first wake
- The VibeCider bot itself has a raw clip with docent now (it had none): site/media/vibecider-bot-capture.mp4 + .json, seventh row of media/index.json, live and read back. 58.7 s: the studio's zoo page for this bot, the 17 Oct day (plan matched to actual), Round Robin live, the sales page to the pay button. Mail to docent in thread `vibecider-bot-capture`, no reply needed.
- Recorder and how to run it: demo/vibecider/capture/ (README there). Scrolls must run inside the page; a step-by-step scroll from the script ran four times slow on the studio's page.
- The clip's JSON says no bot has been sold and which seconds carry dates or the price. If the offer's price changes, the last 14 s of the clip are stale: tell docent.
- Stripe 00:22Z: no sale. No mail in. Next is the list at the end of plan/2026-11-12.md.

## 12 Nov, mail check 00:25 UTC
- docent has the bot clip (thread `vibecider-bot-capture`, closed, no reply needed): no retake wanted. It will cut it at its next work wake, cutting around the "88 times" line, and it is stock for Sunday 15 Nov at the earliest (house TikTok out of quota until then). It wants more clips of the bot itself over clips of apps, when I have something.
- docent will look at its own day page's scroll-to-top after a card is pressed; nothing for me to do.

## 12 Nov, second wake
- RULES.md section 0 still says "$100 pays for the first month", and the studio's zoo page for me prints it ("Its rules, verbatim"). The offer is $50 until the first dollar from a stranger or 90 days, then $30/mo (FACTS, 17 Oct). After a clear: trust FACTS and the sales page for the price, not RULES section 0, until the boss edits it.
- Two questions are with market-nana for the boss's sheet (`for_boss: yes`): threads `rules-offer-line` and `search-console-count`. An answer comes back as `from_boss: yes` with a `quote:`; only the quote goes in FACTS.
- docent told (thread `rules-block-old-price`, no reply needed).
- site/cards/ moved to demo/cards/ (old templates, "$50 first month"); the sales host no longer serves /cards/. Deployed, read back.
- Stripe 03:07Z: no sale. No mail in.

## 12 Nov, mail check 03:14 UTC
- docent answered on the rules block (thread `rules-block-old-price`, closed, no reply needed): it checked and agrees section 0 is stale on the first-month price and on when the $30 starts; the $30 a month itself is current. It will not touch the block (it follows RULES.md by itself once the boss edits it). At its next work wake it adds one general line to all five bots' rules blocks: the file is shown unchanged, and where it and a product page disagree on a price, the product page is current. Nothing under /cards/ was linked from its site.
- Still open: the boss's answers to the two questions on market-nana's sheet.

## 12 Nov, third wake
Dailies was tested the way a judge meets it (actual/2026-11-12.md, third
wake). Every service answered on live. Fixed and deployed: an empty channel
list is read from Buffer again (make.js, mcp.js) and the page offers "Check
again" (public/make/app.js); sign-in picks the first organization that has
a channel when there are several (`pickOrg` in worker.js); the home page's
"Being built now" line is now "Built in public for Buffer Commit, 28 October
to 13 November 2026", so there is no line to change on 14 Nov. **Do not
deploy tap during judging (from 16 Nov) unless something is broken.**
How I test signed in without the boss: put a random 22-character id in the
TAP store as `ses:<id>` with the account id as its value and a 2-hour life,
send it as the `tap_sid` cookie (other than GET needs the header
`origin: https://tap.bananafest-destiny.com`), block /api/draft, /api/ideas
and /api/keep in the browser, and delete the key after. The store has one
account; a second `tok:` key means somebody else signed in.
Not fixed, known: two requests refreshing Buffer's token at once would
cancel the sign-in (LEARNED, 12 Nov); the cure is a Durable Object, after
judging if ever. tap deploys with `npx wrangler@4 deploy -c
.wrangler/local.jsonc` from demo/tap (that ignored file is the template
with the store id filled in).

## 12 Nov, fourth wake
Dailies' "into the queue" and "at a time" have still never reached Buffer for
real, but every call Dailies makes now passes Buffer's own schema:
`node demo/tap/test/contract.mjs <schema.json> [graphql/index.js]` (header
says how to get schema.json: the standard introspection query to
api.buffer.com with the token in the store's `tok:` key; `npm i graphql@16`
in a scratch folder). Run it after any change to a Buffer document.
Fixed and live: a second press can't send a video to a channel that already
has it (`state.done` in public/make/app.js; the worker's results carry
`channelId`); a past time is refused before upload; the filled-in time is one
to two hours out; the day-and-time box has the page's style (ui.css).
Asked docent (thread `one-scheduled-test`) for one post scheduled for 30 Dec
on the house YouTube, deleted within a minute. **If docent says yes and it is
still before 14 Nov 07:59 UTC:** make a test session, upload a small mp4
through /api/upload, POST /api/draft with only the YouTube channel and
`when: {mode:"time", dueAt: 30 Dec}`, then `deletePost` with the returned id
(the schema has `deletePost`; check its input shape in schema.json first),
read scheduled posts back, delete the test session and the video, mail
docent the result. If the answer comes after the window closes, do it only
if docent still wants it; nothing can be fixed then unless it is broken.
Never to TikTok, Instagram or the queue.

## 12 Nov, mail check 18:26 UTC
docent said **yes** to the one scheduled test (thread `one-scheduled-test`,
mail/read/, message 2 of 6; a colleague's word). It is the next work wake's
first job, before 14 Nov 07:59 UTC. docent's conditions:
- One post, once. A second try needs a new ask.
- House YouTube only. No queue, no TikTok, no Instagram, no publish-now.
- **Label it a test in the title and in the video itself** (so if the delete
  ever failed, what showed on the channel would read as a test).
- Mail docent the result either way: the post's id, its title, and its
  scheduled time as a 12-hour clock with the zone. If the delete fails, mail
  docent and the boss (market-nana, `for_boss: yes`) at once.
- **A limit refusal before Sunday is probably not my bug.** docent says the
  house YouTube, TikTok and Instagram share one Buffer key whose 30-day
  window is spent and resets Sunday 15 Nov, 12:13 AM CST (docent asked
  Buffer on the 11th). Drafts skip that check; a scheduled post may not. Read
  the error's words before changing any code. A judge on the 16th would not
  meet that limit.
- A refusal on anything other than a limit is the finding. Fix what is mine
  while the window is open.
Also from docent, not urgent: on the Dailies home capture, the issue box on
the Captain Biscuit cover reads "EC 2026" under "No. 1" at the short's widest
zoom (DEC 2026, the D behind the phone frame), so it names a month, not only
a year. docent cut the 1.5 s that carries it. Put that correction in the
clip's JSON note (site/media/, the Dailies home capture) so the next cutter
knows.

## 12 Nov, fifth wake
**The one scheduled test is done and closed** (actual/2026-11-12.md, fifth
wake). One post through Dailies' "at a time" choice to the house YouTube for
30 Dec 12:00 PM CST; Buffer accepted it; deleted two seconds later; read back
gone, twice. docent has the result (thread `one-scheduled-test`, no reply
needed). **No second post without asking docent again.** "Into the queue" has
still never run for real and nobody has agreed to it.
- Not refused on a limit. docent (mail, 21:17 UTC, thread closed at 4 of 6)
  corrected my reading: its limit is a request budget on its own API client,
  and Dailies is a different client with its own budget. So the house YouTube
  is not blocked, and nothing the studio's key does can get a Dailies user
  refused. The test says nothing about limits at scheduling.
- Fixed and live (tap deployed 21:19 UTC): a YouTube caption with no hashtags
  had a space before "#Shorts" (`captionFor`, demo/tap/src/make.js).
- **A tag named `dailies` now exists in the boss's Buffer** (Buffer had room
  this time; the account record's `tag.id` is set). Nothing carries it. The
  2 Nov drafts are still untagged; the boss's walkthrough for them stands.
- The test's video, its "made" row and the session are gone.
- How it was run, if it is ever needed again: scripts in this wake's
  scratchpad `t/` (lib.py, prep.py, look.py, run.py, after.py, clean.py);
  the pattern is session in the store, `GET /me?refresh=1` so the worker
  refreshes its own token (never refresh from outside: Buffer cancels the
  grant on a reused refresh token), then Buffer's API with the token from
  `tok:` while it has minutes left. A full ffmpeg (with drawtext) is at
  `pwt/node_modules/ffmpeg-static/ffmpeg` in older scratchpads; none is
  installed on the machine.
- The Dailies home capture's JSON note is corrected and live (the cover's
  issue box reads DEC 2026 at 26 to 27 s).
- Stripe 21:30Z: no sale.
- **Mail check 21:13 UTC, docent, thread `docent-raws-after-the-16th`** (5 of
  6, no reply wanted; start a new thread when a clip is live): a Round Robin
  raw **after Fri 13 Nov**. Spec: upright 1080x1920, the live page at phone
  width, no sound, no pointer, nothing sped up; one fact a stranger can check
  on the page; 13 to 17 s of action in up to 60 s; 3 to 4 still seconds at
  the end with the schedule in shot; at least 80 px of empty space above the
  first type (the address bar clips higher); claim JSON beside it, saying it
  is a demo nobody paid for. Recorders: demo/vibecider/capture/ and
  demo/tap/capture/.
- CLAUDE.md has an uncommitted change that is the boss's (a section on his
  email address). I left it for him to commit; I follow it.

## 13 Nov, first wake

Dailies' Buffer step shows each channel's name and says when Buffer calls a
channel locked or disconnected, or its queue paused (lines under the ticks;
nothing blocked). `/api/channels` asks Buffer its own question each time
(`id service name isDisconnected isLocked isQueuePaused`), falls back to the
known channels if refused, and writes the record only on a change. The
question behind `/me` was not touched. Deployed 00:16 UTC 13 Nov; checked
live. **This is the last planned change to Dailies before judging.**

Left for after judging: result lines name only the network; MCP
`list_channels` has no names.

How the page was tested (all still on disk on 13 Nov, in /tmp, so it may be
gone): Playwright in scratchpad `f74e0069-…/scratchpad/pwt/`
(`chans.mjs`, `when.mjs`), Chrome in `f74e0069-…/scratchpad/cft/`, saved
page answers in `ad8bd3ab-…/scratchpad/t/` (`read.json`, `scripts.out`),
session and KV helpers in `a4151a6c-…/scratchpad/t/` (`lib.py`, `prep.py`).
`chans.mjs` takes `CH=rich|bare|fine|live` and `LOCAL=<demo/tap>` to serve
the repo's `app.js` and `ui.css` over the live ones. Upload and draft are
stand-ins in it; it sends nothing to Buffer's write side.

Two rules I worked out here and should keep: a GET that writes the account
record can put an old copy over a new one, so write only on a change; and
never let the page send two requests that each may renew the Buffer token.

## 13 Nov, second wake

The Round Robin raw docent asked for is live: `site/media/roundrobin-capture-2.mp4`
with its JSON and an index row (one take, 21.4 s, tail 16.7 to 21.4 s, the
fact is the page's own line "no partner repeats"). docent told in a new
thread, `roundrobin-raw-2`, no reply asked. The one open point: in the tail
the table's heading row sits in the top 84 px so that all seven rounds stay
whole; I offered a second tail if docent wants empty space there instead.

To shoot again: `demo/vibecider/capture/rec-rr.mjs` and the README beside it
("Round Robin on its own"). Scratch with footage and node_modules is
`a4151a6c-…/scratchpad/rr/` (in /tmp, may be gone); Chrome is in
`f9f2d008-…/scratchpad/cft/`; `OY=261`. Start Xvfb as its own long-running
command, not with `&` inside another one.

Round Robin's page has one change: `scroll-margin-top:28px` on `#out`.

Dailies signed out answers `/` 200 and `/make/` 302 to sign-in. That is
right; do not expect 200 from `/make/`.

## 13 Nov, mail check 03:18 UTC

docent on `roundrobin-raw-2` (a colleague, not the boss; no reply asked, none
sent): **keep the tail as shot, do not reshoot.** Seven whole rounds is the
fact; its address bar over the heading row is now a decision in its spec. It
cuts the clip at its next work wake and expects it to go out on 23 Nov. The
open point in the section above is closed.

Its one note back: the 28 px stop on Round Robin's scroll was a page change
made for a video, and the record should say so where someone will find it in
a year. My actual, the clip's JSON and this file say it; the page's own code
does not. Next work wake: one comment beside that CSS line, out with the next
sales-site deploy (no deploy just for a comment).

## 13 Nov, third wake
- Mail in: nothing. Stripe 15:19Z: no sale. Dailies signed out: `/` 200, `/make/` 302. Nothing changed on Dailies.
- **Round Robin, read as a stranger (Next 4a): done, live since about 15:14 UTC.** A link to it now has a picture (`site/roundrobin/og.png`, 1200x630, the real first schedule for the clip's eight names), an address, a type and a preview line that suits a player as well as the organizer; a free-web-app note for search engines (price 0, no ratings); the empty-box press says the grey names are only an example; one new line under the names box, "Try it with eight example names", fills them in and makes the schedule; the comment docent asked for is beside the 28 px line; sitemap says 13 Nov; IndexNow took it.
- The schedule maker is untouched: the same names give the same schedule as before (checked against the live page before deploy, four sizes, typed and by link).
- To remake the picture after any change to the page's look or its first schedule: `PW=<folder that holds node_modules/playwright-core> CHROME=<chrome binary> node demo/roundrobin/og/make-og.mjs`. It reads the schedule maker out of the page and stops if the first schedule is no longer 7 partners each, no repeats. Playwright and Chrome are where "13 Nov, first wake" above says. Look at the picture before deploying it.
- **The page differs a little from docent's clip now** (the lower part of the form is about 25 px lower than at 2.9 to 9.2 s). Written into `site/media/roundrobin-capture-2.json` and mailed to docent on thread `roundrobin-raw-2`, no reply needed. If docent wants a reshoot it says so in a new thread; the recorder is `demo/vibecider/capture/rec-rr.mjs`, and its `measure` step must be run again first because the form moved.
- Item 4b decided: the Round Robin clip does not go on the sales page (the proof list links the app itself).
- Measured, not built: when everyone plays every round and rounds come close to players minus one, partner pairs repeat (16 players, 4 courts, 15 rounds: about 8 repeats; 12 on 3 for 11: about 2). At 6 to 8 rounds every size from 10 to 24 players was clean in 40 of 40 shuffles. The page prints the count of repeats, so it never says something false. A perfect rotation for 12 or more players is possible; if it is ever built, old shared links must keep their schedule (a version mark in the link), and 8 players must stay exactly as docent's clip shows.
- Ports 8765 and 8791 on this machine belong to other people's servers. For a local look at `site/`, pick a high odd port, and check the page that comes back is mine before testing against it.
- Seen and left: Comic Cover's maker page has a title and line for link previews and no picture; Dailies' home page has no link-preview tags at all (no change to Dailies before judging ends). Comic Cover's picture is first on Next for the next free wake.
- **One deploy of the sales site is owed.** Repo's `site/media/roundrobin-capture-2.json` says "about 15:14 UTC"; live says "15:30". Six deploys from 15:19 to 15:23 UTC failed with Cloudflare's "unknown error", code 10013, at the versions step; the same command worked at 15:14, reads with the token work, `--dry-run` builds. Live is the 15:14 deploy and is fine. Next wake: deploy once, compare the live JSON with the repo's; do not loop if it fails again (Next item 2 says what to do).

## 14 Nov, first wake
- Mail in: nothing. The owed sales-site deploy went through at 00:07:56 UTC. Stripe 00:08Z: no sale. Dailies signed out: `/` 200, `/make/` 302. Nothing changed on Dailies.
- **Comic Cover's maker page has a link picture** (`demo/comiccover/public/comiccover/og.jpg`, 1200x630): a real free cover the page made from a public-domain cat photo the site already had (`public/comiccover/examples/cat-photo.jpg`), and the same cover in the page's pretend graded case. Live 00:11 UTC, commit f390b95. To remake it after the page's look changes: `PW=<folder that holds node_modules/playwright-core> CHROME=<chrome binary> node demo/comiccover/og/make-og.mjs`, look at it, then deploy from `demo/comiccover` with `-c wrangler.local.jsonc`. It uses the page's "Light" effect on purpose (`FX=2` gives "Strong", which blots white fur).
- **Each of the eight sales pages has a link picture** (`site/og.png` and `site/<page>/og.png`): the page's own headline and the logo; the home page's also has the price sentence and the public-log line, lifted from that page's description. Live 00:13:55 UTC, commit a09c858. The old `logo-word-1000.png` stays on the site for old shares.
- **After any change to a sales page's headline, its small line above the headline, or the home page's price sentence:** run `CHECK=1 node demo/vibecider/og/make-og.mjs` (no browser needed; exit 1 and the page's name if a picture is stale). To redraw: the same command without `CHECK=1`, with `PW=` and `CHROME=` set as above; then look, deploy, IndexNow. `OUT=<folder>` writes drafts somewhere else. This check matters most the day the price changes.
- Playwright and Chrome this wake: `/tmp/claude-1000/-home-walker-vibecider4/f74e0069-…/scratchpad/pwt` and `…/scratchpad/cft/chrome-linux64/chrome` (in /tmp, may be gone; then `npm i playwright-core` in a scratch folder and `npx @puppeteer/browsers install chrome@stable`).
- Seven link-preview readers (Facebook, X, Slack, Discord, LinkedIn, WhatsApp, Telegram) get 200 for the pages and the pictures. What each one draws I have not seen; I have no account on them.
- **Seen and left:** the pretend graded case prints "SEALED AT COMICCOVER.BANANAFEST-DESTINY.COM", the old hostname (it still forwards). docent's held clip shows the case. Change it to the live address only after telling docent, or after its clip is out (it holds it until after 15 Nov); then remake `og.jpg`, which shows the case too.
- Dailies' home page still has no link-preview tags; that waits until judging ends.

## Waiting on Walker
- How many VibeCider pages Search Console shows indexed now (0 on 20 Oct). If some are in, I write more search pages; if none, I don't. Sent to his sheet through market-nana on 12 Nov.
- Edit RULES.md section 0 to the current offer (it says $100 for the first month, and the studio's page for me prints it). The lines to paste: forboss/2026-11-12-rules-offer-line.md. Also on his sheet, 12 Nov.
- A pet post on Reddit: Bobo (asked 26 Oct) or the pug (ready 10 Nov), his to post. Either one is the only thing that puts the $9 drawing in front of strangers besides docent's videos.
- Whether to rotate the GitHub token (it was printed into session output on 9 Nov; not written anywhere).
- Whether to point the site's public-log links at WickedCreativeSystems/Cider-Prod (the repo moved; the old address 301s, so they work now).
- The forboss/ walkthroughs (sending the Dailies drafts, deleting the test items, renaming the Buffer app).
- Post the Sizecurve reply (and optional post) once the new video is public: forboss/2026-11-11-post-sizecurve-video.md
- Question: once the new Sizecurve video is up, may my sales site say a VibeCider bot made it, naming Sizecurve and linking it?
- Try a second Buffer account on Dailies' sign-in before 16 Nov and say yes or the words on the page (`forboss/2026-11-12-dailies-second-account.md`; on his sheet 12 Nov, thread `dailies-second-account`).
