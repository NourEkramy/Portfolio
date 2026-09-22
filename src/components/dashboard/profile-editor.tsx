"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveProfile, type ActionState } from "@/app/dashboard/actions";
import { MediaUploader } from "./media-uploader";

const initial: ActionState = { status: "idle", message: "" };

export interface EditorProfile {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
  github: string;
  linkedin: string;
  leetcode: string;
  codeforces: string;
  cvUrl: string;
  portraitUrl: string;
  portraitWideUrl: string;
  languages: string;
}

export function ProfileEditor({ profile }: { profile: EditorProfile }) {
  const [state, action] = useActionState(saveProfile, initial);
  const [cvUrl, setCvUrl] = useState(profile.cvUrl);
  const [portraitUrl, setPortraitUrl] = useState(profile.portraitUrl);

  return (
    <form action={action} className="space-y-10">
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

      <Fieldset legend="Identity">
        <div className="grid gap-5 sm:grid-cols-2">
          <Text label="Name" name="name" defaultValue={profile.name} required />
          <Text label="Title" name="title" defaultValue={profile.title} required />
        </div>
        <Area label="Tagline" name="tagline" defaultValue={profile.tagline} rows={3} hint="The line under your name on the home page." />
        <Area label="Bio" name="bio" defaultValue={profile.bio} rows={7} hint="One paragraph per line." />
      </Fieldset>

      <Fieldset legend="Contact">
        <div className="grid gap-5 sm:grid-cols-2">
          <Text label="Email" name="email" type="email" defaultValue={profile.email} required />
          <Text label="Phone" name="phone" defaultValue={profile.phone} />
          <Text label="Location" name="location" defaultValue={profile.location} />
          <Area
            label="Languages"
            name="languages"
            defaultValue={profile.languages}
            rows={3}
            hint="One per line: name :: level"
          />
        </div>
      </Fieldset>

      <Fieldset legend="Profiles">
        <div className="grid gap-5 sm:grid-cols-2">
          <Text label="GitHub" name="github" defaultValue={profile.github} />
          <Text label="LinkedIn" name="linkedin" defaultValue={profile.linkedin} />
          <Text label="LeetCode" name="leetcode" defaultValue={profile.leetcode} />
          <Text label="CodeForces" name="codeforces" defaultValue={profile.codeforces} />
        </div>
      </Fieldset>

      <Fieldset legend="CV and portrait">
        <Text
          label="CV file"
          name="cv_url"
          value={cvUrl}
          onChange={setCvUrl}
          hint="A /cv/… path, or a storage key once uploaded."
        />
        <MediaUploader folder="cv" onUploaded={(paths) => paths[0] && setCvUrl(paths[0])} />

        <Text
          label="Portrait"
          name="portrait_url"
          value={portraitUrl}
          onChange={setPortraitUrl}
          hint="Portrait orientation. Shown in the hero."
        />
        <MediaUploader folder="profile" onUploaded={(paths) => paths[0] && setPortraitUrl(paths[0])} />

        <Text label="Wide portrait" name="portrait_wide_url" defaultValue={profile.portraitWideUrl} />
      </Fieldset>

      <div className="border-t border-rule pt-6">
        <SaveButton />
      </div>
    </form>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-primary px-6 py-2.5 text-[0.68rem] disabled:opacity-60">
      {pending ? "Saving…" : "Save profile"}
    </button>
  );
}

function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-5">
      <legend className="label w-full border-b border-rule-soft pb-2">{legend}</legend>
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
  rows = 4,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  rows?: number;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="label">
        {label}
      </label>
      <textarea id={name} name={name} rows={rows} defaultValue={defaultValue} className={`${inputClass} resize-y`} />
      {hint && <p className="mt-1.5 font-mono text-[0.66rem] text-ink-3">{hint}</p>}
    </div>
  );
}
