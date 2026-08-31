import { NavLink } from "react-router-dom";
import { cn } from "@/lib/cn";

const tabs = [
  { to: "/admin", label: "Listings", end: true },
  { to: "/admin/leads", label: "Leads" },
  { to: "/admin/comments", label: "Comments" },
  { to: "/admin/testimonials", label: "Testimonials" },
];

export default function AdminNav({ counts = {} }) {
  return (
    <nav aria-label="Dashboard" className="border-b border-surface-line">
      <ul className="-mb-px flex gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <li key={tab.to}>
            <NavLink
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                cn(
                  "inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition-colors duration-fast ease-out",
                  isActive
                    ? "border-brand-red text-brand-red"
                    : "border-transparent text-ink-muted hover:text-ink",
                )
              }
            >
              {tab.label}
              {counts[tab.label] ? (
                <span className="rounded-full bg-brand-red px-1.5 py-0.5 text-xs font-semibold text-on-accent">
                  {counts[tab.label]}
                </span>
              ) : null}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
