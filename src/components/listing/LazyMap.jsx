import { Suspense, lazy } from "react";
import { cn } from "@/lib/cn";

const MapCanvas = lazy(() => import("@/components/listing/ListingMap"));

export default function LazyMap({ className, ...props }) {
  return (
    <Suspense
      fallback={
        <div className={cn("min-h-[26rem]", className)}>
          <div className="h-full min-h-[26rem] w-full animate-pulse rounded-2xl border border-surface-line bg-surface-sunken" />
        </div>
      }
    >
      <MapCanvas className={className} {...props} />
    </Suspense>
  );
}
