import { useCallback, useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Heart,
  LayoutDashboard,
  MapPin,
  Menu,
  Phone,
  User,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { areas } from "@/data/areas";
import { NavPanel, NavTriggers } from "@/components/layout/NavMenu";
import { agent, brokerage, contactPhone } from "@/config/site";
import BrandLockup from "@/components/ui/BrandLockup";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const flatLinks = [
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const mobileGroups = [
  {
    title: "Buy",
    links: [
      { to: "/listings", label: "All Listings" },
      { to: "/listings?type=land", label: "Land and Acreage" },
      { to: "/saved", label: "Saved Homes" },
      { to: "/compare", label: "Compare Homes" },
    ],
  },
  {
    title: "Sell",
    links: [
      { to: "/#valuation", label: "What Your Home Is Worth" },
      { to: "/faq", label: "Common Questions" },
    ],
  },
  {
    title: "Areas",
    links: [
      { to: "/areas", label: "Areas Served" },
      ...areas.map((area) => ({ to: `/areas/${area.slug}`, label: area.name })),
    ],
  },
];

const officeAddress = `${brokerage.street}, ${brokerage.city}, ${brokerage.state} ${brokerage.zip}`;

/** Named so the hamburger can point at the panel it opens. */
const MOBILE_PANEL_ID = "mobile-nav-panel";

const barLink =
  "inline-flex h-11 items-center gap-1.5 rounded-xl px-2.5 text-sm font-semibold text-ink transition-colors duration-fast ease-out hover:bg-surface-sunken";

/**
 * The site chrome: a status banner over one navigation bar.
 *
 * The banner carries where the office is and what number reaches it, which is
 * the pair a walk-in buyer wants and neither of which belongs among the
 * destinations. It is a banner rather than a second nav for that reason: every
 * account link lives in the bar below, so the top tier is never a row of places
 * to go.
 *
 * Past the first stretch of scroll the banner retracts and the bar docks to the
 * top. That is a CSS scroll timeline rather than a scroll listener, so it costs
 * no main-thread frame, and a browser without one keeps the banner in place.
 * Dismissing it sets `--banner-height` to zero, and every offset on the page is
 * measured from that token, so the chrome and the content close up together.
 */
export default function Header() {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(null);
  const [banner, setBanner] = useState(true);
  const { user, isAgent, signOut } = useAuth();
  const { count } = useFavorites();
  const { pathname } = useLocation();
  const openMenu = useCallback((key) => setMenu(key), []);

  useEffect(() => {
    setMenu(null);
    setOpen(false);
  }, [pathname]);

  /* The thumb rail stands down while the menu is open. Both are pinned to the
     bottom of the same screen, and the rail's two actions are already rows in
     the menu, so leaving it up covers the last of them with a copy of itself. */
  useEffect(() => {
    document.documentElement.dataset.menuOpen = open ? "true" : "false";
  }, [open]);

  const dismissBanner = useCallback(() => {
    setBanner(false);
    document.documentElement.style.setProperty("--banner-height", "0px");
  }, []);

  const navClass = ({ isActive }) =>
    cn(
      "inline-flex h-11 items-center text-sm font-semibold transition-colors duration-fast ease-out",
      isActive ? "text-brand-red" : "text-ink hover:text-brand-red",
    );

  return (
    <div
      className={cn(
        "site-header fixed inset-x-0 top-0 z-chrome",
        banner || "site-header--dismissed",
      )}
      onMouseLeave={() => setMenu(null)}
    >
      {banner ? (
        <aside
          aria-label="Office Details"
          className="announcement-bar on-dark text-white"
        >
          <div className="page-shell flex h-banner items-center gap-4 text-xs font-medium">
            <p className="flex min-w-0 items-center gap-1.5 text-white/75">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{officeAddress}</span>
            </p>
            <a
              href={`tel:${contactPhone}`}
              className="ml-auto inline-flex h-11 shrink-0 items-center gap-1.5 text-white/75 transition-colors duration-fast ease-out hover:text-white"
            >
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              {contactPhone}
            </a>
            <button
              type="button"
              onClick={dismissBanner}
              aria-label="Dismiss Office Details"
              className="-mr-2 inline-flex h-11 w-11 shrink-0 items-center justify-center text-white/60 transition-colors duration-fast ease-out hover:text-white"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </aside>
      ) : null}

      <header className="site-navbar border-b border-surface-line bg-surface">
        <div className="page-shell flex h-header items-center justify-between gap-6">
          <Link to="/" className="flex h-11 items-center gap-3">
            <BrandLockup width={102} height={28} className="h-6 sm:h-7" />
            <span
              aria-hidden="true"
              className="hidden h-7 w-px bg-surface-line sm:block"
            />
            <span className="hidden leading-tight sm:block">
              <span className="block font-display text-base font-semibold">
                {agent.name}
              </span>
              <span className="block text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint">
                {agent.title}
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            <NavTriggers open={menu} onOpen={openMenu} />
            {flatLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={navClass}
                onMouseEnter={() => setMenu(null)}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-1 lg:flex">
            {user ? (
              <>
                <Link to="/saved" className={barLink}>
                  <Heart className="h-4 w-4" aria-hidden="true" />
                  Saved
                  {count > 0 ? (
                    <span className="rounded-full bg-brand-red px-1.5 text-xs font-semibold text-on-accent">
                      {count}
                    </span>
                  ) : null}
                </Link>
                <Link to="/account" className={barLink}>
                  <User className="h-4 w-4" aria-hidden="true" />
                  Account
                </Link>
                <button type="button" onClick={signOut} className={barLink}>
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/sign-in" className={barLink}>
                <User className="h-4 w-4" aria-hidden="true" />
                Sign In
              </Link>
            )}
            {/* The dashboard is where the agent works, so it takes the loud
                action, and Get in Touch stands down for him: he is the person
                that button writes to. */}
            {isAgent ? (
              <Button to="/admin" size="md" variant="navy" className="ml-2">
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                Dashboard
              </Button>
            ) : (
              <Button to="/contact" size="md" className="ml-2">
                Get in Touch
              </Button>
            )}
          </div>

          <button
            type="button"
            className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-xl text-ink transition-colors duration-fast ease-out hover:bg-surface-sunken lg:hidden"
            aria-label={open ? "Close Menu" : "Open Menu"}
            aria-controls={MOBILE_PANEL_ID}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <NavPanel open={menu} />

        {/* The panel is always in the document so the hamburger's aria-controls
            points at something a reader's software can find, closed or open.
            Only one display class is applied at a time: Tailwind emits .hidden
            after .block, so carrying both would hold the panel shut. */}
        <div
          id={MOBILE_PANEL_ID}
          className={cn(
            "mobile-nav-panel overflow-y-auto overscroll-contain border-t border-surface-line bg-surface lg:hidden",
            open || "hidden",
          )}
        >
          <nav className="page-shell flex flex-col gap-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
            {mobileGroups.map((group) => (
              <div key={group.title}>
                <p className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink-faint">
                  {group.title}
                </p>
                <div className="mt-1 flex flex-col">
                  {group.links.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={() => setOpen(false)}
                      className="flex min-h-11 items-center rounded-xl px-2 text-sm font-semibold text-ink hover:bg-surface-sunken"
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex flex-col border-t border-surface-line pt-3">
              {flatLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center rounded-xl px-2 text-sm font-semibold text-ink hover:bg-surface-sunken"
                >
                  {link.label}
                </NavLink>
              ))}
              <a
                href={`tel:${contactPhone}`}
                className="flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-ink hover:bg-surface-sunken"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                {contactPhone}
              </a>
            </div>

            {user ? (
              <div className="flex flex-col border-t border-surface-line pt-3">
                {isAgent ? (
                  <NavLink
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className="flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-brand-blue hover:bg-surface-sunken"
                  >
                    <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                    Dashboard
                  </NavLink>
                ) : null}
                <NavLink
                  to="/account"
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-ink hover:bg-surface-sunken"
                >
                  <User className="h-4 w-4" aria-hidden="true" />
                  Account
                </NavLink>
              </div>
            ) : null}

            <div className="flex gap-2 px-2 pb-2">
              {user ? (
                <Button
                  variant="outline"
                  size="md"
                  className="flex-1"
                  onClick={() => {
                    signOut();
                    setOpen(false);
                  }}
                >
                  Sign Out
                </Button>
              ) : (
                <Button
                  to="/sign-in"
                  variant="outline"
                  size="md"
                  className="flex-1"
                  onClick={() => setOpen(false)}
                >
                  Sign In
                </Button>
              )}
              {/* Same reason the bar drops it: the agent is who this button
                  writes to, and the dashboard is listed above. */}
              {isAgent ? null : (
                <Button
                  to="/contact"
                  size="md"
                  className="flex-1"
                  onClick={() => setOpen(false)}
                >
                  Get in Touch
                </Button>
              )}
            </div>
          </nav>
        </div>
      </header>
    </div>
  );
}
