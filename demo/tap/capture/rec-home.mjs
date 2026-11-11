// node rec-home.mjs probe|<take name> : records the Dailies home page at phone width, under Xvfb.
// Nobody is signed in and nothing is pressed that needs it. The visit counter is blocked, so the take counts no visit.
//   Xvfb :97 -screen 0 1200x2400x24 -nolisten tcp &
//   S=<scratch with footage/ and shots/> CHROME=<chrome for testing> DISPLAY=:97 OY=<from probe> node rec-home.mjs take1
// Needs playwright-core and ffmpeg-static in node_modules beside this file.
import { chromium } from "playwright-core";
import { spawn } from "node:child_process";
import fs from "node:fs";
import ffmpegPath from "ffmpeg-static";
const S = process.env.S, CH = process.env.CHROME, B = process.env.SITE || "https://tap.bananafest-destiny.com", mode = process.argv[2];
const DISP = process.env.DISPLAY, OX = +(process.env.OX || 0), OY = +(process.env.OY || 0), W = 1080, H = 1920;
const br = await chromium.launch({ executablePath: CH, headless: false,
  args: ["--force-device-scale-factor=3", "--window-position=0,0", "--window-size=360,760", "--hide-scrollbars", "--disable-infobars", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--autoplay-policy=no-user-gesture-required"],
  ignoreDefaultArgs: ["--enable-automation"], env: { ...process.env, DISPLAY: DISP } });
const ctx = await br.newContext({ viewport: { width: 360, height: 640 }, colorScheme: "light" });
await ctx.route(/pulse\.bananafest-destiny\.com/, r => r.abort());
await ctx.addInitScript(() => {
  const st = document.createElement("style"); st.textContent = "html{scrollbar-width:none} *{cursor:none!important}";
  addEventListener("DOMContentLoaded", () => document.head.appendChild(st));
});
const p = await ctx.newPage();
{ const cdp = await ctx.newCDPSession(p); const { windowId } = await cdp.send("Browser.getWindowForTarget"); await cdp.send("Browser.setWindowBounds", { windowId, bounds: { left: 0, top: 0, width: 500, height: 770 } }); }
p.on("pageerror", e => console.log("PAGEERR", e.message.slice(0, 200)));
const wait = ms => p.waitForTimeout(ms);
const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const scrollToY = async (y, ms = 1100) => { const y0 = await p.evaluate(() => scrollY); const n = Math.max(1, Math.round(ms / 16)); for (let i = 1; i <= n; i++) { await p.evaluate(v => scrollTo(0, v), y0 + (y - y0) * ease(i / n)); await wait(16); } };
const topOf = (sel, pad = 12) => p.evaluate(([s, pad]) => Math.max(0, Math.round(document.querySelector(s).getBoundingClientRect().top + scrollY - pad)), [sel, pad]);
const tap = async sel => { const b = await p.locator(sel).first().boundingBox(); await p.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await wait(120); await p.mouse.down(); await wait(90); await p.mouse.up(); };
let ff, t0; const marks = {}; const mark = k => { marks[k] = (Date.now() - t0) / 1000; console.log("mark", k, marks[k].toFixed(2)); };
const start = name => { ff = spawn(ffmpegPath, ["-y", "-loglevel", "error", "-f", "x11grab", "-framerate", "30", "-video_size", `${W}x${H}`, "-draw_mouse", "0", "-i", `${DISP}.0+${OX},${OY}`, "-c:v", "libx264", "-preset", "veryfast", "-crf", "14", "-pix_fmt", "yuv420p", `${S}/footage/${name}.mp4`], { stdio: ["pipe", "inherit", "inherit"] }); t0 = Date.now(); };
const stop = () => new Promise(r => { ff.on("close", r); ff.stdin.write("q"); });
const EX = ".ex video";

await p.goto(B + "/", { waitUntil: "networkidle" }); await p.evaluate(() => document.fonts.ready); await wait(800);
if (mode === "probe") {
  await p.evaluate(() => { for (const pos of ["top:0", "bottom:0"]) { const d = document.createElement("div"); d.style.cssText = `position:fixed;left:0;${pos};width:100%;height:1px;background:#ff00ff;z-index:99999`; document.body.appendChild(d); } });
  await wait(300);
  await new Promise(r => spawn(ffmpegPath, ["-y", "-loglevel", "error", "-f", "x11grab", "-video_size", "1200x2400", "-i", `${DISP}.0`, "-frames:v", "1", `${S}/shots/probe.png`]).on("close", r));
  console.log("window", await p.evaluate(() => [innerWidth, innerHeight, devicePixelRatio, outerWidth, outerHeight].join(" ")));
  console.log("hero short", await p.evaluate(() => { const v = document.getElementById("short"); return [v.readyState, v.paused, v.currentTime.toFixed(2), v.videoWidth, v.error && v.error.message].join(" "); }));
  console.log("layout", JSON.stringify(await p.evaluate(() => Object.fromEntries([".hero h1", ".hero .actions", ".hero .phone", "#example", ".ex video", ".ex ol", ".ex .cap", ".ex table", ".ex .actions", "main > h2:nth-of-type(2)"].map(s => { const e = document.querySelector(s); if (!e) return [s, null]; const r = e.getBoundingClientRect(); return [s, [Math.round(r.top + scrollY), Math.round(r.height), Math.round(r.width)]]; })))));
  console.log("doc", await p.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.scrollHeight].join(" ")));
} else {
  // A: the top of the page, then the short that plays there
  await p.evaluate(() => { const v = document.getElementById("short"); v.currentTime = 0; return v.play(); });
  start(mode); await wait(2600);
  await scrollToY(await topOf(".hero .phone", 24), 1300); mark("heroShort"); await wait(4200);
  // B: "What one link gave", no sign-in
  await scrollToY(await topOf("#example", 20), 1300); mark("example"); await wait(3200);
  await scrollToY(await topOf(".ex .phone", 16), 1200); await wait(600);
  // the player's own play button, bottom left of the picture (a press on the picture itself does nothing at this width)
  { const b = await p.locator(EX).boundingBox(); await p.mouse.move(b.x + 24, b.y + b.height - 49); await wait(120); await p.mouse.down(); await wait(90); await p.mouse.up(); } mark("playTap");
  await p.waitForFunction(s => document.querySelector(s).currentTime > 0.2, EX, { timeout: 20000 }); mark("playing");
  await wait(+(process.env.WATCH || 12000));
  await p.evaluate(s => document.querySelector(s).pause(), EX); mark("paused"); await wait(300);
  // C: the script, the caption, the month
  await scrollToY(await topOf(".ex h3", 16), 1300); mark("script"); await wait(4200);
  await scrollToY(await topOf(".ex .cap", 90), 1000); mark("caption"); await wait(3000);
  await scrollToY(await topOf(".ex h3:nth-of-type(2)", 16), 1200); mark("month"); await wait(3000);
  await scrollToY((await topOf(".ex .actions", 0)) - 470, 2600); mark("signin"); await wait(2600);
  mark("end");
  await stop();
  fs.writeFileSync(`${S}/footage/${mode}.marks.json`, JSON.stringify(marks, null, 1));
}
await br.close();
