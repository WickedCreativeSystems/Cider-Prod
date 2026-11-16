// Makes the 1200x630 picture a chat app or a social site shows beside a link to Dailies' home page.
// NOT LIVE. This folder is outside ./public and ./src, so a tap deploy does not serve it. README.md here
// says when and how it goes in (after Buffer Commit's judging; no tap deploy during judging).
//
// Every word on the picture is lifted from the home page (../public/index.html), so the picture cannot say
// what the page does not:
//   - the name beside the logo is the page's own brand link;
//   - the headline is the page's own <h1>;
//   - the line under it is the first sentence of the page's own lede;
//   - the line under the phone is the first clause of the page's own caption under its phone;
//   - the picture in the phone is the page's own poster, ../public/home/short.jpg, a frame of a real short.
// The words drawn are also written to words.json beside this script. Run with CHECK=1 (no browser needed) to
// see whether the page's words have moved since the picture was made; if they have, run this again and look.
//
//   PW=<folder holding node_modules/playwright-core> CHROME=<chrome binary> node make-og.mjs
//   CHECK=1 node make-og.mjs
//
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url)), pub = path.resolve(here, "../public");
const ENT = { "&amp;": "&", "&quot;": '"', "&#39;": "'", "&lt;": "<", "&gt;": ">", "&nbsp;": " ", "&times;": "×" };
const text = s => s.replace(/<[^>]+>/g, "").replace(/&[a-z#0-9]+;/g, m => ENT[m] ?? m).replace(/\s+/g, " ").trim();
const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

function words() {
  const s = fs.readFileSync(path.join(pub, "index.html"), "utf8");
  const brand = s.match(/<a class="brand"[^>]*>([\s\S]*?)<\/a>/), h1 = s.match(/<h1[^>]*>([\s\S]*?)<\/h1>/),
    lede = s.match(/<p class="lede">([\s\S]*?)<\/p>/), cap = s.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/),
    poster = s.match(/<video id="short"[^>]*poster="([^"]+)"/);
  if (!brand || !h1 || !lede || !cap || !poster) throw new Error("the home page no longer has a brand link, a headline, a lede, a caption or a poster");
  const first = text(lede[1]).match(/^[^.]*\./)?.[0], clause = text(cap[1]).match(/^[^:]*/)?.[0];
  if (!first || !clause) throw new Error("the lede has no first sentence, or the caption no first clause");
  return { brand: text(brand[1]), h1: text(h1[1]), lede: first, caption: clause, poster: poster[1] };
}
const now = words(), kept = path.join(here, "words.json");
if (process.env.CHECK) {
  const was = fs.existsSync(kept) ? JSON.parse(fs.readFileSync(kept, "utf8")) : {};
  const moved = Object.keys(now).filter(k => now[k] !== was[k]);
  console.log(moved.length ? "words moved on Dailies' home page since its picture was made: " + moved.join(", ") : "Dailies' picture still says what its home page says");
  process.exit(moved.length ? 1 : 0);
}

const { chromium } = await import(pathToFileURL(path.join(process.env.PW, "node_modules/playwright-core/index.mjs")).href);
const data = (f, type) => `data:${type};base64,` + fs.readFileSync(f).toString("base64");
const logo = data(path.join(pub, "logo.png"), "image/png"), shot = data(path.join(pub, now.poster), "image/jpeg");
// Colours are the page's own light theme (ui.css): --bg, --fg, --muted, --gold, --ink.
const html = w => `<!doctype html><meta charset="utf-8"><style>
*{box-sizing:border-box}html,body{margin:0}
body{width:1200px;height:630px;overflow:hidden;background:#fbf8f1;color:#1d1b16;font:22px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif;display:grid;grid-template-columns:1fr 290px;gap:60px;align-items:center;padding:0 84px 0 64px}
.b{display:flex;align-items:center;gap:16px;font-size:34px;font-weight:700;letter-spacing:-.01em;margin:0 0 30px}
.b img{width:56px;height:56px;border-radius:14px;display:block}
h1{font-size:68px;line-height:1.07;letter-spacing:-.02em;margin:0;text-wrap:balance}
.l{font-size:31px;line-height:1.25;color:#5f5a4f;margin:26px 0 0;padding-left:18px;border-left:8px solid #e8b830}
figure{margin:0}
.s{width:270px;margin:0 auto;aspect-ratio:9/16;border:9px solid #0b0a07;border-radius:34px;overflow:hidden;background:#000;box-shadow:0 18px 40px rgb(0 0 0/.18)}
.s img{display:block;width:100%;height:100%;object-fit:cover}
figcaption{font-size:21px;line-height:1.25;color:#5f5a4f;text-align:center;margin-top:12px;text-wrap:balance}
</style>
<div id="t"><p class="b"><img id="logo" src="${logo}" alt="">${esc(w.brand)}</p><h1>${esc(w.h1)}</h1><p class="l">${esc(w.lede)}</p></div>
<figure id="f"><div class="s"><img id="shot" src="${shot}" alt=""></div><figcaption>${esc(w.caption)}</figcaption></figure>`;

const b = await chromium.launch({ executablePath: process.env.CHROME, args: ["--no-sandbox"] });
const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
const tmp = path.join(here, ".og.html"), out = path.join(process.env.OUT || here, "og.png");
fs.writeFileSync(tmp, html(now));
await p.goto(pathToFileURL(tmp).href);
// The headline shrinks until the words fit the picture with room above and below.
const fit = await p.evaluate(() => { const t = document.getElementById("t"), h = document.querySelector("h1"), f = document.getElementById("f"); let s = 68;
  while (t.getBoundingClientRect().height > 500 && s > 40) { s -= 2; h.style.fontSize = s + "px"; }
  const r = t.getBoundingClientRect(), g = f.getBoundingClientRect(), ok = i => { const e = document.getElementById(i); return e.complete && e.naturalWidth > 0; };
  return { size: s, top: Math.round(r.top), bottom: Math.round(r.bottom), ftop: Math.round(g.top), fbottom: Math.round(g.bottom), wide: h.scrollWidth > h.clientWidth,
    logo: ok("logo"), shot: ok("shot"), sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight }; });
if (fit.bottom - fit.top > 540 || fit.ftop < 12 || fit.fbottom > 618 || fit.wide || !fit.logo || !fit.shot || fit.sw > 1200 || fit.sh > 630) { await b.close(); throw new Error("the picture does not fit: " + JSON.stringify(fit)); }
await p.screenshot({ path: out });
console.log("wrote", out, fs.statSync(out).size, "bytes;", JSON.stringify(fit));
await b.close(); fs.unlinkSync(tmp);
if (!process.env.OUT) fs.writeFileSync(kept, JSON.stringify(now, null, 1) + "\n");
