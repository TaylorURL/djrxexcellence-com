import { cn } from "@/lib/cn";

export default function Field({ label, hint, error, children, className }) {
  return (
    <label className={cn("block space-y-2", className)}>
      <span className="block text-sm font-semibold leading-tight text-ink">
        {label}
      </span>
      {children}
      {hint && !error ? (
        <span className="block text-xs text-ink-muted">{hint}</span>
      ) : null}
      {error ? (
        <span className="block text-xs font-medium text-brand-red">
          {error}
        </span>
      ) : null}
    </label>
  );
}

export const inputClasses =
  "h-11 w-full rounded-xl border border-surface-line bg-surface-raised px-3.5 text-sm text-ink transition-colors duration-fast ease-out placeholder:text-ink-faint hover:border-surface-line-strong focus:border-brand-blue focus:bg-surface aria-[invalid=true]:border-brand-red";

/**
 * The same field on a dark ground, which is what the hero search sits on.
 *
 * It lives here beside the light one because the two are one control, and a
 * dark ground that borrows its field from whichever component needed it first
 * is how they drifted apart on height, padding and hover the last time.
 */
export const inputClassesDark =
  "h-11 w-full rounded-xl border-[--hairline-inverse-strong] bg-[--surface-inverse-raised] border px-3.5 text-sm text-white transition-colors duration-fast ease-out placeholder:text-[--ink-inverse-faint] hover:border-white/45 focus:border-white/70 aria-[invalid=true]:border-brand-red-light";

/** A textarea is the field with its fixed height released. */
export const textareaClasses = `${inputClasses} h-auto py-3`;
