import { SlidersHorizontal, X } from "lucide-react";
import { areas } from "@/data/areas";
import { PROPERTY_TYPE_LABELS, STATUS_LABELS } from "@/lib/listingStatus";
import {
  SEARCH_HINT,
  SORT_OPTIONS,
  activeFilterCount,
} from "@/lib/listingFilters";
import { inputClasses } from "@/components/ui/Field";
import { cn } from "@/lib/cn";

const fields = [
  { key: "min", label: "Min Price", type: "number", placeholder: "Min price" },
  { key: "max", label: "Max Price", type: "number", placeholder: "Max price" },
  {
    key: "beds",
    label: "Minimum Bedrooms",
    type: "number",
    placeholder: "Beds",
  },
  {
    key: "baths",
    label: "Minimum Bathrooms",
    type: "number",
    placeholder: "Baths",
  },
  {
    key: "sqft",
    label: "Minimum Square Feet",
    type: "number",
    placeholder: "Sq ft",
  },
  {
    key: "acres",
    label: "Minimum Acres",
    type: "number",
    placeholder: "Acres",
  },
];

export default function FilterBar({
  params,
  onChange,
  onClear,
  expanded,
  onToggle,
  showAdvanced = true,
}) {
  const count = activeFilterCount(params);

  return (
    <div className="rounded-2xl border border-surface-line bg-surface-raised p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="lg:col-span-2">
          <span className="sr-only">Search Listings</span>
          <input
            value={params.get("q") ?? ""}
            onChange={(event) => onChange("q", event.target.value)}
            placeholder={SEARCH_HINT}
            className={inputClasses}
          />
        </label>
        <label>
          <span className="sr-only">Area</span>
          <select
            value={params.get("city") ?? ""}
            onChange={(event) => onChange("city", event.target.value)}
            className={inputClasses}
          >
            <option value="">Any Area</option>
            {areas.map((area) => (
              <option key={area.slug} value={area.name}>
                {area.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Sort Order</span>
          <select
            value={params.get("sort") ?? "newest"}
            onChange={(event) => onChange("sort", event.target.value)}
            className={inputClasses}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {expanded && showAdvanced ? (
        <div className="mt-3 grid gap-3 border-t border-surface-line pt-3 sm:grid-cols-2 lg:grid-cols-4">
          <label>
            <span className="sr-only">Property Type</span>
            <select
              value={params.get("type") ?? ""}
              onChange={(event) => onChange("type", event.target.value)}
              className={inputClasses}
            >
              <option value="">Any Type</option>
              {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Listing Status</span>
            <select
              value={params.get("status") ?? ""}
              onChange={(event) => onChange("status", event.target.value)}
              className={inputClasses}
            >
              <option value="">Any Status</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          {fields.map((field) => (
            <label key={field.key}>
              <span className="sr-only">{field.label}</span>
              <input
                type={field.type}
                min="0"
                value={params.get(field.key) ?? ""}
                onChange={(event) => onChange(field.key, event.target.value)}
                placeholder={field.placeholder}
                className={inputClasses}
              />
            </label>
          ))}
        </div>
      ) : null}

      {/* Both controls in this row are conditional, and the divider above them
          is not, so with neither showing the card ended in an empty ruled
          band. */}
      <div
        className={cn(
          "mt-3 flex flex-wrap items-center gap-3 border-t border-surface-line pt-3",
          showAdvanced || count > 0 ? null : "hidden",
        )}
      >
        {showAdvanced ? (
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            {expanded ? "Fewer Filters" : "More Filters"}
          </button>
        ) : null}
        {count > 0 ? (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-brand-red"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Clear {count} {count === 1 ? "Filter" : "Filters"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
