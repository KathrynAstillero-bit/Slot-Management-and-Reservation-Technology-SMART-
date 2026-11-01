import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const client = path.join(root, "dist/client");
const assets = {};
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};
async function readAssets(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) await readAssets(filename);
    else if (entry.isFile()) {
      const url =
        "/" + path.relative(client, filename).split(path.sep).join("/");
      assets[url] = {
        body: (await fs.readFile(filename)).toString("base64"),
        type: mime[path.extname(filename)] || "application/octet-stream",
      };
    }
  }
}
await readAssets(client);
if (!assets["/index.html"])
  throw new Error("Run vite build before packaging the Worker.");

const entry = `
import api from './server/worker.mjs';
const assets = ${JSON.stringify(assets)};
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/api' || url.pathname.startsWith('/api/')) return api.fetch(request, env, ctx);
    if (!['GET','HEAD'].includes(request.method)) return new Response('Method not allowed', {status:405,headers:{Allow:'GET, HEAD'}});
    let key;
    try { key = decodeURIComponent(url.pathname); } catch { return new Response('Bad request', {status:400}); }
    const asset = assets[key] || (!key.split('/').pop().includes('.') ? assets['/index.html'] : undefined);
    if (!asset) return new Response('Not found', {status:404});
    const headers = {
      'Content-Type':asset.type,
      'Cache-Control':key.startsWith('/assets/')?'public, max-age=31536000, immutable':'no-cache',
      'X-Content-Type-Options':'nosniff',
      'Referrer-Policy':'same-origin',
      'Permissions-Policy':'camera=(), microphone=(), geolocation=()'
    };
    const body = request.method==='HEAD'?null:Uint8Array.from(atob(asset.body), c=>c.charCodeAt(0));
    return new Response(body,{headers});
  }
};
`;
await fs.mkdir(path.join(root, "dist/server"), { recursive: true });
await build({
  stdin: {
    contents: entry,
    resolveDir: root,
    sourcefile: "worker-entry.mjs",
    loader: "js",
  },
  outfile: path.join(root, "dist/server/index.js"),
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  minify: true,
});

const manifest = JSON.parse(
  await fs.readFile(path.join(root, ".openai/hosting.json"), "utf8"),
);
if (manifest.static)
  throw new Error("Worker hosting manifest must not declare static assets.");
await fs.mkdir(path.join(root, "dist/.openai"), { recursive: true });
await fs.writeFile(
  path.join(root, "dist/.openai/hosting.json"),
  JSON.stringify(manifest, null, 2) + "\n",
);

// Sites reads schema-only migrations from drizzle/ and copies them into the deployment.
const sql = await fs.readFile(
  path.join(root, "migrations/0001_init.sql"),
  "utf8",
);
await fs.mkdir(path.join(root, "drizzle/meta"), { recursive: true });
const deployedSql = path.join(root, "drizzle/0001_init.sql");
let existing;
try {
  existing = await fs.readFile(deployedSql, "utf8");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
if (existing !== undefined && existing !== sql)
  throw new Error(
    "An existing hosted migration changed. Append a new migration instead.",
  );
await fs.writeFile(deployedSql, sql);
const journal = {
  version: "7",
  dialect: "sqlite",
  entries: [
    {
      idx: 0,
      version: "6",
      when: 1793145600000,
      tag: "0001_init",
      breakpoints: true,
    },
  ],
};
await fs.writeFile(
  path.join(root, "drizzle/meta/_journal.json"),
  JSON.stringify(journal, null, 2) + "\n",
);
await fs.cp(
  path.join(root, "drizzle"),
  path.join(root, "dist/.openai/drizzle"),
  { recursive: true },
);
console.log("Worker built with embedded Vite assets and D1 schema.");
