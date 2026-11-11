// The three app screens in the video, taken from Sizecurve's public preview
// (a generated store, no merchant data). The install box and the "Check your
// own store" box are never in the shot: each clip is one element.
//   PW=<path to playwright-core/index.mjs> CHROME=<path to chrome> node capture.mjs public/img
import { pathToFileURL } from "node:url";
const { chromium } = await import(pathToFileURL(process.env.PW).href);
const out = process.argv[2] || "public/img";
const b = await chromium.launch({ executablePath: process.env.CHROME, args: ["--no-sandbox"] });
// [page width, scale, selector, file]: the alert cards wide at 2x; the table and the order narrow at 3x so they fit the window whole.
for (const [W, dpr, sel, name] of [[1600, 2, "ul.alerts", "alerts"], [900, 3, "table", "styles"], [900, 3, "details.po", "po"]]) {
  const p = await b.newPage({ viewport: { width: W, height: 900 }, deviceScaleFactor: dpr });
  await p.goto("https://sizecurve.bananafest-destiny.com/", { waitUntil: "networkidle" });
  await p.evaluate(() => { document.querySelector("details.po").open = true; });
  await p.waitForTimeout(300);
  const clip = await p.evaluate(s => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.left, y: r.top + scrollY, width: r.width, height: r.height }; }, sel);
  await p.screenshot({ path: `${out}/${name}.png`, fullPage: true, clip });
  console.log(name, JSON.stringify(clip));
  await p.close();
}
await b.close();
