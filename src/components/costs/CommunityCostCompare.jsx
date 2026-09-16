import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { duesRange, price } from "@/lib/format";
import {
  compareCommunities,
  costSpread,
  costViews,
  viewByKey,
} from "@/lib/carryingCost";
import { insuranceBenchmark, prevalenceLabel } from "@/data/carryingCosts";
import CostInputs from "@/components/costs/CostInputs";
import { useCostInputs } from "@/hooks/useCostInputs";
import CostBar, { CostLegend } from "@/components/costs/CostBar";
import { cn } from "@/lib/cn";

/**
 * Every town costed at one price, so the towns can be compared rather than the
 * houses.
 *
 * The chart is a table with a bar drawn in each row. A table is what the data
 * is and it survives being read aloud, neither of which is true of a canvas.
 * The bars are drawn from the same figures the cells print, so a reader who
 * cannot see them loses nothing but the comparison at a glance.
 */
/* A header row that scrolls away leaves every column unlabelled by the second
   screen, so both heads stick to the top of their own scroll container on their
   own opaque ground. */
const headCell = "sticky top-0 z-10 bg-surface pb-3 pr-4 font-semibold";
const gridHeadCell =
  "sticky top-0 z-10 bg-surface-sunken px-4 py-3 font-semibold";

export default function CommunityCostCompare() {
  const inputs = useCostInputs();
  const [viewKey, setViewKey] = useState(costViews[0].key);
  const view = viewByKey(viewKey);

  const rows = useMemo(
    () => compareCommunities(inputs.values, view.total),
    [inputs.values, view.total],
  );
  const scale = rows.length > 0 ? rows[rows.length - 1][view.total] : 0;
  const spread = costSpread(rows, view.total);

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
        What the same price costs in each town
      </h2>
      <p className="mt-3 max-w-measure leading-relaxed text-ink-muted">
        The price is only the part a lender finances. Taxes, insurance and
        district fees are set by the town, and they move the monthly number.
      </p>

      <div className="mt-8 rounded-2xl border border-surface-line bg-surface-raised p-6 lg:p-8">
        <CostInputs {...inputs} />

        <div
          role="group"
          aria-label="What the bars measure"
          className="mt-6 inline-flex rounded-xl border border-surface-line bg-surface p-1"
        >
          {costViews.map((option) => (
            <button
              key={option.key}
              type="button"
              aria-pressed={option.key === viewKey}
              onClick={() => setViewKey(option.key)}
              className={
                option.key === viewKey
                  ? "rounded-lg bg-brand-blue-deep px-4 py-2 text-sm font-semibold text-white"
                  : "rounded-lg px-4 py-2 text-sm font-semibold text-ink-muted hover:text-ink"
              }
            >
              {option.label}
            </button>
          ))}
        </div>

        {spread ? (
          <p className="mt-4 rounded-xl border border-surface-line bg-surface p-4 text-sm leading-relaxed">
            At {price(Number(inputs.values.homePrice))}, a house in{" "}
            <span className="font-semibold">{spread.dearest.name}</span> carries
            about{" "}
            <span className="font-semibold text-brand-red">
              {price(Math.round(spread.monthly))} more a month
            </span>{" "}
            than the same price in{" "}
            <span className="font-semibold">{spread.cheapest.name}</span>. Over
            a year that is {price(Math.round(spread.annual))}.
          </p>
        ) : null}

        <CostLegend
          className="mt-6 flex flex-wrap gap-x-6 gap-y-2"
          segments={view.segments}
        />

        <div className="mt-6">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">
              {view.key === "town"
                ? "Estimated monthly taxes, insurance and district fees by town"
                : "Estimated total monthly cost of ownership by town"}{" "}
              at {price(Number(inputs.values.homePrice))}, cheapest first
            </caption>
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.14em] text-ink-faint">
                <th scope="col" className={headCell}>
                  Town
                </th>
                <th scope="col" className={headCell}>
                  {view.label}
                </th>
                <th
                  scope="col"
                  className={cn(headCell, "hidden sm:table-cell")}
                >
                  Tax Rate
                </th>
                <th scope="col" className={cn(headCell, "pr-0 text-right")}>
                  Per Month
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.slug}
                  className="group border-t border-surface-line align-middle [&>*]:transition-colors [&>*]:duration-fast [&>*]:ease-out hover:[&>*]:bg-surface-raised group-hover:[&>*]:bg-surface-raised"
                >
                  <th
                    scope="row"
                    className="py-3 pr-3 text-left font-semibold text-ink sm:pr-4"
                  >
                    <Link
                      className="hover:text-brand-red"
                      to={`/areas/${row.slug}`}
                    >
                      {row.name}
                    </Link>
                    <span className="hidden text-xs font-normal text-ink-muted sm:block">
                      {row.schoolDistrict}
                    </span>
                  </th>
                  <td className="w-1/2 min-w-[5rem] py-3 pr-3 sm:pr-4">
                    <CostBar row={row} scale={scale} view={view} />
                  </td>
                  <td className="hidden py-3 pr-4 tabular-nums text-ink-muted sm:table-cell">
                    {row.entry.taxRate.toFixed(2)}%
                  </td>
                  <td className="py-3 text-right font-semibold tabular-nums">
                    {price(Math.round(row[view.total]))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-surface-line">
        <table className="w-full min-w-[44rem] border-collapse text-sm">
          <caption className="sr-only">
            Tax rate, insurance rate and district fees by town
          </caption>
          <thead className="text-left text-xs uppercase tracking-[0.14em] text-ink-faint">
            <tr>
              <th scope="col" className={gridHeadCell}>
                Town
              </th>
              <th scope="col" className={gridHeadCell}>
                Tax Rate
              </th>
              <th scope="col" className={gridHeadCell}>
                Insurance
              </th>
              <th scope="col" className={gridHeadCell}>
                MUD
              </th>
              <th scope="col" className={gridHeadCell}>
                PID
              </th>
              <th scope="col" className={gridHeadCell}>
                HOA Dues
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.slug}
                className="border-t border-surface-line [&>*]:transition-colors [&>*]:duration-fast [&>*]:ease-out hover:[&>*]:bg-surface-raised"
              >
                <th scope="row" className="px-4 py-3 text-left font-semibold">
                  <Link
                    className="hover:text-brand-red"
                    to={`/areas/${row.slug}`}
                  >
                    {row.name}
                  </Link>
                </th>
                <td className="px-4 py-3 tabular-nums">
                  {row.entry.taxRate.toFixed(2)}%
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {row.entry.insuranceRate.toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-ink-muted">
                  {prevalenceLabel[row.entry.mud]}
                </td>
                <td className="px-4 py-3 text-ink-muted">
                  {prevalenceLabel[row.entry.pid]}
                </td>
                <td className="px-4 py-3 text-ink-muted">
                  {duesRange(row.entry.hoa)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 space-y-2 text-xs leading-relaxed text-ink-faint">
        <p>
          Estimates, not quotes. A tax rate is what a homesteaded house works
          out to as a share of its price.
        </p>
        <p>
          Each county, city, school district and utility district adopts its own
          rate fresh every autumn.
        </p>
        <p>
          Insurance is scaled from a statewide average of{" "}
          {price(insuranceBenchmark.annualPremium)} a year on{" "}
          {price(insuranceBenchmark.dwellingCoverage)} of dwelling coverage.
        </p>
        <p>
          The appraisal district sets the real rate for a real address and a
          carrier sets the real premium. Ask for both before an offer.
        </p>
      </div>
    </section>
  );
}
