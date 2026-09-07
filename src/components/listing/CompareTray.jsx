import { Link } from "react-router-dom";
import { Scale, X } from "lucide-react";
import { useCompare } from "@/hooks/useCompare";

export default function CompareTray() {
  const { count, clear } = useCompare();
  if (count === 0) return null;

  return (
    <div className="on-dark pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-4 rounded-2xl bg-ink px-5 py-3 text-surface shadow-lift">
        <Scale className="h-4 w-4" aria-hidden="true" />
        <p className="text-sm font-semibold">
          {count} {count === 1 ? "home" : "homes"} selected
        </p>
        <Link
          to="/compare"
          className="rounded-lg bg-brand-red px-3.5 py-1.5 text-sm font-semibold"
        >
          Compare
        </Link>
        <button
          type="button"
          onClick={clear}
          aria-label="Clear Comparison"
          className="text-white/60 transition-colors duration-fast ease-out hover:text-white"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
