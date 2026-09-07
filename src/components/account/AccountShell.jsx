import { NavLink } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Seo from "@/components/app/Seo";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const tabs = [
  { to: "/saved", label: "Saved Homes" },
  { to: "/account/searches", label: "Saved Searches" },
  { to: "/account/questions", label: "Your Questions" },
  { to: "/account", label: "Profile", end: true },
];

export default function AccountShell({ title, children }) {
  const { isAgent } = useAuth();

  return (
    <div className="page-shell py-14">
      <Seo title={title} noindex />
      {/* The agent has an account here like anyone else, and these four tabs
          are the whole of it -- none of them leads to the side of the site he
          actually works in. */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl font-semibold">{title}</h1>
        {isAgent ? (
          <Button to="/admin" variant="outline" size="sm">
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
            Dashboard
          </Button>
        ) : null}
      </div>
      <nav
        aria-label="Your Account"
        className="mt-8 border-b border-surface-line"
      >
        <ul className="-mb-px flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <li key={tab.to}>
              <NavLink
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  cn(
                    "inline-block whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition-colors duration-fast ease-out",
                    isActive
                      ? "border-brand-red text-brand-red"
                      : "border-transparent text-ink-muted hover:text-ink",
                  )
                }
              >
                {tab.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-8">{children}</div>
    </div>
  );
}
