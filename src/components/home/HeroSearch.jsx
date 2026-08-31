import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { areas } from "@/data/areas";
import { SEARCH_HINT } from "@/lib/listingFilters";
import Button from "@/components/ui/Button";
import { inputClassesDark } from "@/components/ui/Field";
import { cn } from "@/lib/cn";

const priceCaps = [200000, 300000, 400000, 500000, 750000, 1000000];

const fieldClasses = cn(inputClassesDark, "h-12 px-4");

/**
 * The hero's way into the listings query.
 *
 * Two controls rather than the full filter set: the ten filters live on the
 * listings page behind their own disclosure, and repeating them here turns the
 * first thing a visitor sees into a form to fill in.
 */
export default function HeroSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [max, setMax] = useState("");

  function onSubmit(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (max) params.set("max", max);
    navigate(`/listings${params.size ? `?${params}` : ""}`);
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <label className="sm:flex-1">
          <span className="sr-only">Search Listings</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={SEARCH_HINT}
            className={fieldClasses}
          />
        </label>
        <label className="sm:w-44">
          <span className="sr-only">Maximum Price</span>
          <select
            value={max}
            onChange={(event) => setMax(event.target.value)}
            className={`${fieldClasses} bg-brand-blue-deep`}
          >
            <option value="">Any Price</option>
            {priceCaps.map((cap) => (
              <option key={cap} value={cap}>
                Up to ${cap.toLocaleString("en-US")}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit" size="lg" className="sm:w-auto">
          <Search className="h-4 w-4" aria-hidden="true" />
          Search Homes
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
          Or Start in
        </span>
        {areas.map((area) => (
          <Link
            key={area.slug}
            to={`/listings?city=${encodeURIComponent(area.name)}`}
            className="inline-flex min-h-11 items-center rounded-full border border-white/20 px-4 text-xs font-semibold text-white/80 transition-colors duration-fast ease-out hover:border-white/60 hover:text-white"
          >
            {area.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
