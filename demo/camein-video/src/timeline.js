// One clock for picture and music: 120 BPM at 30 fps, a beat is 15 frames, a bar 60 (2 s).
export const FPS = 30, BPM = 120, BEAT = 15, BAR = 60;
export const b = (bar, beat = 0) => Math.round(bar * BAR + beat * BEAT);
// Scenes, in bars. kind names the scene in Demo.jsx; bg is its colour.
export const SCENES = [
  { id: "hook", from: 0, to: 4 },
  { id: "logo", from: 4, to: 6 },
  { id: "card", from: 6, to: 9 },
  { id: "tap", from: 9, to: 14 },
  { id: "wall", from: 14, to: 20 },
  { id: "staff", from: 20, to: 22 },
  { id: "week", from: 22, to: 28 },
  { id: "again", from: 28, to: 32 },
  { id: "api", from: 32, to: 36 },
  { id: "end", from: 36, to: 40 },
];
export const BARS = 40, TAIL = 60, DURATION = BARS * BAR + TAIL; // 2460 frames = 1:22
// Music sections (gen-music.mjs).
export const SECTIONS = [
  { from: 0, to: 4, kind: "intro" },
  { from: 4, to: 14, kind: "verse" },
  { from: 14, to: 22, kind: "chorus" },
  { from: 22, to: 31, kind: "verse" },
  { from: 31, to: 32, kind: "break" },
  { from: 32, to: 38, kind: "chorus" },
  { from: 38, to: 40, kind: "outro" },
];
// Clip moments (seconds into each recording), measured by scene change.
export const CLIP = { tapAt: 4.53, rings: [1.73, 5.07, 8.48], sheetAt: 1.4, queuedAt: 3.17, staffTapAt: 1.45 };
// Where clips start inside their scene: [clip, start second in clip].
export const START = { tap: 0.4, wall: 0.3, week: 0.8, again: 0.2, staff: 0.3, card: 0 };
// Sound effects in frames, from the cuts and the clip moments. The bell is the shop's ding.
const sc = id => SCENES.find(s => s.id === id);
const inClip = (id, sec) => b(sc(id).from) + Math.round((sec - START[id]) * FPS);
export const RINGS = CLIP.rings.map(t => inClip("wall", t));
export const RING_POSTS = ["Tuesday’s sourdough post", "Saturday’s croissant post", "Tuesday’s sourdough post"];
export const SFX = [
  ...SCENES.slice(1).map(s => ({ type: "swoosh", f: b(s.from) })),
  { type: "pop", f: b(0, 1) }, { type: "pop", f: b(1, 1) }, { type: "pop", f: b(1, 3) },
  { type: "boing", f: b(2, 2) },
  { type: "bell", f: b(4, 0.5), g: 1.1 },
  { type: "tapclick", f: inClip("tap", CLIP.tapAt) },
  { type: "chime", f: inClip("tap", CLIP.tapAt) + 8 },
  ...RINGS.map(f => ({ type: "bell", f, g: 1.2 })),
  ...RINGS.map(f => ({ type: "confetti", f: f + 2 })),
  { type: "tapclick", f: inClip("staff", CLIP.staffTapAt) },
  { type: "pop", f: inClip("staff", CLIP.staffTapAt) + 4 },
  { type: "tapclick", f: inClip("again", CLIP.sheetAt) - 3 },
  { type: "tapclick", f: inClip("again", 2.95) },
  { type: "chime", f: inClip("again", CLIP.queuedAt) },
  ...[0, 1, 2, 3].map(i => ({ type: "pop", f: b(32, 2 + i * 2), g: 0.9 })),
  { type: "bell", f: b(36, 0.5), g: 1.2 },
];
