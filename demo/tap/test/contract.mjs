// Every question Dailies puts to Buffer, checked against Buffer's own schema, with nothing sent.
//
//   node contract.mjs <schema.json> [path to graphql's index.js]
//
// schema.json is the answer to GraphQL's standard introspection query, asked of api.buffer.com
// with any signed-in token (a read). This script then runs the real worker (src/worker.js) with
// a stand-in store and a stand-in network: each call the worker would make to Buffer is caught,
// answered with a made-up success so the code carries on, and checked two ways:
//   1. the document is valid against the schema (fields, arguments, fragments, variable types);
//   2. the variables fit their input types (required fields, enum values, no unknown fields).
// What it can't see: rules Buffer applies after the schema (a network's own needs, plan limits,
// whether a video can be fetched). Those come back as error types the pages already show.

import { readFileSync } from "node:fs";
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const [schemaPath, gqlPath] = process.argv.slice(2);
if (!schemaPath) { console.error("usage: node contract.mjs <schema.json> [graphql/index.js]"); process.exit(2); }
const G = await import(gqlPath ? pathToFileURL(resolve(gqlPath)).href : "graphql");
const { getVariableValues } = await import(gqlPath ? pathToFileURL(resolve(dirname(gqlPath), "execution/values.js")).href : "graphql/execution/values.js");
const raw = JSON.parse(readFileSync(schemaPath, "utf8"));
const schema = G.buildClientSchema(raw.data || raw);

// ---- Stand-ins ---------------------------------------------------------------

const HOME = "https://tap.bananafest-destiny.com";
const ACCT = "acct1", SID = "sid1", MCP_KEY = "test-key";
const services = schema.getType("Service").getValues().map(v => v.name);
const channels = services.map(s => ({ id: `ch-${s}`, service: s }));
const sentPost = (id, service, video) => ({ id, channelId: `ch-${service}`, channelService: service, sentAt: "2026-11-01T12:00:00.000Z",
  text: "A post that worked. example.com", externalLink: null, tags: [],
  assets: video ? [{ __typename: "VideoAsset", thumbnail: "https://x.test/t.jpg", source: "https://x.test/v.mp4" }] : [{ __typename: "ImageAsset", thumbnail: "https://x.test/t.jpg", source: "https://x.test/i.jpg" }],
  metadata: service === "youtube" ? { __typename: "YoutubePostMetadata", title: "A title", category: { categoryId: "22" } } : null });

function kv() {
  const m = new Map();
  return {
    m,
    async get(k, type) { const v = m.get(k)?.v; if (v == null) return null; return type === "arrayBuffer" || type?.type === "arrayBuffer" ? v : typeof v === "string" ? v : new TextDecoder().decode(v); },
    async getWithMetadata(k) { const e = m.get(k); return { value: e?.v ?? null, metadata: e?.meta ?? null }; },
    async put(k, v, o) { m.set(k, { v, meta: o?.metadata }); },
    async delete(k) { m.delete(k); },
    async list({ prefix = "" } = {}) { return { keys: [...m.keys()].filter(k => k.startsWith(prefix)).map(name => ({ name })), list_complete: true }; },
  };
}

const calls = [];
let label = "";
let orgs = [{ id: "org1", name: "One" }];
let refuseStates = false; // Buffer refusing the question about channel states
const answer = q => {
  const d = {};
  if (/createPost\b/.test(q)) d.createPost = { __typename: "PostActionSuccess", post: { id: "post-new", dueAt: "2026-12-12T15:00:00.000Z" } };
  if (/createTag\b/.test(q)) d.createTag = { __typename: "TagActionSuccess", tag: { id: "tag1" } };
  if (/createPostTemplate\b/.test(q)) d.createPostTemplate = { __typename: "CreatePostTemplateSuccess", postTemplate: { id: "tpl1" } };
  if (/deletePostTemplate\b/.test(q)) d.deletePostTemplate = { __typename: "X" };
  if (/deleteTag\b/.test(q)) d.deleteTag = { __typename: "X" };
  if (/createIdea\b/.test(q)) d.createIdea = { __typename: "Idea", id: "idea1" };
  if (/\baccount\b/.test(q)) d.account = { id: ACCT, organizations: orgs };
  if (/\bposts\(/.test(q)) d.posts = { edges: [{ node: sentPost("post-ig", "instagram", true) }, { node: sentPost("post-x", "twitter", false) }] };
  if (/\bchannels\(input:\{organizationId:\$o\}\)/.test(q)) d.channels = channels;
  for (const m of q.matchAll(/\b(o\d+): channels/g)) d[m[1]] = m[1] === "o1" ? [{ id: "c" }] : [];
  return d;
};
globalThis.fetch = async (u, init = {}) => {
  const url = String(u?.url || u);
  if (url.startsWith("https://api.buffer.com")) {
    const { query, variables } = JSON.parse(init.body);
    calls.push({ label, query, variables });
    if (refuseStates && /isQueuePaused/.test(query)) return new Response(JSON.stringify({ data: null, errors: [{ message: "Cannot return null for non-nullable field Channel.isQueuePaused." }] }), { headers: { "content-type": "application/json" } });
    return new Response(JSON.stringify({ data: answer(query) }), { headers: { "content-type": "application/json" } });
  }
  if (url.startsWith("https://auth.buffer.com/token"))
    return new Response(JSON.stringify({ access_token: "a", refresh_token: "r", expires_in: 3600, scope: "s" }), { headers: { "content-type": "application/json" } });
  throw new Error(`the test reached for the network: ${url}`);
};

const { default: worker } = await import(pathToFileURL(resolve(here, "../src/worker.js")).href);
const { sha256 } = await import(pathToFileURL(resolve(here, "../src/mcp.js")).href);

const TAP = kv();
const env = { TAP, BUFFER_CLIENT_ID: "id", BUFFER_CLIENT_SECRET: "secret", ASSETS: { fetch: async () => new Response("", { status: 404 }) } };
const ctx = { waitUntil() {} };
const put = (k, v) => TAP.put(k, typeof v === "string" ? v : JSON.stringify(v));
const user = () => JSON.parse(TAP.m.get(`user:${ACCT}`).v);
await put(`ses:${SID}`, ACCT);
await put(`tok:${ACCT}`, { access_token: "a", refresh_token: "r", expires_at: Date.now() + 3600e3 });
await put(`key:${await sha256(MCP_KEY)}`, ACCT);
await put(`user:${ACCT}`, { name: "abcd", orgId: "org1", dest: {}, mainDest: "", posts: [], postsAt: 0, sessions: [SID], videos: [{ id: "vid1" }] });

const go = async (what, path, { method = "GET", json, form, headers = {} } = {}) => {
  label = what;
  const h = { cookie: `tap_sid=${SID}`, ...headers };
  let body;
  if (method !== "GET") h.origin = HOME;
  if (json) { h["content-type"] = "application/json"; body = JSON.stringify(json); }
  if (form) { h["content-type"] = "application/x-www-form-urlencoded"; body = new URLSearchParams(form).toString(); }
  const before = calls.length;
  const res = await worker.fetch(new Request(HOME + path, { method, headers: h, body, redirect: "manual" }), env, ctx);
  const text = await res.text();
  return { status: res.status, text, asked: calls.length - before };
};

// ---- The worker's every road to Buffer ----------------------------------------

const ran = [];
const note = (what, r, want = 1) => ran.push({ what, status: r.status, asked: r.asked, short: r.asked < want });

// Sign-in: one organization, then several.
await put("st:state1", "verifier");
note("sign-in, one organization", await go("sign-in, one organization", "/auth/callback?state=state1&code=c"));
orgs = [{ id: "org0", name: "Empty" }, { id: "org1", name: "One" }, { id: "org2", name: "Two" }];
await put("st:state2", "verifier");
note("sign-in, three organizations", await go("sign-in, three organizations", "/auth/callback?state=state2&code=c"), 2);
if (user().orgId !== "org1") throw new Error("pickOrg did not take the organization with a channel");

// The shorts page, read fresh from Buffer.
note("Your shorts, refreshed", await go("Your shorts, refreshed", "/me?refresh=1"));
// The Buffer step asks for the channels with their names and states, its own small question.
{
  const r = await go("channels for the Buffer step", "/api/channels");
  note("channels for the Buffer step", r);
  if (!(JSON.parse(r.text).channels?.length >= 3)) throw new Error(`/api/channels answered ${r.text.slice(0, 200)}`);
  const kept = JSON.stringify(user().channels);
  if (kept !== JSON.stringify(channels)) throw new Error("/api/channels did not keep what Buffer said");
  // Asked again with nothing changed: Buffer is asked, the record is not written.
  let wrote = 0; const put0 = TAP.put; TAP.put = async (k, ...r) => { if (k.startsWith("user:")) wrote++; return put0(k, ...r); };
  const again = await go("channels, asked again", "/api/channels"); TAP.put = put0;
  if (again.asked !== 1 || wrote) throw new Error(`/api/channels asked again: ${again.asked} calls, ${wrote} writes of the record`);
  // Buffer refuses the states: the channels already known are given, and nothing else is asked.
  refuseStates = true;
  const refused = await go("channels, states refused by Buffer", "/api/channels"); refuseStates = false;
  if (refused.status !== 200 || JSON.stringify(JSON.parse(refused.text).channels) !== r.text.slice(12, -1) || refused.asked !== 1) throw new Error(`/api/channels with states refused: ${refused.status}, ${refused.asked} calls, ${refused.text.slice(0, 120)}`);
  ran.push({ what: "channels when Buffer refuses the states: the known ones are given", status: refused.status, asked: refused.asked });
}

// A video to Buffer: every channel, each of the three timings.
const all = channels.map(c => c.id);
const base = { video: "vid1", channels: all, caption: "A caption for the short.", title: "A title", hashtags: ["one", "two", "three", "four", "five", "six"], angle: "angle", hook: "hook", lines: ["a", "b"], link: "https://example.com/" };
const soon = new Date(Date.now() + 30 * 86400e3).toISOString();
for (const [name, when] of [["drafts", undefined], ["drafts (said outright)", { mode: "draft" }], ["the queue", { mode: "queue" }], ["a time", { mode: "time", dueAt: soon }]]) {
  const r = await go(`a short to ${name}`, "/api/draft", { method: "POST", json: { ...base, when } });
  note(`a short to ${name}, ${all.length} channels`, r, all.length);
  const out = JSON.parse(r.text).results || [];
  const want = name === "the queue" ? "queued" : name === "a time" ? "scheduled" : "draft";
  // Each result names its channel by id: the page uses that to leave a channel out of a second press.
  if (out.some((x, i) => x.channelId !== all[i])) throw new Error(`/api/draft (${name}) results don't carry their channel ids`);
  if (out.length !== all.length || out.some(x => !x.ok || x.state !== want)) throw new Error(`/api/draft (${name}) answered ${r.text.slice(0, 300)}`);
}
for (const [name, when] of [["no time given", { mode: "time" }], ["a time gone by", { mode: "time", dueAt: new Date(Date.now() - 3600e3).toISOString() }], ["not a time", { mode: "time", dueAt: "soon" }]]) {
  const r = await go(`refused: ${name}`, "/api/draft", { method: "POST", json: { ...base, when } });
  if (r.status !== 400 || r.asked) throw new Error(`"${name}" should be refused before Buffer is asked; got ${r.status}, ${r.asked} calls`);
  ran.push({ what: `refused before Buffer: ${name}`, status: r.status, asked: 0 });
}

// The month plan into Buffer Ideas.
note("plan rows to Ideas", await go("plan rows to Ideas", "/api/ideas", { method: "POST", json: { items: [
  { angle: "An angle", hook: "A hook", text: "Some notes", date: "2026-12-01", services: ["instagram", "twitter", "nonsense"] },
  { angle: "No date", hook: "A hook", notes: "n", services: [] } ] } }), 2);

// Keep this, Post it again, Forget.
note("Keep this (a video post)", await go("Keep this", "/me/keep", { method: "POST", form: { post: "post-ig" } }), 2);
note("Post it again (to every other channel)", await go("Post it again", "/me/again", { method: "POST", form: { kept: "post-ig" } }), 3);
note("Forget (template and tag deleted)", await go("Forget", "/me/forget", { method: "POST", form: { kept: "post-ig" } }), 2);
note("Keep this (a picture post)", await go("Keep this, picture", "/me/keep", { method: "POST", form: { post: "post-x" } }), 2);
note("Post it again (a picture post)", await go("Post it again, picture", "/me/again", { method: "POST", form: { kept: "post-x" } }), 3);

// Claude Code's side.
const rpc = (name, args = {}) => go(`MCP ${name}`, "/mcp", { method: "POST", headers: { authorization: `Bearer ${MCP_KEY}` }, json: { jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } } });
note("MCP list_channels", await rpc("list_channels"), 0);
note("MCP draft_post", await rpc("draft_post", { text: "Shipped a thing today.", hashtags: ["buildinpublic"] }), 3);
note("MCP queue_status", await rpc("queue_status"), 2);

// ---- The check ---------------------------------------------------------------

const problems = [];
const seen = new Map();
for (const c of calls) {
  let doc;
  try { doc = G.parse(c.query); } catch (e) { problems.push(`${c.label}: the document doesn't parse: ${e.message}`); continue; }
  const op = doc.definitions.find(d => d.kind === "OperationDefinition");
  const root = op.selectionSet.selections.map(s => s.name.value).filter((v, i, a) => a.indexOf(v) === i).join("+");
  const key = `${op.operation} ${root}`;
  seen.set(key, (seen.get(key) || 0) + 1);
  for (const e of G.validate(schema, doc)) problems.push(`${c.label}: ${key}: ${e.message}`);
  const v = getVariableValues(schema, op.variableDefinitions || [], c.variables || {});
  for (const e of v.errors || []) problems.push(`${c.label}: ${key}: ${e.message}`);
  // Variables the document never declared would be dropped in silence by us and refused by Buffer.
  const declared = new Set((op.variableDefinitions || []).map(d => d.variable.name.value));
  for (const k of Object.keys(c.variables || {})) if (!declared.has(k)) problems.push(`${c.label}: ${key}: variable $${k} is sent but not declared`);
}

// What a post can come back as, set beside what the pages ask about.
const payload = schema.getType("PostActionPayload")?.getTypes().map(t => t.name) || [];
const asked = [...new Set(calls.filter(c => /createPost\b/.test(c.query)).flatMap(c => [...c.query.matchAll(/\.\.\. on (\w+)/g)].map(m => m[1])))];
const unasked = payload.filter(t => !asked.includes(t));

console.log(`Buffer's schema: ${Object.keys(schema.getTypeMap()).length} types, ${services.length} services (${services.join(", ")})`);
console.log(`\nRoads run (${ran.length}):`);
for (const r of ran) console.log(`  ${r.short ? "!!" : "ok"}  ${r.what}: ${r.asked} call${r.asked === 1 ? "" : "s"} to Buffer, page answered ${r.status}`);
console.log(`\nCalls caught: ${calls.length}, of ${seen.size} kinds:`);
for (const [k, n] of seen) console.log(`  ${String(n).padStart(3)}  ${k}`);
const modes = {};
for (const c of calls) if (c.variables?.i?.mode) { const k = `${c.variables.i.mode}${c.variables.i.saveToDraft ? " + saveToDraft" : ""}${c.variables.i.dueAt ? " + dueAt" : ""}`; modes[k] = (modes[k] || 0) + 1; }
console.log(`\nHow posts were asked for:`, modes);
console.log(`createPost can answer: ${payload.join(", ")}`);
console.log(unasked.length ? `  not asked about by the pages: ${unasked.join(", ")}` : "  the pages ask about every one of them");
const short = ran.filter(r => r.short);
for (const r of short) problems.push(`${r.what}: fewer calls reached Buffer than the road should make (${r.asked})`);
console.log(problems.length ? `\n${problems.length} PROBLEM${problems.length === 1 ? "" : "S"}:\n  ` + [...new Set(problems)].join("\n  ") : "\nNo problems: every document is valid and every variable fits.");
process.exit(problems.length ? 1 : 0);
