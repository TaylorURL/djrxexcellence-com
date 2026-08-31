import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { price } from "@/lib/format";
import { cn } from "@/lib/cn";

const DAYTON = [30.0466, -94.8858];

/* Leaflet measures its container on mount and paints a frame later, so the
   height it will fill is reserved here rather than left to the caller. */
const RESERVED_BOX = "min-h-[26rem]";

function markerIcon(label, active) {
  return L.divIcon({
    className: "",
    html: `<span class="flex -translate-x-1/2 -translate-y-full items-center rounded-lg px-2 py-1 text-xs font-semibold shadow-card ring-1 ring-black/10 ${
      active ? "bg-brand-blue text-white" : "bg-white text-ink"
    }">${label}</span>`,
    iconSize: [0, 0],
  });
}

export default function ListingMap({
  listings,
  activeId,
  onSelect,
  className,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return undefined;
    const map = L.map(containerRef.current, {
      center: DAYTON,
      zoom: 10,
      scrollWheelZoom: false,
    });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);
    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    const points = [];

    listings.forEach((listing) => {
      if (listing.latitude == null || listing.longitude == null) return;
      const position = [Number(listing.latitude), Number(listing.longitude)];
      points.push(position);
      L.marker(position, {
        icon: markerIcon(price(listing.price), listing.id === activeId),
        keyboard: true,
        alt: `${listing.street_address}, ${listing.city}`,
        riseOnHover: true,
      })
        .on("click", () => onSelect?.(listing))
        .bindPopup(
          `<strong>${price(listing.price)}</strong><br/>${listing.street_address}<br/>${listing.city}, ${listing.state} ${listing.zip}<br/><a href="/listings/${listing.slug}">View Listing</a>`,
        )
        .addTo(layer);
    });

    if (points.length === 1) map.setView(points[0], 13);
    else if (points.length > 1) map.fitBounds(points, { padding: [40, 40] });
    else map.setView(DAYTON, 10);
  }, [listings, activeId, onSelect]);

  const plotted = listings.filter(
    (listing) => listing.latitude != null && listing.longitude != null,
  ).length;

  return (
    <div className={cn(RESERVED_BOX, className)}>
      <div
        ref={containerRef}
        role="application"
        aria-label="Map of Listings"
        className={cn(
          "h-full w-full rounded-2xl border border-surface-line",
          RESERVED_BOX,
        )}
      />
      {plotted < listings.length ? (
        <p className="mt-2 text-xs text-ink-faint">
          {listings.length - plotted} of {listings.length} homes have no map
          coordinates yet.
        </p>
      ) : null}
    </div>
  );
}
