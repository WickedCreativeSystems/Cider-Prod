// The Came In demo: flat bright colours, phones that bounce in on springs,
// rounded type that pops in word by word, confetti and a ding on each ring.
import React from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig, interpolate, random, Easing } from "remotion";
import { loadFont as fredoka } from "@remotion/google-fonts/Fredoka";
import { loadFont as inter } from "@remotion/google-fonts/Inter";
import { SCENES, BAR, BEAT, FPS, b, START, CLIP, RINGS, RING_POSTS, DURATION } from "./timeline.js";

const ROUND = fredoka("normal", { weights: ["500", "600", "700"], subsets: ["latin"] }).fontFamily;
const SANS = inter("normal", { weights: ["500", "700"], subsets: ["latin"] }).fontFamily;
const C = { butter: "#FFD447", tangerine: "#FF7A45", pink: "#FF5FA2", sky: "#4CC3FF", mint: "#3DDC97", grape: "#8B5CF6", ink: "#1E1B2E", cream: "#FFF8EC", brass: "#C4912C" };
const BG = { hook: C.butter, logo: C.tangerine, card: C.sky, tap: C.pink, wall: C.mint, staff: C.grape, week: C.butter, again: C.tangerine, api: C.ink, end: C.pink };
const ACCENT = { hook: C.pink, logo: C.butter, card: C.butter, tap: C.butter, wall: C.pink, staff: C.mint, week: C.sky, again: C.butter, api: C.mint, end: C.butter };

const sp = (f, delay = 0, cfg = {}) => spring({ frame: f - delay, fps: FPS, config: { damping: 11, stiffness: 160, mass: 0.7, ...cfg } });
const clamp = (x, a = 0, z = 1) => Math.max(a, Math.min(z, x));
const beatPulse = f => 1 + 0.018 * Math.exp(-((f % BEAT) / 4));

// ---- backdrop: flat colour, drifting dots, three soft blobs ----------------
const Backdrop = ({ id, f }) => {
  const bg = BG[id], dark = id === "api";
  const dot = dark ? "rgba(255,255,255,.07)" : "rgba(255,255,255,.28)";
  return (
    <AbsoluteFill style={{ background: bg, overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundImage: `radial-gradient(${dot} 3.5px, transparent 4px)`, backgroundSize: "56px 56px", backgroundPosition: `${f * 0.6}px ${f * 0.35}px` }} />
      {[0, 1, 2].map(i => {
        const r = 380 + 140 * i, x = [180, 1600, 1100][i] + 60 * Math.sin(f / 50 + i), y = [880, 160, 1000][i] + 50 * Math.cos(f / 60 + i * 2);
        return <div key={i} style={{ position: "absolute", left: x - r / 2, top: y - r / 2, width: r, height: r, borderRadius: "50%", background: dark ? "rgba(255,255,255,.04)" : "rgba(255,255,255,.18)" }} />;
      })}
    </AbsoluteFill>
  );
};

// ---- a phone playing one recording (780x1684) ------------------------------
const PW = 780, PH = 1684;
const Phone = ({ src, from = 0, x, y, h = 900, f, tilt = -4, delay = 0, rate = 1, children }) => {
  const s = h / (PH + 60), e = sp(f, delay, { damping: 12 });
  const bob = Math.sin((f / BAR) * Math.PI * 2) * 6;
  const rot = tilt * e + Math.sin(f / 40) * 0.8;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) translateY(${(1 - e) * 1100 + bob}px) rotate(${rot}deg) scale(${s})`, transformOrigin: "50% 50%" }}>
      <div style={{ position: "relative", width: PW + 60, height: PH + 60, borderRadius: 120, background: C.ink, boxShadow: "0 50px 0 rgba(0,0,0,.12), 0 70px 120px rgba(0,0,0,.25)" }}>
        <div style={{ position: "absolute", left: 30, top: 30, width: PW, height: PH, borderRadius: 92, overflow: "hidden", background: "#F4F2ED" }}>
          <OffthreadVideo src={staticFile(`clips/${src}.mp4`)} trimBefore={Math.round(from * FPS)} playbackRate={rate} muted style={{ width: PW, height: PH }} />
          {children}
        </div>
      </div>
    </div>
  );
};

// ---- words that pop in, one after another ----------------------------------
const Pop = ({ text, f, at = 0, size = 96, color = C.ink, x, y, w = 820, align = "left", step = 3, weight = 700, hl = [], hlColor = C.cream }) => {
  const words = text.split(" ");
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, textAlign: align, fontFamily: ROUND, fontWeight: weight, fontSize: size, lineHeight: 1.04, color, letterSpacing: -1 }}>
      {words.map((wd, i) => {
        const e = sp(f, at + i * step, { damping: 9, stiffness: 200 });
        const isHl = hl.includes(i);
        return (
          <span key={i} style={{ display: "inline-block", marginRight: size * 0.24, opacity: clamp(e * 3), transform: `translateY(${(1 - e) * size * 0.6}px) scale(${0.4 + 0.6 * e}) rotate(${(1 - e) * (i % 2 ? 8 : -8)}deg)`,
            ...(isHl ? { background: hlColor, color: C.ink, padding: `0 ${size * 0.16}px`, borderRadius: size * 0.22, margin: `0 ${size * 0.24}px ${size * 0.08}px 0` } : {}) }}>{wd}</span>
        );
      })}
    </div>
  );
};

// A sticker: a rounded pill that pops in, rotated a little.
const Sticker = ({ children, f, at, x, y, bg = C.cream, color = C.ink, rot = -4, size = 54, pad = "18px 34px" }) => {
  const e = sp(f, at, { damping: 8, stiffness: 220 });
  if (f < at) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${e})`, background: bg, color, fontFamily: ROUND, fontWeight: 700, fontSize: size,
      padding: pad, borderRadius: 999, boxShadow: "0 12px 0 rgba(0,0,0,.14)", whiteSpace: "nowrap" }}>{children}</div>
  );
};

// The step number in a circle.
const Step = ({ n, f, at = 0, x, y, bg = C.ink, color = C.cream }) => {
  const e = sp(f, at, { damping: 8 });
  return <div style={{ position: "absolute", left: x, top: y, width: 104, height: 104, borderRadius: "50%", background: bg, color, fontFamily: ROUND, fontWeight: 700, fontSize: 64,
    display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${e}) rotate(${(1 - e) * -90}deg)` }}>{n}</div>;
};

// Confetti from a point.
const Confetti = ({ f, at, x, y, n = 90, seed = 1 }) => {
  const t = (f - at) / FPS;
  if (t < 0 || t > 2.6) return null;
  const cols = [C.pink, C.butter, C.sky, C.tangerine, C.grape, C.cream];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: n }, (_, i) => {
        const a = random(`a${seed}${i}`) * Math.PI * 2, v = 500 + 900 * random(`v${seed}${i}`);
        const px = x + Math.cos(a) * v * t, py = y + Math.sin(a) * v * t * 0.8 + 900 * t * t - 200 * t;
        const r = random(`r${seed}${i}`) * 720 * t, w = 14 + 12 * random(`w${seed}${i}`);
        return <div key={i} style={{ position: "absolute", left: px, top: py, width: w, height: w * 0.55, background: cols[i % cols.length], borderRadius: i % 3 ? 3 : 99, transform: `rotate(${r}deg)`, opacity: clamp(2.6 - t) }} />;
      })}
    </AbsoluteFill>
  );
};

// The Came In bell (the app's icon shape), swinging.
const Bell = ({ f, at = 0, x, y, size = 220, color = C.cream, clapper = C.ink }) => {
  const t = (f - at) / FPS, e = sp(f, at, { damping: 7 });
  const swing = t > 0 ? 26 * Math.exp(-t * 2.2) * Math.sin(t * 14) : 0;
  return (
    <svg viewBox="0 0 40 40" style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, transform: `scale(${e}) rotate(${swing}deg)`, transformOrigin: "50% 12%" }}>
      <path d="M20 4.5c.9 0 1.6.7 1.6 1.6v1.2c5.3.8 9.2 5.3 9.2 10.8v7.3l3 4.2H6.2l3-4.2v-7.3C9.2 12.6 13.1 8.1 18.4 7.3V6.1c0-.9.7-1.6 1.6-1.6z" fill={color} />
      <path d="M6.2 29.6h27.6v2.1H6.2z" fill={color} opacity=".85" />
      <circle cx={20 + swing * -0.08} cy="34.4" r="2.6" fill={clapper} />
    </svg>
  );
};

// Little hearts floating up off a post.
const Hearts = ({ f, at, x, y }) => (
  <>{Array.from({ length: 9 }, (_, i) => {
    const t = (f - at - i * 6) / FPS; if (t < 0 || t > 1.6) return null;
    const px = x + (random(`h${i}`) - 0.5) * 160 + Math.sin(t * 6 + i) * 20, py = y - t * 360;
    return <div key={i} style={{ position: "absolute", left: px, top: py, fontSize: 60, color: C.pink, opacity: clamp(1.6 - t), transform: `scale(${clamp(t * 5)})`, fontFamily: SANS }}>♥</div>;
  })}</>
);

// ---- scenes ----------------------------------------------------------------
const Hook = ({ f }) => {
  const e = sp(f, 6);
  return (
    <>
      <div style={{ position: "absolute", left: 470, top: 560, width: 600, transform: `translate(-50%,-50%) rotate(${-6 * e}deg) scale(${e})`, background: "#fff", borderRadius: 40, padding: 26, boxShadow: "0 30px 0 rgba(0,0,0,.12)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 20 }}>
          <div style={{ width: 70, height: 70, borderRadius: "50%", background: C.brass, color: C.ink, fontFamily: ROUND, fontWeight: 700, fontSize: 30, display: "flex", alignItems: "center", justifyContent: "center" }}>RL</div>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, color: C.ink }}>ryeandlantern</div>
        </div>
        <Img src={staticFile("img/sour.jpg")} style={{ width: "100%", height: 470, objectFit: "cover", borderRadius: 24 }} />
        <div style={{ fontFamily: SANS, fontSize: 28, color: C.ink, marginTop: 18 }}><b>ryeandlantern</b> Tuesday's sourdough is out of the oven.</div>
      </div>
      <Hearts f={f} at={b(1, 1)} x={700} y={760} />
      <Pop text="You posted the sourdough." f={f} at={b(0, 1)} x={880} y={250} w={900} size={100} />
      <Pop text="People loved it." f={f} at={b(1, 1)} x={880} y={500} w={900} size={72} color={C.ink} weight={600} />
      <Pop text="But did anyone actually come in?" f={f} at={b(2, 2)} x={880} y={650} w={960} size={104} hl={[3, 4, 5]} hlColor={C.pink} />
    </>
  );
};

const Logo = ({ f }) => {
  const e = sp(f, 2, { damping: 9 });
  return (
    <>
      <Bell f={f} at={2} x={960} y={330} size={260} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 470, textAlign: "center", fontFamily: ROUND, fontWeight: 700, fontSize: 230, color: C.cream, transform: `scale(${e})`, letterSpacing: -4, textShadow: "0 14px 0 rgba(0,0,0,.12)" }}>Came In</div>
      <Pop text="See which posts bring people through the door." f={f} at={20} x={260} y={780} w={1400} size={60} color={C.ink} align="center" weight={600} step={2} />
    </>
  );
};

const CardScene = ({ f }) => (
  <>
    <Phone src="card" from={START.card} x={1380} y={560} h={940} f={f} tilt={5} />
    <Step n="1" f={f} at={4} x={150} y={250} />
    <Pop text="Put a card by the till." f={f} at={8} x={150} y={390} w={820} size={104} />
    <Sticker f={f} at={b(1, 2)} x={520} y={760} bg={C.butter}>Scan. Tap. Three seconds.</Sticker>
    <Sticker f={f} at={b(2, 0)} x={440} y={890} bg={C.cream} rot={3}>No app to download.</Sticker>
  </>
);

const TapScene = ({ f }) => {
  const tap = Math.round((CLIP.tapAt - START.tap) * FPS);
  return (
    <>
      <Phone src="tap" from={START.tap} x={1400} y={560} h={960} f={f} tilt={4} />
      <Step n="2" f={f} at={4} x={150} y={200} bg={C.cream} color={C.ink} />
      <Pop text="A customer taps the post that brought them in." f={f} at={8} x={150} y={340} w={900} size={96} hl={[4]} hlColor={C.butter} />
      <Pop text="…and gets a thank-you." f={f} at={tap + 12} x={150} y={760} w={900} size={80} color={C.cream} />
      <Sticker f={f} at={tap + 30} x={1020} y={930} bg={C.butter} rot={-6} size={50}>Free cookie today!</Sticker>
    </>
  );
};

const WallScene = ({ f, from }) => {
  const rings = RINGS.map(r => r - from), ring = rings[0];
  const k = rings.filter(r => f >= r).length - 1, rk = rings[Math.max(0, k)];
  const shake = rings.reduce((a, r) => a + (f >= r && f < r + 14 ? Math.sin((f - r) * 2.4) * (14 - (f - r)) * 0.9 : 0), 0);
  const qe = sp(f, rk + 4, { damping: 9, stiffness: 220 });
  return (
    <>
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${shake}px)` }}>
        <Phone src="wall" from={START.wall} x={520} y={560} h={960} f={f} tilt={-4} />
      </div>
      <Step n="3" f={f} at={4} x={960} y={170} />
      <Pop text="Ding! Your phone rings." f={f} at={ring - 2} x={960} y={300} w={900} size={110} hl={[0]} hlColor={C.butter} />
      {k >= 0 && <div style={{ position: "absolute", left: 960, top: 560, width: 860, opacity: clamp(qe * 2), transform: `scale(${0.85 + 0.15 * qe}) rotate(${(1 - qe) * -3}deg)`, transformOrigin: "0% 50%",
        background: C.cream, borderRadius: 36, padding: "30px 40px", fontFamily: SANS, fontWeight: 700, fontSize: 46, lineHeight: 1.2, color: C.ink, boxShadow: "0 14px 0 rgba(0,0,0,.12)" }}>
        “Someone just came in because of {RING_POSTS[k]}.”
      </div>}
      {k >= 0 && <Sticker key={k} f={f} at={rk + 6} x={1540} y={850} bg={C.pink} color={C.cream} rot={6 - k * 5} size={64}>{["+1", "+2", "+3"][k]} came in</Sticker>}
      <Pop text="Live, while they're still at the counter." f={f} at={ring + 70} x={960} y={950} w={900} size={52} weight={600} step={2} />
      {rings.map((r, i) => <Confetti key={i} f={f} at={r + 2} x={520} y={260} seed={i + 1} n={i ? 60 : 90} />)}
    </>
  );
};

const StaffScene = ({ f }) => (
  <>
    <Phone src="staff" from={START.staff} x={1380} y={560} h={940} f={f} tilt={-5} delay={0} />
    <Pop text="No phone? Staff tap it at the till." f={f} at={6} x={150} y={330} w={860} size={104} color={C.cream} hl={[0, 1]} hlColor={C.mint} />
  </>
);

const WeekScene = ({ f }) => (
  <>
    <Phone src="week" from={START.week} x={1420} y={560} h={960} f={f} tilt={4} />
    <Step n="4" f={f} at={4} x={130} y={110} />
    <Pop text="Every week, in plain words." f={f} at={8} x={130} y={240} w={1000} size={96} />
    <Sticker f={f} at={b(1, 2)} x={560} y={560} bg={C.cream} rot={-3} size={50}>20 people came in because of 8 posts.</Sticker>
    <Sticker f={f} at={b(2, 2)} x={500} y={700} bg={C.pink} color={C.cream} rot={3} size={50}>Photos brought 18 of them.</Sticker>
    <Sticker f={f} at={b(3, 2)} x={560} y={840} bg={C.sky} rot={-2} size={50}>Saturday posts brought the most.</Sticker>
    <Sticker f={f} at={b(4, 2)} x={470} y={980} bg={C.ink} color={C.cream} rot={2} size={44}>No charts to squint at.</Sticker>
  </>
);

const AgainScene = ({ f }) => {
  const q = Math.round((CLIP.queuedAt - START.again) * FPS);
  return (
    <>
      <Phone src="again" from={START.again} x={520} y={560} h={960} f={f} tilt={-4} />
      <Step n="5" f={f} at={4} x={960} y={200} bg={C.cream} color={C.ink} />
      <Pop text="Post the winner again." f={f} at={8} x={960} y={340} w={900} size={110} hl={[2]} hlColor={C.butter} />
      <Sticker f={f} at={q + 4} x={1380} y={720} bg={C.cream} rot={-4} size={50}>Back in your Buffer queue.</Sticker>
      <Pop text="One tap. Straight through Buffer." f={f} at={q + 40} x={960} y={840} w={900} size={60} color={C.cream} weight={600} step={2} />
    </>
  );
};

const API = [
  ["posts", "reads what you've already sent"],
  ["createPost", "posts a winner again, to your queue"],
  ["createCollaborationNote", "leaves a note on a post once 3 people say it"],
  ["createIdea", "saves “more like this” to your Ideas"],
];
const ApiScene = ({ f }) => (
  <>
    <Pop text="Built on the Buffer API." f={f} at={4} x={150} y={130} w={1600} size={120} color={C.cream} hl={[3, 4]} hlColor={C.mint} />
    {API.map(([name, what], i) => {
      const at = b(0, 2 + i * 2), e = sp(f, at, { damping: 10 });
      return (
        <div key={name} style={{ position: "absolute", left: 150, top: 380 + i * 150, display: "flex", alignItems: "center", gap: 34, opacity: clamp(e * 2), transform: `translateX(${(1 - e) * -300}px)` }}>
          <div style={{ background: [C.butter, C.pink, C.sky, C.tangerine][i], color: C.ink, fontFamily: "ui-monospace, Menlo, monospace", fontWeight: 700, fontSize: 46, padding: "16px 30px", borderRadius: 22 }}>{name}</div>
          <div style={{ fontFamily: ROUND, fontWeight: 600, fontSize: 50, color: C.cream }}>{what}</div>
        </div>
      );
    })}
    <Pop text="Sign in with Buffer. A customer's tap never touches your account." f={f} at={b(3, 0)} x={150} y={960} w={1700} size={44} color="rgba(255,248,236,.75)" weight={500} step={1} />
  </>
);

const EndScene = ({ f }) => (
  <>
    <Bell f={f} at={4} x={960} y={250} size={220} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", fontFamily: ROUND, fontWeight: 700, fontSize: 200, color: C.cream, transform: `scale(${sp(f, 4)})`, letterSpacing: -4, textShadow: "0 14px 0 rgba(0,0,0,.12)" }}>Came In</div>
    <Pop text="Try the sample bakery." f={f} at={b(0, 3)} x={260} y={630} w={1400} size={76} align="center" />
    <Sticker f={f} at={b(1, 1)} x={960} y={810} bg={C.cream} rot={-2} size={50}>came-in.walkertbrown.workers.dev/sample</Sticker>
    <div style={{ position: "absolute", left: 0, right: 0, top: 990, textAlign: "center", fontFamily: SANS, fontWeight: 500, fontSize: 24, color: C.ink, opacity: clamp((f - b(2)) / 15) * 0.8 }}>
      Built for Buffer Commit 2026 · Sample bakery photos: Wikimedia Commons (CC0, CC BY 2.0)
    </div>
    <Confetti f={f} at={6} x={960} y={250} n={70} seed={7} />
  </>
);

const VIEW = { hook: Hook, logo: Logo, card: CardScene, tap: TapScene, wall: WallScene, staff: StaffScene, week: WeekScene, again: AgainScene, api: ApiScene, end: EndScene };
const ORIGIN = [[0.15, 0.2], [0.85, 0.8], [0.2, 0.85], [0.8, 0.15], [0.5, 0.5]];

// Each scene comes in as a circle growing from a corner, with a ring of the next colour leading it.
const SceneIn = ({ s, i }) => {
  const f = useCurrentFrame();
  const View = VIEW[s.id], from = b(s.from);
  const e = i === 0 ? 1 : clamp(interpolate(f, [0, 13], [0, 1], { easing: Easing.bezier(0.5, 0, 0.2, 1) }));
  const [ox, oy] = ORIGIN[i % ORIGIN.length], r = e * 2300;
  const zoom = 1 + 0.03 * (1 - sp(f, 0, { damping: 14 }));
  return (
    <AbsoluteFill style={{ clipPath: e < 1 ? `circle(${r}px at ${ox * 100}% ${oy * 100}%)` : undefined }}>
      <Backdrop id={s.id} f={f + from} />
      <AbsoluteFill style={{ transform: `scale(${zoom * beatPulse(f + from)})` }}>
        <View f={f} from={from} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Demo = () => (
  <AbsoluteFill style={{ background: C.butter }}>
    {SCENES.map((s, i) => (
      <Sequence key={s.id} from={b(s.from)} durationInFrames={(i === SCENES.length - 1 ? DURATION : b(s.to)) - b(s.from) + (i === SCENES.length - 1 ? 0 : 14)}>
        <SceneIn s={s} i={i} />
      </Sequence>
    ))}
    <Audio src={staticFile("music.wav")} />
  </AbsoluteFill>
);
