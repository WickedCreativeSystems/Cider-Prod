// node rec-free.mjs probe|measure|take <take name> : records Comic Cover's FREE maker, live, at phone width, under Xvfb.
// The short route a phone visitor has since 14 Nov 2026: press "Add a photo", pick the photo, name the series,
// write the big line, download. One take, no cuts. No payment, no checkout, no drawing call, no slab, no grading label.
// Nobody is signed in; the page has no sign-in. The visit counter is blocked, so a take counts no visit.
//
// ONE THING IS PREPARED BEFORE THE CAMERA STARTS, and the clip's JSON has to say so: the form's default big line
// ("He fixed the Wi-Fi. Now he must save Christmas!") is emptied, the way a visitor empties a box, so that no frame
// names a season. Everything else on screen is the page's own default until it is typed over on camera.
// (CLEAR=0 leaves the default in, for a take that replaces it on camera instead.)
//
//   Xvfb :97 -screen 0 1200x2400x24 -nolisten tcp        (its own long-running command)
//   S=<scratch with footage/ shots/ dl/> CHROME=<chrome for testing> DISPLAY=:97 node rec-free.mjs probe
//   S=… CHROME=… DISPLAY=:97 PHOTO=<file> node rec-free.mjs measure
//   S=… CHROME=… DISPLAY=:97 OY=<from probe, 261 on 15 Nov> PHOTO=<file> node rec-free.mjs take t1
// Needs playwright-core and ffmpeg-static in node_modules beside this file (or copy it into S and run it there).
import { chromium } from "playwright-core";
import { spawn } from "node:child_process";
import fs from "node:fs";
import ffmpegPath from "ffmpeg-static";
const S = process.env.S, CH = process.env.CHROME, mode = process.argv[2], take = process.argv[3] || "t";
const URL_ = process.env.URL || "https://vibecider.bananafest-destiny.com/comiccover/";
const PHOTO = process.env.PHOTO || `${S}/dl/cat.jpg`, CLEAR = process.env.CLEAR !== "0";
const TITLE = process.env.TITLE || "Whiskers", CAP = process.env.CAP || "Nine lives. One laser stare.", FX = process.env.FX || "";   // FX=1 presses "Light" on camera
const DISP = process.env.DISPLAY, OX = +(process.env.OX || 0), OY = +(process.env.OY || 0), W = 1080, H = 1920;
// A fresh browser profile with one of Chrome's own settings turned off: "Show downloads when they're done". Left on,
// desktop Chrome opens its downloads panel over the top right of the page at the press on "Download the cover", and
// the panel names the file by a made-up id (the recorder's, not the page's "whiskers-cover.png"). The file is still
// saved; only the browser's panel stays shut. A phone shows its own notice there, which is not the page's either.
const PROF = `${S}/profile-${Date.now()}`; fs.mkdirSync(`${PROF}/Default`, { recursive: true });
fs.writeFileSync(`${PROF}/Default/Preferences`, JSON.stringify({ download_bubble: { partial_view_enabled: false } }));
const ctx = await chromium.launchPersistentContext(PROF, { executablePath: CH, headless: false,
  args: ["--force-device-scale-factor=3", "--window-position=0,0", "--window-size=360,760", "--hide-scrollbars", "--disable-infobars",
    // desktop Chrome flies a download arrow up the left edge of the page for a third of a second; a phone does not.
    // This scales the browser's own animations to nothing. It does not touch what the page draws.
    "--animation-duration-scale=0"],
  ignoreDefaultArgs: ["--enable-automation"], env: { ...process.env, DISPLAY: DISP },
  viewport: { width: 360, height: 640 }, colorScheme: "light", acceptDownloads: true });
const br = { close: async () => { await ctx.close(); fs.rmSync(PROF, { recursive: true, force: true }); } };
const asked = [];
await ctx.route(/pulse\.bananafest-destiny\.com|buy\.stripe\.com/, r => r.abort());   // no visit counted, no checkout opened
await ctx.addInitScript(() => {
  const st = document.createElement("style"); st.textContent = "html{scrollbar-width:none} *{cursor:none!important}";
  addEventListener("DOMContentLoaded", () => document.head.appendChild(st));
});
const p = ctx.pages()[0] || await ctx.newPage();
p.on("request", r => asked.push(r.method() + " " + r.url().replace(/^blob:.*/, "blob:").slice(0, 120)));   // every address the page asks for, to show no drawing call is made
{ const cdp = await ctx.newCDPSession(p); const { windowId } = await cdp.send("Browser.getWindowForTarget"); await cdp.send("Browser.setWindowBounds", { windowId, bounds: { left: 0, top: 0, width: 500, height: 770 } }); }
p.on("pageerror", e => console.log("PAGEERR", e.message.slice(0, 200)));
const wait = ms => p.waitForTimeout(ms);
// the scroll runs inside the page on its own clock, so it lasts what it says however slowly the screen paints
const scrollToY = (y, ms = 1100) => p.evaluate(([y, ms]) => new Promise(res => { const y0 = scrollY, t0 = performance.now(); const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; const step = () => { const t = Math.min(1, (performance.now() - t0) / ms); scrollTo({ top: y0 + (y - y0) * ease(t), behavior: "instant" }); t < 1 ? requestAnimationFrame(step) : res(); }; requestAnimationFrame(step); }), [y, ms]);
const topOf = (sel, pad = 12) => p.evaluate(([s, pad]) => Math.max(0, Math.round(document.querySelector(s).getBoundingClientRect().top + scrollY - pad)), [sel, pad]);
const press = async sel => { const b = await p.locator(sel).first().boundingBox(); await p.mouse.move(b.x + Math.min(b.width / 2, 120), b.y + b.height / 2); await wait(140); await p.mouse.down(); await wait(90); await p.mouse.up(); };
const box = sel => p.evaluate(s => { const r = document.querySelector(s).getBoundingClientRect(); return [Math.round(r.top), Math.round(r.bottom)].join("-"); }, sel);
const boxes = async (...sels) => (await Promise.all(sels.map(async s => `${s} ${await box(s)}`))).join("  ");
// one stop for the whole form: the "Title" label 27 px down the screen. The title box, the big line box, the colours and
// the effect choice are then in one frame, the file box above is out, and the $9 example picture under the form is out.
const formY = () => topOf("label[for=title]", 27);
const clearCap = () => p.evaluate(() => { const c = document.getElementById("cap"); c.value = ""; c.dispatchEvent(new Event("input", { bubbles: true })); });
const addPhoto = async () => { const fc = p.waitForEvent("filechooser"); await press("#addp"); await (await fc).setFiles(PHOTO); await p.waitForFunction(() => document.getElementById("addp").textContent === "Change the photo"); };
const saveCanvas = async name => { const d = await p.evaluate(() => document.getElementById("cv").toDataURL("image/jpeg", 0.9)); fs.writeFileSync(`${S}/shots/${name}.jpg`, Buffer.from(d.split(",")[1], "base64")); };
let ff, t0; const marks = {}; const mark = k => { marks[k] = +((Date.now() - t0) / 1000).toFixed(2); console.log("mark", k, marks[k]); };
const start = name => { ff = spawn(ffmpegPath, ["-y", "-loglevel", "error", "-f", "x11grab", "-framerate", "30", "-video_size", `${W}x${H}`, "-draw_mouse", "0", "-i", `${DISP}.0+${OX},${OY}`, "-c:v", "libx264", "-preset", "veryfast", "-crf", "14", "-pix_fmt", "yuv420p", `${S}/footage/${name}.mp4`], { stdio: ["pipe", "inherit", "inherit"] }); t0 = Date.now(); };
const stop = () => new Promise(r => { ff.on("close", r); ff.stdin.write("q"); });

await p.goto(URL_, { waitUntil: "networkidle" });
await p.evaluate(() => document.fonts.ready); await wait(800);

if (mode === "probe") {
  // two 1 px lines at the page's top and bottom edge, then one picture of the whole X screen: where the page starts is OY
  await p.evaluate(() => { for (const pos of ["top:0", "bottom:0"]) { const d = document.createElement("div"); d.style.cssText = `position:fixed;left:0;${pos};width:100%;height:1px;background:#ff00ff;z-index:99999`; document.body.appendChild(d); } }); await wait(300);
  await new Promise(r => spawn(ffmpegPath, ["-y", "-loglevel", "error", "-f", "x11grab", "-video_size", "1200x2400", "-i", `${DISP}.0`, "-frames:v", "1", `${S}/shots/probe.png`]).on("close", r));
  console.log(await p.evaluate(() => [innerWidth, innerHeight, devicePixelRatio, outerWidth, outerHeight, screenX, screenY].join(" ")));
} else if (mode === "measure") {
  console.log("top of page:", await boxes("h1", ".lede", "#addp", ".view", "#cv", "#dl", "#f"));
  await p.screenshot({ path: `${S}/shots/m1-top.png` });
  await saveCanvas("m-cover-empty-default");
  if (CLEAR) { await clearCap(); await wait(200); await saveCanvas("m-cover-empty-cleared"); await p.screenshot({ path: `${S}/shots/m1-top-cleared.png` }); }
  await addPhoto(); await wait(600);
  console.log("photo in, scrollY", await p.evaluate(() => scrollY), ":", await boxes("#addp", ".view", "#cv", "#dl"));
  await p.screenshot({ path: `${S}/shots/m2-photo.png` }); await saveCanvas("m-cover-photo-strong");
  await p.locator("input[name=fx][value='1']").check(); await wait(300); await saveCanvas("m-cover-photo-light");
  await p.locator("input[name=fx][value='2']").check(); await wait(300);
  const yc = await topOf("#cv", 40); await scrollToY(yc, 300); console.log("cover whole? at", yc, await boxes("#cv", "#dl")); await p.screenshot({ path: `${S}/shots/m3-cover.png` });
  const yt = await formY(); await scrollToY(yt, 300); console.log("at the form:", yt, await boxes("#photo", "#small", "label[for=title]", "#title", "#date", "#burst", "#cap", "input[name=c]", "input[name=fx]", "#f", ".buy img"));
  await press("#title"); await p.keyboard.press("Control+A"); await p.keyboard.type(TITLE, { delay: 5 }); await p.screenshot({ path: `${S}/shots/m4-title.png` });
  await press("#cap"); if (!CLEAR) await p.keyboard.press("Control+A"); await p.keyboard.type(CAP, { delay: 5 }); await p.screenshot({ path: `${S}/shots/m5-cap.png` });
  await scrollToY(yc, 300); await wait(300); await p.screenshot({ path: `${S}/shots/m6-cover-done.png` }); await saveCanvas("m-cover-done");
  const dl = p.waitForEvent("download"); await press("#dl"); const d = await dl; await d.saveAs(`${S}/shots/m-download-${d.suggestedFilename()}`); console.log("download:", d.suggestedFilename());
  await wait(500); await p.screenshot({ path: `${S}/shots/m7-after-download.png` });
  console.log("asked for:\n " + [...new Set(asked)].join("\n "));
} else {
  if (CLEAR) await clearCap();
  await wait(400);
  const yc = await topOf("#cv", 40);
  start(`${take}-free`); await wait(3600);                                         // the headline, the paragraph, "Add a photo"
  const fc = p.waitForEvent("filechooser"); await press("#addp"); mark("addPhotoPress");
  await (await fc).setFiles(PHOTO); await p.waitForFunction(() => document.getElementById("addp").textContent === "Change the photo"); mark("photoIn"); await wait(2000);
  await scrollToY(yc, 1100); mark("coverWithPhoto"); await wait(3000);             // the photo on the cover, whole
  await scrollToY(await formY(), 1500); mark("form"); await wait(700);
  await press("#title"); await p.keyboard.press("Control+A"); mark("titlePress"); await wait(250);
  await p.keyboard.type(TITLE, { delay: 130 }); mark("titleTyped"); await wait(900);
  await press("#cap"); if (!CLEAR) await p.keyboard.press("Control+A"); mark("capPress"); await wait(250);
  await p.keyboard.type(CAP, { delay: 90 }); mark("capTyped"); await wait(1000);
  if (FX) { await press(`input[name=fx][value='${FX}']`); mark("fxPress"); await wait(600); }
  await scrollToY(yc, 1500); mark("coverDone"); await wait(4500);                  // the finished cover, whole
  const dl = p.waitForEvent("download"); await press("#dl"); mark("downloadPress"); const d = await dl; await d.saveAs(`${S}/footage/${take}-${d.suggestedFilename()}`); mark("downloadSaved");
  await wait(5000);                                                                // the still tail
  mark("end"); await stop();
  fs.writeFileSync(`${S}/footage/${take}-free.marks.json`, JSON.stringify(marks, null, 1));
  fs.writeFileSync(`${S}/footage/${take}-free.asked.txt`, [...new Set(asked)].join("\n") + "\n");
  console.log("saved", d.suggestedFilename());
}
await br.close();
