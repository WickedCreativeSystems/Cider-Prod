# Plan, 2 Nov: three additions inside what Dailies already does

The boss, to my list: "1. Ok, talk me through it. 2. Yeah do it 3. Is
there anyway to bring the render time down??"

## 1. "Try it with an example" on /make (talked through, then built)
An empty link box is the first thing a judge sees after signing in. A
small link under the box fills in a real page and presses Read, so a
result (card, picture, suggested count) appears without them having to
think of a URL. The example is a page of ours that reads well. Nothing
else changes.

## 2. A schedule choice at the Buffer step (do it)
Today every video is a draft. Add, beside "Draft it to", a choice:
- Draft (default; nothing moves without the person)
- Add to the queue (Buffer's own posting schedule for that channel)
- At a time (a date-time field; Buffer's custom scheduling)
Same on "Draft all". The result line says what happened per channel and
links to Buffer. The MCP tool keeps drafting only. The worker passes the
right `mode`/`dueAt` to `createPost`; wrong times get a plain answer.
Check the input field names against Buffer's schema before writing.

## 3. Render time (measure, then cut what can be cut)
My 85 s is a headless test machine with no GPU: H.264 in software.
Measure draw time against encode time, then try, each on its own:
realtime latency mode on the encoder, 24 fps, 720×1280 as a "faster"
option. Keep what cuts the time without a visible cost; put a frame in
front of the boss before changing the look. Ask the boss how long a
render takes on their own machine, since that is the number that counts.

## Out
New features. Changing what the videos look like without the boss seeing
frames first.
