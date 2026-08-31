import { price } from "@/lib/format";
import { rateSurvey } from "@/data/carryingCosts";
import { inputClasses } from "@/components/ui/Field";

const districtLevels = [
  { value: "none", label: "None" },
  { value: "typical", label: "Typical For The Town" },
  { value: "high", label: "New Subdivision" },
];

export default function CostInputs({
  values,
  setHomePrice,
  setDownPercent,
  setRate,
  setDistricts,
}) {
  const down = (Number(values.homePrice) * Number(values.downPercent)) / 100;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <label className="space-y-1.5">
        <span className="text-sm font-semibold">Home Price</span>
        <input
          type="number"
          min="0"
          step="5000"
          value={values.homePrice}
          onChange={(event) => setHomePrice(event.target.value)}
          className={inputClasses}
        />
        <span className="block text-xs text-ink-muted">
          {price(Math.round(down))} down
        </span>
      </label>

      <label className="space-y-1.5">
        <span className="text-sm font-semibold">Down Payment (%)</span>
        <input
          type="number"
          min="0"
          max="100"
          step="0.5"
          value={values.downPercent}
          onChange={(event) => setDownPercent(event.target.value)}
          className={inputClasses}
        />
      </label>

      <label className="space-y-1.5">
        <span className="text-sm font-semibold">Interest Rate (%)</span>
        <input
          type="number"
          min="0"
          max="20"
          step="0.125"
          value={values.rate}
          onChange={(event) => setRate(event.target.value)}
          className={inputClasses}
        />
        <span className="block text-xs text-ink-muted">
          {rateSurvey.source} averaged {rateSurvey.thirtyYearFixed}% on{" "}
          {rateSurvey.asOf}
        </span>
      </label>

      <label className="space-y-1.5">
        <span className="text-sm font-semibold">District Fees</span>
        <select
          value={values.districts}
          onChange={(event) => setDistricts(event.target.value)}
          className={inputClasses}
        >
          {districtLevels.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
        <span className="block text-xs text-ink-muted">
          MUD, PID and HOA charges carried by the lot
        </span>
      </label>
    </div>
  );
}
