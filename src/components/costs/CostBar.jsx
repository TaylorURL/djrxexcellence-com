import { price } from "@/lib/format";
import { costSegments, costViews } from "@/lib/carryingCost";

/** Written out rather than interpolated, so Tailwind's scanner sees them. */
const fills = {
  loan: "bg-cost-loan",
  taxes: "bg-cost-taxes",
  insurance: "bg-cost-insurance",
  districts: "bg-cost-districts",
};

/**
 * One town's monthly payment as a stacked bar.
 *
 * `scale` is the largest total on the chart rather than this row's own, so
 * every bar on a page is measured against the same axis and two rows can be
 * compared by length. The bar is decoration over a figure that is also printed
 * beside it, so it carries no label of its own for a screen reader to repeat.
 */
export default function CostBar({ row, scale, view = costViews[0] }) {
  const total = row[view.total];
  const width = scale > 0 ? (total / scale) * 100 : 0;

  return (
    <div
      className="h-6 w-full overflow-hidden rounded-md bg-surface-sunken"
      aria-hidden="true"
    >
      <div className="flex h-full" style={{ width: `${width}%` }}>
        {view.segments.map((segment) => {
          const value = row[segment.key];
          if (!(value > 0)) return null;
          return (
            <span
              key={segment.key}
              className={fills[segment.tone]}
              style={{ width: `${(value / total) * 100}%` }}
            />
          );
        })}
      </div>
    </div>
  );
}

export function CostLegend({ className, segments = costSegments }) {
  return (
    <ul className={className}>
      {segments.map((segment) => (
        <li key={segment.key} className="flex items-center gap-2 text-sm">
          <span
            className={`h-3 w-3 shrink-0 rounded-md ${fills[segment.tone]}`}
            aria-hidden="true"
          />
          <span className="text-ink-muted">{segment.label}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * The same four parts as a list of figures, for one town on its own.
 *
 * A single bar cannot be compared against anything, so where only one town is
 * in view the segments are worth more as numbers than as widths.
 */
export function CostLines({ row }) {
  return (
    <dl className="space-y-2 text-sm">
      {costSegments.map((segment) => {
        const value = row[segment.key];
        if (!(value > 0)) return null;
        return (
          <div key={segment.key} className="flex items-center justify-between">
            <dt className="flex items-center gap-2 text-ink-muted">
              <span
                className={`h-3 w-3 shrink-0 rounded-md ${fills[segment.tone]}`}
                aria-hidden="true"
              />
              {segment.label}
            </dt>
            <dd className="font-semibold tabular-nums">
              {price(Math.round(value))}
            </dd>
          </div>
        );
      })}
      <div className="flex items-baseline justify-between border-t border-surface-line pt-3">
        <dt className="font-semibold">Estimated monthly payment</dt>
        <dd className="font-display text-2xl font-semibold tabular-nums">
          {price(Math.round(row.total))}
        </dd>
      </div>
    </dl>
  );
}
