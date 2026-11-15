#!/usr/bin/env python3
"""The "More on this site" links at the foot of the sales pages.

Why: on 15 Nov the pet portrait page, the one page that takes money, had one
link pointing at it from the whole site, and two of the guide pages were not
linked from the home page at all. Crawlers find and weigh a page by the links
to it, and Cloudflare's counts showed Google fetching the home page 25 times
in a month and those pages once or not at all (node scratch/crawlers.mjs).

What it does: writes one marked block as the first thing inside <footer> on
the home page and the seven guide pages, linking every other page in the
list. A page never links to itself. Run it again after adding a page to
PAGES; it replaces the block, it never adds a second one.

    python3 demo/vibecider/links/more-links.py          # write
    python3 demo/vibecider/links/more-links.py check    # change nothing; exit 1 if a page is out of date

Round Robin's page is left alone on purpose: docent holds a clip of it, and
it already links the home page and the ideas page in its own words.
No price is written in a link. A price in eight footers goes stale unseen.
"""
import re, sys, pathlib

SITE = pathlib.Path(__file__).resolve().parents[3] / "site"
# path, the words of the link (each page's own headline, shortened)
GUIDES = [
    ("/", "The VibeCider bot: your idea, built and selling"),
    ("/i-have-an-app-idea/", "I have an app idea. Where do I start?"),
    ("/turn-my-idea-into-an-app/", "How do I turn my idea into an app?"),
    ("/app-idea-no-money/", "I have an app idea but no money"),
    ("/can-ai-build-an-app-for-me/", "Can AI build an app for me?"),
    ("/how-much-does-it-cost-to-build-an-app-with-ai/", "How much does it cost to build an app with AI?"),
    ("/app-ideas/", "Simple app ideas to make money"),
    ("/vibe-coded-apps/", "Vibe coded apps, every dollar counted"),
]
BUILT = [
    ("/roundrobin/", "Round Robin, a pickleball round robin generator"),
    ("/comiccover/", "Comic Cover, a custom comic book cover maker"),
    ("/comiccover/pet-portrait/", "Your pet as a superhero, a custom pet portrait"),
]
START, END = "<!-- more:start (written by demo/vibecider/links/more-links.py; change it there) -->", "<!-- more:end -->"
LIST = 'style="list-style:none;padding:0;margin:4px 0 14px;line-height:2.1;font-size:15px"'

def block(me):
    li = lambda items: "\n".join(f'    <li><a href="{p}">{t}</a></li>' for p, t in items if p != me)
    return f"""{START}
  <nav aria-label="More on this site">
  <strong>More on this site</strong>
  <ul {LIST}>
{li(GUIDES)}
  </ul>
  <strong>Built by the bot that wrote this page</strong>
  <ul {LIST}>
{li(BUILT)}
  </ul>
  </nav>
  {END}"""

check = len(sys.argv) > 1 and sys.argv[1] == "check"
stale = 0
for path, _ in GUIDES:
    f = SITE / path.strip("/") / "index.html"
    old = f.read_text()
    if old.count("<footer>") != 1:
        sys.exit(f"{f}: expected one <footer>, found {old.count('<footer>')}")
    new = re.sub(re.escape(START) + r".*?" + re.escape(END) + r"\n  ", "", old, flags=re.S)
    new = new.replace("<footer>\n", "<footer>\n  " + block(path) + "\n", 1)
    if new != old:
        stale += 1
        if not check:
            f.write_text(new)
    print(("out of date" if check else "written    ") if new != old else "up to date ", path)
if check and stale:
    sys.exit(1)
