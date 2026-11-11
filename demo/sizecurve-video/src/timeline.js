// One clock for picture and music: 120 BPM at 30 fps, a beat is 15 frames, a bar 60 (2 s).
export const FPS = 30, BPM = 120, BEAT = 15, BAR = 60;
export const b = (bar, beat = 0) => Math.round(bar * BAR + beat * BEAT);
export const SCENES = [
  { id: "rail", from: 0, to: 3 },
  { id: "gone", from: 3, to: 6 },
  { id: "slam", from: 6, to: 8 },
  { id: "flag", from: 8, to: 11 },
  { id: "order", from: 11, to: 15 },
  { id: "kept", from: 15, to: 18 },
  { id: "app", from: 18, to: 22 },
  { id: "end", from: 22, to: 25 },
];
export const BARS = 25, TAIL = 45, DURATION = BARS * BAR + TAIL; // 1545 frames = 51.5 s
const sc = id => SCENES.find(s => s.id === id);
export const at = (id, f = 0) => b(sc(id).from) + f;
// Music sections (gen-music.mjs).
export const SECTIONS = [
  { from: 0, to: 3, kind: "intro" },
  { from: 3, to: 6, kind: "hollow" },
  { from: 6, to: 8, kind: "slam" },
  { from: 8, to: 11, kind: "groove" },
  { from: 11, to: 15, kind: "lift" },
  { from: 15, to: 18, kind: "groove" },
  { from: 18, to: 22, kind: "lift" },
  { from: 22, to: 25, kind: "outro" },
];
// The sizes on the rail and how many pips of stock each starts with (a picture, not data).
export const SIZES = ["S", "M", "L", "XL"];
export const PIPS = { S: 5, M: 6, L: 6, XL: 4 };
// Orders in the rail scene: [frame in scene, size]. M and L take six each and are gone.
export const ORDERS = ["M", "L", "M", "S", "L", "M", "L", "XL", "M", "L", "M", "L", "M", "L"].map((s, i) => [58 + i * 8, s]);
// The pointer in the gone scene: tries M, tries L, leaves.
export const TRY = { M: 92, L: 116, leave: 128 };
// The example, from the public preview at sizecurve.bananafest-destiny.com (a generated store).
export const EXAMPLE = { style: "Heavyweight Tee", out: "L and M out of stock", order: { S: 6, M: 79, L: 104, XL: null }, total: 189 };
export const COUNT = { S: 70, M: 85, L: 100, XL: 115, total: 165 };   // frames into the order scene
// The kept scene: a picture of one style's M and L. More M sold; three came back. Tees, not numbers.
export const KEPT = { rows: [["M", 8, [5, 6, 7]], ["L", 6, []]], back: [56, 64, 72], mark: 92 };
export const VIEWS = [8, 84, 160];                                   // frames into the app scene: its three screens
// The mark, measured off the app icon (a 1200 box, bars 124 wide on a baseline at 920): [x, height, hollow].
export const MARK = [[128, 190, 0], [292, 400, 0], [456, 640, 1], [620, 590, 1], [784, 350, 0], [948, 165, 0]];
export const SFX = [
  ...SCENES.slice(1).map(s => ({ type: "swoosh", f: b(s.from) })),
  ...[0, 1, 2, 3].map(i => ({ type: "pop", f: 6 + i * 4, g: 0.7 })),
  ...ORDERS.map(([f, s]) => ({ type: "pop", f, g: 0.8, m: s === "M" || s === "L" ? 0 : 4 })),
  { type: "yank", f: at("gone", 0) }, { type: "yank", f: at("gone", 5) },
  { type: "tapclick", f: at("gone", TRY.M) }, { type: "denied", f: at("gone", TRY.M + 2) },
  { type: "tapclick", f: at("gone", TRY.L) }, { type: "denied", f: at("gone", TRY.L + 2) },
  { type: "riser", f: at("gone", 120) },
  { type: "impact", f: at("slam", 0) }, { type: "impact", f: at("slam", 30), g: 0.7 },
  { type: "ping", f: at("flag", 20) },
  ...["S", "M", "L"].flatMap(s => [0, 4, 8, 12].map(k => ({ type: "tick", f: at("order", COUNT[s] + k) }))),
  { type: "chime", f: at("order", COUNT.total) },
  ...KEPT.back.map(f => ({ type: "flip", f: at("kept", f) })),
  { type: "ping", f: at("kept", KEPT.mark), g: 0.6 },
  ...VIEWS.map((f, i) => ({ type: "pop", f: at("app", f), g: 0.9, m: i * 2 })),
  ...MARK.map((_, i) => ({ type: "pop", f: at("end", 6 + i * 3), g: 0.7, m: [0, 2, 4, 7, 9, 12][i] })),
  { type: "chime", f: at("end", 30), g: 1.1 },
];
