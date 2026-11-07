// Came In's track: bright, bouncy, major key, made from nothing but maths
// (no rights question), with every effect on the picture's grid.
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
const put = (t, fn, dur, gain = 1, pan = 0, send = 0, ducked = false) => {
  const i0 = Math.floor(t * SR), n = Math.floor(dur * SR), gl = gain * Math.cos((pan + 1) * Math.PI / 4), gr = gain * Math.sin((pan + 1) * Math.PI / 4);
  for (let i = 0; i < n && i0 + i < N; i++) { if (i0 + i < 0) continue; const v = fn(i / SR, i); const d = ducked ? duck[i0 + i] : 1;
    L[i0 + i] += v * gl * d; R[i0 + i] += v * gr * d; if (send) rev[i0 + i] += v * send * gain * d; }
};
const svf = () => { let lo = 0, bp = 0; return (x, f, q = 0.7) => { const F = 2 * Math.sin(Math.PI * Math.min(f, SR / 6) / SR); lo += F * bp; const hi = x - lo - q * bp; bp += F * hi; return { lo, bp, hi }; }; };
const section = t => { const B = t / bar; return SECTIONS.find(s => B >= s.from && B < s.to) || { kind: "end" }; };

// ---- drums: a soft round kick, claps, a shaker, finger snaps ----
const kick = (t, g = 1) => {
  put(t, x => Math.sin(TAU * (50 * x + 70 * (1 - Math.exp(-x * 35)) / 35)) * Math.exp(-x * 9), 0.35, 0.75 * g);
  const i0 = Math.floor(t * SR); for (let i = 0; i < 0.22 * SR && i0 + i < N; i++) duck[i0 + i] = Math.min(duck[i0 + i], 1 - 0.35 * Math.exp(-i / SR / 0.08));
};
const clap = (t, g = 1) => { const f = svf(); put(t, x => { const e = [0, 0.009, 0.019].reduce((a, o) => a + (x >= o ? Math.exp(-(x - o) * 110) : 0), 0) + Math.exp(-x * 18) * 0.5; return f(rnd(), 1500, 1.1).bp * e * 1.8; }, 0.3, 0.36 * g, 0.05, 0.35); };
const shaker = (t, g = 1, pan = 0.3) => { const f = svf(); put(t, x => f(rnd(), 7500, 0.8).bp * Math.min(1, x / 0.012) * Math.exp(-x * 40), 0.09, 0.2 * g, pan); };
const snap = (t, g = 1) => { const f = svf(); put(t, x => f(rnd(), 2600, 0.6).bp * Math.exp(-x * 70) * 2, 0.12, 0.3 * g, -0.2, 0.4); };

// ---- melodic voices ----
const PROG = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]];   // C G Am F
const ROOT = [36, 31, 33, 29];
// marimba: sine + its 4th partial, wooden decay
const marimba = (t, m, g = 1, pan = 0) => put(t, x => (Math.sin(TAU * hz(m) * x) + 0.35 * Math.sin(TAU * hz(m) * 3.93 * x) * Math.exp(-x * 30)) * Math.exp(-x * 7) * Math.min(1, x / 0.002), 0.6, 0.2 * g, pan, 0.25, true);
// glockenspiel: bright bell partials, long ring
const glock = (t, m, g = 1, pan = 0) => put(t, x => { const f0 = hz(m); return (Math.sin(TAU * f0 * x) + 0.5 * Math.sin(TAU * f0 * 2.76 * x) * Math.exp(-x * 6) + 0.25 * Math.sin(TAU * f0 * 5.4 * x) * Math.exp(-x * 12)) * Math.exp(-x * 3.2) * Math.min(1, x / 0.001); }, 1.4, 0.12 * g, pan, 0.4);
// bouncy bass: rounded square, short
const bass = (t, m, dur, g = 1) => { const f = svf(); put(t, x => { const e = Math.min(1, x / 0.005) * Math.exp(-x * 5); const s = Math.sin(TAU * hz(m) * x) + 0.35 * Math.tanh(4 * Math.sin(TAU * hz(m) * x)); return f(s, 900, 0.6).lo * e; }, dur, 0.5 * g, 0, 0, true); };
// soft pad chord: two detuned triangles
const tri = (f, x) => 2 * Math.abs(2 * ((f * x) % 1) - 1) - 1;
const pad = (t, notes, dur, g = 1) => put(t, x => { const env = Math.min(1, x / 0.3) * Math.min(1, (dur - x) / 0.4); let s = 0; for (const m of notes) s += tri(hz(m) * 1.003, x) + tri(hz(m) * 0.997, x); return s / (notes.length * 2) * env; }, dur, 0.09 * g, 0, 0.4, true);

// ---- effects ----
const swoosh = (t, g = 1) => { const d = 0.32, f = svf(); put(t - d * 0.75, x => { const k = x / d; return f(rnd(), 600 + 6000 * k * k, 1.2).bp * Math.sin(Math.PI * k) ** 2 * 1.5; }, d, 0.32 * g, 0.3, 0.2); };
const pop = (t, g = 1) => put(t, x => Math.sin(TAU * (500 * x + 3000 * x * x)) * Math.exp(-x * 35), 0.12, 0.35 * g, 0, 0.2);
const boing = (t, g = 1) => put(t, x => Math.sin(TAU * (180 * x + 120 * Math.sin(x * 30) / 30 * 6)) * Math.exp(-x * 4) * 0.8, 0.7, 0.3 * g, 0, 0.2);
const tapclick = (t, g = 1) => put(t, x => Math.sin(TAU * 1800 * x) * Math.exp(-x * 160) + rnd() * Math.exp(-x * 400) * 0.3, 0.05, 0.3 * g);
const chime = (t, g = 1) => [84, 88, 91].forEach((m, i) => glock(t + i * 0.07, m, 1.3 * g, i - 1));
// the shop bell: a struck handbell, inharmonic partials, long ring, struck twice like a door bell
const bell = (t, g = 1) => [0, 0.16].forEach((o, k) => put(t + o, x => { const f0 = k ? 1318.5 : 1568; return (Math.sin(TAU * f0 * x) + 0.6 * Math.sin(TAU * f0 * 2.4 * x) * Math.exp(-x * 4) + 0.4 * Math.sin(TAU * f0 * 0.5 * x) + 0.3 * Math.sin(TAU * f0 * 3.9 * x) * Math.exp(-x * 9)) * Math.exp(-x * 2.4) * Math.min(1, x / 0.0008); }, 2.2, 0.17 * g, k ? 0.2 : -0.2, 0.5));
const confetti = (t, g = 1) => { for (let i = 0; i < 10; i++) glock(t + i * 0.045, [79, 84, 88, 91, 96][i % 5] + (i > 4 ? 12 : 0), 0.5 * g, (i % 3) - 1); };
const FX = { swoosh, pop, boing, tapclick, chime, bell, confetti };

// ---- the arrangement ----
const HOOK = [76, 79, 81, 79, 76, 72, 74, 76];      // the glock tune, eighths over two bars
for (let B = 0; B < BARS; B++) {
  const t0 = B * bar, s = section(t0 + 0.001), k = s.kind, ci = B % 4, ch = PROG[ci], last = B === s.to - 1;
  const groove = k === "verse" || k === "chorus";
  for (let q = 0; q < 16; q++) {
    const t = t0 + q * s16;
    if (groove && (q === 0 || q === 8 || (k === "chorus" && (q === 4 || q === 12)) || q === 10)) kick(t, q === 10 ? 0.6 : 1);
    if (groove && (q === 4 || q === 12)) clap(t);
    if ((groove || k === "intro") && q % 2 === 0) shaker(t, q % 4 === 2 ? 1 : 0.55);
    if (k === "intro" && (q === 4 || q === 12) && B >= 2) snap(t);
    if (groove && [0, 3, 6, 8, 11, 14].includes(q)) bass(t, ROOT[ci] + ([6, 14].includes(q) ? 12 : 0), s16 * 1.8);
    // marimba: off-beat chord bounce
    if ((groove || k === "intro") && [2, 6, 10, 14].includes(q)) ch.forEach((m, j) => marimba(t, m + 12, 0.7, j - 1));
    if (k === "chorus" && q % 2 === 0) { const arp = [ch[0] + 24, ch[1] + 24, ch[2] + 24, ch[1] + 24]; marimba(t, arp[(q / 2) % 4], 0.55, q % 4 ? 0.5 : -0.5); }
    // glock hook in the chorus and the intro's second half
    if ((k === "chorus" || (k === "intro" && B >= 2)) && q % 2 === 0) { const n = HOOK[((B % 2) * 8 + q / 2) % 8 + 0]; if ((q / 2) % 4 !== 3 || k === "chorus") glock(t, n + (B % 4 === 3 ? -2 : 0), k === "intro" ? 0.7 : 1, 0.25); }
    if (k === "break" && q % 4 === 0) { snap(t, 0.5 + q / 16); marimba(t, ch[q / 4 % 3] + 24, 0.8); }
  }
  if (k === "intro" || k === "break" || k === "outro") pad(t0, ch, bar + 0.3, k === "outro" ? 1.4 : 1);
  if (k === "verse") pad(t0, ch, bar, 0.6);
  if (k === "outro" && B === s.from) { kick(t0); ch.concat(ch[0] + 12).forEach((m, j) => glock(t0 + j * 0.05, m + 12, 1.2, j - 1)); bass(t0, ROOT[0], 1.2); }
}
if (!noSfx) for (const e of SFX) FX[e.type]?.(e.f / FPS, e.g ?? 1);

// ---- reverb, gentle glue, normalise ----
const combs = [1557, 1617, 1491, 1422].map(d => ({ d, buf: new Float32Array(d), i: 0, fb: 0.78 })), aps = [225, 556].map(d => ({ d, buf: new Float32Array(d), i: 0 }));
for (let i = 0; i < N; i++) { let x = rev[i] * 0.25, y = 0; for (const c of combs) { const o = c.buf[c.i]; c.buf[c.i] = x + o * c.fb; c.i = (c.i + 1) % c.d; y += o; }
  for (const a of aps) { const o = a.buf[a.i]; const v = -y + o; a.buf[a.i] = y + o * 0.5; a.i = (a.i + 1) % a.d; y = v; } L[i] += y * 0.5; R[i] += (i > 300 ? y : 0) * 0.5; }
const DRIVE = +(process.env.DRIVE || 1.6);
let peak = 0; for (let i = 0; i < N; i++) { L[i] = Math.tanh(L[i] * DRIVE); R[i] = Math.tanh(R[i] * DRIVE); peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i])); }
const fade = Math.floor(1.2 * SR), norm = 0.89 / peak * +(process.env.GAIN || 0.7);   // 0.7 lands the mix near -14 LUFS
const pcm = Buffer.alloc(44 + N * 4); const w = (o, s) => pcm.write(s, o);
w(0, "RIFF"); pcm.writeUInt32LE(36 + N * 4, 4); w(8, "WAVE"); w(12, "fmt "); pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(2, 22);
pcm.writeUInt32LE(SR, 24); pcm.writeUInt32LE(SR * 4, 28); pcm.writeUInt16LE(4, 32); pcm.writeUInt16LE(16, 34); w(36, "data"); pcm.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { const f = i > N - fade ? (N - i) / fade : 1; pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * norm * f)) * 32767), 44 + i * 4); pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * norm * f)) * 32767), 46 + i * 4); }
mkdirSync(out.replace(/\/[^/]*$/, "") || ".", { recursive: true }); writeFileSync(out, pcm);
console.log(`${out}: ${(N / SR).toFixed(1)} s, ${SFX.length} effects, peak before norm ${peak.toFixed(2)}`);
