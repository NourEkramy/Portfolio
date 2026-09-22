"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { MediaItem } from "@/lib/types";

/**
 * Screenshot grid with a keyboard-navigable lightbox. Phone screenshots are
 * tall, so the grid uses a 9:19.5 aspect and the lightbox sizes to height.
 */
export function Gallery({ items, initialCount = 8 }: { items: MediaItem[]; initialCount?: number }) {
  const [open, setOpen] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);

  const visible = expanded ? items : items.slice(0, initialCount);
  const hidden = items.length - visible.length;

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (delta: number) => setOpen((i) => (i === null ? null : (i + delta + items.length) % items.length)),
    [items.length],
  );

  useEffect(() => {
    if (open === null) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };

    document.addEventListener("keydown", onKey);
    // Freeze the page behind the lightbox.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, close, step]);

  if (items.length === 0) return null;

  return (
    <>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {visible.map((item, index) => (
          <li key={item.url}>
            <button
              type="button"
              onClick={() => setOpen(index)}
              className="group block w-full text-left"
              aria-label={`Open screenshot: ${item.caption ?? `screen ${index + 1}`}`}
            >
              <div className="phone relative aspect-9/19.5 transition-transform duration-500 group-hover:-translate-y-1">
                <Image
                  src={item.url}
                  alt={item.caption ?? `Screenshot ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 230px"
                  className="rounded-[1.3rem] object-cover object-top"
                />
              </div>
              {item.caption && (
                <p className="mt-2.5 text-xs leading-snug text-ink-3 transition-colors group-hover:text-ink-2">
                  {item.caption}
                </p>
              )}
            </button>
          </li>
        ))}
      </ul>

      {hidden > 0 && (
        <button type="button" onClick={() => setExpanded(true)} className="btn btn-ghost mt-8">
          Show {hidden} more {hidden === 1 ? "screen" : "screens"}
        </button>
      )}

      {open !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={items[open].caption ?? "Screenshot"}
          className="fixed inset-0 z-50 flex flex-col bg-navy/95 backdrop-blur-sm"
          onClick={close}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <span className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-white/60">
              {open + 1} / {items.length}
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="grid size-9 place-items-center border border-white/20 text-white/80 transition-colors hover:border-white/50 hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div
            className="relative flex flex-1 items-center justify-center gap-4 p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <LightboxArrow direction="prev" onClick={() => step(-1)} />

            <figure className="flex h-full max-h-full flex-col items-center justify-center gap-4">
              <div className="relative h-[calc(100vh-13rem)] w-auto">
                <Image
                  src={items[open].url}
                  alt={items[open].caption ?? `Screenshot ${open + 1}`}
                  width={828}
                  height={1792}
                  className="h-full w-auto rounded-2xl border border-white/10 object-contain"
                  priority
                />
              </div>
              {items[open].caption && (
                <figcaption className="max-w-lg text-center text-sm text-white/70">
                  {items[open].caption}
                </figcaption>
              )}
            </figure>

            <LightboxArrow direction="next" onClick={() => step(1)} />
          </div>
        </div>
      )}
    </>
  );
}

function LightboxArrow({ direction, onClick }: { direction: "prev" | "next"; onClick: () => void }) {
  const isPrev = direction === "prev";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isPrev ? "Previous screenshot" : "Next screenshot"}
      className="grid size-11 shrink-0 place-items-center border border-white/20 text-white/80 transition-colors hover:border-white/50 hover:text-white"
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
        <path
          d={isPrev ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
