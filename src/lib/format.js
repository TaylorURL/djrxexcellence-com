const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const compact = new Intl.NumberFormat("en-US");

export function price(value) {
  return typeof value === "number" ? currency.format(value) : "Call for price";
}

export function number(value) {
  return typeof value === "number" ? compact.format(value) : "—";
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

export function address(listing) {
  if (!listing) return "";
  const { streetAddress, city, state, zip } = listing;
  return [streetAddress, [city, state].filter(Boolean).join(", "), zip]
    .filter(Boolean)
    .join(" ");
}

export function relativeDate(value) {
  const then = new Date(value);
  const days = Math.round((Date.now() - then.getTime()) / 86400000);
  if (days < 1) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return then.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
