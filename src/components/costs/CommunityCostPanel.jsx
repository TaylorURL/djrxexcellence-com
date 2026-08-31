import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { duesRange, price } from "@/lib/format";
import {
  communityMonthly,
  compareCommunities,
  costsBySlug,
} from "@/lib/carryingCost";
import { prevalenceLabel } from "@/data/carryingCosts";
import CostInputs from "@/components/costs/CostInputs";
import { useCostInputs } from "@/lib/useCostInputs";
import { CostLines } from "@/components/costs/CostBar";

/**
 * Where this town lands among the eight at the same price.
 *
 * A monthly figure on its own says nothing, so the rank is computed against
 * the whole set rather than reported as a number the reader has to weigh
 * alone.
 */
function useRank(values, slug) {
  return useMemo(() => {
    const rows = compareCommunities(values);
    const index = rows.findIndex((row) => row.slug === slug);
    if (index < 0) return null;
    return { position: index + 1, of: rows.length, cheapest: rows[0] };
  }, [values, slug]);
}

/** Where the town landed, as one sentence rather than a branch in the markup. */
function rankLine(rank) {
  if (rank.position === 1) {
    return `That is the lowest monthly cost of the ${rank.of} towns at this price.`;
  }
  return `That is ${rank.position} of ${rank.of} towns at this price. ${rank.cheapest.name} is the lowest at ${price(Math.round(rank.cheapest.total))}.`;
}

export default function CommunityCostPanel({ area }) {
  const entry = costsBySlug(area.slug);
  const inputs = useCostInputs();
  const rank = useRank(inputs.values, area.slug);

  const row = useMemo(
    () => (entry ? communityMonthly({ ...inputs.values, entry }) : null),
    [entry, inputs.values],
  );

  if (!entry || !row) return null;

  const districtRows = [
    { label: "Municipal Utility District", value: prevalenceLabel[entry.mud] },
    { label: "Public Improvement District", value: prevalenceLabel[entry.pid] },
    {
      label: "Homeowners Association",
      value:
        entry.hoa.monthlyHigh > 0 ? `${duesRange(entry.hoa)} a month` : "Rare",
    },
  ];

  return (
    <section
      id="carrying-cost"
      aria-labelledby="carrying-cost-heading"
      className="scroll-anchor"
    >
      <h2
        id="carrying-cost-heading"
        className="font-display text-3xl font-semibold"
      >
        What it costs to own in {area.name}
      </h2>
      <p className="mt-3 max-w-measure leading-relaxed text-ink-muted">
        The price is only the part a lender finances. {entry.taxNote}
      </p>

      <div className="mt-8 rounded-2xl border border-surface-line bg-surface-raised p-6 lg:p-8">
        <CostInputs {...inputs} />

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-2">
          <div className="rounded-xl border border-surface-line bg-surface p-5">
            <CostLines row={row} />
            {rank ? (
              <p className="mt-4 border-t border-surface-line pt-4 text-sm leading-relaxed text-ink-muted">
                {rankLine(rank)}{" "}
                <Link
                  className="font-semibold text-brand-red"
                  to="/areas#carrying-cost"
                >
                  Compare all {rank.of}
                </Link>
              </p>
            ) : null}
          </div>

          <dl className="space-y-5">
            <div>
              <dt className="text-sm font-semibold">Property tax rate</dt>
              <dd className="mt-1 font-display text-2xl font-semibold tabular-nums">
                {entry.taxRate.toFixed(2)}%
              </dd>
              <dd className="mt-1 text-sm leading-relaxed text-ink-muted">
                Levied by {entry.taxingUnits.join(", ")}.
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold">Homeowners insurance</dt>
              <dd className="mt-1 font-display text-2xl font-semibold tabular-nums">
                {entry.insuranceRate.toFixed(2)}%
              </dd>
              <dd className="mt-1 text-sm leading-relaxed text-ink-muted">
                {entry.insuranceNote}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold">Community fees</dt>
              <dd className="mt-2">
                <ul className="space-y-1.5 text-sm">
                  {districtRows.map((item) => (
                    <li key={item.label} className="flex justify-between gap-4">
                      <span className="text-ink-muted">{item.label}</span>
                      <span className="text-right font-semibold">
                        {item.value}
                      </span>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-ink-faint">
        Estimates, not quotes. Rates are adopted fresh every autumn and a
        homestead exemption changes the bill.{" "}
        <a
          className="inline-flex items-center gap-1 font-semibold text-brand-blue"
          href={entry.verify.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {entry.verify.label}
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>{" "}
        publishes the rate for a specific address.
      </p>
    </section>
  );
}
