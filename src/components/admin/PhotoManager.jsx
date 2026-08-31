import { useEffect, useRef, useState } from "react";
import { GripVertical, Star, Trash2, Upload } from "lucide-react";
import {
  deleteListingImage,
  fetchListingImages,
  saveImageAltText,
  saveImageOrder,
  uploadListingImage,
} from "@/services/images";
import { publicImageUrl } from "@/services/listings";
import { inputClasses } from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";
const MAX_BYTES = 10 * 1024 * 1024;

export default function PhotoManager({ listingId }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState("");
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchListingImages(listingId)
      .then(setImages)
      .catch((caught) => setError(caught.message))
      .finally(() => setLoading(false));
  }, [listingId]);

  async function addFiles(fileList) {
    const files = Array.from(fileList ?? []);
    if (!files.length) return;
    setError("");

    const tooBig = files.find((file) => file.size > MAX_BYTES);
    if (tooBig) {
      setError(`${tooBig.name} is over 10 MB. Resize it and try again.`);
      return;
    }

    setUploading(files.length);
    let position = images.length;
    for (const file of files) {
      try {
        const created = await uploadListingImage({
          listingId,
          file,
          position,
        });
        setImages((rows) => [...rows, created]);
        position += 1;
      } catch (caught) {
        setError(`${file.name} did not upload. ${caught.message}`);
        break;
      } finally {
        setUploading((count) => count - 1);
      }
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  async function commitOrder(next) {
    setImages(next);
    try {
      await saveImageOrder(next);
    } catch (caught) {
      setError(caught.message);
    }
  }

  function onDrop(index) {
    if (dragIndex === null || dragIndex === index) return;
    const next = images.slice();
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    setDragIndex(null);
    setOverIndex(null);
    commitOrder(next);
  }

  function move(index, delta) {
    const target = index + delta;
    if (target < 0 || target >= images.length) return;
    const next = images.slice();
    [next[index], next[target]] = [next[target], next[index]];
    commitOrder(next);
  }

  async function onDelete(image) {
    try {
      await deleteListingImage(image);
      const next = images.filter((row) => row.id !== image.id);
      commitOrder(next);
    } catch (caught) {
      setError(caught.message);
    }
  }

  async function onAltBlur(image, value) {
    if (value === (image.alt_text ?? "")) return;
    try {
      await saveImageAltText(image.id, value || null);
      setImages((rows) =>
        rows.map((row) =>
          row.id === image.id ? { ...row, alt_text: value || null } : row,
        ),
      );
    } catch (caught) {
      setError(caught.message);
    }
  }

  return (
    <section aria-labelledby="photos-heading" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="photos-heading"
            className="font-display text-2xl font-semibold"
          >
            Photos
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            The first photo is the cover. Drag to reorder, or use the arrows.
          </p>
        </div>
        <div>
          <input
            ref={inputRef}
            id="photo-input"
            type="file"
            accept={ACCEPT}
            multiple
            className="sr-only"
            onChange={(event) => addFiles(event.target.files)}
          />
          <Button as="label" htmlFor="photo-input" className="cursor-pointer">
            <Upload className="h-4 w-4" aria-hidden="true" />
            {uploading > 0 ? `Uploading ${uploading}` : "Upload Photos"}
          </Button>
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-brand-red/30 bg-brand-red/5 p-3 text-sm font-medium text-brand-red">
          {error}
        </p>
      ) : null}

      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          if (event.dataTransfer.files?.length)
            addFiles(event.dataTransfer.files);
        }}
        className="rounded-2xl border border-dashed border-surface-line p-4"
      >
        {loading ? (
          <p className="py-8 text-center text-sm text-ink-muted">
            Loading photos
          </p>
        ) : images.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-muted">
            No photos yet. Drop image files here or use the upload button.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image, index) => (
              <li
                key={image.id}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragEnter={() => setOverIndex(index)}
                onDragEnd={() => {
                  setDragIndex(null);
                  setOverIndex(null);
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onDrop(index);
                }}
                className={cn(
                  "space-y-2 rounded-xl border bg-surface p-2 transition-colors duration-fast ease-out",
                  overIndex === index && dragIndex !== null
                    ? "border-brand-blue"
                    : "border-surface-line",
                  dragIndex === index && "opacity-50",
                )}
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-surface-sunken">
                  <img
                    src={publicImageUrl(image.storage_path)}
                    alt={image.alt_text ?? ""}
                    loading="lazy"
                    width={480}
                    height={360}
                    className="h-full w-full object-cover"
                  />
                  {index === 0 ? (
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-lg bg-brand-red px-2 py-0.5 text-xs font-semibold text-on-accent">
                      <Star className="h-3 w-3" aria-hidden="true" />
                      Cover
                    </span>
                  ) : null}
                  <span className="absolute right-2 top-2 flex h-7 w-7 cursor-grab items-center justify-center rounded-lg bg-surface/90 text-ink-muted">
                    <GripVertical className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>

                <label>
                  <span className="sr-only">Photo Description</span>
                  <input
                    defaultValue={image.alt_text ?? ""}
                    onBlur={(event) =>
                      onAltBlur(image, event.target.value.trim())
                    }
                    placeholder="Describe this photo"
                    className={cn(inputClasses, "h-9 text-xs")}
                  />
                </label>

                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      aria-label={`Move Photo ${index + 1} Earlier`}
                      className="rounded-lg px-2 py-1 text-xs font-semibold text-ink-muted hover:bg-surface-sunken disabled:opacity-40"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === images.length - 1}
                      aria-label={`Move Photo ${index + 1} Later`}
                      className="rounded-lg px-2 py-1 text-xs font-semibold text-ink-muted hover:bg-surface-sunken disabled:opacity-40"
                    >
                      Forward
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDelete(image)}
                    aria-label={`Delete Photo ${index + 1}`}
                    className="rounded-lg p-1.5 text-ink-faint hover:text-brand-red"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
