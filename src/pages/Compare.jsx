import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { isConfigured } from "@/lib/supabase";
import { fetchListingsByIds, coverImage } from "@/services/listings";
import { useCompare } from "@/hooks/useCompare";
import { price, number, pricePerSquareFoot } from "@/lib/format";
import { propertyTypeLabel, statusLabel } from "@/lib/listingStatus";
import Seo from "@/components/app/Seo";
import PageFallback from "@/components/app/PageFallback";
import Button from "@/components/ui/Button";

const rows = [
  { label: "Price", read: (listing) => price(listing.price) },
  { label: "Status", read: (listing) => statusLabel(listing.status) },
  {
    label: "Property Type",
    read: (listing) => propertyTypeLabel(listing.property_type),
  },
  { label: "Bedrooms", read: (listing) => number(listing.beds) },
  { label: "Bathrooms", read: (listing) => number(listing.baths) },
  { label: "Square Feet", read: (listing) => number(listing.square_feet) },
  {
    label: "Price Per Square Foot",
    read: (listing) => {
      const perSquareFoot = pricePerSquareFoot(listing);
      return perSquareFoot ? `$${perSquareFoot}` : "—";
    },
  },
  {
    label: "Lot Size",
    read: (listing) =>
      listing.lot_size_acres ? `${listing.lot_size_acres} acres` : "—",
  },
  { label: "Year Built", read: (listing) => listing.year_built ?? "—" },
  { label: "Garage Spaces", read: (listing) => number(listing.garage_spaces) },
  {
    label: "HOA Fee",
    read: (listing) => (listing.hoa_fee ? price(listing.hoa_fee) : "None"),
  },
  {
    label: "Annual Taxes",
    read: (listing) =>
      listing.taxes_annual ? price(listing.taxes_annual) : "—",
  },
  {
    label: "School District",
    read: (listing) => listing.school_district ?? "—",
  },
  { label: "MLS Number", read: (listing) => listing.mls_number ?? "—" },
];

export default function Compare() {
  const { ids, remove, clear } = useCompare();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isConfigured || ids.length === 0) {
      setListings([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchListingsByIds(ids)
      .then((rows_) => {
        setListings(
          ids.map((id) => rows_.find((row) => row.id === id)).filter(Boolean),
        );
        // The comparison set is held in localStorage, so it outlives the rows
        // it names. Without this the tray goes on counting listings that were
        // taken down, and it sends the visitor to a page that tells them
        // nothing is selected.
        for (const id of ids) {
          if (!rows_.some((row) => row.id === id)) remove(id);
        }
      })
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [ids, remove]);

  return (
    <div className="page-shell py-14">
      <Seo
        title="Compare Homes"
        description="Put up to four Dayton and Liberty County listings side by side on price, size, lot, taxes and school district."
        noindex
      />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-4xl font-semibold">Compare Homes</h1>
        {listings.length > 0 ? (
          <Button variant="outline" onClick={clear}>
            Clear All
          </Button>
        ) : null}
      </div>

      {loading ? <PageFallback /> : null}

      {!loading && listings.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-surface-line bg-surface-raised p-8">
          <p className="text-ink-muted">
            Nothing selected yet. The scales icon on any listing adds it here,
            up to four at a time.
          </p>
          <Button to="/listings" className="mt-5">
            Browse Listings
          </Button>
        </div>
      ) : null}

      {!loading && listings.length > 0 ? (
        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
            <caption className="sr-only">
              Selected homes compared on price, size and cost of ownership
            </caption>
            <thead>
              <tr>
                <th scope="col" className="w-40 p-3" />
                {listings.map((listing) => {
                  const cover = coverImage(listing);
                  return (
                    <th key={listing.id} scope="col" className="p-3 align-top">
                      <div className="space-y-3">
                        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-sunken">
                          {cover ? (
                            <img
                              src={cover}
                              alt={`${listing.street_address}, ${listing.city}`}
                              loading="lazy"
                              width={480}
                              height={360}
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                          <button
                            type="button"
                            onClick={() => remove(listing.id)}
                            aria-label={`Remove ${listing.street_address}`}
                            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-surface/90 text-ink shadow-card hover:text-brand-red"
                          >
                            <X className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                        <Link
                          to={`/listings/${listing.slug}`}
                          className="block font-semibold text-ink hover:text-brand-red"
                        >
                          {listing.street_address}
                        </Link>
                        <p className="text-xs font-normal text-ink-muted">
                          {listing.city}, {listing.state} {listing.zip}
                        </p>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-line border-t border-surface-line">
              {rows.map((row) => (
                <tr key={row.label}>
                  <th
                    scope="row"
                    className="p-3 align-top font-semibold text-ink-muted"
                  >
                    {row.label}
                  </th>
                  {listings.map((listing) => (
                    <td
                      key={listing.id}
                      className="p-3 align-top font-semibold"
                    >
                      {row.read(listing)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
