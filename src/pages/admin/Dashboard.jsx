import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Plus } from "lucide-react";
import {
  deleteListing,
  fetchAllListingsForAgent,
  setListingPublished,
} from "@/services/listings";
import { price, relativeDate } from "@/lib/format";
import { statusLabel } from "@/lib/listingStatus";
import PageFallback from "@/components/app/PageFallback";
import AdminShell from "@/components/admin/AdminShell";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const scopes = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
];

export default function Dashboard() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAllListingsForAgent()
      .then(setListings)
      .catch((caught) => setError(caught.message))
      .finally(() => setLoading(false));
  }, []);

  const shown = useMemo(() => {
    if (scope === "published")
      return listings.filter((listing) => listing.published_at);
    if (scope === "draft")
      return listings.filter((listing) => !listing.published_at);
    return listings;
  }, [listings, scope]);

  const draftCount = listings.filter((listing) => !listing.published_at).length;

  async function togglePublished(listing) {
    setError("");
    try {
      const updated = await setListingPublished(
        listing.id,
        !listing.published_at,
      );
      setListings((rows) =>
        rows.map((row) =>
          row.id === listing.id
            ? { ...row, published_at: updated.published_at }
            : row,
        ),
      );
    } catch (caught) {
      setError(caught.message);
    }
  }

  async function onDelete(listing) {
    const confirmed = window.confirm(
      `Delete ${listing.street_address}? This removes the listing, its photos and its comments.`,
    );
    if (!confirmed) return;
    try {
      await deleteListing(listing.id);
      setListings((rows) => rows.filter((row) => row.id !== listing.id));
    } catch (caught) {
      setError(caught.message);
    }
  }

  if (loading) return <PageFallback />;

  return (
    <AdminShell
      title="Listings"
      counts={{ Listings: draftCount }}
      headerAction={
        <Button to="/admin/listings/new">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add a Listing
        </Button>
      }
    >
      {error ? (
        <p className="mb-4 rounded-xl border border-brand-red/30 bg-brand-red/5 p-3 text-sm font-medium text-brand-red">
          {error}
        </p>
      ) : null}

      <div
        role="group"
        aria-label="Listing Scope"
        className="mb-6 inline-flex rounded-xl border border-surface-line bg-surface p-1"
      >
        {scopes.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setScope(option.value)}
            aria-pressed={scope === option.value}
            className={cn(
              "h-9 rounded-lg px-3.5 text-sm font-semibold transition-colors duration-fast ease-out",
              scope === option.value
                ? "bg-brand-blue text-white"
                : "text-ink-muted hover:text-ink",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="rounded-2xl border border-surface-line bg-surface-raised p-8">
          <p className="text-ink-muted">
            Nothing here yet. A new listing starts as a draft and stays off the
            public site until it is published.
          </p>
          <Button to="/admin/listings/new" className="mt-5">
            Add a Listing
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-surface-line">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead className="bg-surface-raised text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Address
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Price
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Photos
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Updated
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Visibility
                </th>
                <th scope="col" className="px-4 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-line">
              {shown.map((listing) => (
                <tr key={listing.id}>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{listing.street_address}</p>
                    <p className="text-xs text-ink-muted">
                      {listing.city}, {listing.state} {listing.zip}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {statusLabel(listing.status)}
                  </td>
                  <td className="px-4 py-3">{price(listing.price)}</td>
                  <td className="px-4 py-3 text-ink-muted">
                    {listing.listing_images?.length ?? 0}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {relativeDate(listing.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => togglePublished(listing)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold",
                        listing.published_at
                          ? "bg-brand-blue/10 text-brand-blue"
                          : "bg-surface-sunken text-ink-muted",
                      )}
                    >
                      {listing.published_at ? (
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      {listing.published_at ? "Published" : "Draft"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {listing.published_at ? (
                      <Link
                        className="font-semibold text-ink-muted hover:text-ink"
                        to={`/listings/${listing.slug}`}
                      >
                        View
                      </Link>
                    ) : null}
                    <Link
                      className="ml-4 font-semibold text-brand-blue"
                      to={`/admin/listings/${listing.id}`}
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(listing)}
                      className="ml-4 font-semibold text-ink-faint hover:text-brand-red"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
