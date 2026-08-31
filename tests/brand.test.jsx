import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "@/context/AuthProvider";
import { FavoritesProvider } from "@/context/FavoritesProvider";
import Header from "@/components/layout/Header";
import { PANEL_ID } from "@/components/layout/headerNav";
import Hero from "@/components/home/Hero";
import { areas } from "@/data/areas";
import { SEARCH_HINT } from "@/lib/listingFilters";

const root = path.resolve(import.meta.dirname, "..");
const read = (file) => readFileSync(path.join(root, file), "utf8");

function viewBox(svg) {
  const match = svg.match(/viewBox="([\d.\s-]+)"/);
  if (!match) throw new Error("no viewBox");
  const [, , width, height] = match[1].trim().split(/\s+/).map(Number);
  return { width, height };
}

describe("the icon a tab shows", () => {
  // The favicon was the full lockup squeezed into a square, which is legible at
  // the size it was drawn and a smear at the size it is served.
  it("is close enough to square to fill a 16px tile", () => {
    const { width, height } = viewBox(read("public/favicon.svg"));
    expect(width / height).toBeLessThan(1.4);
  });

  it("is the same artwork as the pin the lockup carries", () => {
    expect(read("public/favicon.svg")).toBe(read("public/brand/remax-pin.svg"));
  });

  it("carries no background, so a dark tab strip shows through", () => {
    expect(read("public/favicon.svg")).not.toMatch(
      /<rect[^>]*fill="#(?!fff\b)/,
    );
  });

  it("keeps a reversed lockup for the footer's dark ground", () => {
    expect(read("public/brand/remax-logo-light.svg")).toContain(
      'fill="#ffffff"',
    );
    expect(read("public/brand/remax-logo.svg")).toContain('fill="#000e35"');
  });
});

describe("header menus", () => {
  function mount() {
    render(
      <MemoryRouter>
        <AuthProvider>
          <FavoritesProvider>
            <Header />
          </FavoritesProvider>
        </AuthProvider>
      </MemoryRouter>,
    );
  }

  function open(label) {
    mount();
    const trigger = screen.getByRole("button", { name: new RegExp(label) });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    return document.getElementById(PANEL_ID);
  }

  it("opens the buy panel onto the listing filters", () => {
    const panel = open("Buy");
    expect(
      within(panel).getByRole("link", { name: "All Listings" }),
    ).toHaveAttribute("href", "/listings");
    expect(
      within(panel).getByRole("link", { name: "Land and Acreage" }),
    ).toHaveAttribute("href", "/listings?type=land");
  });

  it("opens the sell panel onto the valuation section", () => {
    const panel = open("Sell");
    expect(
      within(panel).getByRole("link", { name: "What Your Home Is Worth" }),
    ).toHaveAttribute("href", "/#valuation");
  });

  it("lists every town in the areas panel", () => {
    const panel = open("Areas");
    for (const area of areas) {
      expect(
        within(panel).getByRole("link", { name: new RegExp(area.name) }),
      ).toHaveAttribute("href", `/areas/${area.slug}`);
    }
  });

  it("shows one panel at a time", () => {
    mount();
    fireEvent.click(screen.getByRole("button", { name: /Buy/ }));
    fireEvent.click(screen.getByRole("button", { name: /Areas/ }));
    expect(screen.getByRole("button", { name: /Buy/ })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.getByRole("button", { name: /Areas/ })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("closes on Escape", () => {
    mount();
    const trigger = screen.getByRole("button", { name: /Buy/ });
    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  // A panel anchored to its trigger has to be narrow enough that the rightmost
  // one still fits the window. This one spans the shell, so it cannot overflow.
  it("spans the page shell rather than hanging off a trigger", () => {
    const panel = open("Areas");
    expect(panel.className).toContain("inset-x-0");
    expect(panel.querySelector(".page-shell")).not.toBeNull();
  });

  // The art is imagery for the panel, not a symbol standing for a row, so it is
  // hidden from the accessibility tree rather than labelled.
  it("hides the panel artwork from a screen reader", () => {
    const panel = open("Buy");
    for (const image of panel.querySelectorAll("img")) {
      expect(image).toHaveAttribute("aria-hidden", "true");
      expect(image).toHaveAttribute("alt", "");
    }
  });
});

describe("the hero", () => {
  function mount() {
    render(
      <MemoryRouter>
        <Hero />
      </MemoryRouter>,
    );
  }

  // The field is the only thing telling a visitor what it matches on, so the
  // placeholder names each column fetchListings puts the term through.
  it("says what the search field searches", () => {
    mount();
    const field = screen.getByPlaceholderText(SEARCH_HINT);
    expect(field).toBeInTheDocument();
    for (const column of ["address", "city", "zip", "mls"]) {
      expect(SEARCH_HINT.toLowerCase()).toContain(column);
    }
  });

  it("offers one search and one button, not the whole filter set", () => {
    mount();
    expect(screen.getAllByRole("combobox")).toHaveLength(1);
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  it("puts the agent above the fold", () => {
    mount();
    expect(screen.getByAltText(/Dylan Jordan/)).toBeInTheDocument();
  });

  it("offers every town as a way in", () => {
    mount();
    for (const area of areas) {
      expect(screen.getByRole("link", { name: area.name })).toHaveAttribute(
        "href",
        `/listings?city=${encodeURIComponent(area.name)}`,
      );
    }
  });
});

// Tailwind 3 hoists the base block into its base output without emitting a
// native cascade layer, so a selector there that outscores a utility silently
// repaints every field a dark ground styles. :where() holds it at zero.
describe("field styling does not outrank the utilities that override it", () => {
  const css = read("src/index.css");

  it("keeps the field ground and ink at zero specificity", () => {
    expect(css).toMatch(
      /:where\(input:not\(\[type="checkbox"\]\).*\),\s*\n\s*:where\(select\),\s*\n\s*:where\(textarea\)\s*\{/,
    );
  });

  it("keeps the focus ground at zero specificity", () => {
    expect(css).toContain(":where(input, select, textarea):where(:focus)");
  });

  it("leaves no bare element selector setting a field's colours", () => {
    expect(css).not.toMatch(/^\s*input:focus,$/m);
    expect(css).not.toMatch(/^\s*input:not\(\[type="checkbox"\]\)/m);
  });
});

// vh measures the window with the phone's browser bars retracted, so a panel
// bounded by it runs its last rows under the bottom toolbar with no scroll left
// to reach them. dvh follows what is actually on screen, and every browser this
// site is built for has had it since 2022, so it is the only bound the panel
// carries.
describe("the open mobile nav fits the visible screen", () => {
  const css = read("src/index.css");

  it("bounds the panel in dvh", () => {
    expect(css).toContain(
      "max-height: calc(100dvh - var(--banner-height) - var(--header-height))",
    );
  });

  it("bounds it in nothing else", () => {
    const rule = css.match(/\.mobile-nav-panel\s*\{[^}]*\}/s)[0];
    expect(rule.match(/max-height/g)).toHaveLength(1);
  });

  it("scrolls the panel rather than the page behind it", () => {
    expect(css).toMatch(
      /\.mobile-nav-panel\s*\{[^}]*overflow-y:\s*auto[^}]*overscroll-behavior:\s*contain/s,
    );
  });

  it("sets no height of its own at the call site", () => {
    const header = read("src/components/layout/Header.jsx");
    expect(header).toContain("mobile-nav-panel");
    expect(header).not.toMatch(/max-h-|maxHeight/);
  });
});
