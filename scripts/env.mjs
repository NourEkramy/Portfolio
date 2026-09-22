/**
 * Minimal .env.local reader, shared by the setup scripts so none of them needs
 * a dotenv dependency. Values already present in the real environment win, so
 * CI can override the file.
 */
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

export const ROOT = path.resolve(import.meta.dirname, "..");

export async function loadEnv(file = path.join(ROOT, ".env.local")) {
  if (!existsSync(file)) return;

  for (const line of (await readFile(file, "utf8")).split("\n")) {
    const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!match) continue;
    const [, key, raw] = match;
    if (!process.env[key]) process.env[key] = raw.replace(/^["']|["']$/g, "");
  }
}

/** Reads a variable, or exits with a message pointing at where to find it. */
export function required(name, hint) {
  const value = process.env[name];
  if (value) return value;

  console.error(`\nMissing ${name} in .env.local`);
  if (hint) console.error(`  ${hint}`);
  process.exit(1);
}
