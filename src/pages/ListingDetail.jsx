import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Bath, BedDouble, CalendarDays, Car, Ruler, Trees } from "lucide-react";
import { agent, brokerage, contactPhone, siteUrl } from "@/config/site";
import { isConfigured } from "@/lib/supabase";
import {
  fetchListingBySlug,
  fetchNearbyListings,
  publicImageUrl,
  sortedImages,
} from "@/services/listings";
import { price, number, address } from "@/lib/format";
import {
  propertyTypeLabel,
  statusLabel,
  statusTone,
} from "@/lib/listingStatus";
import { breadcrumbSchema, listingSchema } from "@/lib/schema";
import { cn } from "@/lib/cn";
import Seo from "@/components/Seo";
import PageFallback from "@/components/PageFallback";
import ListingUnavailable from "@/pages/ListingUnavailable";
import Gallery from "@/components/listing/Gallery";
import LazyMap from "@/components/listing/LazyMap";
import ListingCard from "@/components/listing/ListingCard";
import FavoriteButton from "@/components/listing/FavoriteButton";
import ShareBar from "@/components/listing/ShareBar";
import CommentThread from "@/components/listing/CommentThread";
import MortgageCalculator from "@/components/listing/MortgageCalculator";
import NeighborhoodPanel from "@/components/listing/NeighborhoodPanel";
import Button from "@/components/ui/Button";
import LeadForm from "@/components/LeadForm";

export default function ListingDetail() {
  const { slug } = useParams();
  const [listing, setListing] = useState(null);
  const [nearby, setNearby] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setNearby([]);
    fetchListingBySlug(slug)
      .then((found) => {
        setListing(found);
        if (found) {
          fetchNearbyListings(found)
            .then(setNearby)
            .catch(() => setNearby([]));
        }
      })
      .catch(() => setListing(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <PageFallback />;

  if (!listing) return <ListingUnavailable />;

  const images = sortedImages(listing).map((image) => ({
    id: image.id,
    url: publicImageUrl(image.storage_path),
    alt:
      image.alt_text ??
      `${listing.street_address}, ${listing.city}, ${listing.state}`,
  }));

  const fullAddress = address({
    streetAddress: listing.street_address,
    city: listing.city,
    state: listing.state,
    zip: listing.zip,
  });

  const quickFacts = [
    { Icon: BedDouble, label: "Beds", value: number(listing.beds) },
    { Icon: Bath, label: "Baths", value: number(listing.baths) },
    { Icon: Ruler, label: "Sq Ft", value: number(listing.square_feet) },
    {
      Icon: Trees,
      label: "Acres",
      value: listing.lot_size_acres ? Number(listing.lot_size_acres) : "—",
    },
    { Icon: Car, label: "Garage", value: number(listing.garage_spaces) },
    { Icon: CalendarDays, label: "Built", value: listing.year_built ?? "—" },
  ];

  const details = [
    ["Property Type", propertyTypeLabel(listing.property_type)],
    ["Status", statusLabel(listing.status)],
    ["Half Baths", number(listing.half_baths)],
    [
      "Lot Size",
      listing.lot_size_acres ? `${listing.lot_size_acres} acres` : "—",
    ],
    [
      "HOA Fee",
      listing.hoa_fee ? `${price(listing.hoa_fee)} per year` : "None",
    ],
    [
      "Annual Taxes",
      listing.taxes_annual ? price(listing.taxes_annual) : "Ask Dylan",
    ],
    ["School District", listing.school_district ?? "—"],
    ["MLS Number", listing.mls_number ?? "—"],
  ];

  const tourLinks = [
    listing.virtual_tour_url
      ? { href: listing.virtual_tour_url, label: "Virtual Tour" }
      : null,
    listing.video_url ? { href: listing.video_url, label: "Video Tour" } : null,
  ].filter(Boolean);

  return (
    <article className="page-shell py-12">
      <Seo
        title={`${listing.street_address}, ${listing.city} TX`}
        description={
          listing.description?.slice(0, 180) ??
          `${price(listing.price)} in ${listing.city}, Texas. ${number(listing.beds)} bed, ${number(listing.baths)} bath, ${number(listing.square_feet)} square feet.`
        }
        image={images[0]?.url}
        type="article"
        schema={[
          listingSchema(
            listing,
            images.map((image) => image.url),
          ),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Listings", path: "/listings" },
            {
              name: listing.street_address,
              path: `/listings/${listing.slug}`,
            },
          ]),
        ]}
      />

      <nav aria-label="Breadcrumb" className="mb-5 text-sm text-ink-muted">
        <Link className="hover:text-brand-red" to="/listings">
          Listings
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="text-ink">{listing.street_address}</span>
      </nav>

      <Gallery images={images} />

      <div className="mt-10 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-12">
          <header className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span
                  className={cn(
                    "inline-block rounded-lg px-2.5 py-1 text-xs font-semibold",
                    statusTone(listing.status),
                  )}
                >
                  {statusLabel(listing.status)}
                </span>
                <h1 className="mt-3 font-display text-4xl font-semibold">
                  {price(listing.price)}
                </h1>
                <p className="mt-1 text-lg text-ink-muted">{fullAddress}</p>
              </div>
              <FavoriteButton listingId={listing.id} showLabel />
            </div>

            <dl className="grid grid-cols-3 gap-3 border-y border-surface-line py-4 sm:grid-cols-6">
              {quickFacts.map(({ Icon, label, value }) => (
                <div key={label} className="text-center">
                  <Icon
                    className="mx-auto h-5 w-5 text-brand-blue"
                    aria-hidden="true"
                  />
                  <dd className="mt-1.5 font-display text-lg font-semibold">
                    {value}
                  </dd>
                  <dt className="text-xs uppercase tracking-wide text-ink-faint">
                    {label}
                  </dt>
                </div>
              ))}
            </dl>

            <ShareBar
              url={`${siteUrl}/listings/${listing.slug}`}
              title={`${listing.street_address}, ${listing.city} TX — ${price(listing.price)}`}
            />
          </header>

          {listing.description ? (
            <section aria-labelledby="about-heading">
              <h2
                id="about-heading"
                className="font-display text-2xl font-semibold"
              >
                About This Home
              </h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-ink-muted">
                {listing.description}
              </p>
              {tourLinks.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-3">
                  {tourLinks.map((tour) => (
                    <Button
                      key={tour.label}
                      href={tour.href}
                      variant="outline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {tour.label}
                    </Button>
                  ))}
                </div>
              ) : null}
            </section>
          ) : null}

          <section aria-labelledby="details-heading">
            <h2
              id="details-heading"
              className="font-display text-2xl font-semibold"
            >
              Details
            </h2>
            <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {details.map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between gap-4 border-b border-surface-line pb-2 text-sm"
                >
                  <dt className="text-ink-muted">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {listing.features?.length ? (
            <section aria-labelledby="features-heading">
              <h2
                id="features-heading"
                className="font-display text-2xl font-semibold"
              >
                Features
              </h2>
              <ul className="mt-4 grid gap-2 text-sm text-ink-muted sm:grid-cols-2">
                {listing.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span aria-hidden="true" className="text-brand-red">
                      ·
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <MortgageCalculator listing={listing} />

          <NeighborhoodPanel listing={listing} />

          {listing.latitude != null && listing.longitude != null ? (
            <section aria-labelledby="location-heading">
              <h2
                id="location-heading"
                className="font-display text-2xl font-semibold"
              >
                Location
              </h2>
              <LazyMap listings={[listing]} className="mt-4 h-96" />
            </section>
          ) : null}

          <CommentThread listingId={listing.id} />
        </div>

        <aside className="space-y-6 lg:sticky lg:top-[--sticky-top] lg:self-start">
          <div className="rounded-2xl border border-surface-line bg-surface p-6 shadow-card">
            <h2 className="font-display text-xl font-semibold">
              Request a Showing
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              Ask {agent.name.split(" ")[0]} about this address or set up a
              walkthrough.
            </p>
            <div className="mt-5">
              <LeadForm
                kind="showing"
                listingId={listing.id}
                submitLabel="Request a Showing"
                messagePlaceholder="When would you like to see it?"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-surface-line p-6">
            <p className="font-display text-lg font-semibold">{agent.name}</p>
            <p className="mt-1 text-sm text-ink-muted">
              {agent.title}, {brokerage.name}
            </p>
            <Button
              href={`tel:${contactPhone}`}
              variant="outline"
              className="mt-4 w-full"
            >
              Call {contactPhone}
            </Button>
          </div>
        </aside>
      </div>

      {nearby.length > 0 ? (
        <section
          aria-labelledby="nearby-heading"
          className="section-defer mt-20"
        >
          <h2
            id="nearby-heading"
            className="font-display text-3xl font-semibold"
          >
            More in {listing.city}
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {nearby.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
