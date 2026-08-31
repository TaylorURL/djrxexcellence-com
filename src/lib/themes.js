/** The three grounds the site paints, in the order the control cycles them. */
export const THEMES = ["light", "gray", "dark"];

/**
 * The address bar tint, read from the theme currently painting the page.
 *
 * The browser chrome takes a literal colour, and the page surface is a channel
 * triple in the token block, so the value is mixed at the point of use. One
 * definition means the chrome cannot drift from the ground beneath it.
 */
export function barTint() {
  const channels = getComputedStyle(document.documentElement)
    .getPropertyValue("--surface")
    .trim();
  return channels ? `rgb(${channels})` : "";
}
