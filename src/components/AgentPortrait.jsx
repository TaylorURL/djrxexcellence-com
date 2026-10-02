import { useEffect, useRef, useState } from "react";
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

/** How long to wait before asking for the portrait again. */
const RETRY_MS = 800;

/**
 * The portrait falls back to the monogram the header uses when the headshot
 * file is absent, so a missing image is never a broken one. It asks a second
 * time first: a connection that drops mid-load fails the file exactly the way
 * a missing one does, and swapping a photograph the site has for a monogram
 * over one lost second is the wrong read of the two.
 */
export default function AgentPortrait({
  className,
  priority = false,
  sizes = heroSizes,
}) {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  // Empty on the first attempt, so the candidate this resolves stays the one
  // the head preload in index.html already asked for.
  const retry = attempt === 0 ? "" : `?retry=${attempt}`;

  function askAgain() {
    if (attempt > 0) {
      setFailed(true);
      return;
    }
    timer.current = setTimeout(() => setAttempt(1), RETRY_MS);
  }

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
    <picture key={attempt}>
      <source
        type="image/webp"
        srcSet={`${stem}-500.webp${retry} 500w, ${stem}-720.webp${retry} 720w, ${stem}.webp${retry} 1000w`}
        sizes={sizes}
      />
      <img
        src={`${agent.headshot}${retry}`}
        alt={`${agent.name}, ${agent.title}`}
        width={1000}
        height={1250}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        onError={askAgain}
        className={cn("bg-surface-sunken object-cover", className)}
      />
    </picture>
  );
}
