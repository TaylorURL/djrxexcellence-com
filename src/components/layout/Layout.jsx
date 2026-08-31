import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ThumbRail from "@/components/layout/ThumbRail";
import ClickSpark from "@/components/ui/ClickSpark";
import SplitRail from "@taylorurl/split-rail";

export default function Layout({ children }) {
  return (
    <div className="thumb-rail-clearance flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-blue focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to Content
      </a>
      <Header />
      <div className="chrome-spacer" aria-hidden="true" />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <div className="pt-6">
        <SplitRail version={__BUILD_VERSION__} />
      </div>
      <ThumbRail />
      <ClickSpark />
    </div>
  );
}
