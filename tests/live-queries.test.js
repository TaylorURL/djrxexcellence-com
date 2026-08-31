import { describe, expect, it } from "vitest";

const configured = Boolean(
  process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY,
);

/**
 * Runs the service layer against whatever project `.env.local` points at, so a
 * column renamed in a migration fails here rather than on the page. Skipped
 * when no project is configured, which is the case in CI.
 */
describe.skipIf(!configured)("service layer against the live project", () => {
  it("pages published listings with a total", async () => {
    const { fetchListingsPage } = await import("@/services/listings");
    const { rows, total } = await fetchListingsPage(
      {},
      { page: 0, pageSize: 3 },
    );

    expect(total).toBeGreaterThanOrEqual(0);
    expect(rows.length).toBeLessThanOrEqual(3);
    rows.forEach((row) => {
      expect(row.slug).toBeTruthy();
      expect(row.published_at).toBeTruthy();
      expect(Array.isArray(row.listing_images)).toBe(true);
    });
  });

  it("applies every filter without a query error", async () => {
    const { fetchListingsPage } = await import("@/services/listings");
    const { rows } = await fetchListingsPage(
      {
        search: "dayton",
        city: "Dayton",
        propertyType: "single_family",
        status: "active",
        minPrice: 100000,
        maxPrice: 900000,
        minBeds: 2,
        minBaths: 1,
        minSqft: 800,
        minAcres: 0.1,
      },
      { page: 0, pageSize: 12, sort: "price_asc" },
    );
    expect(Array.isArray(rows)).toBe(true);
    rows.forEach((row) => {
      expect(row.city).toBe("Dayton");
      expect(Number(row.price)).toBeGreaterThanOrEqual(100000);
    });
  });

  it("sorts by price ascending", async () => {
    const { fetchListingsPage } = await import("@/services/listings");
    const { rows } = await fetchListingsPage(
      {},
      { page: 0, pageSize: 20, sort: "price_asc" },
    );
    const prices = rows.map((row) => Number(row.price));
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it("reads a listing by slug with resolvable photo URLs", async () => {
    const {
      fetchListingsPage,
      fetchListingBySlug,
      sortedImages,
      publicImageUrl,
    } = await import("@/services/listings");
    const { rows } = await fetchListingsPage({}, { page: 0, pageSize: 1 });
    if (!rows.length) return;
    const listing = await fetchListingBySlug(rows[0].slug);

    expect(listing.id).toBe(rows[0].id);
    const images = sortedImages(listing);
    expect(images.map((image) => image.position)).toEqual(
      [...images].map((_, index) => index),
    );
    if (!images.length) return;

    const head = await fetch(publicImageUrl(images[0].storage_path), {
      method: "HEAD",
    });
    expect(head.ok).toBe(true);
    expect(head.headers.get("content-type")).toContain("image");
  });

  it("finds other listings in the same town", async () => {
    const { fetchListingsPage, fetchNearbyListings } =
      await import("@/services/listings");
    const { rows } = await fetchListingsPage(
      { city: "Dayton" },
      { page: 0, pageSize: 1 },
    );
    if (!rows.length) return;
    const nearby = await fetchNearbyListings(rows[0], 5);
    nearby.forEach((row) => {
      expect(row.city).toBe("Dayton");
      expect(row.id).not.toBe(rows[0].id);
    });
  });

  it("reads comments and published testimonials anonymously", async () => {
    const { fetchComments } = await import("@/services/comments");
    const { fetchPublishedTestimonials } =
      await import("@/services/testimonials");
    const { fetchListingsPage } = await import("@/services/listings");

    const { rows } = await fetchListingsPage({}, { page: 0, pageSize: 1 });
    await expect(fetchPublishedTestimonials(3)).resolves.toBeInstanceOf(Array);
    if (!rows.length) return;
    await expect(fetchComments(rows[0].id)).resolves.toBeInstanceOf(Array);
  });

  it("gives every published listing map coordinates", async () => {
    const { fetchListingsPage } = await import("@/services/listings");
    const { rows } = await fetchListingsPage({}, { page: 0, pageSize: 50 });
    const plotted = rows.filter(
      (row) => row.latitude != null && row.longitude != null,
    );
    expect(plotted.length).toBe(rows.length);
  });
});
