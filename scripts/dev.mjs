import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const preview = process.argv.includes("--preview");
const children = [];
let closing = false;

function start(args, label) {
  const child = spawn(process.execPath, args, {
    cwd: root,
    stdio: "inherit",
    windowsHide: true,
    env: { ...process.env, NODE_ENV: preview ? "production" : "development" },
  });
  children.push(child);
  child.on("error", (error) => {
    console.error(`${label}: ${error.message}`);
    close(1);
  });
  child.on("exit", (code) => {
    if (!closing) close(code ?? 1);
  });
}

function close(code = 0) {
  if (closing) return;
  closing = true;
  children.forEach((child) => {
    if (!child.killed) child.kill();
  });
  process.exitCode = code;
}

process.once("SIGINT", () => close(0));
process.once("SIGTERM", () => close(0));
start(["server/local.mjs"], "API server");
start(
  [
    "node_modules/vite/bin/vite.js",
    ...(preview ? ["preview"] : []),
    "--host",
    "127.0.0.1",
  ],
  "Vite",
);
