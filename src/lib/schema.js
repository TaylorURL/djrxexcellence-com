import {
  agent,
  agentEmail,
  brokerage,
  contactPhone,
  market,
  officePhone,
  siteUrl,
  socialLinks,
} from "@/config/site";

const postalAddress = {
  "@type": "PostalAddress",
  streetAddress: brokerage.street,
  addressLocality: brokerage.city,
  addressRegion: brokerage.state,
  postalCode: brokerage.zip,
  addressCountry: "US",
};

export function publisherSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `${siteUrl}/#organization`,
    name: `${agent.name}, ${brokerage.name}`,
    legalName: brokerage.name,
    url: siteUrl,
    logo: `${siteUrl}/icon-512.png`,
    image: `${siteUrl}/social-card.png`,
    telephone: officePhone,
    ...(agentEmail ? { email: agentEmail } : {}),
    address: postalAddress,
    parentOrganization: {
      "@type": "Organization",
      name: brokerage.name,
    },
    ...(socialLinks.length
      ? { sameAs: socialLinks.map((entry) => entry.url) }
      : {}),
  };
}

export function agentSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `${siteUrl}/#agent`,
    name: agent.name,
    jobTitle: agent.title,
    url: siteUrl,
    image: `${siteUrl}${agent.headshot}`,
    telephone: contactPhone,
    ...(agentEmail ? { email: agentEmail } : {}),
    address: postalAddress,
    areaServed: market.areas.map((area) => ({
      "@type": "City",
      name: `${area}, ${brokerage.state}`,
    })),
    worksFor: { "@id": `${siteUrl}/#organization` },
    publisher: { "@id": `${siteUrl}/#organization` },
    ...(socialLinks.length
      ? { sameAs: socialLinks.map((entry) => entry.url) }
      : {}),
  };
}

export function breadcrumbSchema(trail) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${siteUrl}${crumb.path}`,
    })),
  };
}

export function listingSchema(listing, imageUrls = []) {
  return {
    "@context": "https://schema.org",
    "@type": "SingleFamilyResidence",
    name: listing.title,
    url: `${siteUrl}/listings/${listing.slug}`,
    ...(imageUrls.length ? { image: imageUrls } : {}),
    ...(listing.description ? { description: listing.description } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: listing.street_address,
      addressLocality: listing.city,
      addressRegion: listing.state,
      postalCode: listing.zip,
      addressCountry: "US",
    },
    ...(listing.latitude && listing.longitude
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: listing.latitude,
            longitude: listing.longitude,
          },
        }
      : {}),
    ...(listing.beds ? { numberOfBedrooms: listing.beds } : {}),
    ...(listing.baths ? { numberOfBathroomsTotal: listing.baths } : {}),
    ...(listing.square_feet
      ? {
          floorSize: {
            "@type": "QuantitativeValue",
            value: listing.square_feet,
            unitCode: "FTK",
          },
        }
      : {}),
    ...(listing.year_built ? { yearBuilt: listing.year_built } : {}),
    ...(listing.price
      ? {
          offers: {
            "@type": "Offer",
            price: listing.price,
            priceCurrency: "USD",
            availability:
              listing.status === "active"
                ? "https://schema.org/InStock"
                : "https://schema.org/SoldOut",
            seller: { "@id": `${siteUrl}/#agent` },
          },
        }
      : {}),
  };
}

export function faqSchema(entries) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
}
