// Lists the shorts present in public/shorts, so the edit only uses footage that exists.
import { readdirSync, writeFileSync, existsSync } from "node:fs";
const d = new URL("./public/shorts/", import.meta.url);
const have = existsSync(d) ? readdirSync(d).filter(f => f.endsWith(".mp4")).map(f => "shorts/" + f) : [];
writeFileSync(new URL("./src/have.js", import.meta.url), `export const HAVE = ${JSON.stringify(have)};\n`);
console.log(have.length, "shorts");
