// The Sizecurve explainer: a rail of tees, the middle sizes sell out, the app flags it
// and gives the order size by size. The site's own colours, big tight type, cuts on the beat.
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, spring, staticFile, useCurrentFrame, interpolate, random, Easing } from "remotion";
import { loadFont as inter } from "@remotion/google-fonts/Inter";
import { SCENES, BAR, BEAT, FPS, b, DURATION, SIZES, PIPS, ORDERS, TRY, EXAMPLE, COUNT, KEPT, VIEWS, MARK } from "./timeline.js";

const SANS = inter("normal", { weights: ["500", "600", "700", "800", "900"], subsets: ["latin"] }).fontFamily;
// Sizecurve's own colours: the site's (green, off-white, alert red) and the app icon's (dark green, mint bars, coral).
// Inter stands in for the site's system sans stack.
const C = { bg: "#fbfbfa", ink: "#1a1d21", green: "#2f6f4e", deep: "#1d4d38", mint: "#8fe0b4", pale: "#cfe3d7", red: "#b42318", coral: "#f3a9a4", blush: "#fde0dd", dim: "#6b7280", line: "#e5e7eb", card: "#fff" };
const BG = { rail: C.bg, gone: C.bg, slam: C.red, flag: C.green, order: C.bg, kept: C.deep, app: C.pale, end: C.deep };
const STRIPE = { rail: C.green, gone: C.ink, slam: C.ink, flag: C.mint, order: C.green, kept: C.mint, app: C.green, end: C.mint };

const sp = (f, delay = 0, cfg = {}) => spring({ frame: f - delay, fps: FPS, config: { damping: 12, stiffness: 170, mass: 0.7, ...cfg } });
const clamp = (x, a = 0, z = 1) => Math.max(a, Math.min(z, x));
const ease = (f, a, z, from = 0, to = 1) => interpolate(f, [a, z], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.2, 0.8, 0.2, 1) });
const beatPulse = f => 1 + 0.012 * Math.exp(-((f % BEAT) / 4));

// ---- words that land one after another -------------------------------------
const Words = ({ text, f, at = 0, size = 110, color = C.ink, x, y, w = 1500, align = "left", step = 3, weight = 800, hl = {}, lh = 1.02 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, textAlign: align, fontFamily: SANS, fontWeight: weight, fontSize: size, lineHeight: lh, color, letterSpacing: size * -0.035 }}>
    {text.split(" ").map((wd, i) => {
      const e = sp(f, at + i * step, { damping: 13, stiffness: 220 });
      return <span key={i} style={{ display: "inline-block", marginRight: size * 0.25, opacity: clamp(e * 3), color: hl[i] || color, transform: `translateY(${(1 - e) * size * 0.7}px)` }}>{wd}</span>;
    })}
  </div>
);

// ---- the rail ----------------------------------------------------------------
const RX = [480, 800, 1120, 1440], RY = 170;
const TEE = "M62 18 Q100 46 138 18 L192 48 L172 92 L150 80 L150 192 Q100 200 50 192 L50 80 L28 92 L8 48 Z";
// One hanger on the rail. tee: 0..1 how much of the tee is there; fly: 0..1 the tee leaving.
const Hanger = ({ x, size, f, drop = 0, swing = 0, tee = 1, fly = 0, color = C.green, dim = false, shake = 0, scale = 1 }) => {
  const e = sp(f, drop, { damping: 9, stiffness: 120 });
  const rot = (1 - e) * 14 * Math.sin((f - drop) / 3) + swing + shake;
  return (
    <div style={{ position: "absolute", left: x - 130 * scale, top: RY - 8, width: 260 * scale, height: 340 * scale, transformOrigin: "50% 0%", transform: `translateY(${(1 - clamp(e * 1.4)) * -520}px) rotate(${rot}deg)` }}>
      <svg viewBox="0 0 260 340" width={260 * scale} height={340 * scale} style={{ position: "absolute", overflow: "visible" }}>
        <path d="M130 30 V14 Q130 0 118 0 Q106 0 106 12" fill="none" stroke={C.ink} strokeWidth="7" strokeLinecap="round" />
        <path d="M130 30 L38 88 Q30 96 42 96 L218 96 Q230 96 222 88 Z" fill="none" stroke={C.ink} strokeWidth="7" strokeLinejoin="round" />
        {tee > 0 && (
          <g transform={`translate(${10 + fly * 700} ${60 - fly * 620}) rotate(${fly * 50} 120 120) scale(1.2)`} opacity={tee * (1 - fly * fly)}>
            <path d={TEE} fill={dim ? "#9db8a9" : color} stroke={C.ink} strokeWidth="5" strokeLinejoin="round" />
            <text x="100" y="138" textAnchor="middle" fontFamily={SANS} fontWeight="800" fontSize={size.length > 1 ? 50 : 62} fill="#fff" letterSpacing="-2">{size}</text>
          </g>
        )}
      </svg>
    </div>
  );
};
const RailBar = ({ f }) => {
  const e = ease(f, 0, 12);
  return (
    <>
      <div style={{ position: "absolute", left: 300, top: RY - 8, width: 1320 * e, height: 16, borderRadius: 8, background: C.ink }} />
      {[300, 1604].map((x, i) => <div key={i} style={{ position: "absolute", left: x, top: RY - 170 * e, width: 16, height: 170 * e, borderRadius: 8, background: C.ink, opacity: i ? clamp(e * 2 - 1) : 1 }} />)}
    </>
  );
};
const Pips = ({ x, n, of, lastHit, f }) => (
  <div style={{ position: "absolute", left: x - 130, top: RY + 362, width: 260, display: "flex", justifyContent: "center", gap: 10 }}>
    {Array.from({ length: of }, (_, i) => {
      const on = i < n, justLeft = i === n && f - lastHit < 8 && lastHit >= 0;
      return <div key={i} style={{ width: 26, height: 26, borderRadius: 7, background: on ? C.green : "transparent", border: `4px solid ${on ? C.green : C.line}`, transform: justLeft ? `scale(${1 + 0.6 * (1 - (f - lastHit) / 8)})` : undefined }} />;
    })}
  </div>
);
const SoldOut = ({ x, f, at, bump = 0 }) => {
  const e = sp(f, at, { damping: 9, stiffness: 220 });
  if (f < at) return null;
  return <div style={{ position: "absolute", left: x, top: RY + 350, transform: `translate(-50%,0) scale(${e * (1 + bump * 0.25)}) rotate(-4deg)`, fontFamily: SANS, fontWeight: 800, fontSize: 34, letterSpacing: 1, textTransform: "uppercase", color: bump > 0.05 ? "#fff" : C.red, background: bump > 0.05 ? C.red : C.blush, border: `4px solid ${C.red}`, borderRadius: 12, padding: "6px 18px", whiteSpace: "nowrap" }}>Sold out</div>;
};

// ---- scenes ------------------------------------------------------------------
const RailScene = ({ f }) => {
  const left = s => PIPS[s] - ORDERS.filter(([of, os]) => os === s && of <= f).length;
  const lastHit = s => Math.max(-1, ...ORDERS.filter(([of, os]) => os === s && of <= f).map(([of]) => of));
  return (
    <>
      <RailBar f={f} />
      {SIZES.map((s, i) => {
        const h = lastHit(s), jig = h >= 0 ? 7 * Math.exp(-(f - h) / 5) * Math.sin((f - h) / 1.6) : 0;
        return <React.Fragment key={s}>
          <Hanger x={RX[i]} size={s} f={f} drop={6 + i * 4} swing={jig + Math.sin(f / 22 + i) * 0.8} />
          {f > 30 && <Pips x={RX[i]} n={left(s)} of={PIPS[s]} lastHit={h} f={f} />}
        </React.Fragment>;
      })}
      {ORDERS.map(([of, s], k) => {
        // each tag lifts off its own tee and fades there, so no two ever cross
        const t = (f - of) / 15; if (t < 0 || t > 1) return null;
        const x0 = RX[SIZES.indexOf(s)], x = x0 + 56 + 110 * t, y = RY + 138 - 230 * t + 90 * t * t;   // off the shoulder, so the size letter stays readable
        return <div key={k} style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${Math.min(1, 0.6 + t * 4) * (1 - t * 0.2)}) rotate(${-4 + t * 8}deg)`, opacity: 1 - t * t * t, background: C.ink, color: "#fff", fontFamily: SANS, fontWeight: 800, fontSize: 34, borderRadius: 999, padding: "8px 22px", whiteSpace: "nowrap" }}>Order · {s}</div>;
      })}
      <Words text="One style." f={f} at={BEAT} x={300} y={700} size={150} />
      <Words text="Selling." f={f} at={BAR} x={1090} y={700} size={150} color={C.green} />
    </>
  );
};

const GoneScene = ({ f }) => {
  const px = f < TRY.M ? ease(f, 66, TRY.M - 4, 1500, RX[1] + 30) : f < TRY.leave ? ease(f, TRY.M + 8, TRY.L - 4, RX[1] + 30, RX[2] + 30) : ease(f, TRY.leave, TRY.leave + 14, RX[2] + 30, 2100);
  const py = f < TRY.M ? ease(f, 66, TRY.M - 4, 1150, RY + 250) : RY + 250 + (f >= TRY.leave ? ease(f, TRY.leave, TRY.leave + 14, 0, 120) : 0);
  const hit = at => (f >= at ? Math.exp(-(f - at) / 5) : 0);
  return (
    <>
      <RailBar f={99} />
      {SIZES.map((s, i) => {
        const core = s === "M" || s === "L", d = i === 1 ? 0 : 5;
        const fly = core ? ease(f, d, d + 13) : 0, h = hit(TRY[s] ?? 1e9);
        const swing = core ? 16 * Math.exp(-Math.max(0, f - d) / 22) * Math.sin((f - d) / 3.2) + 9 * h * Math.sin((f - (TRY[s] || 0)) * 1.5) : Math.sin(f / 26 + i * 2) * 1.6;
        return <React.Fragment key={s}>
          <Hanger x={RX[i]} size={s} f={99} swing={swing} tee={1} fly={fly} dim={!core && f > 118} />
          {core ? <SoldOut x={RX[i]} f={f} at={d + 12} bump={h} /> : <Pips x={RX[i]} n={PIPS[s] - 1} of={PIPS[s]} lastHit={-1} f={f} />}
        </React.Fragment>;
      })}
      {f < 118 ? (
        <>
          <Words text="The sizes people want:" f={f} at={8} x={300} y={690} size={104} />
          <Words text="gone." f={f} at={34} x={300} y={810} size={150} color={C.red} weight={900} />
        </>
      ) : (
        <Words text="The rest just hang there." f={f} at={120} x={300} y={730} size={128} />
      )}
      {f >= 66 && (
        <svg viewBox="0 0 24 24" width="92" height="92" style={{ position: "absolute", left: px, top: py, transform: `scale(${1 - 0.18 * Math.max(hit(TRY.M), hit(TRY.L))})`, filter: "drop-shadow(0 8px 10px rgba(0,0,0,.25))" }}>
          <path d="M5 2 L5 19 L9.5 15 L12.5 22 L15.5 20.7 L12.6 14 L19 14 Z" fill={C.ink} stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      )}
    </>
  );
};

const SlamScene = ({ f }) => {
  const e = sp(f, 0, { damping: 7, stiffness: 260, mass: 0.6 }), e2 = sp(f, 30, { damping: 7, stiffness: 260, mass: 0.6 });
  const shake = (at, a = 16) => (f >= at ? a * Math.exp(-(f - at) / 4) * Math.sin((f - at) * 2.4) : 0);
  return (
    <AbsoluteFill style={{ transform: `translate(${shake(0) + shake(30)}px, ${shake(30, 10)}px)` }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 70, display: "flex", justifyContent: "center", gap: 34, opacity: 0.9 }}>
        {SIZES.map((s, i) => {
          const core = s === "M" || s === "L", k = sp(f, 4 + i * 3);
          return <div key={s} style={{ width: 230, height: 230, borderRadius: 34, transform: `scale(${k})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 900, fontSize: 110, letterSpacing: -4,
            color: core ? "rgba(255,255,255,.55)" : C.red, background: core ? "repeating-linear-gradient(135deg, rgba(255,255,255,.22) 0 14px, transparent 14px 28px)" : "#fff", border: core ? "6px dashed rgba(255,255,255,.7)" : "6px solid #fff" }}>{s}</div>;
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 120, color: "#fff", letterSpacing: -4, opacity: clamp(e * 2), transform: `scale(${2.2 - 1.2 * e})` }}>That’s a</div>
      {f >= 30 && <div style={{ position: "absolute", left: 0, right: 0, top: 520, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 230, color: "#fff", letterSpacing: -10, lineHeight: 1, transform: `scale(${2.4 - 1.4 * e2})`, opacity: clamp(e2 * 2) }}>broken size run.</div>}
      <Words text="Core sizes out. The rest stranded." f={f} at={62} x={0} y={830} w={1920} align="center" size={62} weight={600} color="rgba(255,255,255,.9)" step={2} />
    </AbsoluteFill>
  );
};

// The app's attention card, redrawn from the public preview (a generated store): its words, bigger.
const Curve = ({ w = 560, f, at = 0 }) => {
  const seg = [["S", 0.2, false], ["M", 0.27, true], ["L", 0.33, true], ["XL", 0.2, false]];
  return (
    <div style={{ display: "flex", width: w, height: 48, borderRadius: 8, overflow: "hidden", gap: 3 }}>
      {seg.map(([s, p, out], i) => (
        <div key={s} style={{ flex: `${p} 0 0`, transform: `scaleX(${ease(f, at + i * 4, at + 14 + i * 4)})`, transformOrigin: "0 50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 700, fontSize: 24, color: out ? C.red : C.deep,
          background: out ? `repeating-linear-gradient(135deg, ${C.blush} 0 9px, #fff 9px 18px)` : C.pale }}>{s}</div>
      ))}
    </div>
  );
};
const Example = ({ x, y, color = C.dim, f, at = 0, text = "Example store" }) => <div style={{ position: "absolute", left: x, top: y, fontFamily: SANS, fontWeight: 600, fontSize: 30, color, opacity: clamp((f - at) / 10), letterSpacing: 0.4 }}>{text}</div>;

const FlagScene = ({ f }) => {
  const e = sp(f, 18, { damping: 10, stiffness: 150 });
  const ring = k => { const t = (f - 22 - k * 14) / 34; return t < 0 || t > 1 ? null : <div key={k} style={{ position: "absolute", left: 1060 - 60 - t * 260, top: 290 - 60 - t * 260, width: 120 + t * 520, height: 120 + t * 520, borderRadius: "50%", border: `8px solid ${C.mint}`, opacity: 1 - t }} />; };
  return (
    <>
      <Words text="Sizecurve" f={f} at={4} x={120} y={230} size={150} color="#fff" weight={900} />
      <Words text="flags it" f={f} at={12} x={120} y={380} size={150} color={C.mint} weight={900} />
      <Words text="while the leftover stock can still be rescued." f={f} at={BAR + BEAT * 2} x={126} y={610} w={780} size={66} color="#fff" weight={600} step={2} lh={1.15} />
      {[0, 1, 2].map(ring)}
      <div style={{ position: "absolute", left: 930, top: 215, width: 780, transformOrigin: "0 0", transform: `translateY(${(1 - e) * -700}px) rotate(${(1 - e) * -8 + 2}deg) scale(1.1)`, background: C.card, borderRadius: 26, borderLeft: `14px solid ${C.red}`, padding: "40px 46px 46px", boxShadow: "0 40px 90px rgba(0,0,0,.32)", fontFamily: SANS }}>
        <div style={{ fontWeight: 800, fontSize: 26, letterSpacing: 2.4, color: C.red }}>BROKEN SIZE RUN</div>
        <div style={{ fontWeight: 800, fontSize: 64, color: C.ink, letterSpacing: -2, margin: "10px 0 6px" }}>{EXAMPLE.style}</div>
        <div style={{ fontWeight: 500, fontSize: 36, color: C.dim, marginBottom: 30 }}>{EXAMPLE.out}</div>
        <Curve f={f} at={40} w={680} />
        <div style={{ fontWeight: 700, fontSize: 36, color: C.green, marginTop: 30, opacity: clamp((f - 70) / 8) }}>Restock L and M →</div>
      </div>
      <Example x={940} y={748} color="rgba(255,255,255,.8)" f={f} at={50} />
    </>
  );
};

const OrderScene = ({ f }) => {
  const max = 104, CX = [330, 750, 1170, 1590];
  return (
    <>
      <Words text="Then it tells you what to reorder," f={f} at={4} x={130} y={64} size={84} w={1300} />
      <Words text="in which sizes." f={f} at={36} x={130} y={160} size={84} color={C.green} weight={900} />
      {SIZES.map((s, i) => {
        const n = EXAMPLE.order[s], a = COUNT[s], e = sp(f, 50 + i * 4), v = n == null ? null : Math.round(ease(f, a, a + 16) * n);
        const h = n == null ? 0 : (40 + 330 * (n / max)) * ease(f, a, a + 18), land = n != null && f >= a + 16 ? 1 + 0.12 * Math.exp(-(f - a - 16) / 4) : 1;
        return (
          <div key={s} style={{ position: "absolute", left: CX[i] - 180, top: 310, width: 360, height: 560, transform: `translateY(${(1 - e) * 80}px)`, opacity: clamp(e * 2) }}>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 110, height: 380, borderRadius: 26, background: "#f0f1f3" }} />
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 110, height: h, borderRadius: 26, background: C.green }} />
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 110 + (h > 200 ? h - 170 : h + 14), textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 140, lineHeight: 1.1, letterSpacing: -6, color: n == null ? "#c3c7ce" : h > 200 ? "#fff" : C.ink, transform: `scale(${land})`, fontVariantNumeric: "tabular-nums", opacity: f >= a - 2 ? 1 : 0 }}>{v == null ? "—" : v}</div>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 76, color: C.ink, letterSpacing: -2 }}>{s}</div>
          </div>
        );
      })}
      {f >= COUNT.total && (
        <div style={{ position: "absolute", right: 130, top: 188, transform: `scale(${sp(f, COUNT.total, { damping: 8, stiffness: 220 })}) rotate(-3deg)`, background: C.green, color: "#fff", fontFamily: SANS, fontWeight: 800, fontSize: 62, letterSpacing: -1.5, borderRadius: 24, padding: "22px 40px", boxShadow: "0 24px 50px rgba(47,111,78,.35)", whiteSpace: "nowrap" }}>Order {EXAMPLE.total} units →</div>
      )}
      <Example x={130} y={950} f={f} at={60} text={`Example store · ${EXAMPLE.style}`} />
      <div style={{ position: "absolute", right: 130, top: 946, fontFamily: SANS, fontWeight: 700, fontSize: 36, color: C.ink, letterSpacing: -0.6, opacity: clamp((f - 184) / 8), transform: `translateY(${(1 - sp(f, 184)) * 30}px)` }}>For your own lead time, net of stock on hand and incoming.</div>
    </>
  );
};

// More M sold, but three came back: L is the size customers kept. Tees, not numbers.
const KeptScene = ({ f }) => (
  <>
    {KEPT.rows.map(([s, n, back], r) => {
      const win = r === 1 ? sp(f, KEPT.mark, { damping: 9, stiffness: 200 }) : 0;
      return (
        <div key={s} style={{ position: "absolute", left: 130, top: 70 + r * 196, height: 170, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 150, fontFamily: SANS, fontWeight: 900, fontSize: 130, letterSpacing: -5, color: r === 1 && f >= KEPT.mark ? C.mint : "#fff", transform: `scale(${sp(f, 2 + r * 4) * (1 + win * 0.12)})`, transformOrigin: "0 50%" }}>{s}</div>
          {Array.from({ length: n }, (_, i) => {
            const e = sp(f, 8 + r * 6 + i * 2), k = back.indexOf(i), at = k < 0 ? 1e9 : KEPT.back[k], t = ease(f, at, at + 12), gone = t > 0.5;
            return (
              <svg key={i} viewBox="0 0 200 210" width="150" height="158" style={{ transform: `scale(${e * (1 + (k < 0 && r === 1 ? win * 0.06 : 0))}) translateY(${Math.sin(t * Math.PI) * -26}px) rotate(${t * 8}deg)`, overflow: "visible" }}>
                <path d={TEE} fill={gone ? "transparent" : C.mint} stroke={gone ? C.coral : C.mint} strokeWidth="8" strokeLinejoin="round" strokeDasharray={gone ? "16 12" : undefined} />
              </svg>
            );
          })}
          {r === 0 && <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 34, letterSpacing: 2, color: C.coral, opacity: clamp((f - KEPT.back[2] - 6) / 8), marginLeft: 16 }}>← CAME BACK</div>}
        </div>
      );
    })}
    <Words text="Your bestselling size is not the one that sells the most." f={f} at={BEAT} x={130} y={500} size={98} color="#fff" w={1700} lh={1.06} />
    <Words text="Size curves built from demand net of returns, not gross sales." f={f} at={KEPT.mark + 6} x={134} y={770} size={52} color={C.mint} w={1700} weight={600} step={2} />
  </>
);

// The app itself: three screens off the public preview, no browser around them. Under a quarter of the video.
const SHOTS = [
  { img: "alerts.png", w: 1640, x: [0, 0], y: [0, -170], chip: "Broken size runs" },
  { img: "styles.png", w: 1112, x: [0, 0], y: [0, -45], chip: "Size curves per style", stay: 0.16 },
  { img: "po.png", w: 1080, x: [16, 16], y: [196, 186], chip: "Purchase orders by size", card: true },
];
const AppScene = ({ f }) => {
  const e = sp(f, 2, { damping: 13, stiffness: 120 }), now = VIEWS.filter(v => f >= v).length - 1;
  return (
    <>
      <div style={{ position: "absolute", left: 700, top: 130, width: 1160, height: 760, borderRadius: 28, overflow: "hidden", background: C.bg, boxShadow: "0 50px 110px rgba(29,77,56,.35)", transform: `translateX(${(1 - e) * 1300}px)` }}>
        {SHOTS.map((s, i) => {
          const a = VIEWS[i], z = VIEWS[i + 1] ?? 1e9; if (f < a || (!s.stay && f >= z + 8)) return null;
          const k = sp(f, a, { damping: 14, stiffness: 160 }), p = ease(f, a + 6, a + 80), out = clamp((f - z) / 8);
          return <Img key={s.img} src={staticFile("img/" + s.img)} style={{ position: "absolute", left: 24 + s.x[0] + (s.x[1] - s.x[0]) * p, top: 24 + s.y[0] + (s.y[1] - s.y[0]) * p + (1 - k) * 500, width: s.w, opacity: 1 - out * (1 - (s.stay || 0)), borderRadius: s.card ? 14 : 0, boxShadow: s.card ? "0 30px 70px rgba(29,77,56,.35)" : undefined }} />;
        })}
      </div>
      <Words text="Every style." f={f} at={6} x={110} y={150} size={98} w={600} color={C.deep} weight={900} />
      <Words text="Every size." f={f} at={18} x={110} y={254} size={98} w={600} color={C.green} weight={900} />
      {SHOTS.map((s, i) => {
        const k = sp(f, VIEWS[i], { damping: 9, stiffness: 220 }), on = i === now;
        return f < VIEWS[i] ? null : <div key={s.chip} style={{ position: "absolute", left: 110, top: 470 + i * 118, transform: `scale(${k * (on ? 1.04 : 0.96)}) rotate(${[-2, 1.5, -1][i]}deg)`, transformOrigin: "0 50%", background: on ? C.green : "#fff", color: on ? "#fff" : C.ink, fontFamily: SANS, fontWeight: 800, fontSize: 42, letterSpacing: -1, borderRadius: 20, padding: "20px 30px", boxShadow: "0 14px 34px rgba(29,77,56,.22)", whiteSpace: "nowrap" }}>{s.chip}</div>;
      })}
      <Example x={704} y={920} color={C.deep} f={f} at={20} />
    </>
  );
};

// The mark: the app icon's six bars, the two tallest hollow.
const Mark = ({ f, at = 0, w = 560 }) => (
  <svg viewBox="100 250 1000 690" width={w} height={w * 0.69}>
    {MARK.map(([x, h, hollow], i) => {
      const hh = h * sp(f, at + i * 3, { damping: 9, stiffness: 170 });
      return hollow ? <rect key={i} x={x + 8} y={920 - hh + 8} width={108} height={Math.max(0, hh - 16)} rx={18} fill="none" stroke={C.coral} strokeWidth={16} /> : <rect key={i} x={x} y={920 - hh} width={124} height={Math.max(0, hh)} rx={24} fill={C.mint} />;
    })}
  </svg>
);
const EndScene = ({ f }) => (
  <>
    <div style={{ position: "absolute", left: 0, right: 0, top: 70, display: "flex", justifyContent: "center" }}><Mark f={f} at={6} w={540} /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 440, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: 200, letterSpacing: -9, color: "#fff", lineHeight: 1.1, transform: `scale(${sp(f, 30, { damping: 9, stiffness: 180 })})` }}>Sizecurve</div>
    <Words text="What to reorder, in which sizes." f={f} at={46} x={0} y={690} w={1920} align="center" size={72} weight={700} color={C.mint} step={2} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 860, display: "flex", justifyContent: "center" }}>
      <div style={{ transform: `scale(${sp(f, 84, { damping: 9, stiffness: 200 })})`, background: "rgba(255,255,255,.12)", border: "3px solid rgba(255,255,255,.35)", color: "#fff", fontFamily: SANS, fontWeight: 700, fontSize: 40, borderRadius: 999, padding: "16px 40px" }}>Read-only. It never writes to your store.</div>
    </div>
  </>
);

const VIEW = { rail: RailScene, gone: GoneScene, slam: SlamScene, flag: FlagScene, order: OrderScene, kept: KeptScene, app: AppScene, end: EndScene };
const HARD = { gone: true, slam: true };   // these cut in on the beat with no wipe
const DARK = { slam: true, flag: true, kept: true, end: true };

// Each scene wipes in behind a slanted stripe of its accent colour.
const SceneIn = ({ s, i }) => {
  const f = useCurrentFrame(), View = VIEW[s.id], from = b(s.from);
  const wipe = i > 0 && !HARD[s.id], e = wipe ? ease(f, 0, 11) : 1, x = e * 125 - 12;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: e < 1 ? `polygon(0 0, ${x}% 0, ${x - 12}% 100%, 0 100%)` : undefined }}>
        <AbsoluteFill style={{ background: BG[s.id] }} />
        <AbsoluteFill style={{ backgroundImage: `radial-gradient(${DARK[s.id] ? "rgba(255,255,255,.07)" : "rgba(26,29,33,.06)"} 3px, transparent 3.5px)`, backgroundSize: "48px 48px", backgroundPosition: `${(f + from) * 0.5}px ${(f + from) * 0.25}px` }} />
        <AbsoluteFill style={{ transform: `scale(${beatPulse(f + from)})` }}><View f={f} /></AbsoluteFill>
      </AbsoluteFill>
      {e < 1 && <AbsoluteFill style={{ background: STRIPE[s.id], clipPath: `polygon(${x}% 0, ${x + 5}% 0, ${x - 7}% 100%, ${x - 12}% 100%)` }} />}
    </AbsoluteFill>
  );
};

export const Explainer = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    {SCENES.map((s, i) => {
      const lastOne = i === SCENES.length - 1;
      return (
        <Sequence key={s.id} from={b(s.from)} durationInFrames={(lastOne ? DURATION : b(s.to) + 12) - b(s.from)}>
          <SceneIn s={s} i={i} />
        </Sequence>
      );
    })}
    <Audio src={staticFile("music.wav")} />
  </AbsoluteFill>
);
