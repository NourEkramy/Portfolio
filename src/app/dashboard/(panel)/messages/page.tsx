import { deleteMessage, markMessageRead } from "@/app/dashboard/actions";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data } = (await supabase
    ?.from("messages")
    .select("*")
    .order("created_at", { ascending: false })) ?? { data: [] };

  const messages = data ?? [];
  const unread = messages.filter((message) => !message.read).length;

  return (
    <div>
      <div className="mb-7">
        <h2 className="display-md text-ink">Messages</h2>
        <p className="mt-1 max-w-xl text-sm text-ink-3">
          Contact messages are emailed straight to your inbox. Anything listed here is one the email
          send could not deliver, kept so it is not lost.
        </p>
        <p className="mt-2 text-sm text-ink-3">
          {messages.length} total{unread > 0 && ` · ${unread} unread`}
        </p>
      </div>

      {messages.length === 0 ? (
        <div className="plate p-8 text-center">
          <p className="text-ink-2">
            Nothing here — every message so far was delivered by email.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {messages.map((message) => (
            <li
              key={message.id}
              className={`plate p-5 ${message.read ? "" : "border-l-2 border-l-oxblood"}`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-bold text-ink">
                    {message.subject || "(no subject)"}
                  </h3>
                  <p className="mt-0.5 font-mono text-[0.72rem] text-ink-3">
                    {message.name} ·{" "}
                    <a href={`mailto:${message.email}`} className="link-underline text-oxblood">
                      {message.email}
                    </a>
                  </p>
                </div>
                <time
                  dateTime={message.created_at}
                  className="font-mono text-[0.66rem] uppercase tracking-[0.12em] text-ink-3"
                >
                  {new Date(message.created_at).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </div>

              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ink-2">
                {message.message}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-5 border-t border-rule-soft pt-4">
                <form action={markMessageRead}>
                  <input type="hidden" name="id" value={message.id} />
                  <input type="hidden" name="read" value={message.read ? "false" : "true"} />
                  <button
                    type="submit"
                    className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-ink-2 underline underline-offset-4 hover:text-oxblood"
                  >
                    Mark as {message.read ? "unread" : "read"}
                  </button>
                </form>

                <a
                  href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject || "your message"}`)}`}
                  className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-ink-2 underline underline-offset-4 hover:text-oxblood"
                >
                  Reply
                </a>

                <form action={deleteMessage} className="ml-auto">
                  <input type="hidden" name="id" value={message.id} />
                  <button
                    type="submit"
                    className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-oxblood underline underline-offset-4"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
