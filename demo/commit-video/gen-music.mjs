// The demo's soundtrack and sound effects, made from nothing but maths, so
// there is no rights question and every hit is on the picture's grid.
// node gen-music.mjs [out.wav] [--nosfx]
import { writeFileSync, mkdirSync } from "node:fs";
import { FPS, BPM, BARS, SECTIONS, TAIL } from "./src/timeline.js";
import { SFX } from "./src/scenes.js";

const SR = 44100, beat = 60 / BPM, bar = beat * 4, s16 = beat / 4;
const LEN = (BARS * bar) + TAIL / FPS + 1;
const N = Math.ceil(LEN * SR);
const L = new Float32Array(N), R = new Float32Array(N), rev = new Float32Array(N), duck = new Float32Array(N).fill(1);
const out = process.argv[2] || "public/music.wav", noSfx = process.argv.includes("--nosfx");

// ---- tiny helpers ----
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647 * 2 - 1;
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
const put = (t, fn, dur, gain = 1, pan = 0, send = 0, ducked = false) => {
  const i0 = Math.floor(t * SR), n = Math.floor(dur * SR), gl = gain * Math.cos((pan + 1) * Math.PI / 4), gr = gain * Math.sin((pan + 1) * Math.PI / 4);
  for (let i = 0; i < n && i0 + i < N; i++) { if (i0 + i < 0) continue; const v = fn(i / SR, i); const d = ducked ? duck[i0 + i] : 1;
    L[i0 + i] += v * gl * d; R[i0 + i] += v * gr * d; if (send) rev[i0 + i] += v * send * gain * d; }
};
// Chamberlin state-variable filter; returns a stepper
const svf = () => { let lo = 0, bp = 0; return (x, f, q = 0.7) => { const F = 2 * Math.sin(Math.PI * Math.min(f, SR / 6) / SR); lo += F * bp; const hi = x - lo - q * bp; bp += F * hi; return { lo, bp, hi }; }; };
const section = t => { const b = t / bar; return SECTIONS.find(s => b >= s.from && b < s.to) || { kind: "end" }; };

// ---- kick (and the sidechain it drives) ----
const kick = (t, g = 1) => {
  put(t, (x) => { const f = 45 + 110 * Math.exp(-x * 28); const ph = 2 * Math.PI * (45 * x + 110 * (1 - Math.exp(-x * 28)) / 28);
    return Math.tanh(1.6 * Math.sin(ph) * Math.exp(-x * 7.5)) + (x < 0.004 ? rnd() * 0.4 : 0); }, 0.45, 0.95 * g);
  const i0 = Math.floor(t * SR); for (let i = 0; i < 0.3 * SR && i0 + i < N; i++) duck[i0 + i] = Math.min(duck[i0 + i], 1 - 0.75 * Math.exp(-i / SR / 0.09));
};
const snare = (t, g = 1) => { const f = svf(); put(t, (x) => { const n = f(rnd(), 1800, 0.9).bp * 1.6; return (n * Math.exp(-x * 16) + 0.5 * Math.sin(2 * Math.PI * 190 * x) * Math.exp(-x * 30)); }, 0.3, 0.5 * g, 0, 0.35); };
const clap = (t, g = 1) => { const f = svf(); put(t, (x) => { const e = [0, 0.011, 0.022].reduce((a, o) => a + (x >= o ? Math.exp(-(x - o) * 90) : 0), 0) + Math.exp(-x * 14) * 0.5; return f(rnd(), 1300, 1.2).bp * e * 1.8; }, 0.35, 0.38 * g, 0, 0.4); };
const hat = (t, open = false, g = 1, pan = 0) => { let p = 0; put(t, (x) => { const r = rnd(); const h = r - p; p = r; return h * Math.exp(-x * (open ? 9 : 55)); }, open ? 0.35 : 0.08, (open ? 0.13 : 0.16) * g, pan); };

// ---- bass: octave-bouncing saw + sub, pumped by the kick ----
const PROG = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];   // Am F C G (A3 voicings)
const ROOT = [33, 29, 36, 31];                                           // A1 F1 C2 G1
const saw = (f, x) => 2 * ((f * x) % 1) - 1;
const bassNote = (t, m, dur, cut = 600, g = 1) => { const f = svf(); const fr = hz(m);
  put(t, (x) => { const env = Math.min(1, x / 0.004) * Math.exp(-x * 3); const s = saw(fr, x) + 0.6 * saw(fr * 1.005, x);
    return Math.tanh(1.4 * f(s, cut * (0.4 + 2 * Math.exp(-x * 14)), 0.4).lo) * env + 0.7 * Math.sin(2 * Math.PI * fr * x) * env; }, dur, 0.42 * g, 0, 0, true); };
// ---- supersaw stab ----
const stab = (t, notes, dur, cut, g = 1, pan = 0) => { const fl = svf(), fr2 = svf(); const det = [-0.012, -0.005, 0, 0.006, 0.013];
  put(t, (x) => { const env = Math.min(1, x / 0.003) * Math.exp(-x * 9); let s = 0; for (const m of notes) for (const d of det) s += saw(hz(m) * (1 + d), x + d * 3); s /= notes.length * det.length;
    return fl(s, cut * (0.6 + 1.2 * Math.exp(-x * 20)), 0.5).lo * env * 2.2; }, dur, 0.34 * g, pan, 0.3, true); };
const pluck = (t, m, g = 1, pan = 0) => { const f = svf(); put(t, (x) => { const env = Math.exp(-x * 14); const s = (Math.sin(2 * Math.PI * hz(m) * x) > 0 ? 1 : -1) * 0.5 + saw(hz(m) * 2.002, x) * 0.3;
  return f(s, 2400 * Math.exp(-x * 6) + 400, 0.6).lo * env; }, 0.25, 0.16 * g, pan, 0.35, true); };
const pad = (t, notes, dur, g = 1) => { const f = svf(); put(t, (x) => { const env = Math.min(1, x / 0.6) * Math.min(1, (dur - x) / 0.8); let s = 0;
  for (const m of notes) for (const d of [-0.004, 0.004]) s += saw(hz(m) * (1 + d), x); return f(s / (notes.length * 2), 900, 0.3).lo * env; }, dur, 0.22 * g, 0, 0.5); };

// ---- effects ----
const riser = (t, dur, g = 1) => { const f = svf(); put(t, (x) => { const k = x / dur; return f(rnd(), 300 + 9000 * k * k, 0.25).bp * k * k * 1.4 + 0.15 * Math.sin(2 * Math.PI * (200 * x + 900 * x * x / dur)) * k; }, dur, 0.5 * g, 0, 0.3); };
const impact = (t, g = 1) => { put(t, (x) => { const ph = 2 * Math.PI * (32 * x + 40 * (1 - Math.exp(-x * 6)) / 6); return Math.tanh(2 * Math.sin(ph)) * Math.exp(-x * 2.2); }, 1.8, 0.9 * g);
  let p = 0; put(t, (x) => { const r = rnd(); const h = r - p; p = r; return h * Math.exp(-x * 3.2); }, 1.6, 0.35 * g, 0, 0.6); };
const whoosh = (t, g = 1, up = true) => { const d = 0.42, f = svf(); put(t - d * 0.7, (x) => { const k = x / d, e = Math.sin(Math.PI * k) ** 2;
  return f(rnd(), up ? 400 + 5000 * k * k : 5400 - 5000 * k, 1.1).bp * e * 1.6; }, d, 0.42 * g, up ? -0.5 + 1 * 0 : 0.3, 0.2); };
const tick = (t, g = 1) => put(t, (x) => Math.sin(2 * Math.PI * 2100 * x) * Math.exp(-x * 140) + Math.sin(2 * Math.PI * 1050 * x) * Math.exp(-x * 90) * 0.4, 0.06, 0.28 * g);
const pop = (t, g = 1, m = 84) => put(t, (x) => Math.sin(2 * Math.PI * (hz(m) * x + 400 * x * x * 0)) * Math.exp(-x * 30) * Math.min(1, x / 0.002), 0.15, 0.22 * g, 0, 0.25);
const swish = (t, g = 1) => whoosh(t + 0.1, 0.6 * g, false);
const glitch = (t, g = 1) => { put(t, (x, i) => (Math.floor(i / 220) % 2 ? 1 : -1) * Math.sin(2 * Math.PI * 140 * x) * 0.6 + rnd() * 0.3 * ((Math.floor(i / 900) % 2)), 0.18, 0.3 * g); };
const tape = (t, g = 1) => put(t, (x) => saw(110 * Math.exp(-x * 4), x) * Math.exp(-x * 2) * 0.5, 0.6, 0.25 * g);
const FX = { whoosh, swish, impact, tick, pop, glitch, riser: (t, g, d) => riser(t, d || 2 * bar, g), tape, kick, snare: clap };

// ---- the arrangement ----
for (let B = 0; B < BARS; B++) {
  const t0 = B * bar, s = section(t0 + 0.001), k = s.kind, ci = B % 4, ch = PROG[ci], local = B - s.from, last = B === s.to - 1;
  const full = k === "drop" || k === "drop2";
  for (let q = 0; q < 16; q++) {
    const t = t0 + q * s16;
    if (full && q % 4 === 0) kick(t);
    if (full && (q === 4 || q === 12)) { clap(t); snare(t, 0.5); }
    if ((full || (k === "intro" && B >= 2)) && q % 2 === 0) hat(t, false, q % 4 === 2 ? 1 : 0.6, 0.2);
    if (full && q % 4 === 2) hat(t, true, 0.9, -0.2);
    if (k === "drop2" && q % 2 === 1) hat(t, false, 0.35, 0.3);
    if (full && q % 2 === 0) bassNote(t, ROOT[ci] + (q % 4 === 2 ? 12 : 0), s16 * 2 - 0.01, k === "drop2" ? 900 : 700);
    if (full && [3, 6, 10, 14].includes(q)) stab(t, ch, 0.3, k === "drop2" ? 4200 : 3000, 1, q % 2 ? 0.25 : -0.25);
    if (k === "intro" && [3, 6, 10, 14].includes(q)) stab(t, ch, 0.3, 350 + 2600 * ((B * 16 + q) / 64) ** 2, 0.8);
    if (k === "drop2") { const arp = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[1] + 24]; pluck(t, arp[q % 4], 0.8, q % 2 ? 0.4 : -0.4); }
    if (k === "break") { if (q % 4 === 0) bassNote(t, ROOT[ci], s16 * 3, 300, 0.6); if (last && B % 1 === 0) snare(t, 0.25 + 0.75 * q / 16); else if (q % 4 === 0) snare(t, 0.25); }
    if (k === "intro" && B === 3) snare(t, 0.2 + 0.8 * q / 16);
  }
  if (k === "break" || k === "outro" || k === "intro") pad(t0, ch.map(m => m - 12), bar + 0.4, k === "outro" ? 1.3 : 1);
  if (k === "break" && local === 0) riser(t0, 2 * bar);
  if (k === "intro" && B === 0) riser(t0, 4 * bar, 0.8);
  if ((full) && local === 0) impact(t0);
  if (k === "outro" && local === 0) { impact(t0, 1.1); kick(t0); stab(t0, PROG[0].map(m => m + 12), 1.2, 3500, 1.3); }
  if (full && local % 8 === 0 && local > 0) hat(t0, true, 1.5); // crash-ish lift every 8 bars
}
if (!noSfx) for (const e of SFX) FX[e.type]?.(e.f / FPS, e.g ?? 1, e.d);

// ---- reverb (Schroeder) on the send, then glue and limit ----
const combs = [1557, 1617, 1491, 1422].map(d => ({ d, buf: new Float32Array(d), i: 0, fb: 0.8 })), aps = [225, 556].map(d => ({ d, buf: new Float32Array(d), i: 0 }));
for (let i = 0; i < N; i++) { let x = rev[i] * 0.25, y = 0; for (const c of combs) { const o = c.buf[c.i]; c.buf[c.i] = x + o * c.fb; c.i = (c.i + 1) % c.d; y += o; }
  for (const a of aps) { const o = a.buf[a.i]; const v = -y + o; a.buf[a.i] = y + o * 0.5; a.i = (a.i + 1) % a.d; y = v; } L[i] += y * 0.55; R[i] += (i > 300 ? y : 0) * 0.55; }
let peak = 0; for (let i = 0; i < N; i++) { L[i] = Math.tanh(L[i] * 1.15); R[i] = Math.tanh(R[i] * 1.15); peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i])); }
const fade = Math.floor(0.8 * SR), norm = 0.89 / peak;
const pcm = Buffer.alloc(44 + N * 4); const w = (o, s) => pcm.write(s, o);
w(0, "RIFF"); pcm.writeUInt32LE(36 + N * 4, 4); w(8, "WAVE"); w(12, "fmt "); pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(2, 22);
pcm.writeUInt32LE(SR, 24); pcm.writeUInt32LE(SR * 4, 28); pcm.writeUInt16LE(4, 32); pcm.writeUInt16LE(16, 34); w(36, "data"); pcm.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { const f = i > N - fade ? (N - i) / fade : 1; pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * norm * f)) * 32767), 44 + i * 4); pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * norm * f)) * 32767), 46 + i * 4); }
mkdirSync(out.replace(/\/[^/]*$/, "") || ".", { recursive: true }); writeFileSync(out, pcm);
console.log(`${out}: ${(N / SR).toFixed(1)} s, ${SFX.length} effects, peak before norm ${peak.toFixed(2)}`);
