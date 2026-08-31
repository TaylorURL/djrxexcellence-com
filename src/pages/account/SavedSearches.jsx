import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import {
  deleteSavedSearch,
  fetchSavedSearches,
} from "@/services/savedSearches";
import { describeFilters, recordToParams } from "@/lib/listingFilters";
import { relativeDate } from "@/lib/format";
import PageFallback from "@/components/PageFallback";
import AccountShell from "@/components/account/AccountShell";
import Button from "@/components/ui/Button";

export default function SavedSearches() {
  const { user } = useAuth();
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedSearches(user.id)
      .then(setSearches)
      .catch(() => setSearches([]))
      .finally(() => setLoading(false));
  }, [user.id]);

  async function onDelete(id) {
    await deleteSavedSearch(id);
    setSearches((rows) => rows.filter((row) => row.id !== id));
  }

  if (loading) return <PageFallback />;

  return (
    <AccountShell title="Saved Searches">
      {searches.length === 0 ? (
        <div className="rounded-2xl border border-surface-line bg-surface-raised p-8">
          <p className="text-ink-muted">
            No searches saved yet. Set the filters you care about on the
            listings page and save them there.
          </p>
          <Button to="/listings" className="mt-5">
            Browse Listings
          </Button>
        </div>
      ) : (
        <ul className="space-y-4">
          {searches.map((search) => (
            <li
              key={search.id}
              className="arrive flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-surface-line p-5"
            >
              <div>
                <p className="font-display text-lg font-semibold">
                  {search.label}
                </p>
                <p className="mt-0.5 text-sm text-ink-muted">
                  {describeFilters(search.filters)} · saved{" "}
                  {relativeDate(search.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to={`/listings?${recordToParams(search.filters)}`}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-surface-line px-3 text-sm font-semibold text-brand-blue"
                >
                  <Search className="h-4 w-4" aria-hidden="true" />
                  Run Search
                </Link>
                <button
                  type="button"
                  onClick={() => onDelete(search.id)}
                  aria-label={`Delete ${search.label}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-surface-line text-ink-faint hover:text-brand-red"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AccountShell>
  );
}
