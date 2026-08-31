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
      <source
        type="image/webp"
        srcSet={`${stem}-500.webp 500w, ${stem}.webp 1000w`}
        sizes="(min-width: 1024px) 40vw, 100vw"
      />
      <img
        src={agent.headshot}
        alt={`${agent.name}, ${agent.title}`}
        width={1000}
        height={1250}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding={priority ? "sync" : "async"}
        onError={() => setFailed(true)}
        className={cn("bg-surface-sunken object-cover", className)}
      />
    </picture>
  );
}
