import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, GraduationCap, MapPin } from "lucide-react";
import { areaBySlug } from "@/data/areas";
import { areaMetaFor } from "@/config/routeMeta";
import { isConfigured } from "@/lib/supabase";
import { fetchListings } from "@/services/listings";
import { breadcrumbSchema } from "@/lib/schema";
import Seo from "@/components/app/Seo";
import ListingCard from "@/components/listing/ListingCard";
import CommunityCostPanel from "@/components/costs/CommunityCostPanel";
import LazyMap from "@/components/listing/LazyMap";
import Button from "@/components/ui/Button";
import LeadForm from "@/components/LeadForm";
import NotFound from "@/pages/NotFound";

export default function AreaDetail() {
  const { slug } = useParams();
  const area = areaBySlug(slug);
  const [listings, setListings] = useState([]);

  useEffect(() => {
    if (!isConfigured || !area) return;
    fetchListings({ city: area.name, limit: 6 })
      .then(setListings)
      .catch(() => setListings([]));
  }, [area]);

  if (!area) return <NotFound />;

  const meta = areaMetaFor(area);
  const sectionHeading =
    listings.length > 0
      ? `Homes for sale in ${area.name}`
      : `Looking in ${area.name}?`;

  return (
    <div className="page-shell py-16">
      <Seo
        title={meta.title}
        description={meta.description}
        schema={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Areas", path: "/areas" },
          { name: area.name, path: `/areas/${area.slug}` },
        ])}
      />

      <nav aria-label="Breadcrumb" className="text-sm text-ink-muted">
        <Link className="hover:text-brand-red" to="/areas">
          Areas
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="text-ink">{area.name}</span>
      </nav>

      <h1 className="mt-4 font-display text-4xl font-semibold">
        {area.name}, Texas
      </h1>
      <p className="mt-4 max-w-measure text-lg leading-relaxed text-ink-muted">
        {area.summary}
      </p>

      <dl className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-surface-line bg-surface-raised p-5">
          <dt className="flex items-center gap-2 text-sm text-ink-muted">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            County
          </dt>
          <dd className="mt-1 font-semibold">{area.county}</dd>
        </div>
        <div className="rounded-2xl border border-surface-line bg-surface-raised p-5">
          <dt className="flex items-center gap-2 text-sm text-ink-muted">
            <GraduationCap className="h-4 w-4" aria-hidden="true" />
            School District
          </dt>
          <dd className="mt-1 font-semibold">{area.schoolDistrict}</dd>
        </div>
        <div className="rounded-2xl border border-surface-line bg-surface-raised p-5">
          <dt className="text-sm text-ink-muted">ZIP Codes</dt>
          <dd className="mt-1 font-semibold">{area.zips.join(", ")}</dd>
        </div>
      </dl>

      <div className="mt-14 grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-2xl font-semibold">
            What the area is like
          </h2>
          <ul className="mt-4 space-y-3">
            {area.highlights.map((item) => (
              <li key={item} className="flex gap-3 text-ink-muted">
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-brand-red"
                  aria-hidden="true"
                />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="font-display text-2xl font-semibold">
            What to check before you offer
          </h2>
          <ul className="mt-4 space-y-3">
            {area.lookFor.map((item) => (
              <li key={item} className="flex gap-3 text-ink-muted">
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-brand-blue"
                  aria-hidden="true"
                />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="section-defer mt-16">
        <CommunityCostPanel area={area} />
      </div>

      <section className="mt-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-3xl font-semibold">
            {sectionHeading}
          </h2>
          {listings.length > 0 ? (
            <Button
              to={`/listings?city=${encodeURIComponent(area.name)}`}
              variant="outline"
            >
              See All {area.name} Listings
            </Button>
          ) : null}
        </div>

        {listings.length > 0 ? (
          <>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
            <LazyMap listings={listings} className="mt-8 h-[26rem]" />
          </>
        ) : (
          <p className="mt-6 max-w-measure rounded-2xl border border-surface-line bg-surface-raised p-6 text-ink-muted">
            Nothing is listed in {area.name} here right now. New listings go up
            here first, and Dylan can send what is on the wider market.
          </p>
        )}
      </section>

      <div className="mt-16 grid gap-10 rounded-2xl border border-surface-line bg-surface p-8 shadow-card lg:grid-cols-2 lg:p-12">
        <div className="space-y-4">
          <h2 className="font-display text-3xl font-semibold">
            Ask about {area.name}
          </h2>
          <p className="leading-relaxed text-ink-muted">
            School zoning for an address, flood history on a street, what a lot
            like yours is worth.
          </p>
        </div>
        <LeadForm
          kind="area"
          submitLabel="Send Message"
          messagePlaceholder={`What do you want to know about ${area.name}?`}
        />
      </div>
    </div>
  );
}
