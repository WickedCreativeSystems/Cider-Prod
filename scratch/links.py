#!/usr/bin/env python3
"""Does every link on the sales site answer 200?  Read-only.

    python3 scratch/links.py            every address on every page, asked once
    python3 scratch/links.py list       print the addresses and ask nothing

It reads the HTML pages in the two folders the sales host serves (site/ and
demo/comiccover/public/), takes every href, src, poster, srcset and the
link-preview addresses (og:image, og:url, twitter:image, canonical), adds the
sitemap's addresses, resolves each against the live address of its page and
asks each one once with GET.  A "#part" on a page of mine is looked up in the
file (an id or a name), not asked.

It then prints each address in the sitemap with its date beside the UTC day
of the last commit to that page's file, and marks a date that differs (a
sitemap date is only worth giving if it is true).  `python3 scratch/links.py
dates` does that part alone and asks nothing.  A page changed but not yet
committed shows the old day: commit first.

What it cannot say: a pay link answers 200 whether or not Stripe still has it
active (Stripe's API says that, not the page), and a host that turns scripts
away (403, 429, 999) is printed as "turned away", which is not a dead link:
read it by hand before changing a page.  Dailies' own links are
scratch/judging.py's, not this script's.
"""
import os, re, subprocess, sys, time, urllib.request, urllib.error
from html.parser import HTMLParser
from urllib.parse import urljoin, urldefrag, urlparse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HOST = "https://vibecider.bananafest-destiny.com"
FOLDERS = ["site", "demo/comiccover/public"]
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/130.0 Safari/537.36 links-check"
SKIP = ("mailto:", "tel:", "javascript:", "data:", "blob:", "sms:")
META = {"og:image", "og:url", "og:video", "twitter:image", "og:image:secure_url"}
WALLED = {401, 403, 405, 429, 999}


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.links, self.ids = [], set()

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        for k in ("id", "name"):
            if a.get(k) and (k == "id" or tag == "a"):
                self.ids.add(a[k])
        if tag == "link" and set((a.get("rel") or "").lower().split()) & {"preconnect", "dns-prefetch"}:
            return                      # a host to warm up, not a page to open
        for k in ("href", "src", "poster"):
            if a.get(k):
                self.links.append(a[k].strip())
        if a.get("srcset"):
            for part in a["srcset"].split(","):
                if part.strip():
                    self.links.append(part.strip().split()[0])
        if tag == "meta" and (a.get("property") in META or a.get("name") in META) and a.get("content"):
            self.links.append(a["content"].strip())


def live(path):
    """The live address of a served file."""
    for f in FOLDERS:
        if path.startswith(f + "/"):
            rel = path[len(f):]
            return HOST + (rel[: -len("index.html")] if rel.endswith("/index.html") else rel)
    raise ValueError(path)


def local(url):
    """The file behind an address of mine, if one of the two folders holds it."""
    p = urlparse(url)
    if p.scheme + "://" + p.netloc != HOST:
        return None
    for f in FOLDERS:
        for cand in (p.path, p.path.rstrip("/") + "/index.html"):
            full = os.path.join(ROOT, f, cand.lstrip("/"))
            if os.path.isfile(full):
                return full
    return None


def ask(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*", "Range": "bytes=0-2047"})
    try:
        with urllib.request.urlopen(req, timeout=25) as r:
            r.read(2048)
            return r.status, r.geturl()
    except urllib.error.HTTPError as e:
        return e.code, url
    except Exception as e:  # no answer at all
        return None, type(e).__name__ + ": " + str(e)[:80]


def dates():
    """Sitemap dates against the UTC day each page's file last changed in git."""
    sm = os.path.join(ROOT, "site", "sitemap.xml")
    rows = re.findall(r"<loc>\s*([^<\s]+)\s*</loc>\s*(?:<lastmod>\s*([^<\s]+)\s*</lastmod>)?", open(sm, encoding="utf-8").read())
    wrong = 0
    for loc, mod in rows:
        f = local(loc)
        if not f:
            print(f"MARKED  no file for  {loc}"); wrong += 1; continue
        day = subprocess.run(["git", "-C", ROOT, "log", "-1", "--format=%cd", "--date=format-local:%Y-%m-%d", "--", f],
                             capture_output=True, text=True, env={**os.environ, "TZ": "UTC"}).stdout.strip()
        if mod == day:
            print(f"ok      {mod}  {loc}")
        else:
            print(f"MARKED  sitemap says {mod or 'no date'}, last changed {day or 'never committed'}  {loc}"); wrong += 1
    print(f"{len(rows)} sitemap dates; " + ("nothing marked" if not wrong else f"{wrong} MARKED"))
    return wrong


def main():
    if len(sys.argv) > 1 and sys.argv[1] == "dates":
        return 1 if dates() else 0
    pages = {}
    for f in FOLDERS:
        for d, _, names in os.walk(os.path.join(ROOT, f)):
            for n in names:
                if n.endswith(".html"):
                    full = os.path.join(d, n)
                    p = Page()
                    p.feed(open(full, encoding="utf-8").read())
                    pages[os.path.relpath(full, ROOT)] = p
    where, parts = {}, []          # address -> pages that carry it; (page, address, part)
    for rel, p in sorted(pages.items()):
        base = live(rel)
        for raw in p.links:
            if not raw or raw.lower().startswith(SKIP):
                continue
            url, part = urldefrag(urljoin(base, raw))
            if urlparse(url).scheme not in ("http", "https"):
                continue
            where.setdefault(url, set()).add(rel)
            if part:
                parts.append((rel, url, part))
    sm = os.path.join(ROOT, "site", "sitemap.xml")
    if os.path.isfile(sm):
        for u in re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", open(sm, encoding="utf-8").read()):
            where.setdefault(u, set()).add("site/sitemap.xml")

    if len(sys.argv) > 1 and sys.argv[1] == "list":
        for u in sorted(where):
            print(u, " <- ", ", ".join(sorted(where[u])))
        print(f"{len(where)} addresses on {len(pages)} pages; nothing asked")
        return 0

    marked, walled, failed, last = [], [], [], {}
    for u in sorted(where):
        h = urlparse(u).netloc
        mine = h.endswith("bananafest-destiny.com")
        wait = (0.2 if mine else 1.0) - (time.time() - last.get(h, 0))
        if wait > 0:
            time.sleep(wait)
        code, end = ask(u)
        last[h] = time.time()
        if code is None:
            failed.append((u, end))
        elif code in (200, 206):
            pass
        elif code in WALLED and not mine:
            walled.append((u, code))
        else:
            marked.append((u, code))
    bad_parts = []
    for rel, url, part in parts:
        f = local(url)
        if f and f.endswith(".html"):
            target = pages.get(os.path.relpath(f, ROOT))
            if target and part not in target.ids:
                bad_parts.append((rel, url + "#" + part))

    for u, code in marked:
        print(f"MARKED  {code}  {u}\n          on: {', '.join(sorted(where[u]))}")
    for rel, u in bad_parts:
        print(f"MARKED  no such part  {u}\n          on: {rel}")
    for u, code in walled:
        print(f"turned away  {code}  {u}  (a host that refuses scripts; read by hand)\n          on: {', '.join(sorted(where[u]))}")
    for u, why in failed:
        print(f"NO ANSWER  {u}  ({why})\n          on: {', '.join(sorted(where[u]))}")
    n = len(marked) + len(bad_parts)
    print(f"{len(where)} addresses on {len(pages)} pages and the sitemap, each asked once; "
          f"{len(failed)} requests got no answer, {len(walled)} turned away; "
          + ("nothing marked" if n == 0 else f"{n} MARKED"))
    print()
    return 1 if (dates() or n or failed) else 0


if __name__ == "__main__":
    sys.exit(main())
