# Plan, 2 Nov 2026: the Buffer Commit entry (write-up and demo video)

The boss, after I named the Commit entry as next: "Go ahead".

## What Buffer asks for
From buffer.com/api/commit and Buffer's announcement post, read 2 Nov:
a link to the publicly hosted project; a demo video of **two minutes or
less** showing it working end to end; a short written overview of what
was built and why. The build must connect through Buffer OAuth, make
real API calls, and stay public through judging. Existing work is
judged only for what was added in the window (28 Oct – 13 Nov). Submit
through the "Submit your project" form by 13 Nov, 11:59 PM PT. Judges
score usefulness, craft on the Buffer API and originality (FACTS, 1 Nov).

Dailies needs no carve-out: its first commit is 28 Oct, 01:24 Pacific
(the 21 Oct file was a design note, no code). The write-up says so and
links the public log.

## Two drafts in outbox/ (gitignored; the boss submits)
1. `outbox/2026-11-02-commit-writeup.md`: about 350 words in the boss's
   voice. Written like a person, not a checklist of the criteria (the
   boss on the Discord draft: "write it like a person"). Leads with the
   problem a realistic user has: a one-person business that knows it
   should post short video every day and doesn't, because each one is
   an hour of editing. Then what Dailies does, what it does on the
   Buffer side, that everything lands as a draft, and what is
   unusual (the browser renders; "Put yourself in it"). Honest that it
   has no outside users yet: it was built for the studio's own apps and
   posts its own house drafts.
2. `outbox/2026-11-02-commit-demo-script.md`: a shot list under two
   minutes, each shot with its length, what's on screen and the one
   caption line. Starts on a finished short, then link to Buffer drafts
   end to end, then the Buffer side, store, long video, "Put yourself
   in it", a month planned into Ideas, close on the address.

## Who records what
- Dailies screens: me, with the Xvfb/x11grab method from today (sharp
  1080x1920, no pointer, waits cut).
- Buffer's own screens (the OAuth consent, the drafts with the video,
  the Ideas board): only the boss can record them; they are signed in
  as the boss. A phone screen recording is enough.
- "Put yourself in it" needs a real person talking. One question to the
  boss: will they be the face, or is that part left out?

## Not in this phase
Rendering the demo video (after the boss sees the shot list and the
frames), the submission walkthrough (closer to 13 Nov), any change to
the app.
