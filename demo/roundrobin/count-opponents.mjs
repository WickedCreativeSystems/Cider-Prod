// Counts how often two players are on opposite sides in Round Robin's schedules, with the page's own schedule maker
// (rng, shuffle and schedule are lifted out of site/roundrobin/index.html, not copied here). Needs no browser.
//
//   node demo/roundrobin/count-opponents.mjs            the numbers of 14 Nov 2026 (8 players, 2 courts, 7 rounds: 211 of 400)
//   node demo/roundrobin/count-opponents.mjs 12 3 7     another size: players, courts, rounds
//   SHUFFLES=1000 node demo/roundrobin/count-opponents.mjs 8 2 7
//
// The shuffles are the page's first one (seed 1) and then seeds from a fixed little generator below, so the same
// command gives the same count every time. docent's post for roundrobin-capture-2 quotes the 211 of 400: if this
// script ever prints another number for 8 2 7, the schedule maker has changed, and docent must be told.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const page = fs.readFileSync(process.env.PAGE || path.join(root, "site/roundrobin/index.html"), "utf8");
const { schedule } = new Function(page.slice(page.indexOf("function rng("), page.indexOf("function names()")) + "; return { schedule };")();

function count(n, courts, rounds, seed) {
  const { out, part } = schedule(n, Math.min(courts, Math.floor(n / 4)), rounds, seed);
  const opp = [...Array(n)].map(() => Array(n).fill(0)); // counted here from the games, not taken from the maker
  for (const rd of out) for (const [[a, b], [x, y]] of rd.games) for (const i of [a, b]) for (const j of [x, y]) { opp[i][j]++; opp[j][i]++; }
  const o = [], p = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { o.push(opp[i][j]); p.push(part[i][j]); }
  return { min: Math.min(...o), max: Math.max(...o), partnerRepeats: p.filter(v => v > 1).length };
}

const N = +process.env.SHUFFLES || 400;
let s = 12345; const next = () => (s = (s * 1103515245 + 12345) & 0x7fffffff);
const seeds = [1, ...[...Array(N - 1)].map(() => next() % 1e9)];
const cases = process.argv.length > 4 ? [process.argv.slice(2, 5).map(Number)] : [[8, 2, 7], [4, 1, 3], [5, 1, 5], [8, 2, 14], [9, 2, 9], [12, 3, 7], [16, 4, 7]];
for (const [n, c, r] of cases) {
  let even = 0, noRep = 0; const spread = {};
  seeds.forEach((sd, k) => { const x = count(n, c, r, sd); if (x.min === x.max && x.min > 0) even++; if (!x.partnerRepeats) noRep++; const key = x.min + " to " + x.max; spread[key] = (spread[key] || 0) + 1; if (k === 0) spread.first = key; });
  const { first, ...rest } = spread;
  console.log(`${n} players, ${c} courts, ${r} rounds: every two players face each other the same number of times in ${even} of ${N} shuffles; no partner repeats in ${noRep}; first shuffle ${first}; times faced, fewest to most: ${JSON.stringify(rest)}`);
}
