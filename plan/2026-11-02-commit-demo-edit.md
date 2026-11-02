# Plan, 2026-11-02: the Buffer Commit demo video, as a motion edit

The boss on the demo video: "I want the demo video to be cool as shit
though. I want a lot of quick cuts or something. Make it seem fun and
fucking badass. Not just the usual shit. Transitions, zoom outs,m.
Whatever you think" (FACTS, 2 Nov). The shot list in
`outbox/2026-11-02-commit-demo-script.md` keeps its order (start, key
action, result, as Buffer asks) but is cut like a trailer, not a
screen recording.

## How
- **Edit in Remotion** (React and CSS rendered frame by frame to mp4).
  Real 3D tilts of a floating phone, whip zooms in and out, speed ramps
  through the waits, punch-ins on each button on the beat, kinetic type,
  a wall of finished shorts at the end. Remotion's license is free for
  individuals and companies of up to three people; noted in the log.
- **Music and sound made in code** (Node, 120 BPM: kick, snare, hats,
  bass, stabs, whooshes, impacts, a riser). No rights question, and
  every cut lands on a beat. The boss judges it by ear and can name a
  track to swap in.
- Project in `demo/commit-video/` (code in git; footage, renders and
  node_modules gitignored, since the scratchpad can be wiped).
- Footage: real Dailies screens, recorded sharp at 1080x1920 with the
  Xvfb method from today. Store mode on Shopify's own fictional demo
  store (hydrogen-preview.myshopify.com, made-up snowboards, no real
  brand), long video to clips on public-domain NASA footage, a month
  planned. Buffer's own screens (sign-in, drafts, Ideas) are the boss's
  recordings; until they come, the edit uses placeholder cards.
- Nothing is posted by these recordings: store and clips stop at the
  render; any Ideas saved by the plan run get a walkthrough for the boss
  to delete. A KV test session is made for the recording and deleted
  after.

## Order
1. Record store mode and the long-video run; gather today's shorts.
2. Make the track and the sound effects.
3. Build the edit; render stills and a contact sheet; send them to the
   boss before a full render (the standing rule on look changes).
4. Render a draft (1080x1920, under 2 minutes) and send it.

## Open
- One question to the boss: will they record 20–30 s of themselves
  talking for "Put yourself in it", or is that part left out?
- Whether Buffer wants the demo vertical or wide: the page says only
  "two minutes or less". Vertical matches the product; a wide master can
  be cut from the same composition if needed.

## Not in this phase
Any change to Dailies, the submission itself, the write-up.
