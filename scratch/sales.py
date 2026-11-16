#!/usr/bin/env python3
"""The Stripe read, in one command. Read-only: two GETs, nothing is made or changed.

    export $(grep -E "^STRIPE_RESTRICTED_KEY=" .git-credentials | xargs)
    python3 scratch/sales.py

What it prints:
  1. the newest checkouts (day, state, paid or not, cents). A sale of mine is a
     PAID checkout of 5000 (the $50 VibeCider bot link) or 900 (Comic Cover's
     $9 drawing). No buyer's name or address is printed.
  2. the account's charges. The studio shares this Stripe account, so a charge
     is not mine unless it belongs to a paid checkout above. Two were there on
     16 Nov 2026 and neither is mine: 29 Sep 2026, 2098 cents (before I
     existed), and 5 Nov 2026, 600 cents, "Purchase Mapsmith Pro" (cider3's
     app). Anything newer than those is printed with NEW beside it.
Exit 0 with "no sale of mine", exit 1 with "A SALE" (then read it in Stripe
before telling anyone), exit 2 if Stripe did not answer.
`python3 scratch/sales.py test` shows the A SALE path on a made-up checkout
without asking Stripe. No key lives in this file.
"""
import os, sys, json, base64, datetime, urllib.request, urllib.error

TEST = sys.argv[1:] == ["test"]   # `python3 scratch/sales.py test`: a made-up paid $50 checkout, Stripe is not asked
KEY = os.environ.get("STRIPE_RESTRICTED_KEY")
if not KEY and not TEST:
    print("run the export line at the top of this file first"); sys.exit(2)
MINE = {5000: "the $50 link", 900: "the $9 drawing"}
KNOWN_CHARGES_UNTIL = datetime.datetime(2026, 11, 6, tzinfo=datetime.UTC)

def get(path):
    if TEST:
        now = int(datetime.datetime.now(datetime.UTC).timestamp())
        return {"data": [{"created": now, "status": "complete", "payment_status": "paid", "amount_total": 5000}] if path.startswith("checkout") else
                        [{"created": now, "amount": 5000, "status": "succeeded", "description": "made up by the test"}]}
    r = urllib.request.Request("https://api.stripe.com/v1/" + path,
        headers={"Authorization": "Basic " + base64.b64encode((KEY + ":").encode()).decode()})
    try:
        return json.load(urllib.request.urlopen(r, timeout=30))
    except urllib.error.HTTPError as e:
        print("Stripe answered", e.code, "for", path.split("?")[0]); sys.exit(2)
    except Exception as e:
        print("Stripe did not answer:", type(e).__name__); sys.exit(2)

def day(t): return datetime.datetime.fromtimestamp(t, datetime.UTC)

print("TEST, nothing below is real." if TEST else "Stripe, read at", datetime.datetime.now(datetime.UTC).strftime("%Y-%m-%d %H:%M UTC"))
sold = 0
ses = get("checkout/sessions?limit=20")["data"]
print("newest checkouts (%d shown):" % min(len(ses), 6))
for i, s in enumerate(ses):
    paid = s["payment_status"] == "paid"
    mine = paid and s.get("amount_total") in MINE
    if mine: sold += 1
    if i < 6 or paid:
        print("  %s  %-8s %-7s %6s%s" % (day(s["created"]).strftime("%d %b %H:%M"), s["status"], s["payment_status"],
              s.get("amount_total"), "   <- A SALE: " + MINE[s["amount_total"]] if mine else ("   <- paid, not one of my two prices" if paid else "")))
ch = get("charges?limit=20")["data"]
print("charges on the shared account (%d):" % len(ch))
for c in ch:
    new = day(c["created"]) > KNOWN_CHARGES_UNTIL
    print("  %s  %6s  %-9s %s%s" % (day(c["created"]).strftime("%d %b %Y"), c["amount"], c["status"],
          (c.get("description") or "")[:40], "   <- NEW: mine only if a paid checkout above matches it" if new else "   (known, not mine)"))
if sold:
    print("A SALE: %d paid checkout(s) at one of my prices. Read it in Stripe before telling anyone." % sold); sys.exit(1)
print("no sale of mine")
