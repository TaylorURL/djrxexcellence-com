import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import RequireAuth from "@/components/app/RequireAuth";
import ScrollToTop from "@/components/app/ScrollToTop";
import PageFallback from "@/components/app/PageFallback";
import PageError from "@/components/app/PageError";
import { routes } from "@/config/routes";
import Home from "@/pages/Home";

// A chunk's name carries the hash of what is in it, so it belongs to the deploy
// that wrote it and to no other. A tab left open across a release asks the next
// deploy for a file it has never heard of, and a request the connection dropped
// looks the same from here. One retry clears the second; the first needs the
// current document, which is what the boundary offers.
function page(load) {
  return lazy(() =>
    load().catch(() =>
      new Promise((resolve) => {
        setTimeout(resolve, 300);
      }).then(load),
    ),
  );
}

// Every other page is split, because a visitor reaches it from a screen that is
// already painted and pays the chunk's round trip while reading. The home page
// is the one nobody navigates to: it is the landing, so a split there costs the
// first visitor a second round trip before anything but the skeleton exists.
const pages = {
  home: Home,
  listings: page(() => import("@/pages/Listings")),
  listingDetail: page(() => import("@/pages/ListingDetail")),
  areas: page(() => import("@/pages/Areas")),
  areaDetail: page(() => import("@/pages/AreaDetail")),
  compare: page(() => import("@/pages/Compare")),
  about: page(() => import("@/pages/About")),
  contact: page(() => import("@/pages/Contact")),
  faq: page(() => import("@/pages/Faq")),
  privacy: page(() => import("@/pages/legal/Privacy")),
  terms: page(() => import("@/pages/legal/Terms")),
  accessibility: page(() => import("@/pages/legal/Accessibility")),
  fairHousing: page(() => import("@/pages/legal/FairHousing")),
  signIn: page(() => import("@/pages/SignIn")),
  signUp: page(() => import("@/pages/SignUp")),
  saved: page(() => import("@/pages/Saved")),
  account: page(() => import("@/pages/Account")),
  savedSearches: page(() => import("@/pages/account/SavedSearches")),
  questions: page(() => import("@/pages/account/Questions")),
  dashboard: page(() => import("@/pages/admin/Dashboard")),
  adminLeads: page(() => import("@/pages/admin/Leads")),
  adminComments: page(() => import("@/pages/admin/Comments")),
  adminTestimonials: page(() => import("@/pages/admin/Testimonials")),
  listingEditor: page(() => import("@/pages/admin/ListingEditor")),
  notFound: page(() => import("@/pages/NotFound")),
};

function element(route) {
  const Page = pages[route.key];
  if (!Page) throw new Error(`No page component for route "${route.key}"`);
  const view = <Page />;
  if (route.guard === "agent") {
    return <RequireAuth agentOnly>{view}</RequireAuth>;
  }
  if (route.guard === "member") return <RequireAuth>{view}</RequireAuth>;
  return view;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Layout>
        <PageError>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              {routes.map((route) => (
                <Route
                  key={route.key}
                  path={route.path}
                  element={element(route)}
                />
              ))}
            </Routes>
          </Suspense>
        </PageError>
      </Layout>
    </>
  );
}
