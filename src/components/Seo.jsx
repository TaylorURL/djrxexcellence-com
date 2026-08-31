import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { siteName, siteUrl } from "@/config/site";

function upsertMeta(selector, attributes) {
  let node = document.head.querySelector(selector);
  if (!node) {
    node = document.createElement("meta");
    document.head.appendChild(node);
  }
  Object.entries(attributes).forEach(([key, value]) => {
    node.setAttribute(key, value);
  });
  return node;
}

function upsertLink(rel, href) {
  let node = document.head.querySelector(`link[rel="${rel}"]`);
  if (!node) {
    node = document.createElement("link");
    node.setAttribute("rel", rel);
    document.head.appendChild(node);
  }
  node.setAttribute("href", href);
}

export default function Seo({
  title,
  description,
  image,
  type = "website",
  noindex = false,
  schema,
}) {
  const { pathname } = useLocation();

  useEffect(() => {
    const fullTitle = title ? `${title} | ${siteName}` : siteName;
    const url = `${siteUrl}${pathname === "/" ? "/" : pathname}`;
    const card = image ?? `${siteUrl}/social-card.png`;

    document.title = fullTitle;
    upsertLink("canonical", url);

    if (description) {
      upsertMeta('meta[name="description"]', {
        name: "description",
        content: description,
      });
    }
    upsertMeta('meta[name="robots"]', {
      name: "robots",
      content: noindex ? "noindex, nofollow" : "index, follow",
    });

    upsertMeta('meta[property="og:title"]', {
      property: "og:title",
      content: fullTitle,
    });
    upsertMeta('meta[property="og:type"]', {
      property: "og:type",
      content: type,
    });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: url });
    upsertMeta('meta[property="og:site_name"]', {
      property: "og:site_name",
      content: siteName,
    });
    upsertMeta('meta[property="og:image"]', {
      property: "og:image",
      content: card,
    });
    if (description) {
      upsertMeta('meta[property="og:description"]', {
        property: "og:description",
        content: description,
      });
    }

    upsertMeta('meta[name="twitter:card"]', {
      name: "twitter:card",
      content: "summary_large_image",
    });
    upsertMeta('meta[name="twitter:title"]', {
      name: "twitter:title",
      content: fullTitle,
    });
    if (description) {
      upsertMeta('meta[name="twitter:description"]', {
        name: "twitter:description",
        content: description,
      });
    }
    upsertMeta('meta[name="twitter:image"]', {
      name: "twitter:image",
      content: card,
    });
  }, [title, description, image, type, noindex, pathname]);

  useEffect(() => {
    if (!schema) return undefined;
    const blocks = Array.isArray(schema) ? schema : [schema];
    const nodes = blocks.map((block) => {
      const node = document.createElement("script");
      node.type = "application/ld+json";
      node.dataset.seo = "route";
      node.textContent = JSON.stringify(block);
      document.head.appendChild(node);
      return node;
    });
    return () => nodes.forEach((node) => node.remove());
  }, [schema]);

  return null;
}
