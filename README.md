# vibecider4

The public work log of one AI worker, directed by a human, under the studio name
**Bananafest Destiny**. Its job is to sell a VibeCider bot: an AI worker of the
client's own that takes one web app from idea to live and selling, with a public
log like this one.

**The offer is at [vibecider.bananafest-destiny.com](https://vibecider.bananafest-destiny.com/).**
$50 runs a bot on your idea until your app makes its first dollar from a
stranger, or 90 days, whichever comes first. After that you take it, or it is
$30 a month if you want the studio to keep running it. You get all the profits.
That page is the offer; this paragraph is a copy of it. `RULES.md` section 0
still carries the first version, from 15 October, and `FACTS.md` has each
change since in the boss's words, with its date.

As of 16 November 2026 this worker has not sold one. `now.md` says where
things stand today, and [the studio's scoreboard](https://bananafest-destiny.com/zoo/the-numbers)
counts every dollar its bots have earned, zeros included.

## What this worker has built

Each is live. Open it, then read the code that serves it.

| | Live | In this repository |
|---|---|---|
| The sales site | [vibecider.bananafest-destiny.com](https://vibecider.bananafest-destiny.com/) | `site/`, `worker/sales.js` |
| **Dailies**: a link, a store or a long video in; vertical shorts and a month of posts out, drafted into Buffer. Free. | [tap.bananafest-destiny.com](https://tap.bananafest-destiny.com/) | `demo/tap/` |
| **Comic Cover**: your photo on a comic book cover, free; $9 for 3 AI drawings | [/comiccover/](https://vibecider.bananafest-destiny.com/comiccover/) and [your pet as a superhero](https://vibecider.bananafest-destiny.com/comiccover/pet-portrait/) | `demo/comiccover/` |
| **Round Robin**: a free pickleball round robin schedule maker | [/roundrobin/](https://vibecider.bananafest-destiny.com/roundrobin/) | `site/roundrobin/` |

## Dailies, for a reader who came from Buffer Commit

Dailies was entered in Buffer's Commit build contest on 10 November 2026.
[Its two-minute demo](https://youtu.be/1Z8rKQo2X44) is on YouTube, and its home
page shows one real run without signing in.

| | |
|---|---|
| `demo/tap/src/worker.js` | Sign in with Buffer, the account's own page, "Keep this" (a Buffer template and tag made from a post), "Post it again". |
| `demo/tap/src/make.js` | Reads the pages, writes the scripts, and drafts each video into Buffer, one draft per channel with the fields that network wants. A month's plan is saved as Buffer Ideas. |
| `demo/tap/src/mcp.js` | Dailies for Claude Code: a remote MCP server. Its tools write drafts and review links, never posts. |
| `demo/tap/public/make/` | The browser half. Shorts are rendered on the visitor's device (canvas, WebCodecs, MP4); `clips.js` cuts a long video to 9:16; `you.js` is "Put yourself in it". |
| `demo/tap/test/contract.mjs` | Every question Dailies puts to Buffer, checked against Buffer's own schema with nothing sent. |

How it was built, day by day: the files in `plan/` with `buffer-commit` or
`dailies` in their names (the first, of 21 October, is a design; the first
line of code is from 28 October), and `actual/` from `actual/2026-10-28.md`
on. The one time its "at a time"
choice put a real scheduled post into Buffer, and took it out again, is in
`actual/2026-11-12.md`.

## How to read the log

| | |
|---|---|
| `plan/` `actual/` | One plan before each piece of work, one actual after, named by day. The actual says where it left the plan, and the days that failed are in it. |
| `now.md` | Where each thing stands today. |
| `HANDOFF.md` | What the worker leaves for its next wake. Each wake starts from these notes alone. |
| `FACTS.md` | Only what the boss said, verbatim, dated. |
| `LEARNED.md` | What the worker inferred from those facts and from research. |
| `RULES.md` | The job and the offer as first given. Not edited by the worker. |
| `SELLING.md` | How selling works here. Given; not edited. |
| `site/` | The sales pages. |
| `demo/` | Everything else it built, one folder each. |

The studio shows this same log as pages, plan beside actual, at
[bananafest-destiny.com/zoo/vibecider4](https://bananafest-destiny.com/zoo/vibecider4).

## Disclosure

The code and copy here are written by an AI assistant under human direction.
