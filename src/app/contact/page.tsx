import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { SectionLabel } from "@/components/ornament";
import { Reveal } from "@/components/reveal";
import { getProfile } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with NourEldin Ekramy Saad — Flutter App Developer, Cairo, Egypt.",
};

export default async function ContactPage() {
  const profile = await getProfile();

  const channels = [
    { label: "Email", value: profile.email, href: `mailto:${profile.email}` },
    { label: "Phone", value: profile.phone, href: `tel:${profile.phone.replace(/\s/g, "")}` },
    { label: "GitHub", value: "github.com/NourEkramy", href: profile.github },
    profile.linkedin
      ? { label: "LinkedIn", value: "NourEldin Ekramy Saad", href: profile.linkedin }
      : null,
    profile.leetcode ? { label: "LeetCode", value: "NourEkramy", href: profile.leetcode } : null,
  ].filter(Boolean) as { label: string; value: string; href: string }[];

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
      <div className="rise">
        <SectionLabel>Get in touch</SectionLabel>
        <h1 className="display-xl mt-6 text-ink">Contact</h1>
        <div className="rule-double my-8 max-w-md" />
        <p className="max-w-2xl text-lg leading-relaxed text-ink-2">
          Open to Flutter roles and freelance work. Email is fastest, but the form below reaches the
          same inbox.
        </p>
      </div>

      <div className="mt-14 grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <Reveal>
          <div>
            <h2 className="label mb-6">Direct</h2>
            <dl className="divide-y divide-rule-soft border-y border-rule-soft">
              {channels.map((channel) => (
                <div key={channel.label} className="flex items-baseline justify-between gap-4 py-4">
                  <dt className="label">{channel.label}</dt>
                  <dd className="min-w-0 text-right">
                    <a
                      href={channel.href}
                      target={channel.href.startsWith("http") ? "_blank" : undefined}
                      rel={channel.href.startsWith("http") ? "noreferrer noopener" : undefined}
                      className="link-underline break-words font-mono text-sm text-ink-2 hover:text-oxblood"
                    >
                      {channel.value}
                    </a>
                  </dd>
                </div>
              ))}
              <div className="flex items-baseline justify-between gap-4 py-4">
                <dt className="label">Location</dt>
                <dd className="font-mono text-sm text-ink-2">{profile.location}</dd>
              </div>
            </dl>

            <a href={profile.cvUrl} download className="btn btn-ghost mt-8 w-full">
              Download CV
            </a>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div>
            <h2 className="label mb-6">Send a message</h2>
            <ContactForm fallbackEmail={profile.email} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
