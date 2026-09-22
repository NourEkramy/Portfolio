import { ProfileEditor, type EditorProfile } from "@/components/dashboard/profile-editor";
import { profile as fallback } from "@/content/profile";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data } = (await supabase?.from("profile").select("*").maybeSingle()) ?? { data: null };

  // With no row yet, pre-fill from the committed content so the first save
  // imports it rather than starting from an empty form.
  const profile: EditorProfile = {
    name: data?.name ?? fallback.name,
    title: data?.title ?? fallback.title,
    tagline: data?.tagline ?? fallback.tagline,
    bio: (data?.bio ?? fallback.bio).join("\n"),
    email: data?.email ?? fallback.email,
    phone: data?.phone ?? fallback.phone,
    location: data?.location ?? fallback.location,
    github: data?.github ?? fallback.github,
    linkedin: data?.linkedin ?? fallback.linkedin ?? "",
    leetcode: data?.leetcode ?? fallback.leetcode ?? "",
    codeforces: data?.codeforces ?? fallback.codeforces ?? "",
    cvUrl: data?.cv_url ?? fallback.cvUrl,
    portraitUrl: data?.portrait_url ?? fallback.portraitUrl,
    portraitWideUrl: data?.portrait_wide_url ?? fallback.portraitWideUrl ?? "",
    languages: (data?.languages ?? fallback.languages)
      .map((language: { name: string; level: string }) => `${language.name} :: ${language.level}`)
      .join("\n"),
  };

  return (
    <div>
      <div className="mb-8 border-b border-rule pb-5">
        <h2 className="display-md text-ink">Profile</h2>
        <p className="mt-1 text-sm text-ink-3">
          {data ? "Editing the row in Supabase." : "No row yet — saving will create one."}
        </p>
      </div>

      <ProfileEditor profile={profile} />
    </div>
  );
}
