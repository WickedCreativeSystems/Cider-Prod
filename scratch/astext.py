#!/usr/bin/env python3
"""Read a page as text only, the way an AI assistant that does not run the page gets it.

  python3 scratch/astext.py <url or file> [...]         the title, description, canonical, link-preview tags, any
                                                        structured data, then the body's words in order, with links
                                                        as [words](address), buttons as {button: words}
  python3 scratch/astext.py joins <url or file> [...]   only the places where two elements' words run together
                                                        with no space ("$50runs it"); exits 1 if there is one

Nothing is run and no style is applied, so words a browser hides (display:none, the hidden attribute) are printed
like any others. That is the point: this reader sees them. Written 15 Nov 2026 after Cloudflare's counts showed AI
assistants open my pages more often than search sends anyone. Ask of each page: do the words alone say what this
is, what it costs, and where to press (a link with an address, not a button that needs the page's script)?
The user agent says whose check it is; it is not a browser's name, so Cloudflare does not count it as a page load.
"""
import re, sys, urllib.request
from html.parser import HTMLParser

SKIP = {"script", "style", "svg", "template"}
BLOCK = {"p", "div", "li", "section", "br", "tr", "td", "th", "footer", "header", "details", "summary", "label",
         "h1", "h2", "h3", "h4", "ul", "ol", "main", "nav", "table", "form", "option", "select", "figure",
         "figcaption", "blockquote", "body", "html", "head", "title", "hr", "canvas", "textarea", "input", "button",
         "img"}
EDGE = "\x00"   # where an inline element starts or ends: no space is there unless the page wrote one


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.out, self.head, self.ld = [], [], []
        self.skip, self.inld, self.intitle, self.href = 0, False, False, None

    def handle_starttag(self, t, a):
        a = dict(a)
        if t in SKIP:
            self.inld = t == "script" and a.get("type") == "application/ld+json"
            self.skip += 1
            return
        if t == "title":
            self.intitle = True
        elif t == "meta":
            k = a.get("name") or a.get("property") or ""
            if k in ("description", "robots") or k.startswith(("og:", "twitter:")):
                self.head.append(f"{k}: {a.get('content')}")
        elif t == "link" and a.get("rel") == "canonical":
            self.head.append("canonical: " + a.get("href", ""))
        if self.skip:
            return
        if t in ("h1", "h2", "h3"):
            self.out.append("\n\n" + "#" * int(t[1]) + " ")
        elif t in BLOCK:
            self.out.append("\n")
        else:
            self.out.append(EDGE)
        if t == "a":
            self.href = a.get("href"); self.out.append("[")
        elif t == "button":
            self.out.append("{button: ")
        elif t == "img":
            self.out.append(f"(picture: {a.get('alt') or 'no words'})")
        elif t == "input":
            self.out.append(f"(input {a.get('type')} {a.get('placeholder') or a.get('value') or ''})")

    def handle_endtag(self, t):
        if t in SKIP:
            self.skip -= 1; self.inld = False
            return
        if t == "title":
            self.intitle = False
        if self.skip:
            return
        if t == "a":
            self.out.append(f"]({self.href})")
        elif t == "button":
            self.out.append("}")
        self.out.append("\n" if t in BLOCK else EDGE)

    def handle_data(self, d):
        if self.inld:
            self.ld.append(d)
        elif self.intitle:
            self.head.append("title: " + d.strip())
        elif not self.skip:
            self.out.append(d)


def read(where):
    if where.startswith(("http://", "https://")):
        q = urllib.request.Request(where, headers={"User-Agent": "vibecider4-text-read (the site's own check)"})
        return urllib.request.urlopen(q, timeout=30).read().decode("utf8", "replace")
    return open(where, encoding="utf8").read()


def joins(text):
    # a word, then only element edges, then a word: "$50" + "runs it". Marks inside a word (a link's bracket) are
    # mine, so they are taken out first.
    plain = re.sub(r"\]\([^)]*\)|\[|\{button: |\}", "", text)
    return [f"{m.group(1)}|{m.group(2)}" for m in
            re.finditer(r"([A-Za-z0-9$%.,:;!?']+)\x00+([A-Za-z0-9$][A-Za-z ]{0,25})", plain)]


if __name__ == "__main__":
    args = sys.argv[1:]
    only_joins = bool(args) and args[0] == "joins"
    if only_joins:
        args = args[1:]
    if not args:
        sys.exit(__doc__)
    found = 0
    for where in args:
        raw = read(where)
        p = Page(); p.feed(raw)
        text = "".join(p.out)
        j = joins(text)
        found += len(j)
        if only_joins:
            for x in j:
                print(f"{where}: {x}")
            continue
        print("=====", where, len(raw), "bytes")
        print("\n".join(p.head))
        print("structured data:", " ".join(p.ld)[:1500] if p.ld else "none")
        body = re.sub(r"[ \t]+", " ", text.replace(EDGE, ""))
        print("----- the words\n" + re.sub(r"\n\s*\n+", "\n", body).strip())
        print(f"----- words run together: {len(j)}" + ("".join("\n  " + x for x in j)))
    if only_joins:
        print(found, "places where words run together")
        sys.exit(1 if found else 0)
