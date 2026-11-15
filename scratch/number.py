#!/usr/bin/env python3
"""The studio's number, and whether my pages still quote it.

    python3 scratch/number.py

Reads bananafest-destiny.com/zoo/the-numbers (the public scoreboard, as any
stranger can) for three things: how many products are live now, the dollars
earned, and the count of sales. Then reads every page of mine in site/ and
demo/comiccover/public/ and prints each sentence that quotes one of them,
with STALE beside any that no longer matches. Exit 1 if any is stale.

Read-only. It changes nothing; fix a stale page by hand, then deploy.
Written 15 Nov 2026 after four guide pages said "20 products live" a day
after the scoreboard moved to 22.
"""
import glob, html, re, sys, urllib.request

SCORE = "https://bananafest-destiny.com/zoo/the-numbers"
WORDS = {"one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6,
         "seven": 7, "eight": 8, "nine": 9, "ten": 10, "eleven": 11, "twelve": 12}


def text_of(raw):
    raw = re.sub(r"(?is)<(script|style)\b.*?</\1>", " ", raw)
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", raw)))


def num(word):
    word = word.lower()
    return WORDS.get(word, int(word) if word.isdigit() else None)


req = urllib.request.Request(SCORE, headers={"User-Agent": "vibecider4-number-check"})
board = text_of(urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "replace"))
live = re.search(r"(\d+)\s*live now", board)
earned = re.search(r"\$([\d,]+\.\d\d)\s*earned", board)
sales = re.search(r"Earned: \$[\d,.]+, (\w+) sales", board)
if not (live and earned and sales):
    print("could not read the scoreboard; its words have changed:", SCORE)
    sys.exit(2)
live_n, dollars, sales_n = int(live.group(1)), earned.group(1), num(sales.group(1))
print(f"scoreboard: {live_n} live now, ${dollars} earned, {sales_n} sales")

pages = sorted(glob.glob("site/index.html") + glob.glob("site/*/index.html")
               + glob.glob("demo/comiccover/public/**/*.html", recursive=True))
stale = 0
for page in pages:
    t = text_of(open(page, encoding="utf-8").read())
    for s in re.split(r"(?<=[.?!])\s+(?=[A-Z$\d])", t):
        found = []
        m = re.search(r"\b(\d+) (?:products live|live products)\b", s)
        if m:
            found.append(("live", int(m.group(1)), live_n))
        # the studio's total only: a sentence that says "between them" or "the studio"
        if re.search(r"between them|the studio's bots", s):
            m = re.search(r"\$([\d,]+\.\d\d)", s)
            if m:
                found.append(("earned", m.group(1), dollars))
            m = re.search(r"\b(\w+) sales\b", s)
            if m and num(m.group(1)) is not None:
                found.append(("sales", num(m.group(1)), sales_n))
        if not found:
            continue
        bad = [f"{k} {a} (scoreboard {b})" for k, a, b in found if a != b]
        stale += len(bad)
        print(("STALE " + "; ".join(bad) if bad else "ok   ") + f"  {page}\n       {s.strip()[:200]}")
print("nothing stale" if not stale else f"{stale} stale: fix the page, deploy, IndexNow")
sys.exit(1 if stale else 0)
