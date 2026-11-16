// Puts two things into Dailies, or into a copy of it:
//   1. the link picture and link-preview tags on the home page;
//   2. one more sentence in the footer of every page, a link from Dailies to the sales page of the worker
//      that built it. Today no page of Dailies links there.
// It changes files only; it does not deploy. README.md here says when to run it on the real folder.
//
//   node apply.mjs                 the real folder, .. (only after judging; see README.md)
//   node apply.mjs <folder>        a copy that holds public/ and src/, to try it
//
// The tags' title and description are the page's own <title> and description, read at the time it runs, so
// the preview cannot say what the page does not. Running it twice changes nothing the second time.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url)), root = path.resolve(process.argv[2] || path.join(here, "..")), pub = path.join(root, "public");
const HOME = "https://tap.bananafest-destiny.com/", SALES = "https://vibecider.bananafest-destiny.com/";

// 1. The picture and the tags.
const page = path.join(pub, "index.html"), s = fs.readFileSync(page, "utf8");
if (s.includes('property="og:image"')) console.log("1. already there: " + page + " has its link-preview tags");
else {
  const title = s.match(/<title>([^<]*)<\/title>/)?.[1], descLine = s.match(/^<meta name="description" content="([^"]*)">$/m);
  if (!title || !descLine) throw new Error("the home page no longer has a <title> or a one-line description to copy");
  const w = JSON.parse(fs.readFileSync(path.join(here, "words.json"), "utf8"));
  const png = fs.readFileSync(path.join(here, "og.png"));
  if (png.readUInt32BE(16) !== 1200 || png.readUInt32BE(20) !== 630) throw new Error("og.png is not 1200x630");
  const q = t => t.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  const alt = `The ${w.brand} logo and the words: ${w.h1} ${w.lede} Beside them, a phone showing a frame of a short ${w.brand} made: a dog on a comic book cover, with a caption lit word by word.`;
  const tags = [
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${descLine[1]}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${q(w.brand)}">`,
    `<meta property="og:url" content="${HOME}">`,
    `<meta property="og:image" content="${HOME}og.png">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="${q(alt)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
  ].join("\n");
  // After the viewport line, not straight after the description: the page's charset line must stay inside the
  // first 1024 bytes, where a browser looks for it.
  const after = s.match(/^<meta name="viewport"[^>]*>$/m)?.[0];
  if (!after) throw new Error("the home page no longer has a viewport line to put the tags after");
  const out = s.replace(after, after + "\n" + tags);
  if (Buffer.byteLength(out.slice(0, out.indexOf("<meta charset"))) > 900) throw new Error("the charset line would sit too far down the page");
  fs.writeFileSync(page, out);
  fs.copyFileSync(path.join(here, "og.png"), path.join(pub, "og.png"));
  console.log(`1. added ${tags.split("\n").length} lines to ${page} and wrote ${path.join(pub, "og.png")} (${png.length} bytes)`);
}

// 2. The footer. The same footer is written out in five places: four pages and the worker's own template.
// The sentence's words are the sales page's headline turned into a question ("You have the idea. A bot builds
// it and markets it, around the clock."); it names no price and no term of the offer, so it cannot go stale.
const FILES = ["public/index.html", "public/make/index.html", "public/privacy/index.html", "public/404.html", "src/worker.js"];
const WAS = `for Buffer Commit. <a href="/privacy">Privacy</a>`;
const NOW = `for Buffer Commit. <a href="${SALES}">Have an app idea? A worker like it builds it and markets it.</a> <a href="/privacy">Privacy</a>`;
const texts = FILES.map(f => fs.readFileSync(path.join(root, f), "utf8")), count = (t, x) => t.split(x).length - 1;
if (texts.every(t => count(t, NOW) === 1)) console.log("2. already there: all five footers have the sentence");
else {
  const bad = FILES.filter((f, i) => count(texts[i], WAS) !== 1 || count(texts[i], NOW) !== 0);
  if (bad.length) throw new Error("the footer is not as expected (once, unchanged) in: " + bad.join(", ") + "; nothing written for step 2");
  FILES.forEach((f, i) => fs.writeFileSync(path.join(root, f), texts[i].replace(WAS, NOW)));
  console.log("2. added the sentence to the footer in " + FILES.join(", "));
}
