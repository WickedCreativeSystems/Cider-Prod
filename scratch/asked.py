#!/usr/bin/env python3
"""People who already asked: the last days of a few subreddits, read from a public
archive of Reddit (Arctic Shift, arctic-shift.photon-reddit.com; its API is open and
documented, "a free service, so be considerate"). Reads only. Nothing is sent.

  python3 scratch/asked.py [days=7] [sub,sub,...]      matched posts, newest first
                                                       (kinds: idea, stuck, hire; a count per place at the end)
  python3 scratch/asked.py rules sub,sub,...           each sub's rules
  python3 scratch/asked.py person <name> [days=3]      everything one person posted and said, every place,
                                                       oldest first. RUN THIS BEFORE DRAFTING FOR ANYONE: people
                                                       post the same question in several places and say in one
                                                       thread what rules an offer out in another (17 Nov)

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
        "forhire", "indiehackers", "startups", "Entrepreneur",
        # added 17 Nov after a week's count of 27 other places (actual/2026-11-17.md, second wake):
        # the three small ones where "looking for a developer" is actually posted
        "AppDevelopers", "appdev", "WebDeveloperJobs"]
# counted for a week on 17 Nov and left out: the task boards (slavelabour, hiring, DoneDirtCheap, jobbit:
# data entry and errands, no small web app asked for in 633 posts), the idea boards (SomebodyMakeThis,
# Lightbulb, Business_Ideas: ideas given away, nobody paying), and the big ones (learnprogramming, webdev,
# smallbusiness, buildinpublic, microsaas, AI_Agents, EntrepreneurRideAlong, AppBusiness, Solopreneur,
# ChatGPTCoding, startup, AskProgramming, ProgrammingBuddies, sweatystartup: builders and students)
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

# someone who posts a job with money in mind, for the kind of thing one bot builds
HIRE_TAG = re.compile(r"(?i)^\s*[\[(]\s*(hiring|task|paid|request|job)\b")
HIRE_WHAT = re.compile(r"(?i)\b(web ?app|app|website|web ?site|landing page|mvp|saas|tool|script|bot|automation|"
                       r"dashboard|calculator|chrome extension|plugin|scraper|prototype)\b")

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
            FAILED.append(f"{q.get('subreddit', q.get('subreddits', q.get('author', q.get('link_id', q.get('ids')))))} {e.code}"); return []
        except Exception as e:
            FAILED.append(f"{q.get('subreddit', q.get('subreddits', q.get('author', q.get('link_id', q.get('ids')))))} {type(e).__name__}"); return []
    FAILED.append(f"{q.get('subreddit', q.get('subreddits', q.get('author', q.get('link_id', q.get('ids')))))} gave up"); return []

def rules(subs):
    for s in get("/subreddits/rules", subreddits=",".join(subs)):
        print(f"\n== r/{s['subreddit']}")
        for r in s.get("rules") or []:
            print(f"  - {r.get('short_name')}: {' '.join((r.get('description') or '').split())[:600]}")
    if FAILED: print("REQUESTS FAILED:", ", ".join(FAILED))

def person(name, days):
    since = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=days)).strftime("%Y-%m-%dT%H:%M:%SZ")
    stamp = lambda ts: datetime.datetime.fromtimestamp(ts, datetime.timezone.utc).strftime("%d %b %H:%M")
    ps = get("/posts/search", author=name, after=since, limit=100, sort="asc",
             fields="id,title,selftext,created_utc,subreddit,num_comments"); time.sleep(1)
    cs = get("/comments/search", author=name, after=since, limit=100, sort="asc",
             fields="id,body,created_utc,subreddit,link_id")
    seen = set()
    for p in ps:
        body = " ".join((p.get("selftext") or "").split())
        print(f"POST {stamp(p['created_utc'])}  r/{p['subreddit']}  {p['id']}  comments={p.get('num_comments')}\n  {p['title'][:200]}")
        print("  (same words as a post above)" if body in seen else f"  {body[:1500]}"); seen.add(body)
    for c in cs:
        print(f"SAID {stamp(c['created_utc'])}  r/{c['subreddit']}  under {c['link_id'][3:]}\n  {' '.join(c['body'].split())[:900]}")
    print(f"\n{len(ps)} posts and {len(cs)} comments in {days} days (at most 100 of each)",
          "| REQUESTS FAILED: " + ", ".join(FAILED) if FAILED else "| every request answered")

def posts(days, subs):
    since = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=days)
    found, counts, bykind = [], {}, {}
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
                hire = HIRE_TAG.search(p.get("title", "")) and HIRE_WHAT.search(text)
                kind = ("idea" if IDEA.search(text) else "") + (" stuck" if STUCK.search(text) else "") + (" hire" if hire else "")
                if kind.strip():
                    found.append((p["created_utc"], kind.strip(), p))
                    for k in kind.split(): bykind[(sub, k)] = bykind.get((sub, k), 0) + 1
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
    # counts only, no names: this block is the part that may be copied into actual/
    print("\nby place (posts read: idea / stuck / hire, by the words alone, before any reading):")
    for s_ in counts:
        print(f"  {s_:24} {counts[s_]:4}: {bykind.get((s_, 'idea'), 0):3} / {bykind.get((s_, 'stuck'), 0):3} / {bykind.get((s_, 'hire'), 0):3}")
    print("\nposts read:", ", ".join(f"{s} {c}" for s, c in counts.items()), "| matched:", len(found),
          "| REQUESTS FAILED: " + ", ".join(FAILED) if FAILED else "| every request answered")

if __name__ == "__main__":
    a = sys.argv[1:]
    if a and a[0] == "rules":
        rules(a[1].split(",") if len(a) > 1 else SUBS)
    elif a and a[0] == "person" and len(a) > 1:
        person(a[1].removeprefix("u/"), int(a[2]) if len(a) > 2 and a[2].isdigit() else 3)
    else:
        days = int(a[0]) if a and a[0].isdigit() else 7
        subs = a[1].split(",") if len(a) > 1 else SUBS
        posts(days, subs)
