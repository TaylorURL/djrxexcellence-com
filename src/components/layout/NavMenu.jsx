import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { PANEL_ID, menus } from "@/components/layout/headerNav";

/**
 * The nav row, and the panel the open menu fills.
 *
 * One panel spans the page shell rather than hanging off whichever trigger
 * opened it. A panel anchored to its trigger has to be narrow enough that the
 * rightmost one still fits the window, which is a width no mega menu can live
 * inside; spanning the shell cannot overflow at any width.
 *
 * `open` and `onOpen` live in the header because the bar and the panel are
 * siblings: the header wraps both in the hover region, so travelling from a
 * trigger down into the panel never leaves it.
 */
export function NavTriggers({ open, onOpen }) {
  const { pathname } = useLocation();
  const triggerRefs = useRef({});

  useEffect(() => {
    if (!open) return undefined;

    function onKeyDown(event) {
      if (event.key !== "Escape") return;
      onOpen(null);
      triggerRefs.current[open]?.focus();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onOpen]);

  return menus.map(({ key, label, matchPath }) => {
    const active = matchPath ? pathname.startsWith(matchPath) : false;
    const isOpen = open === key;

    return (
      <button
        key={key}
        ref={(node) => {
          triggerRefs.current[key] = node;
        }}
        type="button"
        aria-expanded={isOpen}
        aria-controls={PANEL_ID}
        onMouseEnter={() => onOpen(key)}
        onClick={() => onOpen(isOpen ? null : key)}
        className={cn(
          "inline-flex h-11 items-center gap-1 text-sm font-semibold transition-colors duration-fast ease-out",
          active || isOpen ? "text-brand-red" : "text-ink hover:text-brand-red",
        )}
      >
        {label}
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-fast ease-out",
            isOpen && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>
    );
  });
}

export function NavPanel({ open }) {
  const entry = menus.find((menu) => menu.key === open);

  return (
    <div
      id={PANEL_ID}
      // The hidden attribute and a responsive display utility have the same
      // specificity, so the utility would win and hold a closed panel open.
      // Both states are classes instead.
      className={cn(
        "absolute inset-x-0 top-full z-panel",
        entry ? "hidden lg:block" : "hidden",
      )}
    >
      <div className="page-shell pt-2">
        <div className="overflow-hidden rounded-2xl border border-surface-line bg-surface shadow-lift">
          {entry ? <entry.Panel /> : null}
        </div>
      </div>
    </div>
  );
}
