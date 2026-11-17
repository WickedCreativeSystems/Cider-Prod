#!/usr/bin/env python3
"""Where the people who want a picture of a pet are: a few subreddits' last days, read
from the same public archive as asked.py (Arctic Shift), with asked.py's own request
function. Reads only. Nothing is sent. Written 17 Nov 2026 for one reading; the result
is in LEARNED.md ("17 Nov, fourth wake"): the drawing-request, pet and AI-picture places
are closed by their rules; the gift-asking places have the askers (r/Gifts, r/GiftIdeas).
Do not run it again before the boss has said "sent" or "not sent" for the one reply of
17 Nov: under a 10% rule he cannot answer often, so a second asker is no use before the
first reply has stood or been taken down.

  python3 scratch/pets.py [days=7] sub,sub,...     posts that ask for, or offer, a picture of a pet
                                                   or a gift for someone who loves one; counts at the end
  python3 scratch/pets.py thread <post id>         the comments under one post (does a maker's own link stand)

The output names real people: screen or outbox/ only, never plan/, actual/ or anything public.
One request a second at most.
"""
import sys, re, time, datetime, os
sys.dont_write_bytecode = True      # no __pycache__ in the repository
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from asked import get, FAILED

PETWORD = r"(dog|dogs|cat|cats|pet|pets|puppy|kitten|pug|corgi|retriever|doodle|pup)"
# a gift for someone who loves a pet, or a picture of one
GIFT = re.compile(rf"(?i)\b({PETWORD} (lover|mom|dad|owner|person|parent|people)|"
                  rf"loves? (her|his|their|my|our) {PETWORD}|obsessed with (her|his|their|my|our) {PETWORD}|"
                  rf"(her|his|their|my|our) (late |old |new )?{PETWORD}\b.{{0,60}}(gift|present|portrait|drawing|painting))\b")
PICTURE = re.compile(rf"(?i)\b((portrait|drawing|painting|illustration|cartoon|caricature|comic|superhero|art)\b.{{0,40}}\b{PETWORD}|"
                     rf"{PETWORD}\b.{{0,40}}\b(portrait|drawing|painting|illustration|cartoon|caricature|comic|superhero)|"
                     rf"(draw|paint|illustrate|turn) (my|our|her|his|their) (late |old |new )?{PETWORD})\b")

def stamp(ts): return datetime.datetime.fromtimestamp(ts, datetime.timezone.utc).strftime("%d %b %H:%M")

def posts(days, subs):
    since = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=days)
    counts, hits, found = {}, {}, []
    for sub in subs:
        before, n, pages = None, 0, 0
        while pages < 8:                       # at most 800 posts a sub
            q = dict(subreddit=sub, limit=100, sort="desc", after=since.strftime("%Y-%m-%dT%H:%M:%SZ"),
                     fields="id,title,selftext,author,created_utc,subreddit,num_comments,link_flair_text")
            if before: q["before"] = before
            page = get("/posts/search", **q); pages += 1; time.sleep(1)
            if not page: break
            n += len(page)
            for p in page:
                if p.get("author") in ("[deleted]", "AutoModerator"): continue
                if (p.get("selftext") or "") in ("[removed]", "[deleted]"): continue
                text = f"{p.get('title','')}\n{p.get('selftext','')}"
                kind = ("gift" if GIFT.search(text) else "") + (" picture" if PICTURE.search(text) else "")
                if kind.strip():
                    found.append((p["created_utc"], kind.strip(), p))
                    for k in kind.split(): hits[(sub, k)] = hits.get((sub, k), 0) + 1
            if len(page) < 100: break
            before = page[-1]["created_utc"]
        counts[sub] = n
    for ts, kind, p in sorted(found, key=lambda t: -t[0]):
        body = " ".join((p.get("selftext") or "").split())
        print(f"\n[{kind}] {stamp(ts)}  r/{p['subreddit']}  u/{p['author']}  flair={p.get('link_flair_text')}  comments={p.get('num_comments')}  {p['id']}")
        print(f"  {p['title'][:200]}\n  {body[:500]}")
    # counts only, no names: this block is the part that may be copied into actual/
    print("\nby place (posts read: gift for a pet's person / a picture of a pet, by the words alone):")
    for s in counts:
        print(f"  {s:22} {counts[s]:4}: {hits.get((s, 'gift'), 0):3} / {hits.get((s, 'picture'), 0):3}")
    print("matched:", len(found), "| REQUESTS FAILED: " + ", ".join(FAILED) if FAILED else "| every request answered")

def thread(pid):
    cs = get("/comments/search", link_id=pid, limit=100, sort="asc", fields="id,body,author,created_utc,parent_id")
    for c in cs:
        top = "" if str(c.get("parent_id", "")).startswith("t3_") else "    "
        body = " ".join((c.get("body") or "").split())
        link = "  [LINK]" if re.search(r"https?://|\b\w+\.(com|net|io|co|shop|store)\b", body) else ""
        print(f"{top}{stamp(c['created_utc'])} u/{c.get('author')}{link}\n{top}  {body[:400]}")
    print(f"\n{len(cs)} comments (at most 100)", "| REQUESTS FAILED: " + ", ".join(FAILED) if FAILED else "| every request answered")

if __name__ == "__main__":
    a = sys.argv[1:]
    if a and a[0] == "thread" and len(a) > 1:
        thread(a[1])
    elif a:
        days = int(a[0]) if a[0].isdigit() else 7
        posts(days, a[-1].split(","))
    else:
        print(__doc__)
