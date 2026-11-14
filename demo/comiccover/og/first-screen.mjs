// Is the $9 button on the first screen of the pet portrait page? Opens the page at phone, tablet and desktop
// sizes (the heights are what is left once a phone browser's own bars are drawn), prints where the button and
// the two pictures sit, says so when the button is below the first screen or the page scrolls sideways, and
// leaves a screenshot of each size to look at. Run it after any change to the top of that page.
//
//   PW=<folder holding node_modules/playwright-core> CHROME=<chrome binary> node first-screen.mjs [url] [folder for screenshots]
//
// Without a url it reads the live page. For the repo's copy, serve demo/comiccover/public first:
//   python3 -m http.server 8793 --bind 127.0.0.1 --directory demo/comiccover/public
//   ... node first-screen.mjs http://127.0.0.1:8793/comiccover/pet-portrait/ <folder>
// On 14 Nov 2026 every size passed but two rare ones: 320x480 (31 px short) and a phone held sideways (97 px).
// The loads carry "HeadlessChrome", so scratch/loads.mjs counts them as mine, and the boss's counter is not called.
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import { pathToFileURL } from "node:url";
const { chromium } = await import(pathToFileURL(path.join(process.env.PW, "node_modules/playwright-core/index.mjs")).href);
const url = process.argv[2] || "https://vibecider.bananafest-destiny.com/comiccover/pet-portrait/";
const out = process.argv[3] || fs.mkdtempSync(path.join(os.tmpdir(), "first-screen-"));
const b = await chromium.launch({ executablePath: process.env.CHROME, args: ["--no-sandbox"] });
let below = 0;
for (const [w, h, dark] of [[390, 664], [375, 548], [360, 560], [412, 760], [320, 480], [600, 800], [768, 900], [800, 600], [1280, 720], [844, 390], [390, 664, 1]]) {
  const q = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1, colorScheme: dark ? "dark" : "light", userAgent: "vibecider4-check HeadlessChrome" });
  await q.route(/pulse\.bananafest-destiny\.com/, r => r.abort());   // my looks are not visits
  await q.goto(url, { waitUntil: "load" });
  await q.evaluate(() => document.fonts.ready);
  const r = await q.evaluate(() => { const g = s => { const e = document.querySelector(s); if (!e) return null; const x = e.getBoundingClientRect(); return [Math.round(x.top), Math.round(x.bottom)]; };
    return { button: g("a.btn"), pictures: g(".ba"), sideways: document.documentElement.scrollWidth > innerWidth }; });
  if (!r.button || !r.pictures) throw new Error("the page no longer has a.btn or .ba: " + url);
  const ok = r.button[1] <= h; if (!ok) below++;
  console.log(`${w}x${h}${dark ? " dark" : ""}: button ${r.button[0]}-${r.button[1]}, pictures ${r.pictures[0]}-${r.pictures[1]}:`, ok ? "button on the first screen" : `BUTTON BELOW the first screen by ${r.button[1] - h} px`, r.sideways ? "and the page SCROLLS SIDEWAYS" : "");
  await q.screenshot({ path: path.join(out, `${w}x${h}${dark ? "-dark" : ""}.png`) });
  await q.close();
}
await b.close();
console.log(`screenshots in ${out}; ${below} of 11 sizes have the button below the first screen`);
