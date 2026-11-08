// Where each scene sits (absolute frames, on the bar grid of timeline.js) and
// the sound effects that go with the cuts. Plain data: gen-music.mjs reads it too.
export const S = {
  intro: [0, 240], logo: [240, 360], link: [360, 1200], buffer: [1200, 1440], store1: [1440, 1560],
  store: [1560, 2040], clips: [2040, 2400], plan: [2400, 2760], many: [2760, 2880],
  wall: [2880, 3240], end: [3240, 3420],
};
const L = S.link[0], ST = S.store[0];
const fx = (type, ...frames) => frames.map(f => ({ type, f }));
export const SFX = [
  ...fx("pop", 0, 15, 30, 45, 60, 75, 90, 105),
  ...fx("glitch", 120, 150, 180, 204, 222),
  ...fx("whoosh", 120, 345, L + 60, L + 120, L + 240, L + 390, L + 600, L + 780, 1200, ST + 60, ST + 180, ST + 300, ST + 360, 2040, 2100, 2400, 2640),
  ...fx("tick", L + 113, L + 182, L + 384, L + 672, ST + 168, ST + 285),
  ...fx("pop", L + 627, L + 639, L + 742, 1440, 1455, 1470, 2760, 2775, 2790, 2805, 2820, 2835),
  ...fx("swish", 1545, 2865, 3180),
];
