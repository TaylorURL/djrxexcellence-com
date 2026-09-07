import Seo from "@/components/app/Seo";
import Button from "@/components/ui/Button";

export default function ListingUnavailable() {
  return (
    <div className="page-shell py-24">
      <Seo title="Listing Not Available" noindex />
      <h1 className="font-display text-4xl font-semibold">
        This listing is not available
      </h1>
      <p className="mt-3 max-w-lg text-ink-muted">
        It may have sold or been taken off the market. Everything currently for
        sale is on the listings page.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button to="/listings">Browse Listings</Button>
        <Button to="/contact" variant="outline">
          Ask About It
        </Button>
      </div>
    </div>
  );
}
