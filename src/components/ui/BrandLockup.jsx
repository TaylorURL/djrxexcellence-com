import { cn } from "@/lib/cn";
import { brokerage } from "@/config/site";

/**
 * The RE/MAX lockup, on whichever ground the theme is currently painting.
 *
 * The wordmark is a fixed brand asset in navy, which is invisible on the dark
 * theme's surface, so both lockups ship and CSS picks one. Doing it in CSS
 * rather than from the theme value means the right one is on screen in the
 * first paint, and neither is ever swapped mid-render.
 */
export default function BrandLockup({ className, width, height, ...props }) {
  const shared = cn("mark w-auto", className);
  return (
    <>
      <img
        src="/brand/remax-logo.svg"
        alt={brokerage.name}
        width={width}
        height={height}
        className={cn("brand-lockup-ink", shared)}
        {...props}
      />
      <img
        src="/brand/remax-logo-light.svg"
        alt={brokerage.name}
        width={width}
        height={height}
        aria-hidden="true"
        className={cn("brand-lockup-paper", shared)}
        {...props}
      />
    </>
  );
}
