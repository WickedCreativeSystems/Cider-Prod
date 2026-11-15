// Which crawlers fetched which pages of one hostname, from Cloudflare's own
// count of every request to the zone (not the page-load beacon: a crawler
// runs no script, so loads.mjs never sees one). Read-only. Reads
// CLOUDFLARE_API_TOKEN from the environment; no key lives in this file.
//
//   export $(grep -E "^CLOUDFLARE_(API_TOKEN|ACCOUNT_ID)=" .git-credentials | xargs)
//   node scratch/crawlers.mjs vibecider.bananafest-destiny.com 2026-10-16 2026-11-15
//   node scratch/crawlers.mjs vibecider.bananafest-destiny.com 2026-11-14 2026-11-15 rows
//
// Dates are UTC days, both included. Cloudflare keeps 31 days on this plan
// and the counts are sampled, so small numbers are rough.
// A user agent is a claim. Anyone can call themselves Googlebot, and scanners
// do (10 Nov: a "Googlebot" asked for /.env.production). Cloudflare checks
// the known crawlers itself and says so in `verifiedBotCategory`
// ("Search Engine Crawler", "AI Crawler", "Page Preview", ...). A row that
// names a crawler but that Cloudflare did not verify is printed under
// "claimed, not verified" and counted apart. My own link-preview checks
// (curl with Twitterbot's or redditbot's name) land there too, rightly.
// This plan does not give the referrer of a request, nor the network it came
// from; who arrived from a search page is loads.mjs's question (refererHost).
// With a fourth argument "rows", every row is printed by hour as well.
const [host, from, to, mode] = process.argv.slice(2);
if (!host || !from || !to) { console.error("usage: node scratch/crawlers.mjs <host> <from yyyy-mm-dd> <to yyyy-mm-dd> [rows]"); process.exit(2); }
const tok = process.env.CLOUDFLARE_API_TOKEN;
if (!tok) { console.error("set CLOUDFLARE_API_TOKEN first"); process.exit(2); }
const H = { authorization: `Bearer ${tok}`, "content-type": "application/json" };
const zoneName = host.split(".").slice(-2).join(".");
const z = await (await fetch(`https://api.cloudflare.com/client/v4/zones?name=${zoneName}`, { headers: H })).json();
const zone = z.result?.[0]?.id;
if (!zone) { console.error("no zone for", zoneName, JSON.stringify(z.errors)); process.exit(1); }
const q = `query($zone:String!,$f:ZoneHttpRequestsAdaptiveGroupsFilter_InputObject!){viewer{zones(filter:{zoneTag:$zone}){
  httpRequestsAdaptiveGroups(filter:$f,limit:10000,orderBy:[datetimeHour_ASC]){count dimensions{datetimeHour userAgent clientRequestPath edgeResponseStatus verifiedBotCategory}}}}}`;
// name, pattern in the user agent
const BOTS = [
  ["Googlebot", /googlebot|google-inspectiontool|googleother|storebot-google/i],
  ["Bingbot", /bingbot|bingpreview|msnbot/i],
  ["Yandex", /yandex/i], ["DuckDuckBot", /duckduck/i], ["Applebot", /applebot/i],
  ["GPTBot", /gptbot/i], ["OAI-SearchBot", /oai-searchbot/i], ["ChatGPT-User", /chatgpt-user/i],
  ["ClaudeBot", /claudebot/i], ["Claude-User", /claude-user|claude-searchbot|claude-web/i],
  ["Perplexity", /perplexity/i], ["Amazonbot", /amazonbot/i], ["Meta indexer", /meta-webindexer|meta-externalagent/i],
  ["Exa", /exasearch|exabot/i],
  ["link preview", /redditbot|twitterbot|facebookexternalhit|slackbot|discordbot|whatsapp|telegrambot|linkedinbot/i],
];
const day = (s) => new Date(s + "T00:00:00Z");
const table = new Map(), fake = new Map(), cats = new Map(); let total = 0;
for (let d = day(from); d <= day(to); d = new Date(d.getTime() + 86400000)) {
  const a = d.toISOString(), b = new Date(d.getTime() + 86400000 - 1000).toISOString();
  const r = await fetch("https://api.cloudflare.com/client/v4/graphql", { method: "POST", headers: H,
    body: JSON.stringify({ query: q, variables: { zone, f: { clientRequestHTTPHost: host, datetime_geq: a, datetime_leq: b } } }) });
  const j = await r.json();
  if (j.errors) { console.error(a.slice(0, 10), j.errors[0].message); continue; }
  for (const { count, dimensions: x } of j.data.viewer.zones[0].httpRequestsAdaptiveGroups) {
    total += count;
    const dd = x.datetimeHour.slice(0, 10);
    if (x.verifiedBotCategory) cats.set(x.verifiedBotCategory, (cats.get(x.verifiedBotCategory) || 0) + count);
    const bot = BOTS.find(([, re]) => re.test(x.userAgent)); if (!bot) continue;
    const real = !!x.verifiedBotCategory;
    const m = real ? table : fake;
    const k = `${bot[0]}\t${x.clientRequestPath}\t${x.edgeResponseStatus}`; const v = m.get(k) || { n: 0, first: dd, last: dd }; v.n += count; v.last = dd; m.set(k, v);
    if (mode === "rows") console.log(x.datetimeHour.slice(0, 16), String(count).padStart(3), x.edgeResponseStatus, (real ? bot[0] : bot[0] + "?").padEnd(14), (x.verifiedBotCategory || "not verified").padEnd(22), x.clientRequestPath);
  }
}
const show = (m) => { let last = ""; for (const [k, v] of [...m].sort((a, b) => a[0].localeCompare(b[0]))) { const [bot, path, st] = k.split("\t");
  if (bot !== last) { console.log(`\n${bot}`); last = bot; }
  console.log(`  ${String(v.n).padStart(4)}  ${st}  ${path.padEnd(58)} ${v.first === v.last ? v.first : v.first + " to " + v.last}`); } };
console.log(`${host}, ${from} to ${to}: ${total} requests counted in all (people, my own scripts and crawlers together)`);
console.log("\n== Crawlers, by page (count, status, path, first and last day seen) ==");
show(table);
if (fake.size) { console.log("\n== Claimed a crawler's name, not verified by Cloudflare (not counted above) =="); show(fake); }
console.log("\n== Verified crawler requests by Cloudflare's category ==");
for (const [k, n] of [...cats].sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(5)}  ${k}`);
