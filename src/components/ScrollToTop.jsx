import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Puts a newly opened route at the top, or at the section a link named.
 *
 * The browser resolves a hash against the document it already has, so a link
 * carrying one into a route the router has yet to render finds nothing.
 * Scrolling happens here, after that render, instead.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, hash]);

  return null;
}
