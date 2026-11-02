// Building blocks for the demo edit: a camera on a phone recording, kinetic
// type, flashes and shakes on hits, the backdrop, and phones playing shorts.
import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame, Easing, random } from "remotion";
import { loadFont as anton } from "@remotion/google-fonts/Anton";
import { loadFont as inter } from "@remotion/google-fonts/Inter";
import { loadFont as mono } from "@remotion/google-fonts/JetBrainsMono";

export const HEAVY = anton("normal", { subsets: ["latin"] }).fontFamily;
export const SANS = inter("normal", { weights: ["500", "700", "900"], subsets: ["latin"] }).fontFamily;
export const MONO = mono("normal", { weights: ["500", "700"], subsets: ["latin"] }).fontFamily;
export const GOLD = "#f2c230", INK = "#0b0a08", CREAM = "#fbf6ea";

// Easings: snap (fast in-out, for whips), out (settle), punch (overshoot).
export const snap = Easing.bezier(0.83, 0, 0.17, 1), out = Easing.bezier(0.16, 1, 0.3, 1), punch = Easing.bezier(0.34, 1.56, 0.64, 1), lin = t => t;
// Keyframes: [[frame, value, easing-into-this-point?], ...]; values are numbers or flat objects.
export const kf = (f, pts) => {
  if (f <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (f <= pts[i][0]) {
    const [a, va] = pts[i - 1], [b, vb, e = snap] = pts[i]; const t = e(Math.max(0, Math.min(1, (f - a) / (b - a || 1))));
    if (typeof va === "number") return va + (vb - va) * t;
    const o = {}; for (const k of new Set([...Object.keys(va), ...Object.keys(vb)])) { const x = va[k] ?? 0, y = vb[k] ?? x; o[k] = x + (y - x) * t; } return o;
  }
  return pts[pts.length - 1][1];
};
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));

// ---- the camera on a phone recording -------------------------------------
// view(f) → { x, y, s, rx, ry, rz }: the source pixel (x, y) sits at the frame's
// centre, s frame pixels per source pixel; the phone's bezel is drawn around the
// recording, so zooming out reveals the phone and zooming in loses it.
// segs: [{ at, from, rate }] which part of the recording plays from local frame `at`.
export const Shot = ({ src, segs, view, dur, w = 1080, h = 1920, children, glow = 1 }) => {
  const f = useCurrentFrame();
  const v = { rx: 0, ry: 0, rz: 0, ...view(f) }, p = { ...v, ...view(f - 1) };
  const vel = Math.hypot((v.x - p.x) * v.s, (v.y - p.y) * v.s) + Math.abs(Math.log(v.s / p.s)) * 1400;
  const blur = clamp((vel - 30) / 14, 0, 16);
  const R = 120;
  return (
    <AbsoluteFill style={{ perspective: 2400 }}>
      <div style={{ position: "absolute", left: 960, top: 540, transformStyle: "preserve-3d",
        transform: `rotateX(${v.rx}deg) rotateY(${v.ry}deg) rotateZ(${v.rz}deg)`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>
        <div style={{ position: "absolute", transformOrigin: "0 0", transform: `scale(${v.s}) translate(${-v.x}px, ${-v.y}px)` }}>
          <div style={{ position: "absolute", left: -44, top: -44, width: w + 88, height: h + 88, borderRadius: R + 44, background: "linear-gradient(150deg,#3a3326,#141210 40%,#0d0c0a 70%,#2c271d)",
            boxShadow: `0 0 0 4px #4a4130, 0 80px 160px rgba(0,0,0,.7), 0 0 ${220 * glow}px rgba(242,194,48,${0.22 * glow})` }} />
          <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, borderRadius: R, overflow: "hidden", background: CREAM }}>
            {segs.map((g, i) => { const end = segs[i + 1]?.at ?? dur ?? 100000; return (
              <Sequence key={i} from={g.at} durationInFrames={Math.max(1, end - g.at)} layout="none">
                <OffthreadVideo src={staticFile(src)} trimBefore={Math.round(g.from * 30)} playbackRate={g.rate ?? 1} muted style={{ width: w, height: h, position: "absolute" }} />
              </Sequence>); })}
            {children}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
// Where to put the camera so the whole phone shows at height `ph` px, its centre at frame x `cx`.
export const whole = (ph = 900, cx = 960, cy = 540, h = 1920, w = 1080) => { const s = ph / (h + 88); return { s, x: w / 2 - (cx - 960) / s, y: h / 2 - (cy - 540) / s }; };
// A close-up: source point (x, y) at frame centre with s.
export const at = (x, y, s, extra = {}) => ({ x, y, s, ...extra });

// A ring that blooms where a press lands (source coordinates, inside a Shot's children).
export const Press = ({ x, y, at: a, size = 120 }) => {
  const f = useCurrentFrame() - a; if (f < 0 || f > 18) return null;
  const k = out(f / 18);
  return <div style={{ position: "absolute", left: x - size, top: y - size, width: size * 2, height: size * 2, borderRadius: "50%",
    border: `${10 * (1 - k)}px solid ${GOLD}`, transform: `scale(${0.3 + k * 1.2})`, opacity: 1 - k, boxShadow: `0 0 40px ${GOLD}` }} />;
};

// ---- type ------------------------------------------------------------------
// One word (or line) at a time, slamming in on its frame. items: [{ t, at, gold, size }]
export const Slam = ({ items, x = 960, y = 540, size = 200, until, align = "center", color = CREAM, font = HEAVY, tilt = 0 }) => {
  const f = useCurrentFrame();
  const cur = [...items].reverse().find(it => f >= it.at);
  if (!cur || (until != null && f >= until)) return null;
  const k = f - cur.at, s = cur.size ?? size;
  const sc = 1 + 0.9 * Math.exp(-k / 2.2), op = clamp(k / 2), bl = 10 * Math.exp(-k / 1.5);
  const tx = align === "left" ? "0" : align === "right" ? "-100%" : "-50%";
  return <div style={{ position: "absolute", left: x, top: y, transform: `translate(${tx}, -50%) scale(${sc}) rotate(${tilt}deg)`, transformOrigin: align === "left" ? "0 50%" : align === "right" ? "100% 50%" : "50% 50%",
    fontFamily: font, fontSize: s, lineHeight: 0.92, color: cur.gold ? GOLD : color, opacity: op, filter: bl > 0.4 ? `blur(${bl}px)` : undefined, whiteSpace: "pre", textAlign: align,
    letterSpacing: font === HEAVY ? "0.01em" : 0, textTransform: "uppercase",
    textShadow: cur.gold ? `0 0 40px rgba(242,194,48,.55), 0 6px 0 rgba(0,0,0,.35)` : `0 6px 0 rgba(0,0,0,.35), 0 0 30px rgba(0,0,0,.4)` }}>{cur.t}</div>;
};
// Words that pile up into a line, each popping in on its beat. words: [{ t, at, gold }]
export const Build = ({ words, x = 960, y = 540, size = 120, until, align = "center", gap = 0.28, color = CREAM, lineHeight = 1 }) => {
  const f = useCurrentFrame(); if (until != null && f >= until) return null;
  const tx = align === "left" ? "0" : align === "right" ? "-100%" : "-50%";
  return <div style={{ position: "absolute", left: x, top: y, transform: `translate(${tx}, -50%)`, fontFamily: HEAVY, fontSize: size, lineHeight, textTransform: "uppercase", textAlign: align, maxWidth: 1700, color }}>
    {words.map((w, i) => { const k = f - w.at; if (w.br) return <br key={i} />; const vis = k >= 0;
      return <span key={i} style={{ display: "inline-block", marginRight: `${gap}em`, opacity: vis ? clamp(k / 2) : 0, color: w.gold ? GOLD : undefined,
        transform: vis ? `translateY(${30 * Math.exp(-k / 2)}px) scale(${1 + 0.5 * Math.exp(-k / 2)})` : "none",
        textShadow: w.gold ? "0 0 36px rgba(242,194,48,.5)" : "0 5px 0 rgba(0,0,0,.35)" }}>{w.t}</span>; })}
  </div>;
};
// A small label, typed out a character every frame.
export const Typed = ({ t, at: a = 0, x, y, size = 30, color = GOLD, font = MONO, align = "left", cps = 1.6 }) => {
  const f = useCurrentFrame() - a; if (f < 0) return null; const n = Math.floor(f * cps);
  return <div style={{ position: "absolute", left: x, top: y, fontFamily: font, fontSize: size, color, whiteSpace: "pre", transform: align === "center" ? "translateX(-50%)" : undefined, textShadow: "0 2px 8px rgba(0,0,0,.6)" }}>
    {t.slice(0, n)}<span style={{ opacity: n < t.length || Math.floor(f / 8) % 2 ? 1 : 0 }}>▌</span></div>;
};

// ---- hits ------------------------------------------------------------------
export const Flash = ({ at: hits, color = "#fff", len = 9, max = 0.85 }) => {
  const f = useCurrentFrame(); let o = 0;
  for (const h of hits) { const k = f - h; if (k >= 0 && k < len) o = Math.max(o, max * Math.pow(1 - k / len, 2)); }
  return o > 0.01 ? <AbsoluteFill style={{ background: color, opacity: o, mixBlendMode: "screen", pointerEvents: "none" }} /> : null;
};
// Shakes its children after each hit.
export const Shake = ({ hits, amp = 22, children }) => {
  const f = useCurrentFrame(); let dx = 0, dy = 0, r = 0;
  for (const h of hits) { const k = f - h; if (k >= 0 && k < 14) { const d = amp * Math.exp(-k / 3.5); dx += (random(`x${h}${k}`) - 0.5) * 2 * d; dy += (random(`y${h}${k}`) - 0.5) * 2 * d; r += (random(`r${h}${k}`) - 0.5) * d * 0.05; } }
  return <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px) rotate(${r}deg)` }}>{children}</AbsoluteFill>;
};
// Punches its children in scale on each beat listed (a "bump").
export const Bump = ({ hits, amt = 0.06, children }) => {
  const f = useCurrentFrame(); let s = 1;
  for (const h of hits) { const k = f - h; if (k >= 0 && k < 12) s += amt * Math.exp(-k / 2.5); }
  return <AbsoluteFill style={{ transform: `scale(${s})` }}>{children}</AbsoluteFill>;
};

// ---- the backdrop: dark, a gold glow that pulses on the kick, a moving floor grid, dust ----
export const Backdrop = ({ pulse = true, tone = 1, start = 0 }) => {
  const f = useCurrentFrame(), g = f + start;
  const kick = pulse ? Math.exp(-(g % 15) / 4) : 0;
  const dots = Array.from({ length: 46 }, (_, i) => { const sp = 0.4 + random(`s${i}`) * 1.4; const yy = (random(`y${i}`) * 1200 - g * sp * 2) % 1200;
    return <div key={i} style={{ position: "absolute", left: random(`x${i}`) * 1920, top: (yy < 0 ? yy + 1200 : yy) - 60, width: 3 + random(`r${i}`) * 5, height: 3 + random(`r${i}`) * 5, borderRadius: "50%",
      background: GOLD, opacity: 0.15 + random(`o${i}`) * 0.35, filter: "blur(1px)" }} />; });
  return <AbsoluteFill style={{ background: INK, overflow: "hidden" }}>
    <AbsoluteFill style={{ background: `radial-gradient(60% 70% at 50% 55%, rgba(242,194,48,${(0.16 + 0.1 * kick) * tone}), rgba(242,194,48,0) 70%)` }} />
    <AbsoluteFill style={{ perspective: 600 }}>
      <div style={{ position: "absolute", left: -1000, right: -1000, top: 640, height: 1400, transform: "rotateX(72deg)", transformOrigin: "50% 0",
        backgroundImage: `linear-gradient(rgba(242,194,48,${0.22 * tone}) 2px, transparent 2px), linear-gradient(90deg, rgba(242,194,48,${0.22 * tone}) 2px, transparent 2px)`,
        backgroundSize: "120px 120px", backgroundPosition: `0 ${(g * 6) % 120}px`, maskImage: "linear-gradient(to bottom, transparent, black 40%, black)" }} />
    </AbsoluteFill>
    {dots}
    <AbsoluteFill style={{ background: "radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(0,0,0,.75))" }} />
  </AbsoluteFill>;
};
// Film grain and a vignette over everything.
export const Grain = () => { const f = useCurrentFrame();
  return <AbsoluteFill style={{ pointerEvents: "none", opacity: 0.07, mixBlendMode: "overlay",
    backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='${f % 12}'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>")` }} />; };

// ---- a small phone playing a short ------------------------------------------
export const Mini = ({ src, h = 640, from = 0, rate = 1, style = {}, glow = 0.6, label }) => {
  const w = h * 9 / 16, r = h * 0.07;
  return <div style={{ position: "absolute", width: w, height: h, ...style }}>
    <div style={{ position: "absolute", inset: -h * 0.022, borderRadius: r + h * 0.022, background: "linear-gradient(150deg,#3a3326,#141210 40%,#0d0c0a 70%,#2c271d)",
      boxShadow: `0 0 0 2px #4a4130, 0 40px 80px rgba(0,0,0,.6), 0 0 ${120 * glow}px rgba(242,194,48,${0.25 * glow})` }} />
    <div style={{ position: "absolute", inset: 0, borderRadius: r, overflow: "hidden", background: "#000" }}>
      <OffthreadVideo src={staticFile(src)} trimBefore={Math.round(from * 30)} playbackRate={rate} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
    {label ? <div style={{ position: "absolute", left: 0, right: 0, bottom: -h * 0.075, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: h * 0.034, color: CREAM, opacity: 0.85 }}>{label}</div> : null}
  </div>;
};

// A clearly marked hole for a recording only the boss can make.
export const Slate = ({ title, note, dur }) => { const f = useCurrentFrame();
  return <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
    <div style={{ width: 1300, height: 640, border: `6px dashed ${GOLD}`, borderRadius: 40, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 30,
      background: "rgba(0,0,0,.55)", fontFamily: MONO, color: CREAM, textAlign: "center", transform: `scale(${1 + 0.03 * Math.exp(-f / 4)})` }}>
      <div style={{ fontSize: 34, color: GOLD, letterSpacing: "0.2em" }}>PLACEHOLDER · BOSS RECORDING</div>
      <div style={{ fontFamily: HEAVY, fontSize: 96, textTransform: "uppercase", lineHeight: 1 }}>{title}</div>
      <div style={{ fontSize: 30, opacity: 0.8, maxWidth: 1100, lineHeight: 1.4 }}>{note}</div>
      {dur ? <div style={{ fontSize: 26, opacity: 0.6 }}>{dur}</div> : null}
    </div>
  </AbsoluteFill>; };
