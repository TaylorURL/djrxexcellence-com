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
 * The same field on a dark ground.
 *
 * The hero search and the lead form each carried a version of this, and the two
 * disagreed on height, padding, hover and whether the colour change was
 * animated. They are one control in two places, so the class belongs beside the
 * light one rather than in whichever component happened to need it first.
 */
export const inputClassesDark =
  "h-11 w-full rounded-xl border-[--hairline-inverse-strong] bg-[--surface-inverse-raised] border px-3.5 text-sm text-white transition-colors duration-fast ease-out placeholder:text-[--ink-inverse-faint] hover:border-white/45 focus:border-white/70 aria-[invalid=true]:border-brand-red-light";

/** A textarea is the field with its fixed height released. */
export const textareaClasses = `${inputClasses} h-auto py-3`;
