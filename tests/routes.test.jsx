import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "@/context/AuthProvider";
import { FavoritesProvider } from "@/context/FavoritesProvider";
import { CompareProvider } from "@/context/CompareProvider";
import { ThemeProvider } from "@/context/ThemeProvider";
import App from "@/App";
import { areaMetaFor, metaFor } from "@/config/routeMeta";
import { areas } from "@/data/areas";
import { isConfigured } from "@/lib/supabase";

function mount(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ThemeProvider>
        <AuthProvider>
          <FavoritesProvider>
            <CompareProvider>
              <App />
            </CompareProvider>
          </FavoritesProvider>
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>,
  );
}

const publicRoutes = [
  ["/", "Homes in Dayton and seven towns either side."],
  ["/listings", /Homes for sale in Dayton and Liberty County/],
  ["/areas", /Eight towns, three counties/],
  ["/areas/mont-belvieu", "Mont Belvieu, Texas"],
  ["/about", "Dylan Jordan"],
  ["/contact", "Start the conversation"],
  ["/faq", /Questions buyers and sellers ask first/],
  ["/compare", "Compare Homes"],
  ["/privacy", "Privacy Policy"],
  ["/terms", "Terms of Use"],
  ["/accessibility", "Accessibility Statement"],
  ["/fair-housing", "Fair Housing"],
  ["/sign-in", "Sign In"],
  ["/sign-up", "Create an Account"],
  ["/no-such-page", "That page is not here"],
];

describe("public routes", () => {
  it.each(publicRoutes)("%s renders its heading", async (path, heading) => {
    mount(path);
    expect(
      await screen.findByRole("heading", { level: 1, name: heading }),
    ).toBeInTheDocument();
  });

  it("renders the footer legal links on every page", async () => {
    mount("/");
    await screen.findByRole("heading", { level: 1 });
    expect(screen.getByRole("link", { name: "Fair Housing" })).toHaveAttribute(
      "href",
      "/fair-housing",
    );
    expect(
      screen.getByRole("link", {
        name: "Information About Brokerage Services",
      }),
    ).toBeInTheDocument();
  });

  it("keeps unresolved config tokens off the page", async () => {
    mount("/contact");
    await screen.findByRole("heading", { level: 1 });
    expect(document.body.textContent).not.toMatch(
      /AGENT_EMAIL|AGENT_CELL|TREC_LICENSE_NUMBER|SOCIAL_[A-Z]+_URL/,
    );
  });

  it("sends a signed out visitor from a member route to sign in", async () => {
    mount("/saved");
    expect(
      await screen.findByRole("heading", { level: 1, name: "Sign In" }),
    ).toBeInTheDocument();
  });

  it("sends a signed out visitor from the dashboard to sign in", async () => {
    mount("/admin");
    expect(
      await screen.findByRole("heading", { level: 1, name: "Sign In" }),
    ).toBeInTheDocument();
  });
});

describe.skipIf(isConfigured)("with no database configured", () => {
  it("says listings are not connected rather than failing", async () => {
    mount("/listings");
    expect(
      await screen.findByText(
        /Listings load once the database connection is configured/,
      ),
    ).toBeInTheDocument();
  });
});

describe.skipIf(!isConfigured)("with a database configured", () => {
  // Inventory comes and goes, so these assert that the page resolves against
  // the project rather than that the project is holding rows. A listings page
  // with nothing on it is a correct page, and a test that fails on it is
  // testing the database.
  it("resolves the listings page against the project", async () => {
    mount("/listings");
    // The count line settles whichever way the query goes, so waiting on it
    // costs one round trip rather than the full timeout of a query for cards
    // that an empty project is never going to render.
    await screen.findByText(
      /matching your search|No homes are listed/,
      {},
      { timeout: 8000 },
    );
    const cards = screen.queryAllByRole("article");
    if (cards.length === 0) {
      expect(
        screen.getByText(/Nothing is on the market through this site/),
      ).toBeInTheDocument();
      return;
    }
    expect(
      screen.getAllByRole("button", { name: "Save This Home" }).length,
    ).toBeGreaterThan(0);
  }, 15000);

  it("resolves the home page against the project", async () => {
    mount("/");
    expect(
      await screen.findByRole("heading", { level: 1 }, { timeout: 8000 }),
    ).toBeInTheDocument();
  });
});

/**
 * A crawler reads the description the build wrote and never runs the bundle,
 * so a page whose `Seo` call composes its own sentence can disagree with the
 * table `scripts/prerender.js` writes from, and nothing in the built HTML
 * shows it. These mount each route and read the head the bundle actually set.
 */
describe("the description a visitor's head ends up with", () => {
  const headDescription = () =>
    document.head.querySelector('meta[name="description"]')?.content;

  it("matches the table the prerender writes from, on /areas", async () => {
    mount("/areas");
    await screen.findByRole("heading", { level: 1 });
    expect(headDescription()).toBe(metaFor("/areas").description);
  });

  it.each(areas.map((area) => [area.slug]))(
    "matches what the prerender writes for /areas/%s",
    async (slug) => {
      const area = areas.find((entry) => entry.slug === slug);
      mount(`/areas/${slug}`);
      await screen.findByRole("heading", { level: 1 });
      expect(headDescription()).toBe(areaMetaFor(area).description);
    },
  );
});
