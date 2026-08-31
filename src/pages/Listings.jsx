import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { LayoutGrid, Map as MapIcon } from "lucide-react";
import { isConfigured } from "@/lib/supabase";
import { fetchListingsPage, PAGE_SIZE } from "@/services/listings";
import { activeFilterCount, paramsToFilters } from "@/lib/listingFilters";
import { breadcrumbSchema } from "@/lib/schema";
import { agent, contactPhone, market } from "@/config/site";
import Seo from "@/components/Seo";
import ListingCard from "@/components/listing/ListingCard";
import LazyMap from "@/components/listing/LazyMap";
import FilterBar from "@/components/listing/FilterBar";
import SavedSearchBar from "@/components/listing/SavedSearchBar";
import CompareTray from "@/components/listing/CompareTray";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const views = [
  { value: "grid", label: "Grid", Icon: LayoutGrid },
  { value: "map", label: "Map", Icon: MapIcon },
];

function CardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="h-[26rem] animate-pulse rounded-2xl bg-surface-sunken"
    />
  );
}

/* The first request does not know how many homes match, so its placeholder is
   the shape of the region rather than a count of cards: three card outlines are
   a claim about the result set made before the result set exists, and whatever
   arrives is measured against them. Once a page is on screen the next one's
   size is known, and RowSkeleton below draws exactly that many. */
function RegionSkeleton() {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Loading listings</span>
      <div
        aria-hidden="true"
        className="min-h-[26rem] w-full animate-pulse rounded-2xl bg-surface-sunken"
      />
    </div>
  );
}

function RowSkeleton({ count }) {
  return (
    <div
      role="status"
      aria-busy="true"
      className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      <span className="sr-only">Loading more listings</span>
      {Array.from({ length: count }, (_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
}

export default function Listings() {
  const [params, setParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState("grid");
  const [expanded, setExpanded] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const sentinelRef = useRef(null);

  const filters = useMemo(() => paramsToFilters(params), [params]);
  const sort = params.get("sort") ?? "newest";

  useEffect(() => {
    let cancelled = false;
    if (!isConfigured) {
      setLoading(false);
      setError("Listings load once the database connection is configured.");
      return undefined;
    }
    setLoading(true);
    setPage(0);
    fetchListingsPage(filters, { page: 0, sort })
      .then(({ rows, total: count }) => {
        if (cancelled) return;
        setListings(rows);
        setTotal(count);
        setError("");
      })
      .catch((caught) => {
        if (!cancelled) setError(caught.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filters, sort]);

  const hasMore = listings.length < total;

  const loadMore = useCallback(() => {
    if (loadingMore || loading || !hasMore) return;
    setLoadingMore(true);
    const next = page + 1;
    fetchListingsPage(filters, { page: next, sort })
      .then(({ rows }) => {
        setListings((current) => {
          const seen = new Set(current.map((row) => row.id));
          return [...current, ...rows.filter((row) => !seen.has(row.id))];
        });
        setPage(next);
      })
      .catch((caught) => setError(caught.message))
      .finally(() => setLoadingMore(false));
  }, [filters, sort, page, hasMore, loading, loadingMore]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || view !== "grid") return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore, hasMore, view]);

  function update(name, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(name, value);
    else next.delete(name);
    setParams(next, { replace: true });
  }

  function clearFilters() {
    const next = new URLSearchParams();
    const current = params.get("sort");
    if (current) next.set("sort", current);
    setParams(next, { replace: true });
  }

  const heading = filters.city
    ? `Homes for sale in ${filters.city}, ${market.primary.split(", ")[1] ?? "Texas"}`
    : "Homes for sale in Dayton and Liberty County";

  // A search that returned nothing and a site with nothing on it read the same
  // to the code and completely differently to a visitor, so the count, the
  // empty state and the filter rig all branch on whether anything was asked.
  const narrowed = activeFilterCount(params) > 0;
  const hasResults = listings.length > 0;

  return (
    <div className="page-shell py-14">
      <Seo
        title={
          filters.city ? `Homes for Sale in ${filters.city}, TX` : "Listings"
        }
        description="Search every active listing across Dayton, Liberty, Cleveland, Hardin, Crosby, Huffman, Mont Belvieu and Baytown, with map view, saved searches and side by side comparison."
        schema={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Listings", path: "/listings" },
        ])}
      />

      <h1 className="font-display text-4xl font-semibold">{heading}</h1>
      <p className="mt-3 text-ink-muted">
        {loading
          ? "Loading listings"
          : total === 0 && !narrowed
            ? "No homes are listed through this site right now"
            : `${total} ${total === 1 ? "home" : "homes"} matching your search`}
      </p>

      <div className="mt-8 space-y-4">
        <FilterBar
          params={params}
          onChange={update}
          onClear={clearFilters}
          expanded={expanded}
          onToggle={() => setExpanded((value) => !value)}
          showAdvanced={loading || hasResults || narrowed}
        />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <SavedSearchBar
            params={params}
            onApply={(next) => setParams(next, { replace: true })}
          />
          <div
            role="group"
            aria-label="Listing View"
            className={cn(
              "flex rounded-xl border border-surface-line bg-surface p-1",
              // The map branch only renders with rows to plot, so offering the
              // switch over an empty result is a button that visibly does
              // nothing.
              loading || hasResults ? null : "hidden",
            )}
          >
            {views.map(({ value, label, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setView(value)}
                aria-pressed={view === value}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition-colors duration-fast ease-out",
                  view === value
                    ? "bg-brand-blue text-white"
                    : "text-ink-muted hover:text-ink",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* The results region keeps one row's height whatever is in it, so the
          placeholder, the empty state, the failure and the first row of cards
          all occupy the same box and nothing below them moves as the request
          lands. The placeholder is one row rather than a full page of cards:
          six card-shaped boxes are a claim about how many results there are,
          made before the count is known. */}
      <div className="mt-10 min-h-[26rem]">
        {loading ? <RegionSkeleton /> : null}

        {!loading && error ? (
          <p className="enter flex min-h-[26rem] items-center rounded-2xl border border-surface-line bg-surface-raised p-8 text-sm text-ink-muted">
            {error}
          </p>
        ) : null}

        {!loading && !error && !hasResults ? (
          <div className="enter flex min-h-[26rem] flex-col items-start justify-center rounded-2xl border border-surface-line bg-surface-raised p-8">
            {narrowed ? (
              <>
                <p className="max-w-measure text-ink-muted">
                  Nothing matches those filters right now. Widen the price range
                  or clear the search to see everything available.
                </p>
                <Button onClick={clearFilters} className="mt-5">
                  Clear Filters
                </Button>
              </>
            ) : (
              <>
                <p className="max-w-measure text-ink-muted">
                  Nothing is on the market through this site today. Plenty sells
                  in {market.county} before it reaches a listing page, so tell{" "}
                  {agent.name.split(" ")[0]} what you are looking for and he
                  will call when something fits.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button to="/contact">Tell Him What You Want</Button>
                  <Button href={`tel:${contactPhone}`} variant="outline">
                    Call {contactPhone}
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : null}

        {!loading && hasResults ? (
          view === "map" ? (
            <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
              <LazyMap
                listings={listings}
                activeId={activeId}
                onSelect={(listing) => setActiveId(listing.id)}
                className="h-[34rem] lg:h-[44rem]"
              />
              <ul className="max-h-[44rem] space-y-4 overflow-y-auto lg:pr-1">
                {listings.map((listing) => (
                  <li
                    key={listing.id}
                    onMouseEnter={() => setActiveId(listing.id)}
                    onMouseLeave={() => setActiveId(null)}
                  >
                    <ListingCard listing={listing} />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {listings.map((listing, index) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    index={index}
                    eager={index < 3}
                  />
                ))}
              </div>
              <div ref={sentinelRef} aria-hidden="true" className="h-px" />
              {hasMore ? (
                <div className="mt-10 flex justify-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={loadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore
                      ? "Loading"
                      : `Show ${Math.min(PAGE_SIZE, total - listings.length)} More`}
                  </Button>
                </div>
              ) : null}
            </>
          )
        ) : null}
      </div>

      <CompareTray />
    </div>
  );
}
