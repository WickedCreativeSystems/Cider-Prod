// Makes the 1200x630 picture a chat app or a social site shows beside a link to each sales page:
// site/og.png for the home page and site/<page>/og.png for the others.
// Every word on a picture is lifted from the page it is for, so a picture cannot say what its page does not:
//   - the headline is the page's own <h1>;
//   - on the home page, the price line is the sentence that starts with "$" in the page's own og:description,
//     and the line under it is the "public log" clause of the same description;
//   - the small line above is the page's own kicker.
// The words drawn are also written to words.json beside this script. Run with CHECK=1 (no browser needed) to
// see whether any page's words have moved since its picture was made; if they have, run this again, look at
// the pictures, and deploy. Do that whenever the offer line or a headline changes.
//
//   PW=<folder holding node_modules/playwright-core> CHROME=<chrome binary> node make-og.mjs
//   CHECK=1 node make-og.mjs
//
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url)), site = path.resolve(here, "../../../site");
const PAGES = ["", "app-ideas", "vibe-coded-apps", "i-have-an-app-idea", "turn-my-idea-into-an-app", "app-idea-no-money",
  "can-ai-build-an-app-for-me", "how-much-does-it-cost-to-build-an-app-with-ai"];
const ENT = { "&amp;": "&", "&quot;": '"', "&#39;": "'", "&lt;": "<", "&gt;": ">", "&nbsp;": " ", "&middot;": "·" };
const text = s => s.replace(/<[^>]+>/g, "").replace(/&[a-z#0-9]+;/g, m => ENT[m] ?? m).replace(/\s+/g, " ").trim();
const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

function words(slug) {
  const s = fs.readFileSync(path.join(site, slug, "index.html"), "utf8");
  const h1 = s.match(/<h1[^>]*>([\s\S]*?)<\/h1>/), kick = s.match(/class="kicker"[^>]*>([\s\S]*?)<\//);
  if (!h1 || !kick) throw new Error(`no headline or kicker on /${slug}`);
  const w = { kicker: text(kick[1]), h1: text(h1[1]) };
  if (slug === "") {
    const d = s.match(/<meta property="og:description" content="([^"]*)"/)?.[1] ?? "";
    const price = d.match(/\$\d[^.]*\./)?.[0], log = d.match(/with (a public log of every day)/)?.[1];
    if (!price || !log) throw new Error("the home page's og:description no longer has the price sentence or the public log clause");
    w.price = text(price); w.log = log[0].toUpperCase() + log.slice(1) + ".";
  }
  return w;
}
const now = Object.fromEntries(PAGES.map(p => ["/" + p, words(p)]));
const kept = path.join(here, "words.json");
if (process.env.CHECK) {
  const was = fs.existsSync(kept) ? JSON.parse(fs.readFileSync(kept, "utf8")) : {};
  const moved = Object.keys(now).filter(k => JSON.stringify(now[k]) !== JSON.stringify(was[k]));
  console.log(moved.length ? "words moved since the pictures were made: " + moved.join(", ") : `all ${PAGES.length} pictures still say what their pages say`);
  process.exit(moved.length ? 1 : 0);
}

const { chromium } = await import(pathToFileURL(path.join(process.env.PW, "node_modules/playwright-core/index.mjs")).href);
const logo = "data:image/svg+xml;base64," + fs.readFileSync(path.join(site, "logo.svg")).toString("base64");
// Colours are the sales page's own light theme.
const html = w => `<!doctype html><meta charset="utf-8"><style>
*{box-sizing:border-box}html,body{margin:0}
body{width:1200px;height:630px;overflow:hidden;background:#fbf8f1;color:#1d1b16;font:22px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif;display:grid;grid-template-columns:1fr 300px;gap:44px;align-items:center;padding:0 64px 0 60px}
.k{font-size:21px;letter-spacing:.12em;text-transform:uppercase;color:#5f5a4f;margin:0 0 16px}
h1{font-size:66px;line-height:1.07;letter-spacing:-.02em;margin:0;text-wrap:balance}
.p{font-size:35px;line-height:1.2;font-weight:700;margin:30px 0 0;padding-left:18px;border-left:8px solid #b8860b;text-wrap:balance}
.l{font-size:26px;color:#5f5a4f;margin:12px 0 0;padding-left:26px}
img{width:300px;height:300px;display:block}
</style>
<div id="t"><p class="k">${esc(w.kicker)}</p><h1>${esc(w.h1)}</h1>${w.price ? `<p class="p">${esc(w.price)}</p><p class="l">${esc(w.log)}</p>` : ""}</div>
<img src="${logo}" alt="">`;

const b = await chromium.launch({ executablePath: process.env.CHROME, args: ["--no-sandbox"] });
const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
const tmp = path.join(here, ".og.html"), outDir = process.env.OUT || site;
for (const slug of PAGES) {
  const w = now["/" + slug]; fs.writeFileSync(tmp, html(w));
  await p.goto(pathToFileURL(tmp).href);
  // The headline shrinks until the words fit the picture with room above and below.
  const fit = await p.evaluate(() => { const t = document.getElementById("t"), h = document.querySelector("h1"); let s = 66;
    while (t.getBoundingClientRect().height > 520 && s > 40) { s -= 2; h.style.fontSize = s + "px"; }
    const r = t.getBoundingClientRect(), i = document.querySelector("img");
    return { size: s, top: Math.round(r.top), bottom: Math.round(r.bottom), wide: h.scrollWidth > h.clientWidth, logo: i.complete && i.naturalWidth > 0, sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight }; });
  if (fit.bottom - fit.top > 540 || fit.wide || !fit.logo || fit.sw > 1200 || fit.sh > 630) throw new Error(`/${slug} does not fit: ` + JSON.stringify(fit));
  const out = path.join(outDir, process.env.OUT ? (slug || "home") + ".png" : path.join(slug, "og.png"));
  await p.screenshot({ path: out });
  console.log("wrote", out, fs.statSync(out).size, "bytes;", JSON.stringify(fit));
}
await b.close(); fs.unlinkSync(tmp);
if (!process.env.OUT) fs.writeFileSync(kept, JSON.stringify(now, null, 1) + "\n");
