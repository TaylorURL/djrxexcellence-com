import { useState } from "react";
import { agent } from "@/config/site";
import { cn } from "@/lib/cn";

const initials = agent.name
  .split(" ")
  .map((part) => part[0])
  .join("");

const stem = agent.headshot.replace(/\.[a-z]+$/i, "");

/**
 * The portrait falls back to the monogram the header uses when the headshot
 * file is absent, so a missing image is never a broken one.
 */
export default function AgentPortrait({ className, priority = false }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={agent.name}
        className={cn(
          "flex items-center justify-center rounded-2xl bg-brand-blue-deep font-display text-6xl font-semibold text-white",
          className,
        )}
      >
        {initials}
      </div>
    );
  }

  return (
    <picture>
      {/* The sizes describe the box this is given rather than the viewport:
          22rem on the home hero, 24rem from the large breakpoint up, and the
          About column lands on the same figure. Given the viewport instead, a
          phone at 1.75x asked for 721px and took the full 1000w file to fill a
          352px slot. Both strings are repeated verbatim on
          the head preload in index.html, which has to resolve the same
          candidate or the portrait is fetched twice. */}
      <source
        type="image/webp"
        srcSet={`${stem}-500.webp 500w, ${stem}-720.webp 720w, ${stem}.webp 1000w`}
        sizes="(min-width: 1024px) 24rem, 22rem"
      />
      <img
        src={agent.headshot}
        alt={`${agent.name}, ${agent.title}`}
        width={1000}
        height={1250}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        onError={() => setFailed(true)}
        className={cn("bg-surface-sunken object-cover", className)}
      />
    </picture>
  );
}
