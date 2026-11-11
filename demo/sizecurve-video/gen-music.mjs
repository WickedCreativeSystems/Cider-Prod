// Sizecurve's track: twangy rock in E. Plucked strings that bend, a bass line that walks,
// a rock kit. Made from nothing but maths (no rights question), every effect on the picture's grid.
// The boss, 11 Nov: "twangy rock. Not country, but with a twang. Bendy notes with a good baseline"
// node gen-music.mjs [out.wav] [--nosfx]
import { writeFileSync, mkdirSync } from "node:fs";
import { FPS, BPM, BARS, SECTIONS, TAIL, SFX } from "./src/timeline.js";

const SR = 44100, beat = 60 / BPM, bar = beat * 4, s16 = beat / 4;
const N = Math.ceil((BARS * bar + TAIL / FPS + 1) * SR);
const L = new Float32Array(N), R = new Float32Array(N), rev = new Float32Array(N), duck = new Float32Array(N).fill(1);
const out = process.argv[2] || "public/music.wav", noSfx = process.argv.includes("--nosfx");
let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647 * 2 - 1;
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
const TAU = 2 * Math.PI;
// SOLO=bass or SOLO=nobass renders one side of the mix, for measuring (see the bass's note below).
const SOLO = process.env.SOLO || ""; let inBass = false;
const put = (t, fn, dur, gain = 1, pan = 0, send = 0, ducked = false) => {
  if ((SOLO === "bass" && !inBass) || (SOLO === "nobass" && inBass)) return;
  const i0 = Math.floor(t * SR), n = Math.floor(dur * SR), gl = gain * Math.cos((pan + 1) * Math.PI / 4), gr = gain * Math.sin((pan + 1) * Math.PI / 4);
  for (let i = 0; i < n && i0 + i < N; i++) { if (i0 + i < 0) continue; const v = fn(i / SR, i); const d = ducked ? duck[i0 + i] : 1;
    L[i0 + i] += v * gl * d; R[i0 + i] += v * gr * d; if (send) rev[i0 + i] += v * send * gain * d; }
};
const svf = () => { let lo = 0, bp = 0; return (x, f, q = 0.7) => { const F = 2 * Math.sin(Math.PI * Math.min(f, SR / 6) / SR); lo += F * bp; const hi = x - lo - q * bp; bp += F * hi; return { lo, bp, hi }; }; };
const section = t => { const B = t / bar; return SECTIONS.find(s => B >= s.from && B < s.to) || { kind: "end" }; };

// ---- the kit ----
const kick = (t, g = 1) => {
  put(t, x => Math.sin(TAU * (48 * x + 110 * (1 - Math.exp(-x * 45)) / 45)) * Math.exp(-x * 8) + rnd() * Math.exp(-x * 300) * 0.25, 0.4, 0.85 * g);
  const i0 = Math.floor(t * SR); for (let i = 0; i < 0.2 * SR && i0 + i < N; i++) if (i0 + i >= 0) duck[i0 + i] = Math.min(duck[i0 + i], 1 - 0.3 * Math.exp(-i / SR / 0.07));
};
const snare = (t, g = 1) => { const f = svf(); put(t, x => (Math.sin(TAU * 190 * x) + 0.6 * Math.sin(TAU * 331 * x)) * Math.exp(-x * 22) * 0.6 + f(rnd(), 2800, 1.3).bp * (Math.exp(-x * 17) + 0.4 * Math.exp(-x * 60)) * 1.5, 0.3, 0.42 * g, 0.05, 0.22); };
const hat = (t, g = 1, open = false) => { const f = svf(); put(t, x => f(rnd(), 8000, 1).hi * Math.min(1, x / 0.001) * Math.exp(-x * (open ? 9 : 85)), open ? 0.38 : 0.06, 0.11 * g, 0.35); };
const crash = (t, g = 1) => { const f = svf(), f2 = svf(); put(t, x => (f(rnd(), 5200, 1).hi * 0.7 + f2(rnd(), 3600, 0.3).bp * 0.5) * Math.exp(-x * 2.3) * Math.min(1, x / 0.002), 2.2, 0.2 * g, -0.3, 0.3); };
const tom = (t, hzv, g = 1, pan = 0) => put(t, x => Math.sin(TAU * (hzv * x + hzv * 0.6 * (1 - Math.exp(-x * 25)) / 25)) * Math.exp(-x * 9), 0.35, 0.5 * g, pan, 0.15);
const tamb = (t, g = 1) => { const f = svf(); put(t, x => f(rnd(), 9500, 0.6).bp * Math.min(1, x / 0.004) * Math.exp(-x * 55), 0.07, 0.16 * g, -0.4); };

// ---- strings ----
// A plucked string (Karplus-Strong): a burst of noise goes round a delay line one period long and loses
// a little top each lap. Picked near the bridge, so it twangs. The delay's length follows bend(x), in
// semitones, so a note can be pushed up, dipped on the bar or shaken. A slapback echo follows each note.
const clamp01 = x => Math.max(0, Math.min(1, x)), smooth = x => { const k = clamp01(x); return k * k * (3 - 2 * k); };
const string = (t, m, dur, { g = 1, pan = 0, bend = null, bright = 0.82, loop = 0.997, drive = 1.6, pick = 0.12, send = 0.25, slap = 0.3, trem = 0, mute = 0, ducked = false } = {}) => {
  const f0 = hz(m), per = SR / f0, M = Math.ceil(per * 1.6) + 8, buf = new Float32Array(M), n = Math.floor(dur * SR), tmp = new Float32Array(n);
  const pn = Math.round(per), exc = new Float32Array(pn); let pv = 0;
  for (let i = 0; i < pn; i++) { pv += 0.6 * (rnd() - pv); exc[i] = pv * 0.8; }
  const pp = Math.max(1, Math.round(pn * pick)); for (let i = pn - 1; i >= pp; i--) exc[i] -= exc[i - pp];
  let w = 0, lp = 0; const comp = (1 - bright) / bright, damp = mute ? 1 - mute : 1;
  put(t, (x, i) => {
    const D = Math.max(2, per / (bend ? Math.pow(2, bend(x) / 12) : 1) - comp), rp = w - D + M * 4, i0 = Math.floor(rp), fr = rp - i0;
    const a = buf[i0 % M], c = buf[(i0 + 1) % M];
    lp += bright * (a + (c - a) * fr - lp);
    const v = (i < pn ? exc[i] : 0) + lp * loop * damp;
    buf[w % M] = v; w++;
    const o = Math.tanh(v * drive) * Math.min(1, (dur - x) / 0.03) * (1 - trem * (0.5 + 0.5 * Math.sin(TAU * 6.2 * (t + x))));
    return (tmp[i] = o);
  }, dur, 0.3 * g, pan, send, ducked);
  if (slap) put(t + 0.118, (x, i) => tmp[i], dur, 0.3 * g * slap, -pan * 0.8 + 0.15, send);
};
// ways to move a note: push it up into pitch, shake it, let it sag
const into = (from, d = 0.11, at = 0) => x => from * (1 - smooth((x - at) / d));              // starts off by `from` semitones, arrives
const push = (by, at, d = 0.14) => x => by * smooth((x - at) / d);                            // pushed up by `by` after `at`
const shake = (depth, at = 0.18, rate = 5.6) => x => (x > at ? depth * Math.sin(TAU * rate * (x - at)) * Math.min(1, (x - at) / 0.25) : 0);
const both = (...fs) => x => fs.reduce((s, f) => s + f(x), 0);
const strum = (t, notes, dur, o = {}, gap = 0.014) => notes.forEach((m, j) => string(t + j * gap, m, dur - j * gap, { ...o, pan: (o.pan ?? 0) + (j - notes.length / 2) * 0.08 }));
// the bass: the same string, darker and heavier, with a sine under it for weight
const BB = +(process.env.BB || 0.42), BD = +(process.env.BD || 2.2), BO = +(process.env.BO || 0);
const bass = (t, m, dur, g = 1, bend = null) => {
  inBass = true;
  string(t, m, dur, { g: 1.5 * g, bright: BB, loop: 0.9985, drive: BD, pick: 0.25, send: 0, slap: 0, bend, ducked: true });
  if (BO) string(t, m + 12, dur, { g: BO * g, bright: 0.6, loop: 0.996, drive: 2.4, pick: 0.2, send: 0, slap: 0, bend, ducked: true });
  if (!bend) put(t, x => Math.sin(TAU * hz(m) * x) * Math.min(1, x / 0.006) * Math.exp(-x * 3) * Math.min(1, (dur - x) / 0.03), dur, 0.22 * g, 0, 0, true);
  inBass = false;
};

// ---- effects ----
const glock = (t, m, g = 1, pan = 0) => put(t, x => { const f0 = hz(m); return (Math.sin(TAU * f0 * x) + 0.5 * Math.sin(TAU * f0 * 2.76 * x) * Math.exp(-x * 6) + 0.25 * Math.sin(TAU * f0 * 5.4 * x) * Math.exp(-x * 12)) * Math.exp(-x * 3.2) * Math.min(1, x / 0.001); }, 1.4, 0.12 * g, pan, 0.4);
const swoosh = (t, g = 1) => { const d = 0.32, f = svf(); put(t - d * 0.75, x => { const k = x / d; return f(rnd(), 600 + 6000 * k * k, 1.2).bp * Math.sin(Math.PI * k) ** 2 * 1.5; }, d, 0.24 * g, 0.3, 0.2); };
const pop = (t, g = 1, m = 0) => { const r = Math.pow(2, m / 12); put(t, x => Math.sin(TAU * r * (500 * x + 3000 * x * x)) * Math.exp(-x * 35), 0.12, 0.3 * g, 0, 0.2); };
// a tee pulled off its hanger: a quick breath of air and a rising blip
const yank = (t, g = 1) => { const f = svf(); put(t, x => f(rnd(), 900 + 9000 * x / 0.2, 1).bp * Math.sin(Math.PI * Math.min(1, x / 0.2)) * 1.6 + Math.sin(TAU * (300 * x + 2600 * x * x)) * Math.exp(-x * 18) * 0.5, 0.22, 0.3 * g, 0.2, 0.25); };
const tapclick = (t, g = 1) => put(t, x => Math.sin(TAU * 1800 * x) * Math.exp(-x * 160) + rnd() * Math.exp(-x * 400) * 0.3, 0.05, 0.3 * g);
// nothing there: a dead, muted string, twice, stepping down
const denied = (t, g = 1) => [[0, 46], [0.11, 45]].forEach(([o, m]) => string(t + o, m, 0.16, { g: 1.1 * g, mute: 0.02, bright: 0.5, slap: 0 }));
// air rising over a bar
const riser = (t, g = 1) => { const d = 2, f = svf(); put(t, x => { const k = x / d; return f(rnd(), 300 + 5000 * k * k, 1.4).bp * k * k * 1.4; }, d, 0.2 * g, 0, 0.3); };
// the word landing: the band's hit carries it; this adds the floor tom under it
const impact = (t, g = 1) => { tom(t, 70, 1.1 * g); tom(t + 0.012, 95, 0.6 * g, 0.3); };
// the flag: one high bell with two echoes
const ping = (t, g = 1) => [0, 0.25, 0.5].forEach((o, i) => glock(t + o, 95, 1.3 * g * Math.pow(0.5, i), i - 1));
const tick = (t, g = 1) => put(t, x => Math.sin(TAU * 2400 * x) * Math.exp(-x * 220), 0.03, 0.14 * g, 0.2);
// a tee coming back: a short falling chirp
const flip = (t, g = 1) => put(t, x => Math.sin(TAU * (900 * x - 2200 * x * x)) * Math.exp(-x * 22) * Math.min(1, x / 0.003), 0.16, 0.24 * g, -0.2, 0.3);
const chime = (t, g = 1) => [83, 88, 91].forEach((m, i) => glock(t + i * 0.07, m, 1.3 * g, i - 1));
const FX = { swoosh, pop, yank, tapclick, denied, riser, impact, ping, tick, flip, chime };

// ---- the song ----
// E, with the major IV (A) that keeps it rock and not sad. r: the riff's root, b: the bass's, v: the chord.
const CH = {
  E: { r: 40, b: 40, v: [40, 47, 52, 55, 59, 64] },
  G: { r: 43, b: 43, v: [43, 47, 50, 55, 59, 67] },
  A: { r: 45, b: 45, v: [45, 52, 57, 61, 64] },
  C: { r: 48, b: 36, v: [48, 52, 55, 60, 64] },
  B: { r: 47, b: 35, v: [47, 51, 57, 59, 66] },
};
// the chord for each half of a bar, by section
const chordAt = (k, n, half) => CH[k === "groove" ? "EGA"[n % 3] : k === "lift" ? (n % 4 === 3 ? "CB"[half] : "EGA"[n % 4]) : k === "hollow" ? "ECB"[n % 3] : k === "slam" ? (n === 0 ? "CB"[half] : "B") : "E"];
const e8 = beat / 2;
// the riff, in eighths above the root: root, fifth, flat seventh, octave. The seventh is pushed up into; the octave shakes.
const RIFF = [0, null, 7, 10, 12, null, 10, 7];
const riff = (t0, half0, half1, g = 1, trem = 0) => RIFF.forEach((iv, q) => {
  if (iv == null) return; const r = (q < 4 ? half0 : half1).r, st = q < 4 || half0 === half1 ? iv : RIFF[q - 4] ?? 7;
  string(t0 + q * e8, r + st, e8 * (RIFF[q + 1] === null ? 1.9 : 1.05), { g: (q % 4 === 0 ? 1.15 : 0.9) * g, pan: -0.25, trem, bend: st === 10 ? into(-1, 0.09) : st === 12 ? shake(0.25, 0.12) : null });
});
// the lead, four bars: [bar, eighth, note, length in eighths, how it moves]
const LEAD = [
  [0, 0, 71, 3, into(-2, 0.16)], [0, 3, 67, 1], [0, 4, 64, 2], [0, 6, 67, 2, both(push(2, 0.05, 0.18), shake(0.3, 0.3))],
  [1, 0, 71, 2], [1, 2, 74, 1], [1, 3, 71, 1], [1, 4, 74, 4, both(push(2, 0.06, 0.2), shake(0.35, 0.4))],
  [2, 0, 76, 2, shake(0.3, 0.15)], [2, 2, 73, 1], [2, 3, 69, 1], [2, 4, 76, 4, x => 2 * smooth((x - 0.05) / 0.18) - 2 * smooth((x - 0.7) / 0.25)],
  [3, 0, 72, 2, into(-1, 0.1)], [3, 2, 71, 2], [3, 4, 75, 2, into(-1, 0.12)], [3, 6, 71, 2, both(shake(0.5, 0.1, 6.5), x => -1 * smooth((x - 0.3) / 0.2))],
];
const lead = (t0, n, g = 1) => LEAD.filter(l => l[0] === n % 4).forEach(([, q, m, len, bend]) => string(t0 + q * e8, m, len * e8 * 1.02, { g: 1.05 * g, pan: 0.3, bright: 0.9, drive: 2, send: 0.4, slap: 0.4, bend }));
// the second guitar: short muted chops on the off-beats
const chop = (t, c, g = 1) => [c.r + 12, c.r + 19, c.r + 24].forEach(m => string(t, m, 0.13, { g: 0.55 * g, pan: 0.55, mute: 0.012, bright: 0.7, slap: 0.2 }));
// the bass line, in eighths: root, root, octave, root, fifth, fifth, then two steps walking up into the next root
const bassBar = (t0, c0, c1, next, busy, g = 1) => {
  const line = c0 === c1 ? (busy ? [0, 12, 0, 12, 7, 12, "w2", "w1"] : [0, 0, 12, 0, 7, 7, "w2", "w1"]) : [0, 0, 12, 7, 0, 12, "w2", "w1"];
  line.forEach((s, q) => { const c = q < 4 ? c0 : c1; const m = s === "w2" ? next.b - 2 : s === "w1" ? next.b - 1 : c.b + s;
    bass(t0 + q * e8, m, e8 * 0.95, (q % 4 === 0 ? 1.1 : 0.85) * g); });
};
const fill = (t0, g = 1) => [8, 10, 12, 13, 14, 15].forEach((q, i) => (i < 2 ? snare(t0 + q * s16, (0.6 + i * 0.1) * g) : tom(t0 + q * s16, [150, 150, 115, 85][i - 2], (0.7 + i * 0.07) * g, [-0.3, -0.3, 0, 0.3][i - 2])));

for (let B = 0; B < BARS; B++) {
  const t0 = B * bar, s = section(t0 + 0.001), k = s.kind, n = B - s.from, last = B === s.to - 1;
  const c0 = chordAt(k, n, 0), c1 = chordAt(k, n, 1), ns = section(t0 + bar + 0.001), next = ns.kind === "end" ? CH.E : chordAt(ns.kind, B + 1 - ns.from, 0);
  const band = k === "groove" || k === "lift";
  if (band) {
    if (n === 0) crash(t0, k === "lift" ? 1 : 0.7);
    for (let q = 0; q < 8; q++) {
      const t = t0 + q * e8;
      if ([0, 3, 4].includes(q) || (k === "lift" && q === 7)) kick(t, q === 0 || q === 4 ? 1 : 0.8);
      if ((q === 2 || q === 6) && !(last && q === 6)) snare(t);
      if (!(last && q >= 4)) hat(t, q % 2 === 0 ? 1 : 0.6, k === "lift" && q === 7);
      if (k === "lift") { tamb(t, 0.8); tamb(t + s16, 0.45); }
      if (q % 2 === 1) chop(t, q < 4 ? c0 : c1, k === "lift" ? 1 : 0.85);
    }
    riff(t0, c0, c1, k === "lift" ? 0.8 : 1);
    bassBar(t0, c0, c1, next, k === "lift");
    if (k === "lift") lead(t0, n);
    if (last) fill(t0);
  }
  if (k === "intro") {
    riff(t0, c0, c1, 1.15, 0.45);
    if (n >= 1) for (let q = 0; q < 8; q++) hat(t0 + q * e8, q % 2 === 0 ? 0.9 : 0.5);
    if (n === 2) { [0, 2, 4, 6].forEach(q => kick(t0 + q * e8, 0.8)); bassBar(t0, c0, c1, CH.E, false, 0.9); [12, 13, 14, 15].forEach((q, i) => snare(t0 + q * s16, 0.5 + i * 0.15)); }
  }
  if (k === "hollow") {
    // the sizes are gone: the band drops out, one high note sags on the bar, the bass holds
    bass(t0, c0.b, bar * 0.95, 1); kick(t0, 0.7);
    if (n < 2) string(t0 + e8, [71, 67][n], bar * 0.9, { g: 1.1, pan: 0.2, bright: 0.9, drive: 2, send: 0.5, slap: 0.45, trem: 0.3, bend: both(x => -[2, 1][n] * smooth((x - 0.35) / 1.1), shake(0.25, 0.5, 5)) });
    else { for (let q = 0; q < 16; q++) string(t0 + q * s16, 59, s16 * 1.1, { g: 0.45 + q * 0.05, pan: 0.2, bright: 0.85, slap: 0.2 }); [8, 10, 12, 13, 14, 15].forEach((q, i) => tom(t0 + q * s16, [150, 150, 115, 115, 85, 85][i], 0.5 + i * 0.1, i / 3 - 0.8)); }
  }
  if (k === "slam") {
    if (n === 0) { [0, 8].forEach((q, h) => { const c = h ? c1 : c0, t = t0 + q * s16; strum(t, c.v, bar * (h ? 1.4 : 0.52), { g: 1.15, drive: 2.4, send: 0.45, bend: h ? shake(0.3, 0.5, 5.2) : null }); bass(t, c.b, beat * 1.9, 1.2); kick(t); crash(t, h ? 1 : 0.8); snare(t, 0.9); }); }
    else { [0, 4, 8, 10, 12, 13, 14, 15].forEach((q, i) => snare(t0 + q * s16, 0.45 + i * 0.08)); [0, 4, 8, 12].forEach(q => kick(t0 + q * s16, 0.8)); for (let q = 0; q < 8; q++) bass(t0 + q * e8, q < 6 ? c0.b : c0.b + [3, 4][q - 6], e8 * 0.95, 0.8 + q * 0.04); }
  }
  if (k === "outro") {
    if (n === 0) { strum(t0, c0.v, bar * 1.2, { g: 1.1, drive: 2.2, send: 0.45 }); bass(t0, 40, bar * 0.9, 1.2); kick(t0); crash(t0); string(t0 + 2 * e8, 74, 6 * e8, { g: 1.1, pan: 0.3, bright: 0.9, drive: 2, send: 0.45, slap: 0.4, bend: both(push(2, 0.06, 0.22), shake(0.35, 0.5)) }); }
    if (n === 1) { riff(t0, c0, c1, 0.9, 0.3); [0, 4].forEach(q => kick(t0 + q * e8, 0.8)); for (let q = 0; q < 8; q++) hat(t0 + q * e8, q % 2 === 0 ? 0.8 : 0.45); [[0, 40], [2, 40], [4, 43], [6, 45], [7, 47]].forEach(([q, m]) => bass(t0 + q * e8, m, e8 * (q === 6 ? 0.95 : 1.9), 0.9)); }
    if (n === 2) { strum(t0, c0.v, 5, { g: 1.15, drive: 2, send: 0.5, trem: 0.4, bend: both(into(-1, 0.25), shake(0.2, 1.2, 4.5)) }, 0.045); bass(t0, 40, 3.5, 1.2, into(-2, 0.2)); kick(t0); crash(t0, 0.8); }
  }
}
if (!noSfx) for (const e of SFX) FX[e.type]?.(e.f / FPS, e.g ?? 1, e.m ?? 0);

// ---- reverb, gentle glue, normalise ----
const combs = [1557, 1617, 1491, 1422].map(d => ({ d, buf: new Float32Array(d), i: 0, fb: 0.78 })), aps = [225, 556].map(d => ({ d, buf: new Float32Array(d), i: 0 }));
for (let i = 0; i < N; i++) { let x = rev[i] * 0.25, y = 0; for (const c of combs) { const o = c.buf[c.i]; c.buf[c.i] = x + o * c.fb; c.i = (c.i + 1) % c.d; y += o; }
  for (const a of aps) { const o = a.buf[a.i]; const v = -y + o; a.buf[a.i] = y + o * 0.5; a.i = (a.i + 1) % a.d; y = v; } L[i] += y * 0.5; R[i] += (i > 300 ? y : 0) * 0.5; }
const DRIVE = +(process.env.DRIVE || 1.6);
let peak = 0; for (let i = 0; i < N; i++) { L[i] = Math.tanh(L[i] * DRIVE); R[i] = Math.tanh(R[i] * DRIVE); peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i])); }
const fade = Math.floor(1.2 * SR), norm = process.env.NORM ? +process.env.NORM : 0.89 / peak * +(process.env.GAIN || 0.7);   // 0.7 lands the mix near -14 LUFS
const pcm = Buffer.alloc(44 + N * 4); const w = (o, s) => pcm.write(s, o);
w(0, "RIFF"); pcm.writeUInt32LE(36 + N * 4, 4); w(8, "WAVE"); w(12, "fmt "); pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(2, 22);
pcm.writeUInt32LE(SR, 24); pcm.writeUInt32LE(SR * 4, 28); pcm.writeUInt16LE(4, 32); pcm.writeUInt16LE(16, 34); w(36, "data"); pcm.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { const f = i > N - fade ? (N - i) / fade : 1; pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * norm * f)) * 32767), 44 + i * 4); pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * norm * f)) * 32767), 46 + i * 4); }
mkdirSync(out.replace(/\/[^/]*$/, "") || ".", { recursive: true }); writeFileSync(out, pcm);
console.log(`${out}: ${(N / SR).toFixed(1)} s, ${SFX.length} effects, peak before norm ${peak.toFixed(2)}, norm ${norm.toFixed(4)}`);
