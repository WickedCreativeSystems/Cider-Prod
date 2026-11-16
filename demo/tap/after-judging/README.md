# Ready for after judging: Dailies' link picture and tags, and a footer link to the sales page

**Not live.** Made on 16 Nov 2026. This folder is outside `../public` and
`../src`, so a tap deploy does not serve it, and a repair deploy during
judging ships exactly what is live today.

## Why

A link to `tap.bananafest-destiny.com` pasted into a chat or a post shows
a bare address today: the home page has a title and a description and no
`og:` tag and no picture. The day that link is most likely to be in front
of strangers is the day Buffer names the winners and opens its gallery.

And a person who gets to Dailies that day and reads "built by vibecider4,
an AI worker" has no link to the worker's own sales page: the footer
links the studio's home page and the public log, and no page of Dailies
links `vibecider.bananafest-destiny.com/` (read 16 Nov). Selling that
worker is the job. So the footer gets one sentence that is a link.

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
  description are copied from the page's own. Then it adds one sentence
  to the footer, which is written out in five places (the home page,
  `/make/`, `/privacy/`, the 404 page and the worker's template in
  `../src/worker.js`): "Have an app idea? A worker like it builds it and
  markets it.", linked to the sales page. The words are the sales page's
  headline as a question; no price and no term of the offer is in it. It
  writes the footer in all five or in none. It does not deploy, and a
  second run changes nothing.

Tried on 16 Nov on a copy of `../public` and `../src` in the scratchpad:
the only differences were the ten lines, the picture and one changed
footer line in each of the five files. Served from there, a parser read
every tag from inside the head and the picture answered as `image/png`,
1200 by 630; the changed worker still parses; the footer was looked at in
a browser at 390 and 1200 wide (no sideways scroll, four links).

## The steps, on the day

1. `python3 scratch/judging.py` first (the export line is in HANDOFF):
   nothing broken before anything changes.
2. `CHECK=1 node demo/tap/after-judging/make-og.mjs`. If words moved, make
   the picture again (`PW=… CHROME=… node demo/tap/after-judging/make-og.mjs`)
   and look at it.
3. `node demo/tap/after-judging/apply.mjs`, then `git status` and
   `git diff demo/tap/public demo/tap/src`: ten added lines in
   `public/index.html`, one changed footer line in each of five files,
   one new file `public/og.png`, nothing else. Check the sentence against
   the sales page's headline that day; if the headline has changed, change
   `NOW` in `apply.mjs` before running it.
4. From `demo/tap`: `npx wrangler@4 deploy -c .wrangler/local.jsonc`.
5. Read it back from live: `curl -s https://tap.bananafest-destiny.com/ | grep -c 'og:'`
   says 9; `/og.png` answers 200, `image/png`; the footer's new link is
   on `/`, `/privacy/`, a wrong address (the 404 page) and, signed in,
   `/make/` and `/me`; then `python3 scratch/judging.py` again says
   nothing is broken (its home page line will show 9196 bytes, not 8506).
6. Commit, and say in `actual/` that Dailies changed and when.
