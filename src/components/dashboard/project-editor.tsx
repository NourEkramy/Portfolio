"use client";

import Link from "next/link";
import { useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { deleteProject, saveProject, type ActionState } from "@/app/dashboard/actions";
import { MediaUploader } from "./media-uploader";

const initial: ActionState = { status: "idle", message: "" };

export interface EditorProject {
  id: string | null;
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  body: string;
  role: string;
  category: string;
  period: string;
  year: string;
  featured: boolean;
  sortOrder: string;
  status: string;
  repoUrl: string;
  liveUrl: string;
  paperUrl: string;
  coverUrl: string;
  videoUrl: string;
  posterUrl: string;
  architectureName: string;
  architectureSummary: string;
  architectureTree: string;
  architectureLayers: string;
  metrics: string;
  highlights: string;
  decisions: string;
  tech: string;
  media: string;
}

export function ProjectEditor({ project }: { project: EditorProject }) {
  const [state, action] = useActionState(saveProject, initial);
  const [media, setMedia] = useState(project.media);
  const [slug, setSlug] = useState(project.slug);
  const [coverUrl, setCoverUrl] = useState(project.coverUrl);
  const [videoUrl, setVideoUrl] = useState(project.videoUrl);
  const [posterUrl, setPosterUrl] = useState(project.posterUrl);

  function appendUploads(paths: string[]) {
    const lines = paths.map((path) => `${path} :: `);
    setMedia((current) => [current.trim(), ...lines].filter(Boolean).join("\n"));
  }

  return (
    <form action={action} className="space-y-10">
      {project.id && <input type="hidden" name="id" value={project.id} />}

      {state.status !== "idle" && (
        <p
          role="status"
          className={`border px-4 py-3 text-sm ${
            state.status === "success"
              ? "border-rule bg-surface text-ink-2"
              : "border-oxblood bg-oxblood/8 text-oxblood"
          }`}
        >
          {state.message}
        </p>
      )}

      {/* ------------------------------------------------------------ Basics */}
      <Fieldset legend="Basics">
        <div className="grid gap-5 sm:grid-cols-2">
          <Text label="Title" name="title" defaultValue={project.title} required />
          <Text
            label="Slug"
            name="slug"
            value={slug}
            onChange={setSlug}
            required
            hint="Lowercase, numbers and hyphens. This is the URL."
          />
        </div>
        <Text label="Subtitle" name="subtitle" defaultValue={project.subtitle} />
        <Area label="Summary" name="summary" defaultValue={project.summary} rows={3} hint="Shown on the card and under the title." />
        <Area
          label="Body"
          name="body"
          defaultValue={project.body}
          rows={7}
          hint="One paragraph per line."
        />
      </Fieldset>

      {/* ---------------------------------------------------------- Metadata */}
      <Fieldset legend="Metadata">
        <div className="grid gap-5 sm:grid-cols-2">
          <Text label="Role" name="role" defaultValue={project.role} />
          <Text label="Category" name="category" defaultValue={project.category} />
          <Text label="Period" name="period" defaultValue={project.period} hint="e.g. 08/2026 — 09/2026" />
          <Text label="Year" name="year" type="number" defaultValue={project.year} />
          <Text label="Sort order" name="sort_order" type="number" defaultValue={project.sortOrder} />
          <div>
            <label htmlFor="status" className="label">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={project.status}
              className="mt-2 w-full border border-rule bg-paper px-3.5 py-2.5 text-ink outline-none focus:border-oxblood"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        <label className="mt-2 flex items-center gap-3">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={project.featured}
            className="size-4 accent-[var(--c-oxblood)]"
          />
          <span className="text-sm text-ink-2">Feature on the home page</span>
        </label>
      </Fieldset>

      {/* ------------------------------------------------------------- Links */}
      <Fieldset legend="Links">
        <div className="grid gap-5 sm:grid-cols-3">
          <Text label="Repository" name="repo_url" defaultValue={project.repoUrl} />
          <Text label="Live URL" name="live_url" defaultValue={project.liveUrl} />
          <Text label="Paper URL" name="paper_url" defaultValue={project.paperUrl} />
        </div>
      </Fieldset>

      {/* ------------------------------------------------------------- Media */}
      <Fieldset legend="Media">
        <Text
          label="Cover image"
          name="cover_url"
          value={coverUrl}
          onChange={setCoverUrl}
          hint="Shown on the project card. Upload below, or paste a /media/… path."
        />
        <MediaUploader
          folder={slug || "unsorted"}
          accept="image/*"
          label="Upload a cover image"
          onUploaded={(paths) => paths[0] && setCoverUrl(paths[0])}
        />

        <Text
          label="Demo video"
          name="video_url"
          value={videoUrl}
          onChange={setVideoUrl}
          hint="An MP4 walkthrough. Leave blank to hide the Demo section entirely."
        />
        <MediaUploader
          folder={`${slug || "unsorted"}/video`}
          accept="video/mp4"
          label="Upload an MP4 (50MB max)"
          onUploaded={(paths) => paths[0] && setVideoUrl(paths[0])}
        />

        <Text
          label="Video poster"
          name="poster_url"
          value={posterUrl}
          onChange={setPosterUrl}
          hint="The still shown before the video plays. A frame from the video works best."
        />
        <MediaUploader
          folder={`${slug || "unsorted"}/poster`}
          accept="image/*"
          label="Upload a poster frame"
          onUploaded={(paths) => paths[0] && setPosterUrl(paths[0])}
        />

        <Area
          label="Gallery"
          name="media"
          value={media}
          onChange={setMedia}
          rows={10}
          hint="One per line: url :: caption"
        />
        <MediaUploader
          folder={slug || "unsorted"}
          accept="image/*"
          label="Add screenshots to the gallery"
          onUploaded={appendUploads}
        />
      </Fieldset>

      {/* ------------------------------------------------------ Architecture */}
      <Fieldset legend="Architecture">
        <Text label="Name" name="architecture_name" defaultValue={project.architectureName} hint="Leave blank to omit the section." />
        <Area label="Summary" name="architecture_summary" defaultValue={project.architectureSummary} rows={4} />
        <Area
          label="Layers"
          name="architecture_layers"
          defaultValue={project.architectureLayers}
          rows={5}
          hint="One per line: name :: detail"
        />
        <Area
          label="Folder tree"
          name="architecture_tree"
          defaultValue={project.architectureTree}
          rows={12}
          mono
          hint="Rendered as-is in a monospaced panel."
        />
      </Fieldset>

      {/* -------------------------------------------------------- List fields */}
      <Fieldset legend="Content">
        <Area label="Metrics" name="metrics" defaultValue={project.metrics} rows={6} hint="One per line: label :: value" />
        <Area label="Highlights" name="highlights" defaultValue={project.highlights} rows={8} hint="One per line: label :: detail" />
        <Area label="Decisions" name="decisions" defaultValue={project.decisions} rows={8} hint="One per line: title :: detail" />
        <Area
          label="Stack"
          name="tech"
          defaultValue={project.tech}
          rows={10}
          mono
          hint="One per line: name | version | kind | note   —   kind is package, language, tool, service or concept"
        />
      </Fieldset>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-6">
        <div className="flex items-center gap-3">
          <SaveButton />
          <Link href="/dashboard/projects" className="btn btn-ghost px-5 py-2.5 text-[0.68rem]">
            Cancel
          </Link>
        </div>

        {project.id && (
          <button
            type="submit"
            formAction={deleteProject}
            formNoValidate
            className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-oxblood underline underline-offset-4"
            onClick={(event) => {
              if (!confirm("Delete this project and all of its media, stack and highlights?")) {
                event.preventDefault();
              }
            }}
          >
            Delete project
          </button>
        )}
      </div>
    </form>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-primary px-6 py-2.5 text-[0.68rem] disabled:opacity-60">
      {pending ? "Saving…" : "Save project"}
    </button>
  );
}

function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-5">
      <legend className="label border-b border-rule-soft pb-2 w-full">{legend}</legend>
      {children}
    </fieldset>
  );
}

const inputClass =
  "mt-2 w-full border border-rule bg-paper px-3.5 py-2.5 text-ink outline-none transition-colors focus:border-oxblood";

function Text({
  label,
  name,
  defaultValue,
  value,
  onChange,
  type = "text",
  required = false,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="label">
        {label} {required && <span className="text-oxblood">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className={inputClass}
        {...(onChange ? { value, onChange: (e) => onChange(e.target.value) } : { defaultValue })}
      />
      {hint && <p className="mt-1.5 font-mono text-[0.66rem] text-ink-3">{hint}</p>}
    </div>
  );
}

function Area({
  label,
  name,
  defaultValue,
  value,
  onChange,
  rows = 4,
  hint,
  mono = false,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  rows?: number;
  hint?: string;
  mono?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="label">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        className={`${inputClass} resize-y ${mono ? "font-mono text-[0.78rem] leading-relaxed" : ""}`}
        {...(onChange ? { value, onChange: (e) => onChange(e.target.value) } : { defaultValue })}
      />
      {hint && <p className="mt-1.5 font-mono text-[0.66rem] text-ink-3">{hint}</p>}
    </div>
  );
}
