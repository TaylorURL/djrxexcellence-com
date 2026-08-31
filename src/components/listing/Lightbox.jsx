import { useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function Lightbox({ images, index, onClose, onIndexChange }) {
  const closeRef = useRef(null);
  const total = images.length;

  const step = useCallback(
    (delta) => onIndexChange((index + delta + total) % total),
    [index, total, onIndexChange],
  );

  useEffect(() => {
    closeRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [onClose, step]);

  const current = images[index];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${total}`}
      className="on-dark fixed inset-0 z-50 flex flex-col bg-ink/95"
    >
      <div className="flex items-center justify-between px-5 py-4 text-white">
        <p className="text-sm font-semibold tabular-nums">
          {index + 1} / {total}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close Gallery"
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 transition-colors duration-fast ease-out hover:bg-white/20"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* min-h-0 is what makes the photo fit. A flex item defaults to
          min-height:auto, so this row grows to its content rather than to its
          share of the column, and max-h-full on the photo then measures against
          a box already taller than the screen. The counter and the thumbnails
          get pushed off the ends and the photo runs past both. */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-4 sm:px-20">
        {total > 1 ? (
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous Photo"
            className="absolute left-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-fast ease-out hover:bg-white/20"
          >
            <ChevronLeft className="h-6 w-6" aria-hidden="true" />
          </button>
        ) : null}

        <img
          src={current.url}
          alt={current.alt}
          width={1600}
          height={1200}
          /* No corner rounding here. object-contain letterboxes the photo
             inside an element the flex row has already sized, so the box is
             wider than the photo and a radius would round transparent space
             while the photo itself kept square corners. */
          className="max-h-full max-w-full object-contain"
        />

        {total > 1 ? (
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next Photo"
            className="absolute right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-fast ease-out hover:bg-white/20"
          >
            <ChevronRight className="h-6 w-6" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {total > 1 ? (
        <ul className="flex gap-2 overflow-x-auto px-5 pb-5">
          {images.map((image, position) => (
            <li key={image.id}>
              <button
                type="button"
                onClick={() => onIndexChange(position)}
                aria-label={`Show Photo ${position + 1}`}
                aria-current={position === index}
                className={`h-[3.75rem] w-24 overflow-hidden rounded-lg ring-2 transition-opacity duration-fast ease-out ${
                  position === index
                    ? "ring-white"
                    : "opacity-60 ring-transparent hover:opacity-100"
                }`}
              >
                <img
                  src={image.url}
                  alt=""
                  loading="lazy"
                  width={96}
                  height={64}
                  className="h-full w-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
