"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { status: "idle" | "success" | "error"; message: string };

const NOT_CONFIGURED: ActionState = {
  status: "error",
  message: "Supabase is not configured. Add the environment variables and restart.",
};

/** Refresh every surface a project change can appear on. */
function revalidateProject(slug?: string) {
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/cv");
  revalidatePath("/dashboard/projects");
  if (slug) revalidatePath(`/projects/${slug}`);
}

// ------------------------------------------------------------------- auth --

export async function signIn(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  if (!supabase) return NOT_CONFIGURED;

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");

  if (!email || !password) {
    return { status: "error", message: "Email and password are both required." };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { status: "error", message: error.message };

  redirect(next.startsWith("/dashboard") ? next : "/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase?.auth.signOut();
  redirect("/dashboard/login");
}

// --------------------------------------------------------------- projects --

/** Parses the "one per line" textareas the editor uses for list fields. */
function lines(formData: FormData, key: string): string[] {
  return String(formData.get(key) ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Parses "label :: detail" pairs, one per line. */
function pairs(formData: FormData, key: string): { a: string; b: string }[] {
  return lines(formData, key)
    .map((line) => {
      const [a, ...rest] = line.split("::");
      return { a: a.trim(), b: rest.join("::").trim() };
    })
    .filter((pair) => pair.a);
}

export async function saveProject(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  if (!supabase) return NOT_CONFIGURED;

  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();

  if (!slug || !title) return { status: "error", message: "Slug and title are required." };
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { status: "error", message: "Slug may only contain lowercase letters, numbers and hyphens." };
  }

  const architectureName = String(formData.get("architecture_name") ?? "").trim();
  const architecture = architectureName
    ? {
        name: architectureName,
        summary: String(formData.get("architecture_summary") ?? "").trim(),
        tree: String(formData.get("architecture_tree") ?? "") || undefined,
        layers: pairs(formData, "architecture_layers").map((p) => ({ name: p.a, detail: p.b })),
      }
    : null;

  const record = {
    slug,
    title,
    subtitle: String(formData.get("subtitle") ?? "").trim() || null,
    summary: String(formData.get("summary") ?? "").trim() || null,
    body: lines(formData, "body"),
    role: String(formData.get("role") ?? "").trim() || null,
    category: String(formData.get("category") ?? "").trim() || null,
    period: String(formData.get("period") ?? "").trim() || null,
    year: Number(formData.get("year")) || null,
    featured: formData.get("featured") === "on",
    sort_order: Number(formData.get("sort_order")) || 0,
    status: formData.get("status") === "draft" ? "draft" : "published",
    repo_url: String(formData.get("repo_url") ?? "").trim() || null,
    live_url: String(formData.get("live_url") ?? "").trim() || null,
    paper_url: String(formData.get("paper_url") ?? "").trim() || null,
    cover_url: String(formData.get("cover_url") ?? "").trim() || null,
    video_url: String(formData.get("video_url") ?? "").trim() || null,
    poster_url: String(formData.get("poster_url") ?? "").trim() || null,
    architecture,
  };

  let projectId = id;

  if (id) {
    const { error } = await supabase.from("projects").update(record).eq("id", id);
    if (error) return { status: "error", message: error.message };
  } else {
    const { data, error } = await supabase.from("projects").insert(record).select("id").single();
    if (error) return { status: "error", message: error.message };
    projectId = data.id;
  }

  // Child rows are small and fully described by the form, so replacing them
  // wholesale is simpler and safer than diffing.
  const children: { table: string; rows: Record<string, unknown>[] }[] = [
    {
      table: "project_metrics",
      rows: pairs(formData, "metrics").map((p, i) => ({
        project_id: projectId,
        label: p.a,
        value: p.b,
        sort_order: i,
      })),
    },
    {
      table: "project_highlights",
      rows: pairs(formData, "highlights").map((p, i) => ({
        project_id: projectId,
        label: p.a,
        detail: p.b,
        sort_order: i,
      })),
    },
    {
      table: "project_decisions",
      rows: pairs(formData, "decisions").map((p, i) => ({
        project_id: projectId,
        title: p.a,
        detail: p.b,
        sort_order: i,
      })),
    },
    {
      table: "project_tech",
      // name | version | kind | note
      rows: lines(formData, "tech").map((line, i) => {
        const [name, version, kind, ...note] = line.split("|").map((part) => part.trim());
        return {
          project_id: projectId,
          name,
          version: version || null,
          kind: kind || "package",
          note: note.join("|").trim() || null,
          sort_order: i,
        };
      }),
    },
    {
      table: "project_media",
      // url :: caption
      rows: pairs(formData, "media").map((p, i) => ({
        project_id: projectId,
        url: p.a,
        caption: p.b || null,
        kind: "screenshot",
        sort_order: i,
      })),
    },
  ];

  for (const { table, rows } of children) {
    const { error: clearError } = await supabase.from(table).delete().eq("project_id", projectId);
    if (clearError) return { status: "error", message: `${table}: ${clearError.message}` };

    if (rows.length > 0) {
      const { error: insertError } = await supabase.from(table).insert(rows);
      if (insertError) return { status: "error", message: `${table}: ${insertError.message}` };
    }
  }

  revalidateProject(slug);
  return { status: "success", message: `Saved “${title}”.` };
}

export async function deleteProject(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await supabase.from("projects").delete().eq("id", id);
  revalidateProject();
  redirect("/dashboard/projects");
}

// ---------------------------------------------------------------- profile --

export async function saveProfile(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  if (!supabase) return NOT_CONFIGURED;

  const record = {
    name: String(formData.get("name") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    tagline: String(formData.get("tagline") ?? "").trim() || null,
    bio: lines(formData, "bio"),
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim() || null,
    location: String(formData.get("location") ?? "").trim() || null,
    github: String(formData.get("github") ?? "").trim() || null,
    linkedin: String(formData.get("linkedin") ?? "").trim() || null,
    leetcode: String(formData.get("leetcode") ?? "").trim() || null,
    codeforces: String(formData.get("codeforces") ?? "").trim() || null,
    cv_url: String(formData.get("cv_url") ?? "").trim() || null,
    portrait_url: String(formData.get("portrait_url") ?? "").trim() || null,
    portrait_wide_url: String(formData.get("portrait_wide_url") ?? "").trim() || null,
    languages: pairs(formData, "languages").map((p) => ({ name: p.a, level: p.b })),
  };

  if (!record.name || !record.title || !record.email) {
    return { status: "error", message: "Name, title and email are required." };
  }

  const { data: existing } = await supabase.from("profile").select("id").maybeSingle();

  const { error } = existing
    ? await supabase.from("profile").update(record).eq("id", existing.id)
    : await supabase.from("profile").insert(record);

  if (error) return { status: "error", message: error.message };

  revalidatePath("/", "layout");
  return { status: "success", message: "Profile saved." };
}

// --------------------------------------------------------------- messages --

export async function markMessageRead(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return;

  const id = String(formData.get("id") ?? "");
  const read = formData.get("read") === "true";
  if (!id) return;

  await supabase.from("messages").update({ read }).eq("id", id);
  revalidatePath("/dashboard/messages");
  revalidatePath("/dashboard");
}

export async function deleteMessage(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await supabase.from("messages").delete().eq("id", id);
  revalidatePath("/dashboard/messages");
  revalidatePath("/dashboard");
}
