import { Link } from "react-router-dom";
import { Bath, BedDouble, Ruler } from "lucide-react";
import { price, number, pricePerSquareFoot } from "@/lib/format";
import { statusLabel, statusTone } from "@/lib/listingStatus";
import { coverImage } from "@/services/listings";
import { cn } from "@/lib/cn";
import FavoriteButton from "@/components/listing/FavoriteButton";
import CompareButton from "@/components/listing/CompareButton";

export default function ListingCard({ listing, eager = false, index = 0 }) {
  const cover = coverImage(listing);
  const perSquareFoot = pricePerSquareFoot(listing);

  return (
    <article
      style={{ animationDelay: `${Math.min(index, 5) * 45}ms` }}
      className="enter group relative flex flex-col overflow-hidden rounded-2xl border border-surface-line bg-surface shadow-card transition-shadow duration-base ease-out hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-sunken">
        {cover ? (
          <img
            src={cover}
            alt={`${listing.street_address}, ${listing.city}`}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            width={640}
            height={480}
            className="h-full w-full object-cover transition-transform duration-slow ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink-faint">
            No photos yet
          </div>
        )}
        <span
          className={cn(
            "absolute left-3 top-3 rounded-lg px-2.5 py-1 text-xs font-semibold",
            statusTone(listing.status),
          )}
        >
          {statusLabel(listing.status)}
        </span>
        <div className="absolute right-3 top-3 flex gap-2">
          <CompareButton listingId={listing.id} />
          <FavoriteButton listingId={listing.id} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-display text-2xl font-semibold">
            {price(listing.price)}
          </p>
          {perSquareFoot ? (
            <p className="text-xs text-ink-faint">${perSquareFoot}/sq ft</p>
          ) : null}
        </div>
        <div>
          <Link
            to={`/listings/${listing.slug}`}
            className="font-semibold text-ink after:absolute after:inset-0"
          >
            {listing.street_address}
          </Link>
          <p className="text-sm text-ink-muted">
            {listing.city}, {listing.state} {listing.zip}
          </p>
        </div>
        <dl className="mt-auto flex items-center gap-4 border-t border-surface-line pt-3 text-sm text-ink-muted">
          <div className="flex items-center gap-1.5">
            <BedDouble className="h-4 w-4" aria-hidden="true" />
            <dt className="sr-only">Bedrooms</dt>
            <dd>{number(listing.beds)}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="h-4 w-4" aria-hidden="true" />
            <dt className="sr-only">Bathrooms</dt>
            <dd>{number(listing.baths)}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Ruler className="h-4 w-4" aria-hidden="true" />
            <dt className="sr-only">Square Feet</dt>
            <dd>{number(listing.square_feet)}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
