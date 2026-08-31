import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

/**
 * The dashboard is the whole of the agent's side of the site, and the only way
 * into it was a link in the utility strip, which the phone layout hides. So an
 * agent on a phone had no route to their own listings that did not involve
 * typing the URL.
 *
 * jsdom applies no stylesheet, and the panel stays in the document whether or
 * not it is open, so its trigger can name it through aria-controls. Both
 * layouts are therefore in the tree at once and every assertion names which one
 * it means.
 */
const auth = { user: null, isAgent: false, signOut: vi.fn(), loading: false };

vi.mock("@/lib/useAuth", () => ({ useAuth: () => auth }));
vi.mock("@/lib/useFavorites", () => ({ useFavorites: () => ({ count: 0 }) }));

const { default: Header } = await import("@/components/layout/Header");
const { default: AccountShell } =
  await import("@/components/account/AccountShell");

function signedOut() {
  Object.assign(auth, { user: null, isAgent: false });
}
function member() {
  Object.assign(auth, { user: { id: "m" }, isAgent: false });
}
function agentUser() {
  Object.assign(auth, { user: { id: "a" }, isAgent: true });
}

function mountHeader() {
  return render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>,
  );
}

const dashboardLinks = () =>
  screen.queryAllByRole("link", { name: /Dashboard/ });

/** The bar's own row, which is neither the strip above it nor the panel under it. */
const bar = (container) =>
  container.querySelector("header.site-navbar > .page-shell");

function openMobilePanel() {
  fireEvent.click(screen.getByRole("button", { name: "Open Menu" }));
  return document.querySelector(".mobile-nav-panel");
}

beforeEach(() => signedOut());

describe("the way an agent reaches the dashboard", () => {
  it("offers a signed out visitor no dashboard at all", () => {
    const { container } = mountHeader();
    expect(dashboardLinks()).toHaveLength(0);
    expect(
      within(bar(container)).getAllByRole("link", { name: "Get in Touch" })
        .length,
    ).toBeGreaterThan(0);
  });

  it("offers a signed in member no dashboard at all", () => {
    member();
    mountHeader();
    expect(dashboardLinks()).toHaveLength(0);
    const panel = openMobilePanel();
    expect(within(panel).queryByRole("link", { name: /Dashboard/ })).toBeNull();
    expect(
      within(panel).getByRole("link", { name: /Account/ }),
    ).toHaveAttribute("href", "/account");
  });

  it("puts the dashboard in the row an agent actually reads", () => {
    agentUser();
    const { container } = mountHeader();
    const row = bar(container);
    expect(
      within(row).getByRole("link", { name: /Dashboard/ }),
    ).toHaveAttribute("href", "/admin");
  });

  it("stands Get in Touch down for the agent, who is the person it writes to", () => {
    agentUser();
    mountHeader();
    expect(screen.queryByRole("link", { name: "Get in Touch" })).toBeNull();
    // Both layouts carry that button and only the desktop one was checked to
    // begin with, which is how the panel kept offering the agent a form that
    // writes to him.
    const panel = openMobilePanel();
    expect(
      within(panel).queryByRole("link", { name: "Get in Touch" }),
    ).toBeNull();
  });

  it("keeps Get in Touch for a signed in member on both layouts", () => {
    member();
    const { container } = mountHeader();
    expect(
      within(bar(container)).getAllByRole("link", { name: "Get in Touch" })
        .length,
    ).toBeGreaterThan(0);
    const panel = openMobilePanel();
    expect(
      within(panel).getByRole("link", { name: "Get in Touch" }),
    ).toBeInTheDocument();
  });

  it("puts the dashboard in the mobile panel, which the strip never reached", () => {
    agentUser();
    mountHeader();
    const panel = openMobilePanel();
    expect(
      within(panel).getByRole("link", { name: /Dashboard/ }),
    ).toHaveAttribute("href", "/admin");
    expect(
      within(panel).getByRole("link", { name: /Account/ }),
    ).toHaveAttribute("href", "/account");
  });

  it("crosses from the account pages to the dashboard for an agent", () => {
    agentUser();
    render(
      <MemoryRouter>
        <AccountShell title="Saved Homes">
          <p>body</p>
        </AccountShell>
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: /Dashboard/ })).toHaveAttribute(
      "href",
      "/admin",
    );
  });

  it("leaves the account pages alone for a member", () => {
    member();
    render(
      <MemoryRouter>
        <AccountShell title="Saved Homes">
          <p>body</p>
        </AccountShell>
      </MemoryRouter>,
    );
    expect(screen.queryByRole("link", { name: /Dashboard/ })).toBeNull();
  });
});
