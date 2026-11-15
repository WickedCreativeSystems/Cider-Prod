// Looks at the cover maker in both states against the local staged copy: not paid, and paid (Stripe stood in).
// No drawing is made, no checkout is opened and nothing is deployed. Run it after any change to the maker page
// (public/comiccover/index.html), before the deploy: that page is also the page a buyer lands on after paying.
//
// Stage it as README.md steps 1 and 2 say (the two image keys are not needed for this; .dev.vars only needs
// STRIPE_API=http://127.0.0.1:8894 and STRIPE_RESTRICTED_KEY=standin). Fetch http://127.0.0.1:8893/comiccover/
// first and look for a line only the changed page has: a port can be someone else's.
//
//   PW=<folder holding node_modules/playwright-core> CHROME=<chrome binary> \
//     node paid-look.mjs http://127.0.0.1:8893 cs_test_<ten or more letters and digits> <folder for screenshots>
//
// For each of a phone and a laptop it prints: whether the order box shows, every sentence the box's first line
// held from the moment the page was built ("seen"), whether the buy section shows, and the Draw button's words.
// Right on 15 Nov 2026: not paid, the box is "none" and its resting sentence is not in the page's visible text;
// paid, "seen" starts at "Checking your order…" and ends at "Paid. Thank you! 3 of 3 drawings left.", the buy
// section is "none". The one console error printed is the boss's counter, which this script blocks on purpose.
import path from "node:path"; import { pathToFileURL } from "node:url";
const { chromium } = await import(pathToFileURL(path.join(process.env.PW, "node_modules/playwright-core/index.mjs")).href);
const [base, id, out] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: process.env.CHROME, args: ["--no-sandbox"] });
for (const [w, h] of [[390, 664], [1280, 800]]) {
  for (const [name, url] of [["free", base + "/comiccover/"], ["paid", base + "/comiccover/paid?session_id=" + id]]) {
    const q = await b.newPage({ viewport: { width: w, height: h } });
    const errs = []; q.on("console", m => { if (m.type() === "error") errs.push(m.text()); }); q.on("pageerror", e => errs.push(String(e)));
    await q.route(/pulse\.bananafest-destiny\.com/, r => r.abort());
    const seen = [];
    await q.addInitScript(() => { window.__seen = []; document.addEventListener("DOMContentLoaded", () => {
      const p = document.getElementById("pmsg"), box = document.getElementById("paid");
      const note = () => window.__seen.push([getComputedStyle(box).display, p.textContent]);
      note(); new MutationObserver(note).observe(p, { childList: true, characterData: true, subtree: true });
    }); });
    await q.goto(url, { waitUntil: "load" });
    if (name === "paid") await q.waitForFunction(() => /Paid\. Thank you/.test(document.getElementById("pmsg").textContent), null, { timeout: 15000 });
    const r = await q.evaluate(() => ({ paidBox: getComputedStyle(document.getElementById("paid")).display, pmsg: document.getElementById("pmsg").textContent,
      buy: getComputedStyle(document.getElementById("buy")).display, go: document.getElementById("go").textContent, pformHidden: document.getElementById("pform").hidden,
      visibleText: document.body.innerText.includes("This box opens after you pay"), seen: window.__seen }));
    console.log(`${w}x${h} ${name}:`, JSON.stringify(r), errs.length ? "ERRORS " + errs.join(" | ") : "no console error");
    await q.screenshot({ path: path.join(out, `${name}-${w}x${h}.png`) });
    await q.close();
  }
}
await b.close();
