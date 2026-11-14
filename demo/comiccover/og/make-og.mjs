// Makes demo/comiccover/public/comiccover/og.jpg, the 1200x630 picture a chat app or a social site shows beside a
// link to Comic Cover's maker page (/comiccover/).
// The cover and the slab on it are the page's own work: this script opens the repo's copy of the page in a browser,
// gives it a photo through its own file box, types into its own fields, and reads back the two canvases the page
// draws (the same pixels its Download button saves). Nothing is drawn here but the words beside them.
// The cover is the FREE one: the photo with the page's "Light" comic effect, not the $9 AI drawing. ("Strong", the
// page's default, turns this cat's white fur into purple blots; FX=2 shows it. A visitor has the same choice.)
// The slab beside it is the page's "Slab it" view of the same cover, with the grader's note retyped.
// The photo is examples/cat-photo.jpg: CC0, Wikimedia Commons, "Tabby cat with blue eyes-3336579.jpg".
// If the page's drawing code or its look changes, run this again and look at the picture before it goes up.
//
//   PW=<folder holding node_modules/playwright-core> CHROME=<chrome binary> node make-og.mjs
//   (OUT=<file> writes somewhere else; PARTS=<folder> also saves the cover and the slab as the page made them)
//
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url)), pub = path.resolve(here, "../public");
const { chromium } = await import(pathToFileURL(path.join(process.env.PW, "node_modules/playwright-core/index.mjs")).href);

const WORDS = { small: "The Uncanny", title: "Whiskers", issue: "1", date: "First issue", burst: "First appearance!", cap: "Nine lives. One laser stare." };
const NOTE = "Minor wear from knocking things off tables.", COLOR = process.env.COLOR || "purple", FX = process.env.FX || "1";   // 1 is the page's "Light" comic effect, 2 its "Strong"
const ORIGIN = "https://og.invalid";            // a made-up address; every request to it is answered from the repo's files
const TYPES = { ".html": "text/html", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".png": "image/png" };

const b = await chromium.launch({ executablePath: process.env.CHROME, args: ["--no-sandbox"] });
const ctx = await b.newContext({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 1 });
await ctx.route("**/*", route => {
  const u = new URL(route.request().url());
  if (u.origin === ORIGIN) {
    let f = path.join(pub, decodeURIComponent(u.pathname)); if (u.pathname.endsWith("/")) f = path.join(f, "index.html");
    if (!f.startsWith(pub) || !fs.existsSync(f)) return route.fulfill({ status: 404, body: "" });
    return route.fulfill({ status: 200, contentType: TYPES[path.extname(f)] || "application/octet-stream", body: fs.readFileSync(f) });
  }
  if (/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname) || u.protocol === "file:" || u.protocol === "data:" || u.protocol === "blob:") return route.continue();
  return route.abort();                          // the visit counter and anything else stay unasked
});
const p = await ctx.newPage();
const errs = []; p.on("pageerror", e => errs.push(String(e)));
await p.goto(ORIGIN + "/comiccover/");
if (!(await p.title()).includes("Comic Cover")) throw new Error("this is not the maker page");
await p.setInputFiles("#photo", path.join(pub, "comiccover/examples/cat-photo.jpg"));
for (const [id, v] of Object.entries(WORDS)) await p.fill("#" + id, v);
await p.check(`input[name=c][value=${COLOR}]`);
await p.check(`input[name=fx][value='${FX}']`);
await p.evaluate(() => document.fonts.load('80px "Bangers"'));
await p.waitForFunction(() => document.fonts.check('80px "Bangers"') && typeof img !== "undefined" && img && img.complete);
await p.check("input[name=view][value=slab]");
await p.fill("#note", NOTE);
await p.waitForTimeout(300);
const got = await p.evaluate(() => ({ cover: cv.toDataURL("image/png"), slab: sl.toDataURL("image/png"), bangers: document.fonts.check('80px "Bangers"'), photo: [img.naturalWidth, img.naturalHeight] }));
if (!got.bangers) throw new Error("the cover's font did not load; the title would be in a fallback face");
if (errs.length) throw new Error("the page threw: " + errs.join("; "));
if (process.env.PARTS) for (const k of ["cover", "slab"]) fs.writeFileSync(path.join(process.env.PARTS, k + ".png"), Buffer.from(got[k].split(",")[1], "base64"));

// The picture. Colours and the red button are the page's own (its light theme).
const html = `<!doctype html><meta charset="utf-8"><style>
*{box-sizing:border-box}html,body{margin:0}
body{width:1200px;height:630px;overflow:hidden;position:relative;background:#fbf7ee;color:#1b1a17;font:22px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif}
.t{position:absolute;left:56px;top:0;width:456px;height:630px;display:flex;flex-direction:column;justify-content:center;align-items:flex-start}
h1{font-size:62px;line-height:1.04;letter-spacing:-.02em;margin:0 0 22px}
.sub{font-size:27px;line-height:1.35;color:#5d584d;margin:0 0 28px}
.free{background:#d7372b;color:#fff;font-weight:700;font-size:23px;border-radius:8px;padding:10px 18px}
img{position:absolute;display:block;box-shadow:0 10px 28px rgba(27,26,23,.28)}
#cover{height:520px;left:548px;top:52px;transform:rotate(-2deg);border:1px solid #1b1a17;z-index:2}
#slab{height:500px;left:864px;top:70px;transform:rotate(2deg);border-radius:14px;box-shadow:0 12px 30px rgba(27,26,23,.34)}
</style>
<div class="t"><h1>Custom comic book cover maker</h1><p class="sub">Put anyone on the cover of their own comic. Print-size.</p><span class="free">Free, no sign-up</span></div>
<img id="cover" src="${got.cover}" alt=""><img id="slab" src="${got.slab}" alt="">`;
const tmp = path.join(here, ".og.html"); fs.writeFileSync(tmp, html);
const q = await ctx.newPage(); await q.setViewportSize({ width: 1200, height: 630 });
await q.goto(pathToFileURL(tmp).href);
await q.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth));
const fit = await q.evaluate(() => { const r = s => { const x = document.querySelector(s).getBoundingClientRect(); return [x.left, x.top, x.right, x.bottom].map(Math.round); };
  return { w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight, text: r(".t h1").concat(r(".free")), cover: r("#cover"), slab: r("#slab") }; });
if (fit.cover[0] < fit.text[2] + 12) throw new Error("the cover runs under the words: " + JSON.stringify(fit));
if (fit.slab[2] > 1190 || fit.slab[3] > 626 || fit.cover[1] < 4 || fit.slab[1] < 4) throw new Error("a cover runs off the picture: " + JSON.stringify(fit));
const outPath = process.env.OUT || path.join(pub, "comiccover/og.jpg");
await q.screenshot({ path: outPath, type: "jpeg", quality: 88 }); await b.close(); fs.unlinkSync(tmp);
console.log("wrote", outPath, fs.statSync(outPath).size, "bytes;", JSON.stringify({ photo: got.photo, ...fit }));
