// One clock for the picture and the music: 120 BPM at 30 fps, so a beat is
// 15 frames and a bar is 60 frames (2 s). Every cut sits on this grid.
export const FPS = 30, BPM = 120, BEAT = 15, BAR = 60;
export const BARS = 56;                       // 112 s of music
export const TAIL = 60;                       // last frames: logo holds while the reverb rings
export const DURATION = BARS * BAR + TAIL;    // 3420 frames = 1:54

// What the music does in each stretch of bars.
// intro: build with no kick; drop: full; break: no kick, riser, roll into the next drop; outro: ring out.
export const SECTIONS = [
  { from: 0, to: 4, kind: "intro" },
  { from: 4, to: 24, kind: "drop" },
  { from: 24, to: 26, kind: "break" },
  { from: 26, to: 46, kind: "drop2" },
  { from: 46, to: 48, kind: "break" },
  { from: 48, to: 54, kind: "drop2" },
  { from: 54, to: 56, kind: "outro" },
];

// Sound effects, in frames. Filled in from the scenes (see scenes.js); the
// music script reads this list so a whoosh lands exactly on a cut.
export const b = (bar, beat = 0) => bar * BAR + beat * BEAT;
