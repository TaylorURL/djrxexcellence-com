import { Scale } from "lucide-react";
import { useCompare } from "@/hooks/useCompare";
import { cn } from "@/lib/cn";

export default function CompareButton({ listingId, className }) {
  const { has, isFull, toggle } = useCompare();
  const selected = has(listingId);
  const disabled = !selected && isFull;

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle(listingId);
      }}
      disabled={disabled}
      aria-pressed={selected}
      title={disabled ? "Comparison holds four homes at a time" : undefined}
      aria-label={selected ? "Remove from Comparison" : "Add to Comparison"}
      className={cn(
        "relative z-10 flex h-9 w-9 items-center justify-center rounded-lg shadow-card backdrop-blur transition-colors duration-fast ease-out disabled:cursor-not-allowed disabled:opacity-50",
        selected
          ? "bg-brand-blue text-on-accent"
          : "bg-surface/90 text-ink hover:text-brand-blue",
        className,
      )}
    >
      <Scale className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
