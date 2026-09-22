"use client";

import Image from "next/image";
import { useRef, useState } from "react";

/**
 * Click-to-load demo video. The file is only fetched once the poster is clicked
 * — these recordings are tens of megabytes and most visitors never play them.
 */
export function VideoPlayer({
  src,
  poster,
  label = "Recorded walkthrough",
}: {
  src: string;
  poster?: string;
  label?: string;
}) {
  const [started, setStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  function start() {
    setStarted(true);
    // The element mounts in this same commit, so play after paint.
    requestAnimationFrame(() => videoRef.current?.play().catch(() => {}));
  }

  return (
    <figure className="plate frame-keyline overflow-hidden">
      {/*
        These are portrait phone recordings, so a 16:9 frame would be almost all
        letterbox. The stage is a fixed-height dark panel and the video is
        centred inside it at its own aspect.
      */}
      <div className="relative flex h-[min(78vh,620px)] items-center justify-center overflow-hidden bg-navy">
        {started ? (
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            controls
            playsInline
            preload="metadata"
            className="h-full w-auto max-w-full object-contain"
          >
            Your browser cannot play this video.{" "}
            <a href={src} download>
              Download it instead
            </a>
            .
          </video>
        ) : (
          <button
            type="button"
            onClick={start}
            className="group absolute inset-0 grid place-items-center"
            aria-label={`Play ${label}`}
          >
            {poster && (
              <>
                {/* A blurred fill behind, so the portrait frame does not float
                    on flat navy, plus the frame itself at true aspect. */}
                <Image
                  src={poster}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 820px"
                  className="scale-110 object-cover object-center opacity-25 blur-2xl"
                />
                <Image
                  src={poster}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 820px"
                  className="object-contain object-center opacity-70"
                />
                <span className="absolute inset-0 bg-navy/45" aria-hidden="true" />
              </>
            )}
            <span className="relative flex flex-col items-center gap-3">
              <span className="grid size-16 place-items-center rounded-full border border-[#f8f1e2]/40 bg-[#f8f1e2]/10 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:border-[#f8f1e2]/80 group-hover:bg-[#f8f1e2]/20">
                <svg viewBox="0 0 24 24" className="ml-1 size-6 fill-[#f8f1e2]" aria-hidden="true">
                  <path d="M6 3.5v17l14-8.5z" />
                </svg>
              </span>
              <span className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-[#f8f1e2]/80">
                Play demo
              </span>
            </span>
          </button>
        )}
      </div>
      <figcaption className="flex items-center justify-between gap-4 border-t border-rule px-4 py-2.5">
        <span className="label">{label}</span>
        <a href={src} download className="link-underline font-mono text-[0.68rem] text-ink-3">
          Download
        </a>
      </figcaption>
    </figure>
  );
}
