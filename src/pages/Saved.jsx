import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { useFavorites } from "@/lib/useFavorites";
import { fetchFavoriteListings } from "@/services/favorites";
import ListingCard from "@/components/listing/ListingCard";
import PageFallback from "@/components/PageFallback";
import AccountShell from "@/components/account/AccountShell";
import CompareTray from "@/components/listing/CompareTray";
import Button from "@/components/ui/Button";

export default function Saved() {
  const { user } = useAuth();
  const { ids } = useFavorites();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavoriteListings(user.id)
      .then(setListings)
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [user.id]);

  const shown = listings.filter((listing) => ids.has(listing.id));

  return (
    <AccountShell title="Saved Homes">
      {loading ? <PageFallback /> : null}

      {!loading && shown.length === 0 ? (
        <div className="rounded-2xl border border-surface-line bg-surface-raised p-8">
          <p className="text-ink-muted">
            Nothing saved yet. The heart on any listing keeps it here.
          </p>
          <Button to="/listings" className="mt-5">
            Browse Listings
          </Button>
        </div>
      ) : null}

      {!loading && shown.length > 0 ? (
        <>
          <p className="mb-6 text-sm text-ink-muted">
            {shown.length} {shown.length === 1 ? "home" : "homes"} saved
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </>
      ) : null}

      <CompareTray />
    </AccountShell>
  );
}
