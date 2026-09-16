const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const grouped = new Intl.NumberFormat("en-US");

export function price(value) {
  return typeof value === "number" ? currency.format(value) : "Call for price";
}

export function number(value) {
  return typeof value === "number" ? grouped.format(value) : "—";
}

/**
 * A monthly dues band, with a zero floor read as an absence rather than a
 * figure. "$0 to $30" reads as a real charge that happens to start at nothing.
 */
export function duesRange({ monthlyLow, monthlyHigh }) {
  if (!(monthlyHigh > 0)) return "None";
  if (!(monthlyLow > 0)) return `Up to ${price(monthlyHigh)}`;
  return `${price(monthlyLow)} to ${price(monthlyHigh)}`;
}

/**
 * What a listing costs per square foot, or null where either figure is missing.
 *
 * The card and the comparison table print it differently, so the rounding lives
 * here and the wording stays with each of them.
 */
export function pricePerSquareFoot(listing) {
  if (!listing?.price || !listing?.square_feet) return null;
  return Math.round(listing.price / listing.square_feet);
}

export function address(listing) {
  if (!listing) return "";
  const { streetAddress, city, state, zip } = listing;
  return [streetAddress, [city, state].filter(Boolean).join(", "), zip]
    .filter(Boolean)
    .join(" ");
}

// The office is in Dayton, so today is the day it is there. A calendar day
// rather than a count of elapsed hours: a comment left at eleven last night is
// "Yesterday" at nine this morning, which counting hours calls "Today".
const ZONE = "America/Chicago";

const dayHere = (value = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value instanceof Date ? value : new Date(value));

export function relativeDate(value) {
  const then = new Date(value);
  if (Number.isNaN(then.getTime())) return "";
  const day = dayHere(then);
  const today = dayHere();
  if (day === today) return "Today";
  const days = Math.round(
    (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${day}T00:00:00Z`)) /
      86400000,
  );
  if (days === 1) return "Yesterday";
  if (days > 0 && days < 30) return `${days} days ago`;
  return then.toLocaleDateString("en-US", {
    timeZone: ZONE,
    month: "short",
    day: "numeric",
  });
}

/** The year here, for a line that names the office rather than the reader. */
export function currentYear() {
  return Number(dayHere().slice(0, 4));
}
