import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Music2, Youtube } from "lucide-react";
import {
  agent,
  agentLicense,
  brokerage,
  market,
  phoneLines,
  socialLinks,
} from "@/config/site";
import SplitRail from "@taylorurl/split-rail";
import BrandLockup from "@/components/ui/BrandLockup";
import ThemeControl from "@/components/ui/ThemeControl";
import { currentYear } from "../../lib/format";

const explore = [
  { to: "/listings", label: "Listings" },
  { to: "/areas", label: "Areas Served" },
  { to: "/about", label: "About Dylan" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
];

const legal = [
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms of Use" },
  { to: "/accessibility", label: "Accessibility" },
  { to: "/fair-housing", label: "Fair Housing" },
];

const notices = [
  {
    href: "https://www.trec.texas.gov/forms/consumer-protection-notice",
    label: "TREC Consumer Protection Notice",
  },
  {
    href: "https://www.trec.texas.gov/forms/information-about-brokerage-services",
    label: "Information About Brokerage Services",
  },
];

const icons = {
  facebook: { Icon: Facebook, label: "Facebook" },
  instagram: { Icon: Instagram, label: "Instagram" },
  youtube: { Icon: Youtube, label: "YouTube" },
  tiktok: { Icon: Music2, label: "TikTok" },
  linkedin: { Icon: Linkedin, label: "LinkedIn" },
};

const footLink =
  "inline-flex min-h-11 min-w-11 items-center justify-center text-ink-muted transition-colors duration-fast ease-out hover:text-ink";

/**
 * The site footer.
 *
 * It closes on a sentence rather than a directory, because the four things a
 * link index would list are already reachable from the bar and the panel above
 * it. What is only here is the small print a licensed brokerage owes
 * every visitor, and that reads better under one line than beside three columns
 * competing with it.
 *
 * It carries no top margin. Every page ends on a section with its own padding,
 * so a margin here rendered as a band of page ground between that section and
 * the footer, which reads as a stray gap wherever the section above is dark.
 */
export default function Footer() {
  return (
    <footer className="border-t border-surface-line bg-surface-raised text-ink">
      <div className="page-shell py-16">
        <p className="max-w-[26ch] font-display text-3xl font-semibold leading-[1.05] tracking-tight sm:text-4xl lg:text-5xl">
          Eight towns, one agent who has driven all of them.
        </p>

        <div className="mt-12">
          <div className="flex flex-wrap items-start justify-between gap-x-10 gap-y-8 border-t border-surface-line pt-8">
            <div className="space-y-2">
              <BrandLockup width={131} height={36} className="h-8" />
              <p className="font-display text-lg font-semibold">{agent.name}</p>
              <address className="text-sm not-italic leading-relaxed text-ink-muted">
                {brokerage.street}
                <br />
                {brokerage.city}, {brokerage.state} {brokerage.zip}
              </address>
              <ul className="text-sm text-ink-muted">
                {phoneLines.map((line) => (
                  <li key={line.key}>
                    <span className="text-ink-faint">{line.label} </span>
                    <a className={footLink} href={`tel:${line.number}`}>
                      {line.number}
                    </a>
                  </li>
                ))}
              </ul>
              {agentLicense ? (
                <p className="text-sm text-ink-faint">
                  TREC License {agentLicense}
                </p>
              ) : null}
            </div>

            <nav
              aria-label="Explore"
              className="flex flex-wrap gap-x-6 text-sm font-semibold"
            >
              {explore.map((link) => (
                <Link key={link.to} className={footLink} to={link.to}>
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex flex-wrap items-center gap-3">
              {socialLinks.map(({ key, url }) => {
                const entry = icons[key];
                if (!entry) return null;
                const { Icon, label } = entry;
                return (
                  <a
                    key={key}
                    href={url}
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-surface-line text-ink transition-colors duration-fast ease-out hover:bg-brand-red hover:text-on-accent"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                );
              })}
              <ThemeControl />
            </div>
          </div>

          <div className="mt-8 space-y-3 pt-8 text-xs leading-relaxed text-ink-faint">
            <nav
              aria-label="Legal"
              className="flex flex-wrap gap-x-5 font-semibold"
            >
              {legal.map((link) => (
                <Link key={link.to} className={footLink} to={link.to}>
                  {link.label}
                </Link>
              ))}
              {notices.map((notice) => (
                <a
                  key={notice.href}
                  className={footLink}
                  href={notice.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {notice.label}
                </a>
              ))}
            </nav>
            <p>
              {brokerage.disclaimer} Serving {market.county} and the towns
              around it. Listing data is deemed reliable but not guaranteed and
              should be independently verified. Equal Housing Opportunity.
            </p>
            <p>
              © {currentYear()} {agent.name}
            </p>
          </div>
        </div>
      </div>
      <div className="pt-6">
        <SplitRail version={__BUILD_VERSION__} />
      </div>
    </footer>
  );
}
