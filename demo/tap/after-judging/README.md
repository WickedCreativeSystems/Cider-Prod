# Ready for after judging: Dailies' link picture and link-preview tags

**Not live.** Made on 16 Nov 2026. This folder is outside `../public` and
`../src`, so a tap deploy does not serve it, and a repair deploy during
judging ships exactly what is live today.

## Why

A link to `tap.bananafest-destiny.com` pasted into a chat or a post shows
a bare address today: the home page has a title and a description and no
`og:` tag and no picture. The day that link is most likely to be in front
of strangers is the day Buffer names the winners and opens its gallery.

## When (from Buffer's own pages, read 16 Nov 2026)

- `buffer.com/api/commit/terms`: judging runs "from approximately November
  16 through November 20, 2026", and "Submissions must remain live
  throughout the judging period."
- Same page: "Winning Entrants will be notified by email on or about
  December 4 to December 7, 2026", and winners are "announced on the event
  website on or around December 7, 2026."
- `buffer.com/api/commit`: on December 7, "Up to 16 winners and award
  recipients announced, and the project gallery opens."

"Approximately" is theirs. So: **not before 23 November** (the Monday
after the 20th), **and before 4 December.** Read the terms page once more
on the day, in case the dates moved.

## What is here

- `og.png`, 1200x630: the logo and name, the home page's headline, the
  first sentence of its lede, and a phone showing the page's own poster
  (`../public/home/short.jpg`, a frame of a real short).
- `make-og.mjs` makes it; every word is lifted from `../public/index.html`
  and kept in `words.json`. `CHECK=1 node make-og.mjs` says whether the
  page's words have moved since.
- `apply.mjs` copies the picture to `../public/og.png` and adds ten lines
  to the head of `../public/index.html`, under the viewport line (so the
  charset line stays in the first 1024 bytes; the live page is served as
  `text/html` with no charset in the header). The tags' title and
  description are copied from the page's own. It does not deploy, and a
  second run changes nothing.

Tried on 16 Nov on a copy of `../public` in the scratchpad: the only
difference was the ten lines and the picture; served from there, a parser
read every tag from inside the head and the picture answered as
`image/png`, 1200 by 630.

## The steps, on the day

1. `python3 scratch/judging.py` first (the export line is in HANDOFF):
   nothing broken before anything changes.
2. `CHECK=1 node demo/tap/after-judging/make-og.mjs`. If words moved, make
   the picture again (`PW=… CHROME=… node demo/tap/after-judging/make-og.mjs`)
   and look at it.
3. `node demo/tap/after-judging/apply.mjs`, then `git diff demo/tap/public`:
   ten added lines in `index.html`, one new file `og.png`, nothing else.
4. From `demo/tap`: `npx wrangler@4 deploy -c .wrangler/local.jsonc`.
5. Read it back from live: `curl -s https://tap.bananafest-destiny.com/ | grep -c 'og:'`
   says 9; `/og.png` answers 200, `image/png`; then
   `python3 scratch/judging.py` again says nothing is broken (its home
   page line will show about 570 more bytes than 8506).
6. Commit, and say in `actual/` that Dailies changed and when.
