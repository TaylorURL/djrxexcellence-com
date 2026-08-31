export const agent = {
  name: "Dylan Jordan",
  title: "Real Estate Agent",
  licenseNumber: "TREC_LICENSE_NUMBER",
  email: "AGENT_EMAIL",
  phone: "AGENT_CELL",
  headshot: "/agent/dylan-jordan.jpg",
};

export const brokerage = {
  name: "RE/MAX Excellence",
  street: "605 West Clayton Ste A",
  city: "Dayton",
  state: "TX",
  zip: "77535",
  phone: "936-340-2300",
  disclaimer: "Each Office Independently Owned and Operated.",
};

export const market = {
  primary: "Dayton, Texas",
  county: "Liberty County",
  areas: [
    "Dayton",
    "Liberty",
    "Mont Belvieu",
    "Baytown",
    "Crosby",
    "Huffman",
    "Cleveland",
    "Hardin",
  ],
  mls: "Houston Association of REALTORS",
};

export const social = {
  facebook: "SOCIAL_FACEBOOK_URL",
  instagram: "SOCIAL_INSTAGRAM_URL",
  youtube: "SOCIAL_YOUTUBE_URL",
  tiktok: "SOCIAL_TIKTOK_URL",
  linkedin: "SOCIAL_LINKEDIN_URL",
};

export const siteUrl = "https://djrxexcellence.com";

export const siteName = `${agent.name}, ${brokerage.name}`;

const PLACEHOLDER = /^[A-Z][A-Z0-9_]*$/;

/**
 * Reads a `site.js` field, treating an unfilled `SCREAMING_CASE` token as absent.
 *
 * The config ships with tokens standing in for values that are not yet known.
 * Callers get `null` for those so a screen can fall back to the office contact
 * details rather than printing the token.
 */
export function resolved(value) {
  if (typeof value !== "string") return value ?? null;
  const trimmed = value.trim();
  if (!trimmed || PLACEHOLDER.test(trimmed)) return null;
  return trimmed;
}

export const agentEmail = resolved(agent.email);
export const agentPhone = resolved(agent.phone);
export const agentLicense = resolved(agent.licenseNumber);

export const officePhone = brokerage.phone;

export const contactPhone = agentPhone ?? officePhone;

/**
 * The numbers to call, in the order a caller should try them.
 *
 * Dylan's own line comes first and the front desk second, so a buyer reaches
 * the person holding the file rather than whoever answers the office. Until
 * `agent.phone` is filled the list is the office line alone, which is why
 * every caller renders the array rather than assuming two entries.
 */
export const phoneLines = [
  ...(agentPhone
    ? [{ key: "direct", label: "Direct", number: agentPhone }]
    : []),
  { key: "office", label: "Office", number: officePhone },
];

export const socialLinks = Object.entries(social)
  .map(([key, value]) => ({ key, url: resolved(value) }))
  .filter((entry) => entry.url);
