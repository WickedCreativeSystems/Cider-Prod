# The Sizecurve explainer for cider2 (plan, 11 Nov 2026)

cider2 asked (mail, 10 Nov): a new 30 to 60 second motion-design explainer for
Sizecurve's Shopify App Store listing, because a Reddit commenter said "I'd
recommend redoing your video on Sizecurve. AI motion design explainer to add
some energy would be my thoughts." cider2 uploads it or the boss does. I post
nothing.

## What is there now
https://youtu.be/7mXRi_g7NDA, watched 11 Nov: 1 min 50 s, 1280x720, uploaded
30 Sep, 4 views. It is a slide deck: a headline, two bar charts that sit still
for ten seconds each, four size boxes, then small screen recordings of the app
with caption bars, a bullet list, a logo. Cream page, dark green, a red for
the warning line. Every line in it is true and careful. Nothing moves, the
app's screens are too small to read, and the thing a merchant feels (the
sizes people want are gone while the rest sit) takes 40 seconds to arrive.

## Shopify's rules for the listing video (read 11 Nov, from shopify.dev)
- Best practices, "Feature media": "A short video (2-3 minutes) is the best
  way to showcase your app's impact." "Keep it promotional rather than
  instructional and limit screencasts to 25% of the video."
- App Store requirements 4.2.2: no pricing information in the listing's
  images. 4.3.4: no statistics, data or unsubstantiated claims; no "the
  first", "the best", "the only". 4.3.6: no reviews or testimonials.
  4.4.3: no Shopify trademarks in graphics.
- These are written for images. I hold the video to them too, because a
  reviewer can. So: **no price and no trial length in the video** (a change
  from what I told cider2 on 10 Nov; the listing's pricing box carries
  them), no counted claims about stores, no Shopify logo, and app screens for
  under a quarter of the running time.

## Where every line comes from
Only the listing (apps.shopify.com/sizecurve) and the public site
(sizecurve.bananafest-destiny.com), read 11 Nov.
- "broken size run", "flagged before the stock goes dead", "raised while
  leftover stock can still be sold": the listing.
- "demand net of returns, not gross sales": the listing and the site.
- The example: the site's own preview, which says it is "a generated store —
  no real merchant data". Heavyweight Tee, L and M out of stock, order S 6,
  M 79, L 104, 189 units. On screen it is labelled an example store.
- "Purchase orders by size", "CSV", "Read-only": the listing.
- Nothing about how often broken runs happen, how much money they cost, or
  which size sells out first. No "AI" said about the app.

## Storyboard: 44 s, 1920x1080, 30 fps, 120 beats a minute (a bar is 2 s)
No voice (agreed with cider2). Words on screen, music made from maths.
| bars | s | scene | words on screen |
|---|---|---|---|
| 0–3 | 0–6 | A rail, four tees: S M L XL. Orders take M and L, again and again. | "One style. Selling." |
| 3–6 | 6–12 | M and L are bare hangers. S and XL hang there. A shopper's pointer tries M, then L, and leaves. | "The sizes people want: gone." "The rest just hang there." |
| 6–8 | 12–16 | Red. The words land hard. | "That's a broken size run." |
| 8–11 | 16–22 | Green. The app's attention card drops onto the rail. | "Sizecurve flags it" "while the rest can still sell." |
| 11–15 | 22–30 | The order builds, size by size, numbers counting up. | "and tells you what to reorder. Size by size." S 6 · M 79 · L 104 · "Order 189 units" · "example store" |
| 15–17 | 30–34 | A bar of units sold; the returned slice peels off. | "Built on what customers kept. Not just what sold." |
| 17–19 | 34–38 | The app's real screens in a window, moving. Under a quarter of the video. | "Every style. Every size." "Purchase orders by size" · "CSV for your supplier" · "Read-only" |
| 19–22 | 38–44 | The rail again, every hanger full. The name. | "Sizecurve" "Reorder the sizes customers kept." "On the Shopify App Store" |

## The look
The site's own colours until cider2 sends its own: page #fbfbfa, ink #1a1d21,
green #2f6f4e, red #b42318. The site uses the system font; Inter is the
stand-in. More energy than the deck: big tight type, one idea a scene, cuts on
the beat, things that move the way cloth and hangers move.

## What waits on cider2
The app's own screens from its dev store (until then the 34–38 s scene uses
the public preview on the site), its true lines and its don'ts, logo, font,
feel. Frames go to cider2 after its message is in. The thread has three
messages left and I use at most two.

## Build
demo/sizecurve-video: Remotion 4.0.536, the Came In project's setup.
`npm run still -- out/x.png --frame=N`, `npm run render`. Media, renders and
node_modules are not in git.

## As built (11 Nov, first wake): what changed from the storyboard above
cider2's answers came in mid-wake (its mail, a colleague's word) and the boss
gave the music himself (FACTS 11 Nov). The draft is 51.5 s, 25 bars, not 44 s.

| bars | s | scene | words on screen |
|---|---|---|---|
| 0–3 | 0–6 | The rail, four tees. Orders pop off. | "One style. Selling." |
| 3–6 | 6–12 | M and L pulled off, "Sold out" tags, a pointer refused twice. | "The sizes people want: gone." "The rest just hang there." |
| 6–8 | 12–16 | Red. Four size tiles, M and L hatched. | "That's a broken size run." "Core sizes out. The rest stranded." |
| 8–11 | 16–22 | Green. A drawn alert card drops in. | "Sizecurve flags it while the leftover stock can still be rescued." · "Example store" |
| 11–15 | 22–30 | Four columns count up. | "Then it tells you what to reorder, in which sizes." S 6 · M 79 · L 104 · XL a dash · "Order 189 units" · "For your own lead time, net of stock on hand and incoming." · "Example store · Heavyweight Tee" |
| 15–18 | 30–36 | Eight M tees, three turn hollow ("came back"); six L tees stay. | "Your bestselling size is not the one that sells the most." "Size curves built from demand net of returns, not gross sales." |
| 18–22 | 36–44 | The app's three screens (alert cards, style table, a purchase order) in a plain window. 8 s of 51.5. | "Every style. Every size." · "Broken size runs" · "Size curves per style" · "Purchase orders by size" · "Example store" |
| 22–25 | 44–51.5 | The app icon's six bars, redrawn. | "Sizecurve" "What to reorder, in which sizes." "Read-only. It never writes to your store." |

- The lines in the listing's own words are cider2's list, word for word, with
  one cut: "per style" is left out of the size-curve line to fit one row
  (asked cider2). The joining lines are mine and are listed in the mail for
  cider2 to strike.
- Nothing on screen says the price, the trial, a URL, "AI", "predicts",
  "first, best, only" or Shopify. No logo but the icon's bars, redrawn.
- Screens: captured from the public preview (sizecurve.bananafest-destiny.com)
  at 2x and 3x, the install box and the "Check your own store" box left out.
  They are in public/img/, which is not in git; `npm run render` needs them.
- Music: gen-music.mjs, twangy rock in E at 120 beats a minute, made from
  maths (plucked-string synthesis with bent notes, a walking bass, a kit).
  -14.1 LUFS, true peak -2.8 dBTP. I can't hear it; the boss judges it.
- The feel is the boss's ("add some energy" was his yes on Reddit; "twangy
  rock" his word to me), not cider2's "calm". cider2's colours are kept.
