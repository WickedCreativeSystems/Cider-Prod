// Every request to one hostname, minute by minute, from Cloudflare's own count
// (not the page-load beacon). For reading one visitor's path, e.g. a new
// account on Dailies during judging. Read-only. No key lives in this file.
//
//   export $(grep -E "^CLOUDFLARE_(API_TOKEN|ACCOUNT_ID)=" .git-credentials | xargs)
//   node scratch/requests.mjs tap.bananafest-destiny.com 2026-11-16 2026-11-16
//   node scratch/requests.mjs tap.bananafest-destiny.com 2026-11-16 2026-11-16 all
//
// Dates are UTC days, both included. Counts are sampled; small numbers are
// rough, and a single request can be missing. Without "all", rows that are my
// own scripts (judging read, curl, python, headless Chrome) and verified
// crawlers are left out, and so are scanners' asks for files that do not
// exist (.env, .php, wp-). It prints no IP address: this plan's API is not
// asked for one. The query string is not in the path, so no sign-in code or
// state shows.
const [host, from, to, mode] = process.argv.slice(2);
if (!host || !from || !to) { console.error("usage: node scratch/requests.mjs <host> <from> <to> [all]"); process.exit(2); }
const tok = process.env.CLOUDFLARE_API_TOKEN;
if (!tok) { console.error("set CLOUDFLARE_API_TOKEN first"); process.exit(2); }
const H = { authorization: `Bearer ${tok}`, "content-type": "application/json" };
const zoneName = host.split(".").slice(-2).join(".");
const z = await (await fetch(`https://api.cloudflare.com/client/v4/zones?name=${zoneName}`, { headers: H })).json();
const zone = z.result?.[0]?.id;
if (!zone) { console.error("no zone for", zoneName); process.exit(1); }
const q = `query($zone:String!,$f:ZoneHttpRequestsAdaptiveGroupsFilter_InputObject!){viewer{zones(filter:{zoneTag:$zone}){
  httpRequestsAdaptiveGroups(filter:$f,limit:10000,orderBy:[datetimeMinute_ASC]){count dimensions{datetimeMinute userAgent clientRequestPath clientRequestHTTPMethodName edgeResponseStatus verifiedBotCategory clientCountryName clientDeviceType}}}}}`;
const mine = /vibecider4|^curl\/|python|HeadlessChrome|node|undici|wrangler/i;
const junk = /\.env|\.php|wp-|\.git|\.aws|\.sql|\.bak|\.ya?ml$|cgi-bin|phpinfo|\/admin|\/vendor/i;
const ua = (s) => { // a short name for the browser, never the whole string
  if (!s) return "(no user agent)";
  const os = /iPhone/.test(s) ? "iPhone" : /iPad/.test(s) ? "iPad" : /Android/.test(s) ? "Android" : /Mac OS X/.test(s) ? "Mac" : /Windows/.test(s) ? "Windows" : /Linux/.test(s) ? "Linux" : "";
  const br = /Edg\//.test(s) ? "Edge" : /Firefox\//.test(s) ? "Firefox" : /HeadlessChrome/.test(s) ? "HeadlessChrome" : /Chrome\//.test(s) ? "Chrome" : /Safari\//.test(s) ? "Safari" : "";
  return (os || br) ? `${os} ${br}`.trim() : s.slice(0, 40);
};
const day = (s) => new Date(s + "T00:00:00Z");
let shown = 0, left = 0;
for (let d = day(from); d <= day(to); d = new Date(d.getTime() + 86400000)) {
  const a = d.toISOString(), b = new Date(d.getTime() + 86400000 - 1000).toISOString();
  const r = await fetch("https://api.cloudflare.com/client/v4/graphql", { method: "POST", headers: H,
    body: JSON.stringify({ query: q, variables: { zone, f: { clientRequestHTTPHost: host, datetime_geq: a, datetime_leq: b } } }) });
  const j = await r.json();
  if (j.errors) { console.error(a.slice(0, 10), j.errors[0].message); continue; }
  for (const { count, dimensions: x } of j.data.viewer.zones[0].httpRequestsAdaptiveGroups) {
    const skip = mode !== "all" && (mine.test(x.userAgent) || x.verifiedBotCategory || junk.test(x.clientRequestPath));
    if (skip) { left += count; continue; }
    shown += count;
    console.log(x.datetimeMinute.slice(0, 16).replace("T", " "), String(count).padStart(3), x.clientRequestHTTPMethodName.padEnd(4), x.edgeResponseStatus,
      (x.clientCountryName || "??").padEnd(2), (x.clientDeviceType || "").padEnd(7), ua(x.userAgent).padEnd(16), x.clientRequestPath);
  }
}
console.log(`${host} ${from} to ${to}: ${shown} requests shown, ${left} left out (my scripts, verified crawlers, scanners)${mode === "all" ? "" : "; add \"all\" to see them"}`);
