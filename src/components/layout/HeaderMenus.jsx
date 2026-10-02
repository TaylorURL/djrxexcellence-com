import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { areas } from "@/data/areas";
import Art from "@/components/Art";

const buySearches = [
  { to: "/listings", label: "All Listings" },
  { to: "/listings?type=single_family", label: "Single Family Homes" },
  { to: "/listings?type=land", label: "Land and Acreage" },
  { to: "/listings?type=farm_ranch", label: "Farm and Ranch" },
  { to: "/listings?max=300000", label: "Under $300,000" },
];

const buyShortlist = [
  { to: "/saved", label: "Saved Homes" },
  { to: "/compare", label: "Compare Homes" },
  { to: "/account/searches", label: "Saved Searches" },
];

const sellLinks = [
  { to: "/#valuation", label: "What Your Home Is Worth" },
  { to: "/contact", label: "Talk to Dylan" },
  { to: "/faq", label: "Common Questions" },
];

function MenuColumn({ title, children }) {
  return (
    <div className="p-6">
      <p className="px-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-ink-faint">
        {title}
      </p>
      <ul className="mt-2 space-y-0.5">{children}</ul>
    </div>
  );
}

function MenuLink({ to, label }) {
  return (
    <li>
      <Link
        to={to}
        className="block rounded-lg px-2.5 py-2 text-sm font-semibold text-ink transition-colors duration-fast ease-out hover:bg-surface-raised hover:text-brand-red"
      >
        {label}
      </Link>
    </li>
  );
}

/**
 * The illustrated end of a panel. The art is imagery for the panel rather than
 * a symbol standing for any one entry, so it carries no label of its own.
 */
function MenuFeature({ art, title, body, to, action }) {
  return (
    <div className="flex items-center gap-6 bg-surface-raised p-6">
      <Art
        src={`/art/${art}.svg`}
        width={120}
        height={120}
        loading="lazy"
        className="hidden h-20 w-auto shrink-0 object-contain xl:block"
      />
      <div>
        <p className="font-display text-lg font-semibold leading-snug">
          {title}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{body}</p>
        <Link
          to={to}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-red"
        >
          {action}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

export function BuyPanel() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.2fr]">
      <MenuColumn title="Search">
        {buySearches.map((link) => (
          <MenuLink key={link.to} {...link} />
        ))}
      </MenuColumn>
      <MenuColumn title="Your Shortlist">
        {buyShortlist.map((link) => (
          <MenuLink key={link.to} {...link} />
        ))}
      </MenuColumn>
      <MenuFeature
        art="house"
        title="Every home on the market"
        body="Map view, ten filters, and a search you can save and run again in one click."
        to="/listings"
        action="Browse Listings"
      />
    </div>
  );
}

export function SellPanel() {
  return (
    <div className="grid lg:grid-cols-[1fr_1.4fr]">
      <MenuColumn title="Selling">
        {sellLinks.map((link) => (
          <MenuLink key={link.to} {...link} />
        ))}
      </MenuColumn>
      <MenuFeature
        art="checklist"
        title="Find out what yours would sell for"
        body="What has closed nearby, and the repairs that move the number either direction."
        to="/#valuation"
        action="Get a Valuation"
      />
    </div>
  );
}

export function AreasPanel() {
  return (
    <div className="grid lg:grid-cols-[1fr_1fr_1.2fr]">
      <div className="p-6 lg:col-span-2">
        <p className="px-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-ink-faint">
          Towns Served
        </p>
        <ul className="mt-2 grid grid-cols-2 gap-x-4 md:grid-cols-4">
          {areas.map((area) => (
            <li key={area.slug}>
              <Link
                to={`/areas/${area.slug}`}
                className="block rounded-lg px-2.5 py-1.5 transition-colors duration-fast ease-out hover:bg-surface-raised"
              >
                <span className="block text-sm font-semibold text-ink">
                  {area.name}
                </span>
                <span className="block text-xs text-ink-faint">
                  {area.schoolDistrict}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <MenuFeature
        art="map"
        title="Not one market, eight"
        body="School districts, flood maps and price patterns differ street to street out here."
        to="/areas"
        action="Compare Areas"
      />
    </div>
  );
}
