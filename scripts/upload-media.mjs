/**
 * Pushes everything in /public/media and /public/cv into the Supabase storage
 * bucket, preserving the paths the site already uses. After this runs, the
 * same URLs resolve whether they are served locally or from Supabase.
 *
 *   npm run upload:media              # everything
 *   npm run upload:media -- --videos  # only the large video files
 *   npm run upload:media -- --force   # overwrite what is already there
 *
 * Needs a service-role key, because uploads are not a public operation:
 *   NEXT_PUBLIC_SUPABASE_URL=...
 *   SUPABASE_SERVICE_ROLE_KEY=...
 * Keep that key out of the repository — .env.local is git-ignored.
 */
import { createClient } from "@supabase/supabase-js";
import { readFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const PUBLIC = path.join(ROOT, "public");

// Minimal .env.local reader, so the script needs no extra dependency.
async function loadEnv() {
  const file = path.join(ROOT, ".env.local");
  if (!existsSync(file)) return;

  for (const line of (await readFile(file, "utf8")).split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, raw] = match;
    if (!process.env[key]) process.env[key] = raw.replace(/^["']|["']$/g, "");
  }
}

await loadEnv();

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET ?? "portfolio-media";

if (!URL || !KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  console.error("Add them to .env.local — the service-role key is under Settings → API.");
  process.exit(1);
}

const args = process.argv.slice(2);
const videosOnly = args.includes("--videos");
const force = args.includes("--force");

const supabase = createClient(URL, KEY, { auth: { persistSession: false } });

const CONTENT_TYPES = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".mp4": "video/mp4",
  ".pdf": "application/pdf",
  ".json": "application/json",
};

/** Every file under `dir`, as paths relative to /public. */
async function walk(dir) {
  if (!existsSync(dir)) return [];
  const found = [];

  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...(await walk(full)));
    } else if (CONTENT_TYPES[path.extname(entry.name).toLowerCase()]) {
      found.push(full);
    }
  }
  return found;
}

async function ensureBucket() {
  const { data } = await supabase.storage.listBuckets();
  if (data?.some((bucket) => bucket.name === BUCKET)) return;

  // 50MB is the default project-wide ceiling on the free tier, and asking for
  // more than the project allows fails the create outright. The largest file
  // here is the 7.5MB delivery walkthrough, so this is ample.
  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: "50MB",
  });
  if (error) throw new Error(`Could not create bucket: ${error.message}`);
  console.log(`Created public bucket "${BUCKET}".`);
}

async function main() {
  await ensureBucket();

  let files = [...(await walk(path.join(PUBLIC, "media"))), ...(await walk(path.join(PUBLIC, "cv")))];
  if (videosOnly) files = files.filter((file) => file.endsWith(".mp4"));

  if (files.length === 0) {
    console.log("Nothing to upload. Run `npm run media` first.");
    return;
  }

  console.log(`Uploading ${files.length} file${files.length === 1 ? "" : "s"} to ${BUCKET}…\n`);

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const file of files) {
    // "public/media/recipe-app/home.webp" → "media/recipe-app/home.webp",
    // which is exactly the path the site already references.
    const key = path.relative(PUBLIC, file).split(path.sep).join("/");
    const { size } = await stat(file);
    const contentType = CONTENT_TYPES[path.extname(file).toLowerCase()];

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(key, await readFile(file), { contentType, cacheControl: "31536000", upsert: force });

    if (error) {
      if (!force && /exists/i.test(error.message)) {
        skipped += 1;
      } else {
        failed += 1;
        console.error(`  ✗ ${key} — ${error.message}`);
      }
      continue;
    }

    uploaded += 1;
    const mb = size / 1048576;
    console.log(`  ✓ ${key}${mb > 1 ? ` (${mb.toFixed(1)} MB)` : ""}`);
  }

  console.log(`\nUploaded ${uploaded}, skipped ${skipped} (already present), failed ${failed}.`);
  if (skipped > 0) console.log("Pass --force to overwrite existing files.");
  console.log(`\nPublic URL prefix:\n  ${URL}/storage/v1/object/public/${BUCKET}/`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
