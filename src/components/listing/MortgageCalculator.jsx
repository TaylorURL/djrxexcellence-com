import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { price } from "@/lib/format";
import { estimateMonthlyCost } from "@/lib/mortgage";
import { rateSurvey } from "@/data/carryingCosts";
import { costsBySlug } from "@/lib/carryingCost";
import { areaByCity } from "@/data/areas";
import { inputClasses } from "@/components/ui/Field";

/**
 * A starting figure for a field the listing does not carry.
 *
 * Left empty, taxes and insurance count as zero and the payment comes out
 * hundreds of dollars under what the house actually costs to hold. The town's
 * own rate is a closer opening figure than nothing, and the caller is told
 * which figures were filled in this way.
 */
function estimateFromArea(entry, listingPrice, rateKey) {
  if (!entry || !(listingPrice > 0)) return "";
  return Math.round(listingPrice * (entry[rateKey] / 100));
}

export default function MortgageCalculator({ listing }) {
  const area = areaByCity(listing.city);
  const entry = area ? costsBySlug(area.slug) : null;
  const listingPrice = listing.price ?? 0;

  const taxEstimate = estimateFromArea(entry, listingPrice, "taxRate");
  const insuranceEstimate = estimateFromArea(
    entry,
    listingPrice,
    "insuranceRate",
  );

  const [homePrice, setHomePrice] = useState(listingPrice);
  const [downPercent, setDownPercent] = useState(20);
  const [rate, setRate] = useState(rateSurvey.thirtyYearFixed);
  const [years, setYears] = useState(30);
  const [taxes, setTaxes] = useState(listing.taxes_annual ?? taxEstimate);
  const [insurance, setInsurance] = useState(insuranceEstimate);

  const hoaMonthly = listing.hoa_fee ? Number(listing.hoa_fee) / 12 : 0;

  const result = useMemo(
    () =>
      estimateMonthlyCost({
        homePrice,
        downPercent,
        rate,
        years,
        annualTaxes: taxes,
        annualInsurance: insurance,
        monthlyHoa: hoaMonthly,
      }),
    [homePrice, downPercent, rate, years, taxes, insurance, hoaMonthly],
  );

  const lines = [
    ["Principal and Interest", result.principalAndInterest],
    ["Property Taxes", result.taxes],
    ["Homeowners Insurance", result.insurance],
    ...(hoaMonthly > 0 ? [["HOA Dues", result.hoa]] : []),
  ];

  return (
    <section
      aria-labelledby="mortgage-heading"
      className="rounded-2xl border border-surface-line bg-surface-raised p-6"
    >
      <h2 id="mortgage-heading" className="font-display text-2xl font-semibold">
        Monthly Payment
      </h2>
      <p className="mt-2 text-sm text-ink-muted">
        An estimate, not a quote. A lender sets the rate and the escrow figures
        after they pull credit and the county sets the tax bill.
      </p>
      {area && entry ? (
        <p className="mt-2 text-sm text-ink-muted">
          Taxes and insurance open at the {area.name} rates of{" "}
          {entry.taxRate.toFixed(2)}% and {entry.insuranceRate.toFixed(2)}% of
          the price.{" "}
          <Link
            className="font-semibold text-brand-red"
            to={`/areas/${area.slug}#carrying-cost`}
          >
            What ownership costs in {area.name}
          </Link>
        </p>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-sm font-semibold">Home Price</span>
          <input
            type="number"
            min="0"
            step="1000"
            value={homePrice}
            onChange={(event) => setHomePrice(event.target.value)}
            className={inputClasses}
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-semibold">Down Payment (%)</span>
          <input
            type="number"
            min="0"
            max="100"
            step="0.5"
            value={downPercent}
            onChange={(event) => setDownPercent(event.target.value)}
            className={inputClasses}
          />
          <span className="block text-xs text-ink-muted">
            {price(result.down)} down, {price(result.loan)} financed
          </span>
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-semibold">Interest Rate (%)</span>
          <input
            type="number"
            min="0"
            max="20"
            step="0.125"
            value={rate}
            onChange={(event) => setRate(event.target.value)}
            className={inputClasses}
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-semibold">Loan Term (Years)</span>
          <select
            value={years}
            onChange={(event) => setYears(event.target.value)}
            className={inputClasses}
          >
            {[30, 20, 15, 10].map((term) => (
              <option key={term} value={term}>
                {term} Years
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-semibold">Annual Property Taxes</span>
          <input
            type="number"
            min="0"
            step="100"
            value={taxes}
            onChange={(event) => setTaxes(event.target.value)}
            placeholder={
              entry
                ? `About ${price(taxEstimate)} here`
                : "From the county appraisal district"
            }
            className={inputClasses}
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-semibold">Annual Insurance</span>
          <input
            type="number"
            min="0"
            step="100"
            value={insurance}
            onChange={(event) => setInsurance(event.target.value)}
            placeholder={
              entry
                ? `About ${price(insuranceEstimate)} here`
                : "From your insurance quote"
            }
            className={inputClasses}
          />
        </label>
      </div>

      <dl className="mt-6 space-y-2 border-t border-surface-line pt-5 text-sm">
        {lines.map(([label, value]) => (
          <div key={label} className="flex justify-between">
            <dt className="text-ink-muted">{label}</dt>
            <dd className="font-semibold tabular-nums">
              {price(Math.round(value))}
            </dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between border-t border-surface-line pt-3">
          <dt className="font-semibold">Estimated Monthly Payment</dt>
          <dd className="font-display text-2xl font-semibold tabular-nums">
            {price(Math.round(result.total))}
          </dd>
        </div>
      </dl>
    </section>
  );
}
