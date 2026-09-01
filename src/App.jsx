import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import RequireAuth from "@/components/RequireAuth";
import ScrollToTop from "@/components/ScrollToTop";
import PageFallback from "@/components/PageFallback";
import { routes } from "@/config/routes";
import Home from "@/pages/Home";

// Every other page is split, because a visitor reaches it from a screen that is
// already painted and pays the chunk's round trip while reading. The home page
// is the one nobody navigates to: it is the landing, so a split there costs the
// first visitor a second round trip before anything but the skeleton exists.
const pages = {
  home: Home,
  listings: lazy(() => import("@/pages/Listings")),
  listingDetail: lazy(() => import("@/pages/ListingDetail")),
  areas: lazy(() => import("@/pages/Areas")),
  areaDetail: lazy(() => import("@/pages/AreaDetail")),
  compare: lazy(() => import("@/pages/Compare")),
  about: lazy(() => import("@/pages/About")),
  contact: lazy(() => import("@/pages/Contact")),
  faq: lazy(() => import("@/pages/Faq")),
  privacy: lazy(() => import("@/pages/legal/Privacy")),
  terms: lazy(() => import("@/pages/legal/Terms")),
  accessibility: lazy(() => import("@/pages/legal/Accessibility")),
  fairHousing: lazy(() => import("@/pages/legal/FairHousing")),
  signIn: lazy(() => import("@/pages/SignIn")),
  signUp: lazy(() => import("@/pages/SignUp")),
  saved: lazy(() => import("@/pages/Saved")),
  account: lazy(() => import("@/pages/Account")),
  savedSearches: lazy(() => import("@/pages/account/SavedSearches")),
  questions: lazy(() => import("@/pages/account/Questions")),
  dashboard: lazy(() => import("@/pages/admin/Dashboard")),
  adminLeads: lazy(() => import("@/pages/admin/Leads")),
  adminComments: lazy(() => import("@/pages/admin/Comments")),
  adminTestimonials: lazy(() => import("@/pages/admin/Testimonials")),
  listingEditor: lazy(() => import("@/pages/admin/ListingEditor")),
  notFound: lazy(() => import("@/pages/NotFound")),
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
      </Layout>
    </>
  );
}
