import Button from "@/components/ui/Button";
import Seo from "@/components/Seo";

export default function NotFound() {
  return (
    <div className="page-shell py-28 text-center">
      <Seo
        title="Page Not Found"
        description="This page is not here. Everything currently for sale is on the listings page."
        noindex
      />
      <p className="eyebrow">404</p>
      <h1 className="mt-3 font-display text-4xl font-semibold">
        That page is not here
      </h1>
      <p className="mx-auto mt-3 max-w-md text-ink-muted">
        The link may be out of date. Everything currently for sale is on the
        listings page.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Button to="/listings">Browse Listings</Button>
        <Button to="/" variant="outline">
          Go Home
        </Button>
      </div>
    </div>
  );
}
