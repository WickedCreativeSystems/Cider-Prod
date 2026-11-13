// node rec-rr.mjs measure|take <take name> : records Round Robin, live, at phone width, under Xvfb. One take, no cuts.
// The top of the page, eight made-up names typed, "Make the schedule" pressed, the page's own line about the
// schedule (the fact a stranger can check), the seven rounds, a still tail.
// Nobody is signed in. The visit counter is blocked, so a take counts no visit. "Shuffle again" is not pressed:
// it picks a random shuffle, and then the schedule on screen is not the one a stranger gets from the same names.
//   Xvfb :97 -screen 0 1200x2400x24 -nolisten tcp &
//   S=<scratch with footage/ and shots/> CHROME=<chrome for testing> DISPLAY=:97 OY=<from rec-bot.mjs probe, 261 on 13 Nov> node rec-rr.mjs take t1
// Needs playwright-core and ffmpeg-static in node_modules beside this file (or in S, run from there).
import { chromium } from "playwright-core";
import { spawn } from "node:child_process";
import fs from "node:fs";
import ffmpegPath from "ffmpeg-static";
const S = process.env.S, CH = process.env.CHROME, mode = process.argv[2], take = process.argv[3] || "t";
const RR = "https://vibecider.bananafest-destiny.com/roundrobin/", NAMES = "Ana\nBen\nCarla\nDev\nEli\nFay\nGus\nHana";
const DISP = process.env.DISPLAY, OX = +(process.env.OX || 0), OY = +(process.env.OY || 0), W = 1080, H = 1920;
const br = await chromium.launch({ executablePath: CH, headless: false,
  args: ["--force-device-scale-factor=3", "--window-position=0,0", "--window-size=360,760", "--hide-scrollbars", "--disable-infobars"],
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
// the scroll runs inside the page on its own clock, so it lasts what it says however slowly the screen paints
const scrollToY = (y, ms = 1100) => p.evaluate(([y, ms]) => new Promise(res => { const y0 = scrollY, t0 = performance.now(); const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; const step = () => { const t = Math.min(1, (performance.now() - t0) / ms); scrollTo({ top: y0 + (y - y0) * ease(t), behavior: "instant" }); t < 1 ? requestAnimationFrame(step) : res(); }; requestAnimationFrame(step); }), [y, ms]);
const topOf = (sel, pad = 12) => p.evaluate(([s, pad]) => Math.max(0, Math.round(document.querySelector(s).getBoundingClientRect().top + scrollY - pad)), [sel, pad]);
const press = async loc => { const b = await loc.boundingBox(); await p.mouse.move(b.x + Math.min(b.width / 2, 120), b.y + b.height / 2); await wait(140); await p.mouse.down(); await wait(90); await p.mouse.up(); };
// the page scrolls itself after the press; wait until it has stopped
const settled = () => p.evaluate(() => new Promise(res => { let y = scrollY, n = 0; const t = setInterval(() => { if (scrollY === y) { if (++n >= 4) { clearInterval(t); res(scrollY); } } else { y = scrollY; n = 0; } }, 60); }));
let ff, t0; const marks = {}; const mark = k => { marks[k] = +((Date.now() - t0) / 1000).toFixed(2); console.log("mark", k, marks[k]); };
const start = name => { ff = spawn(ffmpegPath, ["-y", "-loglevel", "error", "-f", "x11grab", "-framerate", "30", "-video_size", `${W}x${H}`, "-draw_mouse", "0", "-i", `${DISP}.0+${OX},${OY}`, "-c:v", "libx264", "-preset", "veryfast", "-crf", "14", "-pix_fmt", "yuv420p", `${S}/footage/${name}.mp4`], { stdio: ["pipe", "inherit", "inherit"] }); t0 = Date.now(); };
const stop = () => new Promise(r => { ff.on("close", r); ff.stdin.write("q"); });
// where the rounds stop: round 1's row starts 28 px down the screen, so all seven rounds are whole in the tail
// (seven rows of 86 px end 10 px above the bottom). The table's heading row is then cut by the top edge.
const tailY = () => p.evaluate(() => Math.round(document.querySelector("#tbl tbody tr").getBoundingClientRect().top + scrollY - 28));

await p.goto(RR, { waitUntil: "networkidle" });
await p.evaluate(() => document.fonts.ready); await wait(800);
if (mode === "measure") {
  t0 = Date.now();
  const box = sel => p.evaluate(s => { const r = document.querySelector(s).getBoundingClientRect(); return [Math.round(r.top), Math.round(r.bottom)].join("-"); }, sel);
  console.log("top of page: h1", await box("h1"), "lede", await box(".lede"), "form", await box("#f")); await p.screenshot({ path: `${S}/shots/m1-top.png` });
  await scrollToY(await topOf("#f", 30), 300); console.log("at the form: label", await box("label[for=names]"), "button", await box("#f button")); 
  await press(p.locator("#names")); await p.keyboard.type(NAMES, { delay: 5 }); await p.screenshot({ path: `${S}/shots/m2-form.png` });
  await press(p.locator("#f button").first()); await p.waitForFunction(() => document.getElementById("tbl").rows.length > 0); console.log("landed at", await settled());
  console.log("schedule: h2", await box("#out h2"), "stats", await box("#stats"), "buttons", await box("#again"), "table", await box("#tbl"), "| says:", await p.locator("#stats").innerText());
  await p.screenshot({ path: `${S}/shots/m3-schedule.png` });
  const y = await tailY(); await scrollToY(y, 300);
  console.log("tail at", y, ": table", await box("#tbl"), "thead", await box("#tbl thead"), "next h2", await box("#out ~ div h2"), "demo note", await box(".demo"), "| rows", await p.evaluate(() => document.getElementById("tbl").rows.length));
  await p.screenshot({ path: `${S}/shots/m4-tail.png` });
} else {
  start(`${take}-rr`); await wait(2800);                                         // the headline and what it does
  await scrollToY(await topOf("#f", 30), 1100); mark("form"); await wait(600);
  await press(p.locator("#names")); await wait(350);
  await p.keyboard.type(NAMES, { delay: 75 }); mark("typed"); await wait(900);
  await press(p.locator("#f button").first()); mark("make");
  await p.waitForFunction(() => document.getElementById("tbl").rows.length > 0, null, { timeout: 10000 });
  await settled(); mark("schedule"); await wait(4000);                           // "8 players, 2 courts, 7 rounds. …"
  await scrollToY(await tailY(), 2600); mark("rounds"); await wait(4600);        // the seven rounds, held still for the tail
  mark("end"); await stop(); fs.writeFileSync(`${S}/footage/${take}-rr.marks.json`, JSON.stringify(marks, null, 1));
}
await br.close();
