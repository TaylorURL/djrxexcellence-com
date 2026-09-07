import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BellRing, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { isConfigured } from "@/lib/supabase";
import {
  createSavedSearch,
  deleteSavedSearch,
  fetchSavedSearches,
} from "@/services/savedSearches";
import {
  describeFilters,
  paramsToRecord,
  recordToParams,
} from "@/lib/listingFilters";
import { inputClasses } from "@/components/ui/Field";
import Button from "@/components/ui/Button";

export default function SavedSearchBar({ params, onApply }) {
  const { user } = useAuth();
  const [searches, setSearches] = useState([]);
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [error, setError] = useState("");
  const record = paramsToRecord(params);

  useEffect(() => {
    if (!isConfigured || !user) {
      setSearches([]);
      return;
    }
    fetchSavedSearches(user.id)
      .then(setSearches)
      .catch(() => setSearches([]));
  }, [user]);

  async function onSave(event) {
    event.preventDefault();
    setError("");
    try {
      const created = await createSavedSearch({
        userId: user.id,
        label: label.trim() || describeFilters(record),
        filters: record,
      });
      setSearches((rows) => [created, ...rows]);
      setLabel("");
      setOpen(false);
    } catch (caught) {
      setError(caught.message);
    }
  }

  async function onDelete(id) {
    await deleteSavedSearch(id);
    setSearches((rows) => rows.filter((row) => row.id !== id));
  }

  if (!user) {
    return (
      <p className="text-sm text-ink-muted">
        <Link className="font-semibold text-brand-blue" to="/sign-in">
          Sign in
        </Link>{" "}
        to save this search and come back to it.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue"
        >
          <BellRing className="h-4 w-4" aria-hidden="true" />
          Save This Search
        </button>
        {searches.length > 0 ? (
          <span className="text-sm text-ink-muted">
            {searches.length} saved
          </span>
        ) : null}
      </div>

      {open ? (
        <form onSubmit={onSave} className="flex flex-wrap gap-2">
          <label className="min-w-0 flex-1">
            <span className="sr-only">Search Name</span>
            <input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder={describeFilters(record)}
              className={inputClasses}
            />
          </label>
          <Button type="submit">Save Search</Button>
        </form>
      ) : null}

      {error ? (
        <p className="text-sm font-medium text-brand-red">{error}</p>
      ) : null}

      {searches.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {searches.map((search) => (
            <li key={search.id}>
              <span className="inline-flex items-center gap-2 rounded-lg border border-surface-line bg-surface px-3 py-1.5 text-sm">
                <button
                  type="button"
                  onClick={() => onApply(recordToParams(search.filters))}
                  className="font-semibold text-ink hover:text-brand-red"
                >
                  {search.label}
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(search.id)}
                  aria-label={`Delete ${search.label}`}
                  className="text-ink-faint hover:text-brand-red"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
