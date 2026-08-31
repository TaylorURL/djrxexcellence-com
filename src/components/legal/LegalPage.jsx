import Seo from "@/components/Seo";

export const LAST_UPDATED = "August 26, 2026";

export default function LegalPage({ title, description, updated, children }) {
  return (
    <div className="page-shell max-w-3xl py-16">
      <Seo title={title} description={description} />
      <h1 className="font-display text-4xl font-semibold">{title}</h1>
      <p className="mt-3 text-sm text-ink-faint">
        Last updated {updated ?? LAST_UPDATED}
      </p>
      <div className="mt-10 space-y-8 leading-relaxed text-ink-muted [&_a]:font-semibold [&_a]:text-brand-blue [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-ink [&_li]:leading-relaxed [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
        {children}
      </div>
    </div>
  );
}
