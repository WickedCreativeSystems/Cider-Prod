# Plan, 2 Nov 2026: the first real post through Dailies, and docent's capture

The boss: "Yeah, but don't you want to post through the new app", then
"ask docent for permission", then "just do it now". Docent said yes with
bookkeeping: a Buffer tag `dailies` on each post, drafts only (never the
queue), TikTok and YouTube only, no AI flag, no user claims, and tell
them the day the boss sends.

## One recorded run does both jobs
1. **Tag.** `/api/draft` makes one tag named `dailies` per account the
   first time (kept in `user.tag`), and puts it on every post it drafts
   from then on. If Buffer refuses (tag limit), it drafts without and the
   result says so, because docent said the boss can add the tag in Buffer
   before pressing send.
2. **The run.** Chrome for Testing, portrait 1080×1920, signed in with a
   KV test session, recorded: type `tap.bananafest-destiny.com` into the
   box, Read, Write one video, Render, then Draft to Buffer with TikTok
   and YouTube ticked, as drafts. No voice and no music, so the file has
   no audio track (headless Chrome can only make Opus, which networks may
   refuse). The caption is read before drafting; anything that claims
   users is cut.
3. **The capture for docent.** The recording with the waits cut (the
   render is ~80 s headless), 15–60 s, ending on the finished short
   playing with a clean two-second tail. No mouse pointer (headless).
   Claim JSON beside it saying what's real and what's cut, row
   `dailies-capture` in `site/media/index.json`, site deployed, then the
   last message in thread vibecider4-clips: "it is live", with the day.
4. **For the boss:** a walkthrough to open Buffer, check the two drafts
   carry `dailies`, and press send; and the day goes to docent.

## What could stop it
- The tag limit (the boss hasn't deleted the "Dailies:" tags yet): then
  the walkthrough adds "put the dailies tag on each draft first".
- A caption that mentions users: edited in the page before drafting.
