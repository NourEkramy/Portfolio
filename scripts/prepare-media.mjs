/**
 * Collects the raw project assets scattered around this machine, normalises the
 * filenames, converts screenshots to WebP at a sane web resolution, and drops
 * everything into /public/media so the site works before Supabase is connected.
 *
 *   node scripts/prepare-media.mjs
 *
 * Re-running is safe: it overwrites what it produced last time.
 */
import { mkdir, readdir, copyFile, writeFile, stat, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import sharp from "sharp";
import ffmpeg from "ffmpeg-static";

const run = promisify(execFile);

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "public", "media");

const HOME = process.env.USERPROFILE || process.env.HOME || "";
const DOWNLOADS = path.join(HOME, "Downloads");

/**
 * Raw screenshots live in .raw-assets/<slug>/ (git-ignored, unpacked from the
 * original archives). Each entry falls back to wherever the originals came from
 * on this machine, so the script still works on a fresh checkout of the assets.
 */
const RAW = path.join(ROOT, ".raw-assets");

const SOURCES = {
  screenshots: [
    {
      slug: "food-delivery-app",
      dirs: [path.join(RAW, "food-delivery-app"), path.join(DOWNLOADS, "Food Delivery App (Community)")],
    },
    { slug: "recipe-app", dirs: [path.join(RAW, "recipe-app"), path.join(DOWNLOADS, "Food Recipe App")] },
    {
      slug: "shopping-demo-app",
      dirs: [path.join(RAW, "shopping-demo-app"), path.join(DOWNLOADS, "Mentor Ship Task 2")],
    },
    { slug: "lupira-app", dirs: [path.join(RAW, "lupira-app"), path.join("D:", "Lupira App")] },
  ],
  videos: [
    {
      slug: "food-delivery-app",
      file: path.join(DOWNLOADS, "Food Delivery App.mp4"),
      posterAt: "00:00:10",
      /**
       * The first 52 seconds are the splash, onboarding and sign-up flow, and
       * the sign-up form is filled in with a real address and a password that
       * is visible in plain text because the reveal toggle is on. The published
       * file therefore starts after it. Set `startAt: 0` to keep the whole
       * recording.
       */
      startAt: 52,
    },
    { slug: "recipe-app", file: path.join(DOWNLOADS, "Food Recipe App.mp4"), posterAt: "00:00:19" },
    { slug: "order-tracking-notifications", file: path.join(DOWNLOADS, "Order Tracking Notifications.mp4"), posterAt: "00:00:08" },
  ],
  cv: path.join(DOWNLOADS, "NourEldin_Ekramy Saad_Flutter_Resume.pdf"),
  /**
   * Stills lifted from the screen recordings — these are the apps actually
   * running, which the Figma exports are not. Each entry is [seconds, name,
   * caption]; the timestamps were chosen off a contact sheet of the footage.
   *
   * Timestamps are against the PUBLISHED video, so for food-delivery-app they
   * are 52 seconds earlier than in the source — adjust if `startAt` changes.
   */
  frames: {
    "food-delivery-app": [
      [10, "home", "Home — cuisine categories and open restaurants"],
      [3, "restaurants", "Open restaurants, with photography pulled from each one's first dish"],
      [17, "restaurant-list", "Browsing restaurants"],
      [66, "cart", "Cart — one restaurant at a time, by design"],
      [73, "order-placed", "Order placed — a real POST that returns 201 Created"],
      [80, "orders", "Order history, with cancellation"],
      [45, "addresses", "Saved delivery addresses"],
      [52, "add-card", "Adding a card — only the brand and last four are kept"],
      [20, "home-arabic", "The same home screen in Arabic, mirrored right-to-left"],
      [18, "restaurants-arabic", "Restaurant list in Arabic"],
      [24, "language", "Switching language in app"],
    ],
    "recipe-app": [
      [19, "home", "Home — featured carousel, categories and popular recipes"],
      [23, "home-featured", "Editor's picks in the featured carousel"],
      [31, "popular", "Popular recipes"],
      [47, "recipe-detail", "Recipe details — time, calories, servings and difficulty"],
      [43, "ingredients", "Ingredients, the creator, and related recipes"],
      [55, "search", "Search across the catalogue"],
      [51, "editors-choice", "Editor's choice"],
      [63, "cart", "Account and shopping cart"],
      [3, "login", "Log in"],
    ],
  },

  /** name → source image. Dropped into .raw-assets/profile/ by hand. */
  portraits: [
    { name: "portrait", file: path.join(RAW, "profile", "portrait.jpg"), width: 900 },
    { name: "portrait-wide", file: path.join(RAW, "profile", "portrait-wide.jpg"), width: 1400 },
  ],
};

/** Phone screenshots never need more than ~2x a 414pt viewport. */
const MAX_WIDTH = 828;
const QUALITY = 82;

const IMAGE_RE = /\.(png|jpe?g|webp)$/i;

function slugify(name) {
  return name
    .replace(IMAGE_RE, "")
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, " ")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

/**
 * Lupira's screenshots are named with Arabic-Indic timestamps that slugify to
 * one identical string, so a plain slug would collapse 87 files onto 2 names.
 * Anything empty or already taken falls back to a zero-padded index, which also
 * preserves the capture order.
 */
function outputName(file, index, taken) {
  const slug = slugify(file);
  const name = slug.length > 2 && !taken.has(slug) ? slug : `screen-${String(index + 1).padStart(3, "0")}`;
  taken.add(name);
  return `${name}.webp`;
}

async function convertDirectory({ slug, dirs }) {
  const dir = dirs.find((candidate) => existsSync(candidate));
  if (!dir) {
    console.warn(`  ! skipped ${slug} — no source directory found`);
    return [];
  }
  const destination = path.join(OUT, slug);
  await mkdir(destination, { recursive: true });

  const files = (await readdir(dir)).filter((f) => IMAGE_RE.test(f)).sort();
  const written = [];
  const taken = new Set();

  for (const [index, file] of files.entries()) {
    const name = outputName(file, index, taken);
    const target = path.join(destination, name);
    const image = sharp(path.join(dir, file));
    const { width } = await image.metadata();

    await image
      .resize({ width: Math.min(width ?? MAX_WIDTH, MAX_WIDTH), withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(target);

    written.push(`/media/${slug}/${name}`);
  }

  console.log(`  ${slug}: ${written.length} screenshots`);
  return written;
}

/**
 * The source recordings are portrait phone captures at bitrates far above what
 * the footage needs — 4 Mb/s for 13 fps in one case. Re-encoding at CRF 28 with
 * a 720px long edge keeps them legible and cuts the total by roughly 85%.
 * A poster frame is pulled from a few seconds in, past any splash screen.
 */
async function transcodeVideos() {
  const destination = path.join(OUT, "video");
  const posterDir = path.join(OUT, "poster");
  await mkdir(destination, { recursive: true });
  await mkdir(posterDir, { recursive: true });

  const written = {};
  const posters = {};

  for (const { slug, file, posterAt = "00:00:06", startAt = 0 } of SOURCES.videos) {
    if (!existsSync(file)) {
      console.warn(`  ! skipped video ${slug} — not found: ${file}`);
      continue;
    }

    const target = path.join(destination, `${slug}.mp4`);
    const before = (await stat(file)).size;

    const SCALE =
      "scale='min(720,iw)':'min(1280,ih)':force_original_aspect_ratio=decrease," +
      "scale=trunc(iw/2)*2:trunc(ih/2)*2";

    /*
     * `startAt` drops everything before that point by seeking the input, so
     * those seconds are not recoverable from the published file. Input seeking
     * is used rather than a trim/concat filter graph because these recordings
     * are variable-frame-rate, which the filter route re-times incorrectly.
     */
    const seek = startAt > 0 ? ["-ss", String(startAt)] : [];

    await run(ffmpeg, [
      "-y", ...seek, "-i", file,
      "-vf", SCALE,
      "-r", "30",
      "-c:v", "libx264", "-preset", "slow", "-crf", "28",
      "-profile:v", "high", "-pix_fmt", "yuv420p",
      // Front-load the index so the browser can start playing before the whole
      // file has arrived.
      "-movflags", "+faststart",
      "-c:a", "aac", "-b:a", "96k", "-ac", "2",
      target,
    ]);

    const after = (await stat(target)).size;
    written[slug] = `/media/video/${slug}.mp4`;
    console.log(
      `  ${slug}.mp4  ${(before / 1048576).toFixed(1)} MB → ${(after / 1048576).toFixed(1)} MB` +
        `  (-${Math.round((1 - after / before) * 100)}%)`,
    );

    // Poster frame, written as WebP through sharp for consistency.
    const framePath = path.join(posterDir, `${slug}.png`);
    await run(ffmpeg, ["-y", "-ss", posterAt, "-i", target, "-frames:v", "1", framePath]);
    await sharp(framePath)
      .resize({ width: 720, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(path.join(posterDir, `${slug}.webp`));
    await rm(framePath, { force: true });

    posters[slug] = `/media/poster/${slug}.webp`;
    console.log(`  ${slug} poster @ ${posterAt}`);
  }

  return { written, posters };
}

/**
 * Pulls the curated stills out of each recording. Writing them to the same
 * /media/<slug>/ folder as the design exports means the gallery does not care
 * where a frame came from.
 */
async function extractFrames() {
  const written = {};

  for (const [slug, frames] of Object.entries(SOURCES.frames)) {
    const source = path.join(OUT, "video", `${slug}.mp4`);
    if (!existsSync(source)) {
      console.warn(`  ! skipped frames for ${slug} — no transcoded video`);
      continue;
    }

    const destination = path.join(OUT, slug);
    await mkdir(destination, { recursive: true });
    const list = [];

    for (const [seconds, name] of frames) {
      const temporary = path.join(destination, `.${name}.png`);
      await run(ffmpeg, ["-y", "-loglevel", "error", "-ss", String(seconds), "-i", source, "-frames:v", "1", temporary]);
      await sharp(temporary)
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(path.join(destination, `app-${name}.webp`));
      await rm(temporary, { force: true });
      list.push(`/media/${slug}/app-${name}.webp`);
    }

    written[slug] = list;
    console.log(`  ${slug}: ${list.length} frames`);
  }

  return written;
}

async function convertPortraits() {
  const destination = path.join(OUT, "profile");
  await mkdir(destination, { recursive: true });
  const written = {};

  for (const { name, file, width } of SOURCES.portraits) {
    if (!existsSync(file)) {
      console.warn(`  ! skipped ${name} — not found: ${file}`);
      continue;
    }
    await sharp(file)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 86 })
      .toFile(path.join(destination, `${name}.webp`));
    written[name] = `/media/profile/${name}.webp`;
    console.log(`  ${name}.webp`);
  }
  return written;
}

async function copyCv() {
  if (!existsSync(SOURCES.cv)) {
    console.warn(`  ! CV not found: ${SOURCES.cv}`);
    return null;
  }
  const destination = path.join(ROOT, "public", "cv");
  await mkdir(destination, { recursive: true });
  const name = "NourEldin-Ekramy-Saad-Flutter-Developer.pdf";
  await copyFile(SOURCES.cv, path.join(destination, name));
  console.log(`  ${name}`);
  return `/cv/${name}`;
}

async function main() {
  await mkdir(OUT, { recursive: true });

  console.log("Screenshots →");
  const galleries = {};
  for (const source of SOURCES.screenshots) {
    galleries[source.slug] = await convertDirectory(source);
  }

  console.log("Videos →");
  const { written: videos, posters } = await transcodeVideos();

  console.log("App frames →");
  const frames = await extractFrames();

  console.log("Portraits →");
  const portraits = await convertPortraits();

  console.log("CV →");
  const cv = await copyCv();

  // A manifest so the content layer and the Supabase uploader agree on paths.
  const manifest = { generatedAt: new Date().toISOString(), galleries, frames, videos, posters, portraits, cv };
  await writeFile(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));

  const total = Object.values(galleries).reduce((n, list) => n + list.length, 0);
  console.log(`\nDone — ${total} screenshots, ${Object.keys(videos).length} videos.`);
  console.log("Manifest: public/media/manifest.json");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
