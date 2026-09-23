"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MEDIA_BUCKET } from "@/lib/supabase/config";

/**
 * Uploads files straight from the browser into the storage bucket and reports
 * back the stored paths, which the editor appends to its media textarea. Going
 * direct avoids routing tens of megabytes of video through a server action.
 */
export function MediaUploader({
  folder,
  onUploaded,
  accept = "image/*,video/mp4,application/pdf",
  label,
}: {
  folder: string;
  onUploaded: (paths: string[]) => void;
  /** Narrow the file picker to what this field actually accepts. */
  accept?: string;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return;

    const supabase = createClient();
    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }

    setBusy(true);
    setError("");
    const uploaded: string[] = [];

    try {
      for (const [index, file] of Array.from(files).entries()) {
        setProgress(`${index + 1} of ${files.length} — ${file.name}`);

        // Keep the original name but make it URL-safe and collision-resistant.
        const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-|-$/g, "");
        const key = `${folder}/${Date.now().toString(36)}-${safe}`;

        const { error: uploadError } = await supabase.storage
          .from(MEDIA_BUCKET)
          .upload(key, file, { cacheControl: "31536000", upsert: false });

        if (uploadError) throw new Error(`${file.name}: ${uploadError.message}`);
        uploaded.push(key);
      }

      onUploaded(uploaded);
      setProgress(`Uploaded ${uploaded.length} file${uploaded.length === 1 ? "" : "s"}.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload failed.");
      setProgress("");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="mt-3 border border-dashed border-rule p-4">
      {label && <p className="mb-2 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-ink-3">{label}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          disabled={busy}
          onChange={(event) => upload(event.target.files)}
          className="max-w-full font-mono text-[0.7rem] text-ink-2 file:mr-3 file:border file:border-rule file:bg-surface file:px-3 file:py-1.5 file:font-mono file:text-[0.68rem] file:uppercase file:tracking-[0.14em] file:text-ink-2"
        />
        <span className="font-mono text-[0.68rem] text-ink-3">→ {MEDIA_BUCKET}/{folder}/</span>
      </div>

      {busy && <p className="mt-2 font-mono text-[0.7rem] text-oxblood">Uploading {progress}</p>}
      {!busy && progress && <p className="mt-2 font-mono text-[0.7rem] text-ink-3">{progress}</p>}
      {error && <p className="mt-2 font-mono text-[0.7rem] text-oxblood">{error}</p>}
    </div>
  );
}
