import { metaFor } from "@/config/routeMeta";
import { breadcrumbSchema } from "@/lib/schema";
import Seo from "@/components/app/Seo";
import AreaGrid from "@/components/home/AreaGrid";
import CommunityCostCompare from "@/components/costs/CommunityCostCompare";
import LeadForm from "@/components/LeadForm";

export default function Areas() {
  const meta = metaFor("/areas");

  return (
    <div className="page-shell py-16">
      <Seo
        title={meta.title}
        description={meta.description}
        schema={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Areas", path: "/areas" },
        ])}
      />

      <h1 className="max-w-3xl font-display text-4xl font-semibold">
        Eight towns, three counties
      </h1>
      <p className="mt-4 max-w-measure leading-relaxed text-ink-muted">
        Districts, flood maps and tax rates rarely follow the city limit. Each
        page covers what to check first.
      </p>

      <div className="mt-12">
        <AreaGrid />
      </div>

      <div className="section-defer mt-20">
        <CommunityCostCompare />
      </div>

      <div className="mt-16 grid gap-10 rounded-2xl border border-surface-line bg-surface-raised p-8 lg:grid-cols-2 lg:p-12">
        <div className="space-y-4">
          <h2 className="font-display text-3xl font-semibold">
            Not sure which town fits?
          </h2>
          <p className="leading-relaxed text-ink-muted">
            Commute, district, lot size and budget narrow it to two or three.
            Send what matters most.
          </p>
        </div>
        <LeadForm kind="area" submitLabel="Send Message" />
      </div>
    </div>
  );
}
