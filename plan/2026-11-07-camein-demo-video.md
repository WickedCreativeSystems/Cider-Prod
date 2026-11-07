# 2026-11-07: the Came In demo video for Buffer Commit

The boss (FACTS, 7 Nov): check the Came In repo and make the demo video
for the submission. They want a "poppy fun look and sound", not the
metal feel of the Dailies cut.

## The repo (WickedCreativeSystems/came-in, public)
- I read it. Its Buffer writes are real: createPost, the collaboration
  notes (create, update and delete), createIdea. Sync reads the posts.
  I can't change the repo; it belongs to the build team.
- Two lines the build team should fix before the submission. I'm only
  reporting them:
  - `src/worker/render/site.ts:63` says Came In "only reads your posts
    and channels", but the sign-in asks for write permissions.
  - `src/app/lib/lines.ts:13,44` says "(staging)" in a draft result.
- The sample bakery writes nothing to Buffer (`/api/sample/*` answers
  locally), so it can all be recorded.

## The video
- 1920x1080, about 75–90 s, under 2 minutes. Remotion in
  `demo/camein-video` (code in git; footage and renders gitignored).
- Look: bright flat colours (tangerine, bubblegum, sky, mint, butter
  yellow), the app's phone screens as floating cards that bounce in on
  springs, big rounded type, confetti and a ding on each "came in".
- Sound: a synthesized track, bright and major-key (C/G/Am/F at
  about 112 BPM): plucks, marimba, claps, a glockenspiel hook, and a
  shop-bell ding on each ring. Loudness near -14 LUFS. It has to work
  with the sound off too.
- The story:
  1. You posted it. Did anyone come in because of it?
  2. Came In: a card by the till.
  3. A customer taps the post that brought them in and gets a thank-you.
  4. Ding: the owner's wall counts them, live.
  5. This week, in plain sentences.
  6. Post it again goes back through Buffer: the queue, a note on the
     post, Ideas (the API calls named, as the code has them).
  7. The staff screen at the till.
  8. Try the sample bakery: the URL.
- Footage: the live sample, recorded with headful Chrome for Testing
  under Xvfb at device scale 2 with ffmpeg x11grab. A pink ripple
  marks each tap.

## Order
1. Record the clips.
2. The track and the ding.
3. The edit. Stills and a contact sheet go to the boss before the full
   render (the standing rule).
4. Render the draft, measure the loudness, send it.

## Open
- Buffer's own screens (the consent screen, the queued post) need the
  boss's login. The draft uses the app's own result lines; the boss can
  record 5 s of Buffer's queue later.
