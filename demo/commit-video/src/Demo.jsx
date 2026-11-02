// The Buffer Commit demo for Dailies: 1:54, 1920x1080, every cut on a 120 BPM grid.
import React from "react";
import { AbsoluteFill, Sequence, Audio, OffthreadVideo, staticFile, useCurrentFrame, random } from "remotion";
import { S } from "./scenes.js";
import { HAVE } from "./have.js";
import { Shot, whole, at, kf, snap, out, punch, lin, Press, Slam, Build, Typed, Flash, Shake, Bump, Backdrop, Grain, Mini, Flip, Slate, HEAVY, SANS, MONO, GOLD, INK, CREAM } from "./kit.jsx";

const Scene = ({ k, children }) => <Sequence from={S[k][0]} durationInFrames={S[k][1] - S[k][0]} name={k}>{children}</Sequence>;
const beats = (from, to, step = 15) => Array.from({ length: Math.ceil((to - from) / step) }, (_, i) => from + i * step);
const ORDER = ["shorts/dailies.mp4", "shorts/sweep1.mp4", "shorts/store0.mp4", "shorts/par.mp4", "shorts/store1.mp4", "shorts/clip0.mp4", "shorts/store2.mp4", "shorts/sweep2.mp4", "shorts/clip1.mp4", "shorts/store3.mp4", "shorts/home.mp4", "shorts/store4.mp4", "shorts/clip2.mp4"];
export const SHORTS = ORDER.filter(s => HAVE.includes(s));
const CLIPS_READY = [0, 1, 2].every(i => HAVE.includes(`shorts/clip${i}.mp4`));
// Until the clips run is recorded: a live crop of the talk, marked as a stand-in.
const Crop = ({ h, x, style }) => { const w = h * 9 / 16, r = h * 0.07, sc = h / 720;
  return <div style={{ position: "absolute", width: w, height: h, ...style }}>
    <div style={{ position: "absolute", inset: -h * 0.022, borderRadius: r + h * 0.022, background: "#141210", boxShadow: "0 0 0 2px #4a4130, 0 40px 80px rgba(0,0,0,.6)" }} />
    <div style={{ position: "absolute", inset: 0, borderRadius: r, overflow: "hidden", background: "#000" }}>
      <OffthreadVideo src={staticFile("talk.mp4")} trimBefore={180} muted style={{ position: "absolute", width: 1280 * sc, height: h, left: -(x - 202.5) * sc }} /></div>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: -h * 0.09, textAlign: "center", fontFamily: MONO, fontSize: 20, color: GOLD }}>stand-in · real clip tonight</div>
  </div>; };
const pick = i => SHORTS[i % SHORTS.length];

// ---- 0: cold open ----------------------------------------------------------
const Intro = () => {
  const f = useCurrentFrame();
  // flashes: 8ths in bar 2, 16ths in bar 3
  const cuts = [...beats(120, 180, 7.5), ...beats(180, 240, 3.75)].map(Math.round);
  const i = cuts.findLastIndex(c => f >= c);
  return <AbsoluteFill>
    <Backdrop pulse={false} tone={0.35 + 0.65 * Math.min(1, f / 240)} />
    <Slam items={[{ t: "post", at: 0 }, { t: "a short", at: 15 }, { t: "every", at: 30 }, { t: "day.", at: 45, gold: true },
      { t: "who", at: 60 }, { t: "has", at: 75 }, { t: "the", at: 90 }, { t: "time?", at: 105, gold: true }]} until={120} size={260} />
    {i >= 0 && f < 240 ? (() => { const k = f - cuts[i], r = (n) => random(`c${i}${n}`);
      return <Shake hits={[cuts[i]]} amp={10}><AbsoluteFill style={{ transform: `rotate(${(r(1) - 0.5) * 16}deg) scale(${1.25 - 0.25 * out(Math.min(1, k / 6)) + (f - 120) / 400})`, left: (r(2) - 0.5) * 500 }}>
        <Mini src={pick(i * 5 + 1)} h={900} from={2 + r(3) * 12} style={{ left: 960 - 253, top: 90 }} glow={1.2} />
      </AbsoluteFill></Shake>; })() : null}
    <Flash at={[120, 180, 210, 225, 232]} max={0.5} len={5} />
    <Flash at={[238]} max={1} len={4} />
  </AbsoluteFill>;
};

// ---- 1: the name ------------------------------------------------------------
const Logo = () => {
  const f = useCurrentFrame();
  const z = f > 100 ? Math.pow(1 + (f - 100) / 4, 2.2) : 1;
  return <AbsoluteFill>
    <Backdrop start={240} />
    <Shake hits={[0]} amp={34}><AbsoluteFill style={{ transform: `scale(${z})`, opacity: f > 112 ? 1 - (f - 112) / 8 : 1 }}>
      <div style={{ position: "absolute", left: 960, top: 450, transform: `translate(-50%,-50%) scale(${1 + 2.5 * Math.exp(-f / 2.5)})`, display: "flex", alignItems: "center", gap: 46 }}>
        <div style={{ width: 210, height: 210, borderRadius: 52, background: "#14120e", boxShadow: `0 0 0 4px #3b3324, 0 0 120px rgba(242,194,48,.5)`, display: "grid", placeItems: "center" }}>
          <div style={{ width: 130, height: 130, borderRadius: "50%", border: `16px solid ${GOLD}`, display: "grid", placeItems: "center", transform: `rotate(${f * 6}deg)` }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: GOLD }} /></div></div>
        <div style={{ fontFamily: HEAVY, fontSize: 300, color: CREAM, letterSpacing: "0.02em", textShadow: `0 0 60px rgba(242,194,48,.35), 0 10px 0 rgba(0,0,0,.4)` }}>DAILIES</div>
      </div>
      <Build words={[{ t: "shorts", at: 30 }, { t: "for", at: 37 }, { t: "every", at: 45 }, { t: "day.", at: 52, gold: true }, { t: "drafted", at: 60 }, { t: "into", at: 67 }, { t: "Buffer.", at: 75, gold: true }]}
        y={720} size={86} />
    </AbsoluteFill></Shake>
    <Flash at={[0]} max={1} len={10} />
  </AbsoluteFill>;
};

// ---- 2: a link, all the way to Buffer drafts ----------------------------------
const LS = [ // which part of the link recording plays when (local frames, seconds in the recording, speed)
  { at: 0, from: 2.0 }, { at: 60, from: 4.0, rate: 1.2 }, { at: 104, from: 6.0 }, { at: 120, from: 6.6, rate: 1.5 }, { at: 180, from: 9.45 },
  { at: 196, from: 12.2 }, { at: 240, from: 14.0 }, { at: 360, from: 165.8 }, { at: 390, from: 167.0, rate: 15.5 }, { at: 590, from: 268.2 },
  { at: 660, from: 272.0 }, { at: 700, from: 275.6 },
];
const Link = () => {
  const f = useCurrentFrame();
  const W = whole(860, 1330), WC = whole(900, 960);
  const view = g => kf(g, [
    [0, { ...W, y: W.y - 2200, ry: -40, rx: 18 }], [22, { ...W, ry: -16, rx: 6 }, out], [56, { ...W, ry: -10, rx: 4 }, lin],
    [66, at(541, 813, 1.55)], [104, at(560, 813, 1.6), lin], [112, at(240, 1040, 2.1)], [120, at(240, 1040, 2.2), lin],
    [130, { ...WC, ry: 14, rx: 4 }], [176, { ...WC, ry: 8, rx: 2 }, lin], [184, at(612, 959, 1.7)], [196, at(612, 959, 1.85), lin],
    [200, at(560, 700, 1.25)], [238, at(560, 760, 1.3), lin],
    [244, at(540, 620, 1.45)], [270, at(540, 640, 1.45), lin], [274, at(540, 820, 1.45)], [300, at(540, 840, 1.45), lin], [304, at(540, 1020, 1.45)], [330, at(540, 1040, 1.45), lin],
    [334, at(540, 1400, 1.45)], [358, at(540, 1420, 1.5), lin],
    [366, at(389, 1018, 1.9)], [388, at(389, 1018, 2.0), lin], [398, { ...whole(960, 1240), ry: -18, rx: 4 }], [585, { ...whole(960, 1240), ry: 14, rx: 2 }, lin],
    [604, at(444, 1310, 1.7)], [650, at(444, 1330, 1.75), lin], [662, at(444, 1630, 1.9)], [690, at(444, 1630, 2.05), lin],
    [702, at(483, 1720, 2.2)], [772, at(483, 1720, 2.4), lin], [790, { ...whole(860, 1330), ry: -14, rx: 4 }], [840, { ...whole(860, 1330), ry: -8, rx: 2 }, lin],
  ]);
  const pct = Math.round(Math.max(0, Math.min(100, (f - 392) / (585 - 392) * 100)));
  const band = (on, t) => on ? <AbsoluteFill style={{ background: "linear-gradient(transparent 55%, rgba(11,10,8,.85) 80%)" }} /> : null;
  return <AbsoluteFill>
    <Backdrop start={360} />
    <Bump hits={[0, 15, 30, 45, 600, 615, 627, 639, 672]} amt={0.025}>
      <Shot src="link.mp4" segs={LS} view={view} dur={840}>
        <Press x={240} y={1040} at={113} /><Press x={612} y={959} at={182} size={150} /><Press x={389} y={1018} at={384} />
        <Press x={444} y={1277} at={627} size={70} /><Press x={444} y={1361} at={639} size={70} /><Press x={444} y={1630} at={672} size={150} />
      </Shot>
    </Bump>
    <Build words={[{ t: "paste", at: 4 }, { t: "a link.", at: 19, gold: true }]} x={150} y={470} size={190} align="left" until={60} lineHeight={0.95} />
    {f < 66 ? <Typed t="a product, an app, an article, a listing" at={30} x={156} y={600} size={30} /> : null}
    {band(f >= 120 && f < 180)}
    <Slam items={[{ t: "it reads the page.", at: 130 }]} until={180} x={960} y={930} size={110} />
    {band(f >= 196 && f < 240)}
    <Slam items={[{ t: "it writes it.", at: 198, gold: true }]} until={240} x={960} y={930} size={130} />
    {band(f >= 240 && f < 360)}
    <Slam items={[{ t: "the script.", at: 244 }, { t: "the title.", at: 274 }, { t: "the caption.", at: 289 }, { t: "the hashtags.", at: 304 }, { t: "the sound.", at: 334, gold: true }]} until={360} x={960} y={940} size={120} />
    {f >= 392 && f < 600 ? <>
      <div style={{ position: "absolute", left: 120, top: 250, fontFamily: HEAVY, fontSize: 92, color: CREAM, lineHeight: 1, textTransform: "uppercase" }}>rendering<br /><span style={{ color: GOLD }}>in your browser</span></div>
      <div style={{ position: "absolute", left: 112, top: 470, fontFamily: HEAVY, fontSize: 300, color: CREAM, lineHeight: 1, fontVariantNumeric: "tabular-nums", textShadow: "0 0 50px rgba(242,194,48,.3)" }}>{pct}<span style={{ fontSize: 150, color: GOLD }}>%</span></div>
      <div style={{ position: "absolute", left: 124, top: 830, fontFamily: MONO, fontSize: 30, color: CREAM, opacity: 0.75 }}>1080×1920 · H.264 · no server</div>
      <div style={{ position: "absolute", right: 120, top: 200, fontFamily: HEAVY, fontSize: 140, color: GOLD, transform: `rotate(-6deg) scale(${1 + 0.08 * Math.exp(-((f - 392) % 15) / 3)})` }}>×15</div>
      <div style={{ position: "absolute", right: 126, top: 370, fontFamily: MONO, fontSize: 26, color: CREAM, opacity: 0.7, textAlign: "right" }}>sped up</div>
    </> : null}
    {band(f >= 600 && f < 700)}
    <Slam items={[{ t: "pick the channels.", at: 606 }, { t: "draft to buffer.", at: 672, gold: true }]} until={700} x={960} y={940} size={110} />
    {band(f >= 742 && f < 790)}
    <Slam items={[{ t: "in your buffer drafts.", at: 742, gold: true }]} until={790} x={960} y={930} size={120} />
    <Build words={[{ t: "nothing", at: 795 }, { t: "posts", at: 803 }, { t: "by", at: 810 }, { t: "itself.", at: 818, gold: true }]} x={150} y={520} size={150} align="left" />
    <Flash at={[66, 130, 398, 590, 742]} max={0.35} len={7} />
    <Shake hits={[]}><></></Shake>
  </AbsoluteFill>;
};

// ---- 3: the Buffer side --------------------------------------------------------
const BufferSide = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill>
    <Backdrop start={1200} />
    <Sequence durationInFrames={120}><Slate title="Buffer: the two drafts" note="The boss's screen recording: Buffer's drafts with the Dailies video in TikTok and YouTube, signed in. A phone recording is fine." dur="4–6 s used" /></Sequence>
    <Sequence from={120} durationInFrames={120}>
      <Mini src="shorts/dailies.mp4" h={860} from={1} style={{ left: 1180, top: 110, transform: `perspective(2000px) rotateY(-16deg) scale(${1 + 0.06 * Math.exp(-(f - 120) / 4)})` }} glow={1.2} />
      <div style={{ position: "absolute", left: 120, top: 200, fontFamily: HEAVY, fontSize: 70, color: CREAM, textTransform: "uppercase" }}>through the <span style={{ color: GOLD }}>buffer api</span></div>
      <Typed t={"Sign in with Buffer   (OAuth)"} at={8} x={124} y={330} size={34} color={CREAM} />
      <Typed t={"channels(organizationId)"} at={23} x={124} y={400} size={34} />
      <Typed t={"createPost(\n  channelId, video,\n  mode: addToQueue,\n  saveToDraft: true )"} at={38} x={124} y={470} size={34} cps={3} />
      <Typed t={"tiktok ✓   youtube ✓"} at={83} x={124} y={720} size={40} color={CREAM} cps={2} />
    </Sequence>
    <Flash at={[0, 120]} max={0.4} len={7} />
  </AbsoluteFill>;
};

// ---- 4: a store ---------------------------------------------------------------
const Store1 = () => { const f = useCurrentFrame(); const z = f > 100 ? Math.pow(1 + (f - 100) / 5, 2) : 1;
  return <AbsoluteFill><Backdrop pulse={false} tone={0.6} start={1440} />
    <AbsoluteFill style={{ transform: `scale(${z})`, opacity: f > 112 ? 0 : 1 }}>
      <Build words={[{ t: "got", at: 0 }, { t: "a", at: 15 }, { t: "store?", at: 30, gold: true }]} y={540} size={300} />
    </AbsoluteFill></AbsoluteFill>; };

const SS = [ // the store recording
  { at: 0, from: 3.4, rate: 1.4 }, { at: 60, from: 7.3, rate: 2 }, { at: 150, from: 14.0 }, { at: 180, from: 15.5, rate: 7 }, { at: 270, from: 37.0 }, { at: 300, from: 38.5, rate: 225 },
];
const Store = () => {
  const f = useCurrentFrame();
  const W = whole(860, 1330);
  const view = g => kf(g, [
    [0, { ...W, ry: -28, rx: 8, s: W.s * 1.6 }], [20, { ...W, ry: -14, rx: 4 }, out], [56, { ...W, ry: -10, rx: 3 }, lin],
    [66, at(480, 1000, 1.3)], [146, at(480, 1020, 1.35), lin], [156, at(342, 1443, 1.8)], [176, at(342, 1443, 1.95), lin],
    [186, { ...whole(940, 960), ry: 16, rx: 3 }], [266, { ...whole(940, 960), ry: -10 }, lin], [276, at(184, 772, 1.9)], [296, at(184, 772, 2.05), lin],
    [306, { ...whole(940, 1250), ry: -16 }], [360, { ...whole(940, 1250), ry: 10 }, lin],
  ]);
  const n = Math.min(5, Math.max(1, Math.ceil((f - 180) / 18)));
  const reveal = f >= 360;
  return <AbsoluteFill>
    <Backdrop start={1560} />
    {!reveal ? <Shot src="store.mp4" segs={SS} view={view} dur={360}><Press x={342} y={1443} at={168} size={150} /><Press x={184} y={772} at={285} size={130} /></Shot> : null}
    {f < 60 ? <><Build words={[{ t: "drop in", at: 2 }, { br: true }, { t: "the store.", at: 17, gold: true }]} x={130} y={420} size={150} align="left" lineHeight={0.95} />
      <Typed t="hydrogen-preview.myshopify.com" at={26} x={136} y={600} size={30} />
      <Typed t="(Shopify's own demo store)" at={40} x={136} y={645} size={24} color={CREAM} /></> : null}
    {f >= 60 && f < 150 ? <AbsoluteFill style={{ background: "linear-gradient(transparent 60%, rgba(11,10,8,.85) 82%)" }}><Slam items={[{ t: "pick the products.", at: 62 }]} y={940} size={110} /></AbsoluteFill> : null}
    {f >= 186 && f < 270 ? <><div style={{ position: "absolute", left: 130, top: 320, fontFamily: HEAVY, fontSize: 340, color: GOLD, lineHeight: 1, transform: `scale(${1 + 0.15 * Math.exp(-((f - 180) % 18) / 3)})` }}>{n}</div>
      <div style={{ position: "absolute", left: 140, top: 700, fontFamily: HEAVY, fontSize: 80, color: CREAM, textTransform: "uppercase" }}>scripts</div></> : null}
    {f >= 300 && f < 360 ? <><div style={{ position: "absolute", left: 120, top: 330, fontFamily: HEAVY, fontSize: 110, color: CREAM, lineHeight: 1, textTransform: "uppercase" }}>render<br /><span style={{ color: GOLD }}>all</span></div>
      <div style={{ position: "absolute", left: 124, top: 590, fontFamily: MONO, fontSize: 30, color: CREAM, opacity: 0.75 }}>five videos · sped up</div></> : null}
    {reveal ? (() => { const g = f - 360; const pull = kf(g, [[0, 2.6], [26, 1, out], [120, 0.92, lin]]);
      return <AbsoluteFill style={{ transform: `scale(${pull})` }}>
        {[0, 1, 2, 3, 4].map(i => { const d = i - 2, sh = kf(g - i * 3, [[0, 0], [18, 1, punch]]);
          return <Mini key={i} src={`shorts/store${i}.mp4`} h={620} from={1} style={{ left: 960 - 174 + d * 370 * sh, top: 330 + Math.abs(d) * 40, transform: `perspective(1800px) rotateY(${-d * 12}deg) rotateZ(${d * 2}deg)` }} glow={0.8} />; })}
        <Build words={[{ t: "one", at: 10 }, { t: "video", at: 18 }, { t: "per", at: 25 }, { t: "product.", at: 33, gold: true }]} y={150} size={120} />
      </AbsoluteFill>; })() : null}
    <Flash at={[0, 66, 186, 306, 360]} max={0.4} len={7} />
  </AbsoluteFill>;
};

// ---- 5: a long video -----------------------------------------------------------
const Clips = () => {
  const f = useCurrentFrame();
  const W = 1280, H = 720;
  const tear = kf(f, [[100, 0], [140, 1, out]]);
  const fly = kf(f, [[140, 0], [175, 1, snap]]);
  return <AbsoluteFill>
    <Backdrop start={2040} />
    <Build words={[{ t: "got", at: 0 }, { t: "a long", at: 8 }, { t: "video?", at: 15, gold: true }]} y={120} size={130} until={180} />
    {f < 180 ? <div style={{ position: "absolute", left: 960 - W / 2, top: 230, width: W, height: H, transform: `perspective(2000px) rotateX(${kf(f, [[0, 30], [25, 6, out]])}deg) scale(${kf(f, [[0, 0.6], [25, 1, punch], [140, 1.05, lin], [175, 1.4]])})`, opacity: 1 - fly,
      borderRadius: 18, overflow: "hidden", boxShadow: "0 60px 120px rgba(0,0,0,.6), 0 0 0 4px #4a4130" }}>
      <OffthreadVideo src={staticFile("talk.mp4")} trimBefore={180} muted style={{ width: W, height: H }} />
      {[-1, 0, 1].map(d => <div key={d} style={{ position: "absolute", top: 0, height: H, width: H * 9 / 16, left: W / 2 - H * 9 / 32 + d * 330, border: `6px solid ${GOLD}`, opacity: tear, boxShadow: `0 0 40px ${GOLD}`, borderRadius: 10 }} />)}
    </div> : null}
    {f >= 140 ? [0, 1, 2].map(i => { const d = i - 1, k = kf(f - i * 4, [[140, 0], [178, 1, punch]]);
      const hh = kf(f, [[140, 405], [178, 760, out]]), st = { left: 960 - 214 + d * 500 * k, top: 200 + (1 - k) * 60, transform: `perspective(1800px) rotateY(${-d * 14 * k}deg)` };
      if (!CLIPS_READY) return <Crop key={i} h={hh} x={640 + d * 330} style={st} />;
      return <Mini key={i} src={`shorts/clip${i}.mp4`} h={kf(f, [[140, 405], [178, 760, out]])} from={0.5} style={{ left: 960 - 214 + d * 500 * k, top: 200 + (1 - k) * 60, transform: `perspective(1800px) rotateY(${-d * 14 * k}deg)` }} glow={0.9} />; }) : null}
    <Slam items={[{ t: "the best moments.", at: 182 }, { t: "pauses cut.", at: 240 }, { t: "words pop.", at: 270, gold: true }, { t: "the frame follows the face.", at: 300 }]} y={100} size={100} />
    <Flash at={[0, 140, 180]} max={0.4} len={7} />
  </AbsoluteFill>;
};

// ---- 6: a month planned -------------------------------------------------------
const Plan = () => {
  const f = useCurrentFrame();
  const days = ["M", "T", "W", "T", "F", "S", "S"], posts = [[0, 2, 4], [1, 3, 5], [0, 2, 4], [1, 3, 6]];
  return <AbsoluteFill>
    <Backdrop start={2400} />
    <Build words={[{ t: "plan", at: 0 }, { br: true }, { t: "a month.", at: 8, gold: true }]} x={130} y={360} size={150} align="left" lineHeight={0.95} />
    <Typed t={"3 a week · 4 weeks\n→ Buffer Ideas"} at={30} x={136} y={560} size={36} />
    <div style={{ position: "absolute", left: 900, top: 170, display: "grid", gridTemplateColumns: "repeat(7, 116px)", gap: 14, transform: `perspective(1600px) rotateY(-14deg) rotateX(6deg)` }}>
      {days.map((d, i) => <div key={"h" + i} style={{ fontFamily: MONO, color: CREAM, opacity: 0.6, fontSize: 26, textAlign: "center" }}>{d}</div>)}
      {posts.flatMap((wk, w) => days.map((_, d) => { const idx = wk.indexOf(d), on = idx >= 0, a = 30 + (w * 3 + idx) * 8, k = f - a;
        return <div key={w + "-" + d} style={{ height: 116, borderRadius: 18, background: on && k >= 0 ? GOLD : "rgba(251,246,234,.06)", border: "2px solid rgba(251,246,234,.12)",
          transform: on && k >= 0 ? `scale(${1 + 0.35 * Math.exp(-k / 3)})` : "none", boxShadow: on && k >= 0 ? "0 0 30px rgba(242,194,48,.5)" : "none", display: "grid", placeItems: "center",
          fontFamily: HEAVY, fontSize: 40, color: INK }}>{on && k >= 0 ? (idx === 1 && w % 2 ? "Aa" : "▶") : ""}</div>; }))}
    </div>
    <Slam items={[{ t: "write any day's video in one tap.", at: 150 }]} y={960} size={70} />
    <Flash at={[0]} max={0.4} len={7} />
  </AbsoluteFill>;
};

// ---- 7: put yourself in it (the boss's recording) -----------------------------
const You = () => <AbsoluteFill><Backdrop start={2640} /><Slate title="Put yourself in it" note="Optional: 20–30 s of the boss talking about a page, made into a short by Dailies. Left out if there is no recording." dur="4 s used" /></AbsoluteFill>;

// ---- 8: links, stores, long videos ----------------------------------------------
const Many = () => { const f = useCurrentFrame(); const z = f > 100 ? Math.pow(1 + (f - 100) / 5, 2) : 1;
  return <AbsoluteFill><Backdrop pulse={false} tone={0.7} start={2760} />
    <AbsoluteFill style={{ transform: `scale(${z})` }}>
      <Slam items={[{ t: "links.", at: 0 }, { t: "stores.", at: 15 }, { t: "long videos.", at: 30 }, { t: "in.", at: 45, gold: true }, { t: "shorts.", at: 60 }, { t: "out.", at: 75, gold: true }, { t: "every day.", at: 90, gold: true }]} size={250} />
    </AbsoluteFill></AbsoluteFill>; };

// ---- 9: the wall ----------------------------------------------------------------
const Wall = () => {
  const f = useCurrentFrame();
  const cols = 9, rows = 5, h = 500, w = h * 9 / 16, gx = w + 60, gy = h + 70;
  const z = kf(f, [[0, 1.9], [30, 1.25, out], [300, 0.62, lin], [330, 0.5, snap], [360, 0.4, lin]]);
  return <AbsoluteFill style={{ background: INK }}>
    <Backdrop start={2880} />
    <AbsoluteFill style={{ perspective: 2200 }}>
      <div style={{ position: "absolute", left: 960, top: 540, transform: `scale(${z}) rotateX(18deg) rotateZ(-7deg) translateY(${-f * 0.8}px)`, transformStyle: "preserve-3d" }}>
        {Array.from({ length: rows * cols }, (_, i) => { const r = Math.floor(i / cols), c = i % cols, cx = (c - (cols - 1) / 2) * gx, cy = (r - (rows - 1) / 2) * gy + (c % 2) * 120;
          const d = Math.hypot(c - 4, r - 2), k = kf(f - d * 4, [[0, 0], [16, 1, punch]]);
          return <Flip key={i} src={pick(i * 7 + r)} h={h} start={i * 5} style={{ left: cx - w / 2, top: cy - h / 2, transform: `scale(${k})`, opacity: k > 0 ? 1 : 0 }} glow={0.35} />; })}
      </div>
    </AbsoluteFill>
    <AbsoluteFill style={{ background: "radial-gradient(50% 40% at 50% 50%, rgba(11,10,8,.85), rgba(11,10,8,0))" }} />
    <Slam items={[{ t: "every day.", at: 30 }, { t: "every channel.", at: 90 }, { t: "drafted", at: 150 }, { t: "into buffer.", at: 180, gold: true }, { t: "you post.", at: 240, gold: true }]} size={200} until={330} />
    <Flash at={[0]} max={0.6} len={10} />
  </AbsoluteFill>;
};

// ---- 10: the end card -----------------------------------------------------------
const End = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill>
    <Backdrop start={3240} />
    <Shake hits={[0]} amp={26}>
      <div style={{ position: "absolute", left: 960, top: 380, transform: `translate(-50%,-50%) scale(${1 + 1.8 * Math.exp(-f / 2.5)})`, display: "flex", alignItems: "center", gap: 40 }}>
        <div style={{ width: 170, height: 170, borderRadius: 42, background: "#14120e", boxShadow: `0 0 0 4px #3b3324, 0 0 120px rgba(242,194,48,.5)`, display: "grid", placeItems: "center" }}>
          <div style={{ width: 104, height: 104, borderRadius: "50%", border: `13px solid ${GOLD}`, display: "grid", placeItems: "center" }}><div style={{ width: 36, height: 36, borderRadius: "50%", background: GOLD }} /></div></div>
        <div style={{ fontFamily: HEAVY, fontSize: 240, color: CREAM }}>DAILIES</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 590, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 64, color: GOLD, opacity: Math.min(1, Math.max(0, (f - 12) / 6)) }}>tap.bananafest-destiny.com</div>
      <div style={{ position: "absolute", left: 960, top: 740, transform: `translateX(-50%) scale(${f < 28 ? 0 : 1 + 0.2 * Math.exp(-(f - 28) / 3)})`, background: GOLD, color: INK, fontFamily: SANS, fontWeight: 900, fontSize: 46, padding: "26px 56px", borderRadius: 22 }}>Sign in with Buffer</div>
    </Shake>
    <Flash at={[0]} max={1} len={12} />
    <AbsoluteFill style={{ background: "#000", opacity: Math.max(0, (f - 160) / 20) }} />
  </AbsoluteFill>;
};

export const Demo = () => <AbsoluteFill style={{ background: INK }}>
  <Scene k="intro"><Intro /></Scene>
  <Scene k="logo"><Logo /></Scene>
  <Scene k="link"><Link /></Scene>
  <Scene k="buffer"><BufferSide /></Scene>
  <Scene k="store1"><Store1 /></Scene>
  <Scene k="store"><Store /></Scene>
  <Scene k="clips"><Clips /></Scene>
  <Scene k="plan"><Plan /></Scene>
  <Scene k="you"><You /></Scene>
  <Scene k="many"><Many /></Scene>
  <Scene k="wall"><Wall /></Scene>
  <Scene k="end"><End /></Scene>
  <Grain />
  <Audio src={staticFile("music.wav")} />
</AbsoluteFill>;
