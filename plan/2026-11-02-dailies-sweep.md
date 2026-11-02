# Plan, 2 Nov 2026: a stranger's run through Dailies' untested paths

After the phone view went live, the boss asked "ok now what". Before polish,
walk the paths no one has pressed as a stranger: Render all, Draft all (as
drafts only; the queue and a time would publish), Save as Buffer Ideas,
music under a short, "Write this video" from the plan, the Claude key page
and Keep this. Fix what breaks; leave nothing behind in Buffer that the boss
isn't told how to delete.

## How
- Playwright with Chrome for Testing, 390 px, signed in with a KV test
  session (deleted after). Script in the scratchpad: `pwt/sweep.mjs`.
- One channel only when drafting, so the boss has few test drafts to delete.
- Any look change gets frames in front of the boss first.

## Expected fixes
Unknown until the run. Each fix: a note here, the log in
`actual/2026-11-02.md`, deploy, re-test the path.

## Found and fixed (filled in after the run)
1. Draft all lost its second video: Buffer said "Video could not be read
   from its URL". The video goes into KV and Buffer fetched it before the
   write had reached its location (the same draft worked a minute later).
   Fix: when Buffer says that, wait and try twice more; if it still fails,
   say "Buffer couldn't fetch the video yet. Wait a minute and press again."
2. Keep this failed: "Buffer didn't make the tag: LimitReachedError".
   Dailies made one Buffer tag per drafted video, and the boss's plan ran
   out of tags within a day of testing. Fix: no tag per video; a video's
   posts are remembered by their ids. Keep this still asks Buffer for one
   tag for the winner, and carries on without it when Buffer refuses
   ("Buffer wouldn't add a tag (your plan's tag limit is reached), so
   Dailies tracks it by its posts instead"). Older videos keep their tags.
