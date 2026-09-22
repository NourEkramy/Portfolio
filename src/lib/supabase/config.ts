/**
 * Supabase is optional. Until the two public env vars are set, every data
 * accessor falls back to the static content in src/content, so the site builds
 * and renders completely on a fresh clone.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/** Storage bucket holding screenshots, videos and the CV. */
export const MEDIA_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET ?? "portfolio-media";

/**
 * Turns a stored path into something the browser can load.
 * Absolute URLs and local /media paths are passed through untouched, so the
 * dashboard can mix uploaded files with the ones committed to /public.
 */
export function mediaUrl(pathOrUrl: string | null | undefined): string {
  if (!pathOrUrl) return "";
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) return pathOrUrl;
  if (pathOrUrl.startsWith("/")) return pathOrUrl;
  if (!isSupabaseConfigured) return `/${pathOrUrl}`;
  return `${SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/${pathOrUrl}`;
}
