import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  fetchListingForAgent,
  saveListing,
  slugExists,
} from "@/services/listings";
import { PROPERTY_TYPE_LABELS, STATUS_LABELS } from "@/lib/listingStatus";
import { areas } from "@/data/areas";
import Seo from "@/components/Seo";
import PageFallback from "@/components/PageFallback";
import PhotoManager from "@/components/admin/PhotoManager";
import Button from "@/components/ui/Button";
import Field, { inputClasses, textareaClasses } from "@/components/ui/Field";
import { cn } from "@/lib/cn";

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function numberOrNull(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function ListingEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (isNew) return;
    fetchListingForAgent(id)
      .then(setListing)
      .catch((caught) => setError(caught.message))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  async function onSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const streetAddress = form.get("street_address").trim();
    const city = form.get("city").trim();
    const slug = form.get("slug").trim() || slugify(`${streetAddress} ${city}`);

    setSaving(true);
    setError("");
    setStatus("");

    try {
      if (await slugExists(slug, isNew ? null : id)) {
        throw new Error(
          `Another listing already uses the address "${slug}". Set a different slug.`,
        );
      }

      const record = {
        ...(isNew ? {} : { id }),
        slug,
        title: form.get("title").trim() || `${streetAddress}, ${city}`,
        status: form.get("status"),
        property_type: form.get("property_type"),
        price: numberOrNull(form.get("price")),
        street_address: streetAddress,
        city,
        state: form.get("state").trim(),
        zip: form.get("zip").trim(),
        latitude: numberOrNull(form.get("latitude")),
        longitude: numberOrNull(form.get("longitude")),
        beds: numberOrNull(form.get("beds")),
        baths: numberOrNull(form.get("baths")),
        half_baths: numberOrNull(form.get("half_baths")),
        square_feet: numberOrNull(form.get("square_feet")),
        lot_size_acres: numberOrNull(form.get("lot_size_acres")),
        year_built: numberOrNull(form.get("year_built")),
        garage_spaces: numberOrNull(form.get("garage_spaces")),
        hoa_fee: numberOrNull(form.get("hoa_fee")),
        taxes_annual: numberOrNull(form.get("taxes_annual")),
        school_district: form.get("school_district").trim() || null,
        mls_number: form.get("mls_number").trim() || null,
        description: form.get("description").trim() || null,
        features: String(form.get("features") || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        virtual_tour_url: form.get("virtual_tour_url").trim() || null,
        video_url: form.get("video_url").trim() || null,
        is_featured: form.get("is_featured") === "on",
        published_at:
          form.get("published") === "on"
            ? (listing?.published_at ?? new Date().toISOString())
            : null,
      };

      const saved = await saveListing(record);
      if (isNew) {
        navigate(`/admin/listings/${saved.id}`, { replace: true });
        return;
      }
      setListing((current) => ({ ...current, ...saved }));
      setStatus("Saved");
    } catch (caught) {
      setError(caught.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageFallback />;

  const published = Boolean(listing?.published_at);

  return (
    <div className="page-shell max-w-4xl py-14">
      <Seo title={isNew ? "Add a Listing" : "Edit Listing"} noindex />

      <button
        type="button"
        onClick={() => navigate("/admin")}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Listings
      </button>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-4xl font-semibold">
          {isNew ? "Add a Listing" : listing?.street_address}
        </h1>
        {!isNew ? (
          <span
            className={cn(
              "rounded-lg px-2.5 py-1 text-xs font-semibold",
              published
                ? "bg-brand-blue/10 text-brand-blue"
                : "bg-surface-sunken text-ink-muted",
            )}
          >
            {published ? "Published" : "Draft"}
          </span>
        ) : null}
      </div>

      {isNew ? (
        <p className="mt-3 max-w-measure text-sm text-ink-muted">
          Save the address first and the photo uploader opens on the next
          screen.
        </p>
      ) : null}

      <form onSubmit={onSubmit} className="mt-8 grid gap-4 sm:grid-cols-6">
        <Field label="Street Address" className="sm:col-span-4">
          <input
            name="street_address"
            required
            defaultValue={listing?.street_address ?? ""}
            className={inputClasses}
          />
        </Field>
        <Field label="City" className="sm:col-span-2">
          <input
            name="city"
            required
            list="area-cities"
            defaultValue={listing?.city ?? "Dayton"}
            className={inputClasses}
          />
          <datalist id="area-cities">
            {areas.map((area) => (
              <option key={area.slug} value={area.name} />
            ))}
          </datalist>
        </Field>
        <Field label="State" className="sm:col-span-1">
          <input
            name="state"
            required
            defaultValue={listing?.state ?? "TX"}
            className={inputClasses}
          />
        </Field>
        <Field label="ZIP" className="sm:col-span-2">
          <input
            name="zip"
            required
            defaultValue={listing?.zip ?? "77535"}
            className={inputClasses}
          />
        </Field>
        <Field label="Price" className="sm:col-span-3">
          <input
            name="price"
            type="number"
            min="0"
            step="1000"
            defaultValue={listing?.price ?? ""}
            className={inputClasses}
          />
        </Field>

        <Field label="Status" className="sm:col-span-3">
          <select
            name="status"
            defaultValue={listing?.status ?? "active"}
            className={inputClasses}
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Property Type" className="sm:col-span-3">
          <select
            name="property_type"
            defaultValue={listing?.property_type ?? "single_family"}
            className={inputClasses}
          >
            {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Bedrooms" className="sm:col-span-2">
          <input
            name="beds"
            type="number"
            min="0"
            defaultValue={listing?.beds ?? ""}
            className={inputClasses}
          />
        </Field>
        <Field label="Full Baths" className="sm:col-span-2">
          <input
            name="baths"
            type="number"
            min="0"
            step="0.5"
            defaultValue={listing?.baths ?? ""}
            className={inputClasses}
          />
        </Field>
        <Field label="Half Baths" className="sm:col-span-2">
          <input
            name="half_baths"
            type="number"
            min="0"
            defaultValue={listing?.half_baths ?? ""}
            className={inputClasses}
          />
        </Field>
        <Field label="Square Feet" className="sm:col-span-2">
          <input
            name="square_feet"
            type="number"
            min="0"
            defaultValue={listing?.square_feet ?? ""}
            className={inputClasses}
          />
        </Field>
        <Field label="Lot Size (Acres)" className="sm:col-span-2">
          <input
            name="lot_size_acres"
            type="number"
            min="0"
            step="0.001"
            defaultValue={listing?.lot_size_acres ?? ""}
            className={inputClasses}
          />
        </Field>
        <Field label="Garage Spaces" className="sm:col-span-2">
          <input
            name="garage_spaces"
            type="number"
            min="0"
            defaultValue={listing?.garage_spaces ?? ""}
            className={inputClasses}
          />
        </Field>
        <Field label="Year Built" className="sm:col-span-2">
          <input
            name="year_built"
            type="number"
            min="1800"
            max="2100"
            defaultValue={listing?.year_built ?? ""}
            className={inputClasses}
          />
        </Field>
        <Field label="HOA Fee (Annual)" className="sm:col-span-2">
          <input
            name="hoa_fee"
            type="number"
            min="0"
            step="1"
            defaultValue={listing?.hoa_fee ?? ""}
            className={inputClasses}
          />
        </Field>
        <Field label="Annual Taxes" className="sm:col-span-2">
          <input
            name="taxes_annual"
            type="number"
            min="0"
            step="1"
            defaultValue={listing?.taxes_annual ?? ""}
            className={inputClasses}
          />
        </Field>

        <Field label="School District" className="sm:col-span-3">
          <input
            name="school_district"
            defaultValue={listing?.school_district ?? ""}
            className={inputClasses}
          />
        </Field>
        <Field label="MLS Number" className="sm:col-span-3">
          <input
            name="mls_number"
            defaultValue={listing?.mls_number ?? ""}
            className={inputClasses}
          />
        </Field>

        <Field
          label="Latitude"
          hint="Puts the home on the map."
          className="sm:col-span-3"
        >
          <input
            name="latitude"
            type="number"
            step="0.000001"
            min="-90"
            max="90"
            defaultValue={listing?.latitude ?? ""}
            className={inputClasses}
          />
        </Field>
        <Field label="Longitude" className="sm:col-span-3">
          <input
            name="longitude"
            type="number"
            step="0.000001"
            min="-180"
            max="180"
            defaultValue={listing?.longitude ?? ""}
            className={inputClasses}
          />
        </Field>

        <Field label="Virtual Tour URL" className="sm:col-span-3">
          <input
            name="virtual_tour_url"
            type="url"
            defaultValue={listing?.virtual_tour_url ?? ""}
            className={inputClasses}
          />
        </Field>
        <Field label="Video URL" className="sm:col-span-3">
          <input
            name="video_url"
            type="url"
            defaultValue={listing?.video_url ?? ""}
            className={inputClasses}
          />
        </Field>

        <Field
          label="Listing Title"
          hint="Leave blank to use the address."
          className="sm:col-span-3"
        >
          <input
            name="title"
            defaultValue={listing?.title ?? ""}
            className={inputClasses}
          />
        </Field>
        <Field
          label="Slug"
          hint="Leave blank to derive from the address."
          className="sm:col-span-3"
        >
          <input
            name="slug"
            defaultValue={listing?.slug ?? ""}
            className={inputClasses}
          />
        </Field>

        <Field
          label="Features"
          hint="Comma separated."
          className="sm:col-span-6"
        >
          <input
            name="features"
            defaultValue={(listing?.features ?? []).join(", ")}
            className={inputClasses}
          />
        </Field>
        <Field label="Description" className="sm:col-span-6">
          <textarea
            name="description"
            rows={8}
            defaultValue={listing?.description ?? ""}
            className={textareaClasses}
          />
        </Field>

        <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-3">
          <input
            type="checkbox"
            name="is_featured"
            defaultChecked={listing?.is_featured ?? false}
          />
          Feature on the Home Page
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-3">
          <input type="checkbox" name="published" defaultChecked={published} />
          Publish to the Public Site
        </label>

        {error ? (
          <p className="rounded-xl border border-brand-red/30 bg-brand-red/5 p-3 text-sm font-medium text-brand-red sm:col-span-6">
            {error}
          </p>
        ) : null}
        {status ? (
          <p className="text-sm font-semibold text-brand-blue sm:col-span-6">
            {status}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3 sm:col-span-6">
          <Button type="submit" size="lg" disabled={saving}>
            {saving ? "Saving" : "Save Listing"}
          </Button>
          <Button to="/admin" variant="outline" size="lg">
            Cancel
          </Button>
        </div>
      </form>

      {!isNew && listing ? (
        <div className="mt-14 border-t border-surface-line pt-10">
          <PhotoManager listingId={listing.id} />
        </div>
      ) : null}
    </div>
  );
}
