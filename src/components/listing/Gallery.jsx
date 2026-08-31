import { useState } from "react";
import { Expand, Images } from "lucide-react";
import Lightbox from "@/components/listing/Lightbox";

export default function Gallery({ images }) {
  const [openAt, setOpenAt] = useState(null);

  if (!images.length) {
    return (
      <div className="flex aspect-[16/9] items-center justify-center rounded-2xl border border-surface-line bg-surface-sunken text-ink-faint">
        No photos yet
      </div>
    );
  }

  const [hero, ...rest] = images;
  const grid = rest.slice(0, 4);
  const remaining = images.length - grid.length - 1;

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-4">
        <button
          type="button"
          onClick={() => setOpenAt(0)}
          className="group relative col-span-full overflow-hidden rounded-2xl bg-surface-sunken sm:col-span-4"
        >
          <img
            src={hero.url}
            alt={hero.alt}
            width={1280}
            height={720}
            loading="eager"
            fetchPriority="high"
            decoding="sync"
            className="aspect-[16/9] w-full object-cover transition-transform duration-slow ease-out group-hover:scale-[1.02]"
          />
          <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-lg bg-surface/90 px-3 py-1.5 text-sm font-semibold text-ink shadow-card">
            <Expand className="h-4 w-4" aria-hidden="true" />
            View {images.length} {images.length === 1 ? "Photo" : "Photos"}
          </span>
        </button>

        {grid.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setOpenAt(index + 1)}
            className="group relative overflow-hidden rounded-xl bg-surface-sunken"
          >
            <img
              src={image.url}
              alt={image.alt}
              loading="lazy"
              width={480}
              height={360}
              className="aspect-[4/3] w-full object-cover transition-transform duration-slow ease-out group-hover:scale-[1.03]"
            />
            {index === grid.length - 1 && remaining > 0 ? (
              <span className="absolute inset-0 flex items-center justify-center gap-1.5 bg-ink/60 text-sm font-semibold text-white">
                <Images className="h-4 w-4" aria-hidden="true" />+{remaining}{" "}
                more
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {openAt !== null ? (
        <Lightbox
          images={images}
          index={openAt}
          onIndexChange={setOpenAt}
          onClose={() => setOpenAt(null)}
        />
      ) : null}
    </>
  );
}
