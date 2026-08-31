import { Link } from "react-router-dom";
import { ExternalLink, GraduationCap, MapPin, Waves } from "lucide-react";
import { areaByCity } from "@/data/areas";

export default function NeighborhoodPanel({ listing }) {
  const area = areaByCity(listing.city);
  const district = listing.school_district ?? area?.schoolDistrict ?? null;
  const mapQuery = encodeURIComponent(
    `${listing.street_address}, ${listing.city}, ${listing.state} ${listing.zip}`,
  );

  const resources = [
    {
      label: "Texas School Report Cards",
      href: "https://txschools.gov",
      Icon: GraduationCap,
      note: district
        ? `Ratings and campus detail for ${district}`
        : "Ratings and campus detail by district",
    },
    {
      label: "FEMA Flood Map",
      href: "https://msc.fema.gov/portal/home",
      Icon: Waves,
      note: "The flood zone for this address, which sets the insurance requirement",
    },
    {
      label: "Street and Satellite View",
      href: `https://www.google.com/maps/search/?api=1&query=${mapQuery}`,
      Icon: MapPin,
      note: "The block, the neighbors, and what backs up to the lot",
    },
  ];

  return (
    <section aria-labelledby="neighborhood-heading">
      <h2
        id="neighborhood-heading"
        className="font-display text-2xl font-semibold"
      >
        Schools and Neighborhood
      </h2>

      <dl className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-surface-line bg-surface-raised p-4">
          <dt className="text-sm text-ink-muted">School District</dt>
          <dd className="mt-1 font-semibold">{district ?? "Ask Dylan"}</dd>
        </div>
        <div className="rounded-xl border border-surface-line bg-surface-raised p-4">
          <dt className="text-sm text-ink-muted">County</dt>
          <dd className="mt-1 font-semibold">
            {area?.county ?? "Liberty County"}
          </dd>
        </div>
        <div className="rounded-xl border border-surface-line bg-surface-raised p-4">
          <dt className="text-sm text-ink-muted">ZIP Code</dt>
          <dd className="mt-1 font-semibold">{listing.zip}</dd>
        </div>
      </dl>

      {area ? (
        <p className="mt-4 leading-relaxed text-ink-muted">
          {area.summary}{" "}
          <Link
            className="font-semibold text-brand-red"
            to={`/areas/${area.slug}`}
          >
            More about {area.name}
          </Link>
        </p>
      ) : null}

      <ul className="mt-6 grid gap-3 sm:grid-cols-3">
        {resources.map(({ label, href, note, Icon }) => (
          <li key={label}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-full flex-col rounded-xl border border-surface-line p-4 transition-colors duration-fast ease-out hover:border-brand-blue/40 hover:bg-surface-raised"
            >
              <span className="flex items-center gap-2 font-semibold">
                <Icon className="h-4 w-4 text-brand-blue" aria-hidden="true" />
                {label}
                <ExternalLink
                  className="h-3.5 w-3.5 text-ink-faint"
                  aria-hidden="true"
                />
              </span>
              <span className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                {note}
              </span>
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs leading-relaxed text-ink-faint">
        School attendance boundaries change and do not always follow the city
        limit. Confirm the assigned campus with the district before it decides
        your offer.
      </p>
    </section>
  );
}
