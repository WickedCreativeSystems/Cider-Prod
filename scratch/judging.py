#!/usr/bin/env python3
"""The daily read of Dailies while Buffer Commit is judging (from 16 Nov 2026).
It reads and changes nothing of anyone's: no sign-in is made, nothing is sent
to Buffer. (Asking for the sign-in step makes Dailies keep one state key for
ten minutes, as it does for any visitor who presses the button.)

    export $(grep -E "^CLOUDFLARE_(API_TOKEN|ACCOUNT_ID)=" .git-credentials | xargs)
    python3 scratch/judging.py

What it prints:
  1. signed out, what a judge meets first: the home page, its two videos (with
     a byte range, which a phone needs to play them), the maker and the account
     page sending a stranger to sign-in, and the sign-in step reaching Buffer's
     own login page;
  2. counts of keys in Dailies' store, by kind. Counts only, never a key's
     name. One more `tok:` than the baseline means one more Buffer account has
     signed in: somebody other than the boss used it.
     Baseline, 16 Nov 2026 15:09 UTC: tok 2, user 2, ses 3 (the boss, and
     the second account that signed in on 16 Nov at 12:36 UTC). It was
     tok 1, user 1, ses 2 on 15 Nov.
No key lives in this file. Who came, today, is a second command (requests are
counted at once; the page-load counts in scratch/loads.mjs ran about two and a
half hours behind on 16 Nov):
    node scratch/requests.mjs tap.bananafest-destiny.com <from> <to>
A person is a page and a POST to /cdn-cgi/rum in the same minute. An account
doing something is a path under /api/.
"""
import os, sys, json, urllib.request, urllib.error, urllib.parse, http.cookiejar, datetime

HOME = "https://tap.bananafest-destiny.com"
# Counted 16 Nov 2026 15:09 UTC: the boss, and the second Buffer account that signed in that day at 12:36 UTC.
BASE = {"tok:": 2, "user:": 2, "ses:": 3}
bad = []

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k): return None

def get(url, headers=None, follow=False, jar=None):
    handlers = [] if follow else [NoRedirect()]
    if jar is not None: handlers.append(urllib.request.HTTPCookieProcessor(jar))
    op = urllib.request.build_opener(*handlers)
    req = urllib.request.Request(url, headers={"user-agent": "vibecider4 judging read (python urllib)", **(headers or {})})
    try:
        r = op.open(req, timeout=30); return r.status, r.headers, r.read(), r.geturl()
    except urllib.error.HTTPError as e:
        return e.code, e.headers, e.read(), url

def want(label, ok, got):
    print(("ok   " if ok else "BAD  ") + label + ": " + str(got))
    if not ok: bad.append(label)

print("Dailies, read at", datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M UTC"))
st, h, b, _ = get(HOME + "/")
want("home page", st == 200 and b"Sign in with Buffer" in b, f"{st}, {len(b)} bytes")
for p in ("/home/short.mp4", "/home/example/short.mp4"):
    st, h, b, _ = get(HOME + p, {"range": "bytes=0-99"})
    want("video " + p, st == 206 and len(b) == 100, f"{st}, {h.get('content-range')}")
for p in ("/home/short.jpg", "/home/example/short.jpg", "/privacy/", "/ui.css", "/logo.png"):
    st, h, b, _ = get(HOME + p)
    want(p, st == 200, st)
for p in ("/make/", "/me"):
    st, h, b, _ = get(HOME + p)
    want(p + " signed out", st == 302 and h.get("location", "").endswith("/auth/start"), f"{st} to {h.get('location')}")
st, h, b, _ = get(HOME + "/auth/start")
loc = h.get("location", "")
q = urllib.parse.parse_qs(urllib.parse.urlsplit(loc).query)
want("sign-in goes to Buffer", st == 302 and loc.startswith("https://auth.buffer.com/auth?") and q.get("redirect_uri") == [HOME + "/auth/callback"],
     f"{st} to {urllib.parse.urlsplit(loc).netloc}, scope {q.get('scope', ['?'])[0]}")
if loc.startswith("https://auth.buffer.com/"):
    # Buffer's page needs its own cookies between hops; without them it lands on /error.
    st, h, b, end = get(loc, follow=True, jar=http.cookiejar.CookieJar())
    path = urllib.parse.urlsplit(end).path
    want("Buffer's login page", st == 200 and path.startswith("/login/"), f"{st} at auth.buffer.com/{path.split('/')[1]}/…")
st, h, b, _ = get(HOME + "/nothing-here")
want("a wrong link", st == 404 and len(b) > 500, f"{st}, {len(b)} bytes")

tok, acct = os.environ.get("CLOUDFLARE_API_TOKEN"), os.environ.get("CLOUDFLARE_ACCOUNT_ID")
if not tok or not acct:
    print("store not read: set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID first (see the top of this file)")
else:
    api = f"https://api.cloudflare.com/client/v4/accounts/{acct}/storage/kv/namespaces"
    def cf(u):
        return json.loads(urllib.request.urlopen(urllib.request.Request(u, headers={"authorization": "Bearer " + tok}), timeout=30).read())
    ns = [n for n in cf(api + "?per_page=100")["result"] if n["title"] == "TAP"][0]["id"]
    def count(prefix):
        n, cur = 0, ""
        while True:
            d = cf(f"{api}/{ns}/keys?limit=1000&prefix={urllib.parse.quote(prefix)}" + (f"&cursor={cur}" if cur else ""))
            n += len(d["result"]); cur = (d.get("result_info") or {}).get("cursor")
            if not cur: return n
    for prefix, was in BASE.items():
        n = count(prefix)
        note = "" if n == was else f"   <- was {was} on 16 Nov"
        print(f"store {prefix:6} {n}{note}")
    print("(one more tok: than the baseline is one more Buffer account signed in)")

print("nothing is broken" if not bad else "BROKEN: " + ", ".join(bad))
sys.exit(1 if bad else 0)
