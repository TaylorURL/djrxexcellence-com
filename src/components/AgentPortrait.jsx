import { useState } from "react";
import { agent } from "@/config/site";
import { cn } from "@/lib/cn";

const initials = agent.name
  .split(" ")
  .map((part) => part[0])
  .join("");

const stem = agent.headshot.replace(/\.[a-z]+$/i, "");

/**
 * The box the hero gives the portrait: 22rem, and 24rem from the large
 * breakpoint up. Described as a share of the viewport instead, a phone took
 * the full 1000w file for a 352px slot, which put 30 KB at high priority in
 * front of the contour texture the hero paints from. A caller that lays the
 * portrait out differently passes its own string; this one is repeated
 * verbatim, with the srcset below, on the head preload in index.html, which
 * has to resolve the same candidate or the portrait is fetched twice.
 */
const heroSizes = "(min-width: 1024px) 24rem, 22rem";

/**
 * The portrait falls back to the monogram the header uses when the headshot
 * file is absent, so a missing image is never a broken one.
 */
export default function AgentPortrait({
  className,
  priority = false,
  sizes = heroSizes,
}) {
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
      <source
        type="image/webp"
        srcSet={`${stem}-500.webp 500w, ${stem}-720.webp 720w, ${stem}.webp 1000w`}
        sizes={sizes}
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
