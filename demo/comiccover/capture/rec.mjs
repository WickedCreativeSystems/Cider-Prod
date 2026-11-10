// node rec.mjs probe|take  : records the Comic Cover paid flow from the local copy, under Xvfb.
import { chromium } from "playwright-core";
import { spawn } from "node:child_process";
import fs from "node:fs";
import ffmpegPath from "ffmpeg-static";
const S = process.env.S, CH = process.env.CHROME, B = "http://127.0.0.1:8893", mode = process.argv[2], sid = process.argv[3] || "cs_test_localcapture0001";
const DISP = process.env.DISPLAY, OX = +(process.env.OX || 0), OY = +(process.env.OY || 0), W = 1080, H = 1920;
const br = await chromium.launch({ executablePath: CH, headless: false,
  args: ["--force-device-scale-factor=3", "--window-position=0,0", "--window-size=360,760", "--hide-scrollbars", "--disable-infobars", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  ignoreDefaultArgs: ["--enable-automation"], env: { ...process.env, DISPLAY: DISP } });
const ctx = await br.newContext({ viewport: { width: 360, height: 640 }, colorScheme: "light" });
await ctx.route(/pulse\.bananafest-destiny\.com|buy\.stripe\.com/, r => r.abort());   // no visit counted, no checkout opened
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
const retype = async (sel, text, d = 38) => { await tap(sel); await p.keyboard.press("Control+A"); await wait(120); await p.keyboard.type(text, { delay: d }); };
let ff, t0; const marks = {}; const mark = k => { marks[k] = (Date.now() - t0) / 1000; console.log("mark", k, marks[k].toFixed(2)); };
const start = name => { ff = spawn(ffmpegPath, ["-y", "-loglevel", "error", "-f", "x11grab", "-framerate", "30", "-video_size", `${W}x${H}`, "-draw_mouse", "0", "-i", `${DISP}.0+${OX},${OY}`, "-c:v", "libx264", "-preset", "veryfast", "-crf", "14", "-pix_fmt", "yuv420p", `${S}/footage/${name}.mp4`], { stdio: ["pipe", "inherit", "inherit"] }); t0 = Date.now(); };
const stop = () => new Promise(r => { ff.on("close", r); ff.stdin.write("q"); });

if (mode === "probe") {
  await p.goto(B + "/comiccover/", { waitUntil: "networkidle" }); await wait(800);
  await p.evaluate(() => { for (const pos of ["top:0", "bottom:0"]) { const d = document.createElement("div"); d.style.cssText = `position:fixed;left:0;${pos};width:100%;height:1px;background:#ff00ff;z-index:99999`; document.body.appendChild(d); } }); await wait(300);
  await new Promise(r => spawn(ffmpegPath, ["-y", "-loglevel", "error", "-f", "x11grab", "-video_size", "1200x2400", "-i", `${DISP}.0`, "-frames:v", "1", `${S}/shots/probe.png`]).on("close", r));
  console.log(await p.evaluate(() => [innerWidth, innerHeight, devicePixelRatio, outerWidth, outerHeight, screenX, screenY].join(" ")));
} else {
  // Scene A: the price on the cover maker's page
  await p.goto(B + "/comiccover/", { waitUntil: "networkidle" }); await p.evaluate(() => document.fonts.ready); await wait(600);
  await p.evaluate(y => scrollTo(0, y), (await topOf("#buy h2", 150)) - 260);
  await wait(500);
  start(mode); await wait(1500);
  await scrollToY(await topOf("#buy h2", 150), 1200); await wait(1500);
  await tap("#buy a.btn"); mark("buyTap"); await wait(700);
  // Scene B: the paid page (the checkout itself is not opened)
  await p.goto(`${B}/comiccover/paid?session_id=${sid}`, { waitUntil: "networkidle" });
  await p.waitForFunction(() => /Paid\. Thank you/.test(document.getElementById("pmsg").textContent));
  await p.evaluate(y => scrollTo(0, y), await topOf("#paid", 14)); await wait(400);
  mark("paidReady"); await wait(1900);
  await scrollToY(await topOf("label[for=photo]", 20), 1300); await wait(400);
  const fc = p.waitForEvent("filechooser"); await tap("#photo"); await (await fc).setFiles(`${S}/dl/pug.jpg`); mark("photoIn"); await wait(900);
  await retype("#small", "The Unboxable"); await wait(250);
  await retype("#title", "Captain Snort"); await wait(300);
  await scrollToY(await topOf("label[for=cap]", 150), 600); await wait(200);
  await retype("#cap", "He fits in any box. Evil never will!", 30); await wait(350);
  await tap("#sw input[value=blue] + i"); await wait(700);
  await scrollToY(await topOf("#cv", 70), 1400); mark("filterCover"); await wait(2000);
  await scrollToY(await topOf("#paid", 14), 1200); await wait(300);
  await scrollToY(await topOf("label[for=power]", 150), 500); await wait(200);
  await tap("#power"); await p.keyboard.type("naps in any box, anywhere", { delay: 38 }); await wait(500);
  await tap("#go"); mark("drawTap");
  await p.waitForFunction(() => /is on your cover|could not|not used|dropped|used\./i.test(document.getElementById("status").textContent), null, { timeout: 120000 });
  mark("drawDone"); console.log("status:", await p.evaluate(() => document.getElementById("status").textContent));
  await wait(1600);
  await scrollToY(await topOf("#cv", 70), 1400); mark("aiCover"); await wait(3200);
  await tap(".view input[value=slab]"); mark("slabTap"); await wait(900);
  await scrollToY(await topOf("#sl", 16), 800); await wait(4200);
  mark("end");
  await stop();
  fs.writeFileSync(`${S}/footage/${mode}.marks.json`, JSON.stringify(marks, null, 1));
  await p.screenshot({ path: `${S}/shots/${mode}-end.png` });
}
await br.close();
