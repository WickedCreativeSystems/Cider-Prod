#!/usr/bin/env python3
"""The repository's front page (README.md), checked against what it points at.

  python3 scratch/readme.py          paths and the offer's words, no network
  python3 scratch/readme.py links    the same, and every link answers 200

README.md is where the "Public log" link in the Buffer Commit write-up lands,
and where every sales page's footer link lands. It carries a copy of the
offer, so it can go stale the way a price in a footer does. This says so.
Exit 1 if anything is marked.
"""
import re, sys, os, html, urllib.request

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
readme = open(os.path.join(root, "README.md"), encoding="utf-8").read()
bad = []

# 1. every path named in backticks is in the repository
for p in sorted(set(re.findall(r"`([A-Za-z0-9_./-]+)`", readme))):
    if "/" not in p and "." not in p:
        continue                                  # a word, not a path
    if "/" not in p and not os.path.exists(os.path.join(root, p)):
        # a bare file name: it has to be in a folder the README names
        folders = [d for d in re.findall(r"`([A-Za-z0-9_./-]+/)`", readme)]
        if not any(os.path.exists(os.path.join(root, d, p)) for d in folders):
            bad.append(f"file not in any folder the README names: {p}")
    elif not os.path.exists(os.path.join(root, p)):
        bad.append(f"path not here: {p}")

# 2. the offer: every dollar amount and each term is on the sales page too
page = open(os.path.join(root, "site", "index.html"), encoding="utf-8").read()
words = " ".join(html.unescape(re.sub(r"<[^>]+>", " ", page)).split())
offer = " ".join(readme.split("## What this worker has built")[0].split())
for amount in sorted(set(re.findall(r"\$\d+", offer))):
    if amount not in words:
        bad.append(f"{amount} is in the README's offer and not on site/index.html")
for term in ["first dollar from a stranger", "90 days", "whichever comes first", "all the profits"]:
    if (term in offer) != (term in words):
        bad.append(f'"{term}": README and site/index.html disagree')
# the $9 line is Comic Cover's
if "$9 for 3 AI drawings" in readme and "$9 for 3 AI drawings" not in words:
    bad.append("$9 for 3 AI drawings is not on site/index.html")

# 3. links
links = sorted(set(re.findall(r"\]\((https://[^)\s]+)\)", readme)))
if "links" in sys.argv[1:]:
    for u in links:
        req = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) HeadlessChrome readme-check"})
        try:
            with urllib.request.urlopen(req, timeout=25) as r:
                code = r.status
        except urllib.error.HTTPError as e:
            code = e.code
        except Exception as e:
            code = type(e).__name__
        print(f"  {code}  {u}")
        if code != 200:
            bad.append(f"link answers {code}: {u}")

for b in bad:
    print("MARK", b)
print(f"README.md: {len(links)} links, {'%d marked' % len(bad) if bad else 'nothing marked'}")
sys.exit(1 if bad else 0)
