import { Quote, Star } from "lucide-react";

export default function Testimonials({ entries }) {
  if (!entries?.length) return null;

  return (
    <section className="section-defer bg-surface-raised py-20">
      <div className="page-shell">
        <h2 className="max-w-2xl font-display text-3xl font-semibold sm:text-4xl">
          What buyers and sellers say afterward
        </h2>
        <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="arrive flex flex-col rounded-2xl border border-surface-line bg-surface p-6 shadow-card transition-shadow duration-base ease-out hover:shadow-lift"
            >
              <Quote className="h-6 w-6 text-brand-red/40" aria-hidden="true" />
              <blockquote className="mt-4 flex-1 leading-relaxed text-ink-muted">
                {entry.quote}
              </blockquote>
              {entry.rating ? (
                <div
                  className="mt-5 flex gap-0.5"
                  aria-label={`${entry.rating} out of 5`}
                >
                  {Array.from({ length: entry.rating }, (_, index) => (
                    <Star
                      key={index}
                      className="h-4 w-4 fill-brand-red text-brand-red"
                      aria-hidden="true"
                    />
                  ))}
                </div>
              ) : null}
              <footer className="mt-4 border-t border-surface-line pt-4 text-sm">
                <p className="font-semibold">{entry.author_name}</p>
                <p className="text-ink-muted">
                  {[entry.transaction_kind, entry.author_location]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
