#!/usr/bin/env python3
"""People who already asked: the last days of a few subreddits, read from a public
archive of Reddit (Arctic Shift, arctic-shift.photon-reddit.com; its API is open and
documented, "a free service, so be considerate"). Reads only. Nothing is sent.

  python3 scratch/asked.py [days=7] [sub,sub,...]      matched posts, newest first
  python3 scratch/asked.py rules sub,sub,...           each sub's rules

Reddit itself answers this machine 403, except its feeds (/r/<sub>/new/.rss), which
allow about one request a minute. The other archive, Pullpush, says it does not serve
agents: not used.

The output names real people. It goes to the screen or to outbox/ (never pushed),
never into plan/, actual/ or anything public. One request a second at most.
"""
import sys, json, time, re, urllib.request, urllib.parse, datetime

BASE = "https://arctic-shift.photon-reddit.com/api"
FAILED = []          # requests that got no answer; printed beside the counts, so a zero is a real zero
SUBS = ["AppIdeas", "AppBuilding", "cofounder", "nocode", "vibecoding", "lovable",
        "boltnewbuilders", "replit", "Startup_Ideas", "SaaS", "SideProject",
        "forhire", "indiehackers", "startups", "Entrepreneur"]
# someone with an idea and nobody to build it
IDEA = re.compile(r"(?i)\b((have|had|got|with) an? (\w+ )?(app|saas|startup|business|website|web app) idea|"
                  r"idea for an? (\w+ )?(app|saas|website|tool)|non[- ]?technical|can'?t code|cannot code|"
                  r"don'?t know how to code|no coding|not a (developer|programmer|coder)|"
                  r"(looking for|need|find|hire|hiring) (a |an |some)?(\w+ )?(developer|dev|programmer|someone to build|"
                  r"someone who can build|technical co-?founder)|who can build|build (my|this|me an?) (app|idea|website|tool|saas|mvp)|"
                  r"how (do|can|would) i (get|turn|make|build).{0,40}(app|idea|built)|where do i start)\b")
# someone who started and stopped, or built it and nobody came
STUCK = re.compile(r"(?i)\b(stuck|can'?t finish|never finish|abandon|gave up|giving up|(8|9)\d ?% (done|there|finished)|almost done|"
                   r"half[- ]?built|half[- ]?finished|no users|zero users|0 users|no traction|no one (uses|signs|cares|visits)|"
                   r"nobody (uses|signs|cares|visits)|how (do|can) i (market|get users|get traffic|promote)|no idea how to market|"
                   r"hate marketing|can'?t market|distribution)\b")

def get(path, **q):
    url = f"{BASE}{path}?{urllib.parse.urlencode(q)}"
    req = urllib.request.Request(url, headers={"User-Agent": "vibecider4 reading public posts, a few requests"})
    for _ in range(3):
        try:
            with urllib.request.urlopen(req, timeout=40) as r:
                return json.load(r).get("data") or []
        except urllib.error.HTTPError as e:
            if e.code == 429:
                time.sleep(min(60, int(e.headers.get("X-RateLimit-Reset", "20")) + 1)); continue
            if e.code == 422 and _ == 0:       # its "query timed out"; a second try a moment later answers
                time.sleep(3); continue
            FAILED.append(f"{q.get('subreddit', q.get('subreddits'))} {e.code}"); return []
        except Exception as e:
            FAILED.append(f"{q.get('subreddit', q.get('subreddits'))} {type(e).__name__}"); return []
    FAILED.append(f"{q.get('subreddit', q.get('subreddits'))} gave up"); return []

def rules(subs):
    for s in get("/subreddits/rules", subreddits=",".join(subs)):
        print(f"\n== r/{s['subreddit']}")
        for r in s.get("rules") or []:
            print(f"  - {r.get('short_name')}: {' '.join((r.get('description') or '').split())[:600]}")
    if FAILED: print("REQUESTS FAILED:", ", ".join(FAILED))

def posts(days, subs):
    since = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=days)
    found, counts = [], {}
    for sub in subs:
        before, n, pages = None, 0, 0
        while pages < 6:                       # at most 600 posts a sub
            q = dict(subreddit=sub, limit=100, sort="desc", after=since.strftime("%Y-%m-%dT%H:%M:%SZ"),
                     fields="id,title,selftext,author,created_utc,subreddit,num_comments,link_flair_text")
            if before: q["before"] = before
            page = get("/posts/search", **q); pages += 1; time.sleep(1)
            if not page: break
            n += len(page)
            for p in page:
                text = f"{p.get('title','')}\n{p.get('selftext','')}"
                if p.get("author") in ("[deleted]", "AutoModerator"): continue
                if re.match(r"(?i)\s*[\[(]\s*for hire", p.get("title", "")): continue   # sellers, not askers
                if (p.get("selftext") or "") in ("[removed]", "[deleted]"): continue
                kind = ("idea" if IDEA.search(text) else "") + (" stuck" if STUCK.search(text) else "")
                if kind.strip(): found.append((p["created_utc"], kind.strip(), p))
            if len(page) < 100: break
            before = page[-1]["created_utc"]
        counts[sub] = n
    found.sort(key=lambda t: -t[0])
    for ts, kind, p in found:
        d = datetime.datetime.fromtimestamp(ts, datetime.timezone.utc).strftime("%d %b %H:%M")
        body = " ".join((p.get("selftext") or "").split())
        print(f"\n[{kind}] {d}  r/{p['subreddit']}  u/{p['author']}  flair={p.get('link_flair_text')}  comments={p.get('num_comments')}")
        print(f"  {p['title'][:200]}")
        print(f"  https://www.reddit.com/r/{p['subreddit']}/comments/{p['id']}/")
        print(f"  {body[:700]}")
    print("\nposts read:", ", ".join(f"{s} {c}" for s, c in counts.items()), "| matched:", len(found),
          "| REQUESTS FAILED: " + ", ".join(FAILED) if FAILED else "| every request answered")

if __name__ == "__main__":
    a = sys.argv[1:]
    if a and a[0] == "rules":
        rules(a[1].split(",") if len(a) > 1 else SUBS)
    else:
        days = int(a[0]) if a and a[0].isdigit() else 7
        subs = a[1].split(",") if len(a) > 1 else SUBS
        posts(days, subs)
