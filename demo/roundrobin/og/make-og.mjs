// Makes site/roundrobin/og.png, the 1200x630 picture a chat app or a social site shows beside a link to Round Robin.
// The schedule on it is the page's own: this script lifts rng, shuffle and schedule out of site/roundrobin/index.html
// and runs them for eight made-up names with the first shuffle (seed 1), so it is the schedule a stranger gets for
// the same names, and the same one as in site/media/roundrobin-capture-2.mp4. The line under the table is built the
// way the page builds it. If the page's maker ever changes, run this again.
//
//   PW=<folder holding node_modules/playwright-core> CHROME=<chrome binary> node make-og.mjs
//
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url)), root = path.resolve(here, "../../..");
const { chromium } = await import(pathToFileURL(path.join(process.env.PW, "node_modules/playwright-core/index.mjs")).href);

const page = fs.readFileSync(path.join(root, "site/roundrobin/index.html"), "utf8");
const js = page.slice(page.lastIndexOf("<script>") + 8, page.lastIndexOf("</script>"));
const { schedule } = new Function(js.slice(js.indexOf("function rng"), js.indexOf("function names()")) + "; return { schedule };")();

const ns = ["Ana", "Ben", "Carla", "Dev", "Eli", "Fay", "Gus", "Hana"], courts = 2, rounds = 7;
const { out, part } = schedule(ns.length, courts, rounds, 1);
const distinct = part.map(r => r.filter(v => v > 0).length), repeats = part.flat().filter(v => v > 1).length / 2;
if (Math.min(...distinct) !== 7 || Math.max(...distinct) !== 7 || repeats) throw new Error("the first schedule is no longer 7 partners each with no repeats; do not publish this picture as it is");
const stats = `${ns.length} players, ${courts} courts, ${rounds} rounds. Each player partners 7 different people; no partner repeats.`;
const team = t => t.map(i => ns[i]).join(" &amp; ");
const rows = out.map((rd, k) => `<tr><td class="n">${k + 1}</td>` + rd.games.map(g => `<td>${team(g[0])} <i>vs</i> ${team(g[1])}</td>`).join("") + "</tr>").join("");

const html = `<!doctype html><meta charset="utf-8"><style>
*{box-sizing:border-box}html,body{margin:0}
body{width:1200px;height:630px;background:#f6f8f3;color:#17201a;font:22px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif;display:grid;grid-template-columns:384px 1fr;gap:34px;padding:48px 48px 44px 52px;align-items:center}
h1{font-size:54px;line-height:1.06;letter-spacing:-.02em;margin:0 0 20px}
.sub{font-size:25px;line-height:1.35;color:#56625a;margin:0 0 26px}
.free{display:inline-block;background:#2f7d4f;color:#fff;font-weight:700;font-size:21px;border-radius:8px;padding:9px 16px}
.card{background:#fff;border:1px solid #d9e0d6;border-radius:16px;padding:22px 24px 18px}
table{width:100%;border-collapse:collapse;font-size:20px}
th,td{border:1px solid #d9e0d6;padding:9px 12px;text-align:left;white-space:nowrap}
th{background:#eef6e8;font-size:14px;text-transform:uppercase;letter-spacing:.07em}
td.n{font-weight:700;width:1%;text-align:center}
i{font-style:normal;color:#56625a;font-size:15px;margin:0 3px}
.stats{font-size:14.5px;color:#56625a;margin:13px 2px 0;white-space:nowrap}
</style>
<div><h1>Pickleball round robin generator</h1><p class="sub">Type the names and the number of courts. Get a fair doubles schedule to print or share.</p><span class="free">Free, no sign-up</span></div>
<div class="card"><table><thead><tr><th>Round</th><th>Court 1</th><th>Court 2</th></tr></thead><tbody>${rows}</tbody></table><p class="stats">${stats}</p></div>`;

const tmp = path.join(here, ".og.html"); fs.writeFileSync(tmp, html);
const b = await chromium.launch({ executablePath: process.env.CHROME, args: ["--no-sandbox"] });
const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await p.goto(pathToFileURL(tmp).href);
const fit = await p.evaluate(() => ({ w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight, card: document.querySelector(".card").getBoundingClientRect().toJSON(), tbl: document.querySelector("table").scrollWidth - document.querySelector("table").clientWidth }));
if (fit.w > 1200 || fit.h > 630 || fit.card.right > 1200 - 44 || fit.card.bottom > 630 - 20) throw new Error("the card does not fit: " + JSON.stringify(fit));
const outPath = process.env.OUT || path.join(root, "site/roundrobin/og.png");
await p.screenshot({ path: outPath }); await b.close(); fs.unlinkSync(tmp);
console.log("wrote", outPath, fs.statSync(outPath).size, "bytes;", JSON.stringify(fit));
