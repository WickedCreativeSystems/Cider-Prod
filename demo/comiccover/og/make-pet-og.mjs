// Makes demo/comiccover/public/comiccover/pet-portrait/og.jpg, the 1200x630 picture a chat app or a social site
// shows beside a link to the pet portrait page (/comiccover/pet-portrait/), the page that takes $9.
// Nothing in the picture is new. This script reads the repo's copy of the page and lifts from it:
//   - the two pictures: the page's first two <img>, the photo of Bobo and the drawing the AI made from it;
//   - the headline: the page's <h1> up to its colon;
//   - the line under it: the first sentence of the page's own og:description;
//   - the price: the sentence with "$" in that same og:description;
//   - the two captions: the page's own <figcaption>s (the second up to its colon);
//   - the small name above: what follows "|" in the page's <title>.
// It stops if any of them is missing. The words drawn are kept in pet-words.json beside this script.
// Run with CHECK=1 (no browser needed) to see whether the page's words or pictures have moved since the
// picture was made; if they have, run this again, look at the picture, and deploy. Do that whenever the
// price, the headline or the example changes.
//
//   PW=<folder holding node_modules/playwright-core> CHROME=<chrome binary> node make-pet-og.mjs
//   CHECK=1 node make-pet-og.mjs
//   (OUT=<file> writes a draft somewhere else and leaves pet-words.json alone)
//
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url)), pub = path.resolve(here, "../public");
const ENT = { "&amp;": "&", "&quot;": '"', "&#39;": "'", "&lt;": "<", "&gt;": ">", "&nbsp;": " " };
const text = s => s.replace(/<[^>]+>/g, "").replace(/&[a-z#0-9]+;/g, m => ENT[m] ?? m).replace(/\s+/g, " ").trim();
const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

function lift() {
  const s = fs.readFileSync(path.join(pub, "comiccover/pet-portrait/index.html"), "utf8"), body = s.slice(s.indexOf("<body"));
  const h1 = body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/), d = s.match(/<meta property="og:description" content="([^"]*)"/)?.[1];
  const name = s.match(/<title>[^<]*\|\s*([^<]+)<\/title>/)?.[1];
  const figs = [...body.matchAll(/<figure><img src="([^"]+)"[^>]*><figcaption>([\s\S]*?)<\/figcaption><\/figure>/g)];
  if (!h1 || !d || !name || figs.length < 2) throw new Error("the pet page no longer has a headline, an og:description, a name in its title, or two captioned pictures");
  const sentences = text(d).match(/[^.]+\./g) ?? [], price = sentences.find(x => x.includes("$"));
  if (!price || sentences[0] === price) throw new Error("the pet page's og:description no longer has a first sentence and a price sentence");
  const w = { name: name.trim(), headline: text(h1[1]).split(":")[0], line: sentences[0].trim(), price: price.trim().replace(/\.$/, ""),
    photo: { src: figs[0][1], caption: text(figs[0][2]) }, drawing: { src: figs[1][1], caption: text(figs[1][2]).split(":")[0] } };
  for (const k of ["photo", "drawing"]) {
    const f = path.join(pub, w[k].src); if (!fs.existsSync(f)) throw new Error("the page names a picture that is not in the repo: " + w[k].src);
    w[k].bytes = fs.statSync(f).size;            // a new example of the same name also counts as moved
  }
  return w;
}
const w = lift(), kept = path.join(here, "pet-words.json");
if (process.env.CHECK) {
  const was = fs.existsSync(kept) ? fs.readFileSync(kept, "utf8") : "";
  const same = was && JSON.stringify(JSON.parse(was)) === JSON.stringify(w);
  console.log(same ? "the pet page's picture still says what the page says" : "the pet page's words or pictures have moved since its link picture was made");
  process.exit(same ? 0 : 1);
}

const { chromium } = await import(pathToFileURL(path.join(process.env.PW, "node_modules/playwright-core/index.mjs")).href);
const uri = src => "data:image/jpeg;base64," + fs.readFileSync(path.join(pub, src)).toString("base64");
// Colours, the red button and the caption style are the page's own (its light theme).
const html = `<!doctype html><meta charset="utf-8"><style>
*{box-sizing:border-box}html,body{margin:0}
body{width:1200px;height:630px;overflow:hidden;position:relative;background:#fbf7ee;color:#1b1a17;font:22px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif}
.t{position:absolute;left:52px;top:0;width:392px;height:630px;display:flex;flex-direction:column;justify-content:center;align-items:flex-start}
.name{font-size:20px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#d7372b;margin:0 0 14px}
h1{font-size:64px;line-height:1.03;letter-spacing:-.02em;margin:0 0 20px;text-wrap:balance}
.sub{font-size:25px;line-height:1.35;color:#5d584d;margin:0 0 26px}
.price{background:#d7372b;color:#fff;font-weight:700;font-size:25px;border-radius:8px;padding:10px 18px}
figure{position:absolute;margin:0;top:86px}
figure img{display:block;height:424px;border:6px solid #fff;box-shadow:0 10px 28px rgba(27,26,23,.28)}
figcaption{font-size:21px;color:#5d584d;text-align:center;margin-top:14px}
#photo{left:476px;transform:rotate(-1.5deg)}
#drawing{left:824px;transform:rotate(1.5deg)}
.arrow{position:absolute;left:786px;top:268px;width:60px;height:60px;border-radius:50%;background:#d7372b;color:#fff;font-size:34px;font-weight:700;display:flex;align-items:center;justify-content:center;z-index:2;box-shadow:0 4px 12px rgba(27,26,23,.3)}
</style>
<div class="t"><p class="name">${esc(w.name)}</p><h1>${esc(w.headline)}</h1><p class="sub">${esc(w.line)}</p><span class="price">${esc(w.price)}</span></div>
<figure id="photo"><img src="${uri(w.photo.src)}" alt=""><figcaption>${esc(w.photo.caption)}</figcaption></figure>
<div class="arrow">&rarr;</div>
<figure id="drawing"><img src="${uri(w.drawing.src)}" alt=""><figcaption>${esc(w.drawing.caption)}</figcaption></figure>`;
const tmp = path.join(here, ".pet-og.html"); fs.writeFileSync(tmp, html);
const b = await chromium.launch({ executablePath: process.env.CHROME, args: ["--no-sandbox"] });
const q = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await q.goto(pathToFileURL(tmp).href);
await q.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth));
const fit = await q.evaluate(() => { const r = s => { const x = document.querySelector(s).getBoundingClientRect(); return [x.left, x.top, x.right, x.bottom].map(Math.round); };
  return { w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight, words: [r(".name")[1], Math.max(r("h1")[2], r(".sub")[2], r(".price")[2]), r(".price")[3]], photo: r("#photo"), drawing: r("#drawing") }; });
try {
  if (fit.words[0] < 24 || fit.words[2] > 606) throw new Error("the words run off the picture");
  if (fit.photo[0] < fit.words[1] + 10) throw new Error("the photo runs under the words");
  if (fit.drawing[2] > 1192 || fit.drawing[3] > 622 || fit.photo[3] > 622 || fit.photo[1] < 8 || fit.drawing[1] < 8) throw new Error("a picture runs off the edge");
} catch (e) { await b.close(); fs.unlinkSync(tmp); throw new Error(e.message + ": " + JSON.stringify(fit)); }
const outPath = process.env.OUT || path.join(pub, "comiccover/pet-portrait/og.jpg");
await q.screenshot({ path: outPath, type: "jpeg", quality: 88 }); await b.close(); fs.unlinkSync(tmp);
if (!process.env.OUT) fs.writeFileSync(kept, JSON.stringify(w, null, 1) + "\n");
console.log("wrote", outPath, fs.statSync(outPath).size, "bytes;", JSON.stringify(w), JSON.stringify(fit));
