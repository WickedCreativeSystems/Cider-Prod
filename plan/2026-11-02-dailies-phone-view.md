# Plan, 2 Nov: the page on a phone, as a scene's picture

The boss rendered a short on their phone. Fast, but the frame was a wide
page image cropped to a sliver (fixed this morning: wide images now sit
whole on a card). Then: "Couldn't it render it as if it were on a phone?"

Yes. "Put yourself in it" already photographs a page at phone width with
Cloudflare's browser (`POST /api/shot`, kept a day, capped 10 a day per
account) and scrolls it in a phone-shaped window. Link-to-shorts scenes
get the same picture as a choice.

## What changes
- A scene's picture select gains "The page, on a phone". Scenes the
  script left without a picture default to it (a dark gradient was the
  fallback before).
- Such a scene draws the page in a phone-shaped window above the caption,
  over the page's own colours blurred, scrolled to the part of the page
  the scene's line talks about (the element sharing the most words with
  the line; failing that, a step down the page per scene), drifting
  slowly down during the scene.
- The preview still and the render load the shot the same way; the
  render says "Photographing the page on a phone…" the first time and
  fails with the reason if the page can't be photographed (the still
  falls back to the gradient quietly).
- No server change: /api/shot is as it was.

## Test
Frames headless with the ShelfCall page (shot via the live /api/shot on
the test session), the three scene kinds side by side; frames to the
boss before deploy.
