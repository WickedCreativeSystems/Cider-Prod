// node rec-bot.mjs probe|zoo|rr|sales <take name> : records the VibeCider bot's public pages at phone width, under Xvfb.
// zoo   = the studio's page for this bot, a press on the 17 Oct card, that day's plan against actual
// rr    = Round Robin live: names typed, schedule made
// sales = the sales page: headline, price boxes, pay button (nothing is pressed)
// Nobody is signed in. The visit counter is blocked, so a take counts no visit.
//   Xvfb :97 -screen 0 1200x2400x24 -nolisten tcp &
//   S=<scratch with footage/ and shots/> CHROME=<chrome for testing> DISPLAY=:97 OY=<from probe> node rec-bot.mjs zoo take1
// Needs playwright-core and ffmpeg-static in node_modules beside this file (or in S, run from there).
import { chromium } from "playwright-core";
import { spawn } from "node:child_process";
import fs from "node:fs";
import ffmpegPath from "ffmpeg-static";
const S = process.env.S, CH = process.env.CHROME, mode = process.argv[2], take = process.argv[3] || "t";
const ZOO = "https://bananafest-destiny.com/zoo/vibecider4", SALES = "https://vibecider.bananafest-destiny.com/", RR = SALES + "roundrobin/";
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
const ready = async () => { await p.evaluate(() => document.fonts.ready); await wait(800); };
let ff, t0; const marks = {}; const mark = k => { marks[k] = +((Date.now() - t0) / 1000).toFixed(2); console.log("mark", k, marks[k]); };
const start = name => { ff = spawn(ffmpegPath, ["-y", "-loglevel", "error", "-f", "x11grab", "-framerate", "30", "-video_size", `${W}x${H}`, "-draw_mouse", "0", "-i", `${DISP}.0+${OX},${OY}`, "-c:v", "libx264", "-preset", "veryfast", "-crf", "14", "-pix_fmt", "yuv420p", `${S}/footage/${name}.mp4`], { stdio: ["pipe", "inherit", "inherit"] }); t0 = Date.now(); };
const stop = () => new Promise(r => { ff.on("close", r); ff.stdin.write("q"); });
const done = async () => { mark("end"); await stop(); fs.writeFileSync(`${S}/footage/${take}-${mode}.marks.json`, JSON.stringify(marks, null, 1)); };

if (mode === "probe") {
  await p.goto(SALES, { waitUntil: "networkidle" }); await ready();
  await p.evaluate(() => { for (const pos of ["top:0", "bottom:0"]) { const d = document.createElement("div"); d.style.cssText = `position:fixed;left:0;${pos};width:100%;height:1px;background:#ff00ff;z-index:99999`; document.body.appendChild(d); } });
  await wait(300);
  await new Promise(r => spawn(ffmpegPath, ["-y", "-loglevel", "error", "-f", "x11grab", "-video_size", "1200x2400", "-i", `${DISP}.0`, "-frames:v", "1", `${S}/shots/probe.png`]).on("close", r));
  console.log("window", await p.evaluate(() => [innerWidth, innerHeight, devicePixelRatio, outerWidth, outerHeight].join(" ")));
} else if (mode === "zoo") {
  await p.goto(ZOO, { waitUntil: "networkidle" }); await ready();
  start(`${take}-zoo`); await wait(3200);                                  // the name, "live, $50 pay link"
  await scrollToY(await topOf(".zoo-two-col", 250), 1300); mark("grid"); await wait(2800);   // the commit grid, then the record table
  await scrollToY(await topOf("#log", 150), 1500); mark("log"); await wait(3600);            // "88 times...", "Every phase, planned then actual."
  const card = p.locator("a[href$='/log/2026-10-17']").first();
  const cy = await card.evaluate(e => Math.round(e.getBoundingClientRect().top + scrollY));
  await scrollToY(cy - 300, 4200); mark("card"); await wait(1300);         // down the day cards to 17 Oct
  await press(card); mark("press");
  await p.waitForURL(/log\/2026-10-17/, { timeout: 20000 }); await p.waitForLoadState("networkidle"); mark("day"); await wait(2600);
  await scrollToY(await topOf("a[href='#plan-phase-3-a-live-demo-of-what-50-buys']", 260), 1500); mark("matched"); await wait(3600);
  await scrollToY(await topOf("[id='plan-phase-3-a-live-demo-of-what-50-buys']", 40), 1700); mark("planned"); await wait(4200);
  await done();
} else if (mode === "rr") {
  await p.goto(RR, { waitUntil: "networkidle" }); await ready();
  start(`${take}-rr`); await wait(2200);
  await scrollToY(await topOf("#f", 16), 1000); mark("form"); await wait(500);
  await press(p.locator("#names")); await wait(300);
  await p.keyboard.type("Ana\nBen\nCarla\nDev\nEli\nFay\nGus\nHana", { delay: 55 }); mark("typed"); await wait(700);
  await press(p.locator("#f button").first()); mark("make");
  // the page itself scrolls to "Your schedule" after the press
  await p.waitForFunction(() => document.getElementById("tbl").rows.length > 0, null, { timeout: 10000 }); mark("schedule"); await wait(3400);
  await scrollToY((await p.evaluate(() => scrollY)) + 520, 2200); mark("more"); await wait(2400);
  await done();
} else if (mode === "sales") {
  await p.goto(SALES, { waitUntil: "networkidle" }); await ready();
  start(`${take}-sales`); await wait(3800);                                // the headline and what the bot does
  await scrollToY(await topOf(".price", 20), 1400); mark("price"); await wait(4200);          // $50 / take it / $30 a month
  await scrollToY((await topOf("a.cta", 0)) - 440, 1400); mark("pay"); await wait(4200);      // the pay button; holds for the tail
  await done();
}
await br.close();
