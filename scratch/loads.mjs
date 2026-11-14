// Page loads Cloudflare counted for one hostname (its Web Analytics, sampled:
// small numbers are rough). Reads CLOUDFLARE_API_TOKEN and
// CLOUDFLARE_ACCOUNT_ID from the environment; no key lives in this file.
//
//   export $(grep -E "^CLOUDFLARE_(API_TOKEN|ACCOUNT_ID)=" .git-credentials | xargs)
//   node scratch/loads.mjs vibecider.bananafest-destiny.com 2026-11-11 2026-11-14
//
// Dates are UTC days, both included. Do not add a `bot` filter: it returns
// nothing and no error (10 Nov). Filter by requestHost only.
const [host, from, to] = process.argv.slice(2);
if (!host || !from || !to) { console.error("usage: node scratch/loads.mjs <host> <from yyyy-mm-dd> <to yyyy-mm-dd>"); process.exit(2); }
const { CLOUDFLARE_API_TOKEN: tok, CLOUDFLARE_ACCOUNT_ID: acct } = process.env;
if (!tok || !acct) { console.error("set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID first"); process.exit(2); }
const query = `query($acct:String!,$f:AccountRumPageloadEventsAdaptiveGroupsFilter_InputObject!){viewer{accounts(filter:{accountTag:$acct}){
  rumPageloadEventsAdaptiveGroups(filter:$f,limit:500,orderBy:[date_ASC]){count sum{visits} dimensions{date requestPath refererHost countryName deviceType userAgentBrowser}}}}}`;
const r = await fetch("https://api.cloudflare.com/client/v4/graphql", {
  method: "POST", headers: { authorization: `Bearer ${tok}`, "content-type": "application/json" },
  body: JSON.stringify({ query, variables: { acct, f: { requestHost: host, date_geq: from, date_leq: to } } }),
});
const j = await r.json();
if (j.errors) { console.error(JSON.stringify(j.errors, null, 1)); process.exit(1); }
const rows = j.data.viewer.accounts[0].rumPageloadEventsAdaptiveGroups;
// A row whose browser is ChromeHeadless is one of my own scripts (a recorder,
// a test, a screenshot): 59 of 80 loads on 11 to 14 Nov were. They are
// counted apart so they are never read as people.
let people = 0, mine = 0;
for (const { count, sum, dimensions: d } of rows) {
  const own = /headless/i.test(d.userAgentBrowser || "");
  if (own) mine += count; else people += count;
  console.log([d.date, String(count).padStart(3), `visits ${sum.visits}`, d.requestPath, d.refererHost || "(no referrer)", d.countryName, d.deviceType, d.userAgentBrowser, own ? "<- my own script" : ""].join("  "));
}
console.log(`${host} ${from} to ${to}: ${people} page loads that could be people, ${mine} by my own headless scripts`);
console.log("A US desktop Chrome load with no referrer is most likely the boss or me in a real browser.");
