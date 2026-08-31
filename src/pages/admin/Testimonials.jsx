import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  deleteTestimonial,
  fetchAllTestimonials,
  saveTestimonial,
  setTestimonialPublished,
} from "@/services/testimonials";
import PageFallback from "@/components/PageFallback";
import AdminShell from "@/components/admin/AdminShell";
import Button from "@/components/ui/Button";
import Field, { inputClasses, textareaClasses } from "@/components/ui/Field";
import { cn } from "@/lib/cn";

const BLANK = {
  author_name: "",
  author_location: "",
  transaction_kind: "",
  quote: "",
  rating: 5,
  is_published: false,
  position: 0,
};

export default function Testimonials() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAllTestimonials()
      .then(setEntries)
      .catch((caught) => setError(caught.message))
      .finally(() => setLoading(false));
  }, []);

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    const record = {
      ...(draft.id ? { id: draft.id } : {}),
      author_name: draft.author_name.trim(),
      author_location: draft.author_location.trim() || null,
      transaction_kind: draft.transaction_kind.trim() || null,
      quote: draft.quote.trim(),
      rating: Number(draft.rating) || null,
      is_published: draft.is_published,
      position: Number(draft.position) || 0,
    };
    try {
      const saved = await saveTestimonial(record);
      setEntries((rows) => {
        const without = rows.filter((row) => row.id !== saved.id);
        return [...without, saved].sort((a, b) => a.position - b.position);
      });
      setDraft(null);
    } catch (caught) {
      setError(caught.message);
    }
  }

  async function onDelete(entry) {
    const confirmed = window.confirm(
      `Delete the note from ${entry.author_name}?`,
    );
    if (!confirmed) return;
    try {
      await deleteTestimonial(entry.id);
      setEntries((rows) => rows.filter((row) => row.id !== entry.id));
    } catch (caught) {
      setError(caught.message);
    }
  }

  async function togglePublished(entry) {
    try {
      const saved = await setTestimonialPublished(
        entry.id,
        !entry.is_published,
      );
      setEntries((rows) =>
        rows.map((row) =>
          row.id === entry.id
            ? { ...row, is_published: saved.is_published }
            : row,
        ),
      );
    } catch (caught) {
      setError(caught.message);
    }
  }

  if (loading) return <PageFallback />;

  const headerAction = draft ? null : (
    <Button onClick={() => setDraft({ ...BLANK })}>
      <Plus className="h-4 w-4" aria-hidden="true" />
      Add a Testimonial
    </Button>
  );

  return (
    <AdminShell title="Testimonials" headerAction={headerAction}>
      <p className="mb-6 max-w-measure text-sm text-ink-muted">
        Published notes appear on the home page in position order. Use the words
        the client actually wrote.
      </p>

      {error ? (
        <p className="mb-4 rounded-xl border border-brand-red/30 bg-brand-red/5 p-3 text-sm font-medium text-brand-red">
          {error}
        </p>
      ) : null}

      {draft ? (
        <form
          onSubmit={onSubmit}
          className="mb-8 grid gap-4 rounded-2xl border border-surface-line bg-surface-raised p-6 sm:grid-cols-2"
        >
          <Field label="Client Name">
            <input
              required
              value={draft.author_name}
              onChange={(event) =>
                setDraft({ ...draft, author_name: event.target.value })
              }
              className={inputClasses}
            />
          </Field>
          <Field label="Town">
            <input
              value={draft.author_location}
              onChange={(event) =>
                setDraft({ ...draft, author_location: event.target.value })
              }
              placeholder="Dayton, TX"
              className={inputClasses}
            />
          </Field>
          <Field label="Transaction">
            <input
              value={draft.transaction_kind}
              onChange={(event) =>
                setDraft({ ...draft, transaction_kind: event.target.value })
              }
              placeholder="Bought a home"
              className={inputClasses}
            />
          </Field>
          <Field label="Rating">
            <select
              value={draft.rating}
              onChange={(event) =>
                setDraft({ ...draft, rating: event.target.value })
              }
              className={inputClasses}
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} of 5
                </option>
              ))}
            </select>
          </Field>
          <Field label="Quote" className="sm:col-span-2">
            <textarea
              required
              rows={4}
              maxLength={1200}
              value={draft.quote}
              onChange={(event) =>
                setDraft({ ...draft, quote: event.target.value })
              }
              className={textareaClasses}
            />
          </Field>
          <Field label="Position" hint="Lower numbers show first.">
            <input
              type="number"
              min="0"
              value={draft.position}
              onChange={(event) =>
                setDraft({ ...draft, position: event.target.value })
              }
              className={inputClasses}
            />
          </Field>
          <label className="flex items-end gap-2 pb-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={draft.is_published}
              onChange={(event) =>
                setDraft({ ...draft, is_published: event.target.checked })
              }
            />
            Show on the Home Page
          </label>
          <div className="flex gap-3 sm:col-span-2">
            <Button type="submit">Save Testimonial</Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDraft(null)}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : null}

      {entries.length === 0 ? (
        <p className="rounded-2xl border border-surface-line bg-surface-raised p-8 text-ink-muted">
          Nothing added yet. The home page skips this section until a
          testimonial is published.
        </p>
      ) : (
        <ul className="space-y-4">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="arrive rounded-2xl border border-surface-line p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{entry.author_name}</p>
                  <p className="mt-0.5 text-sm text-ink-muted">
                    {[entry.transaction_kind, entry.author_location]
                      .filter(Boolean)
                      .join(" · ") || "No detail set"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => togglePublished(entry)}
                    className={cn(
                      "inline-flex h-9 items-center rounded-lg px-3 text-sm font-semibold",
                      entry.is_published
                        ? "bg-brand-blue/10 text-brand-blue"
                        : "bg-surface-sunken text-ink-muted",
                    )}
                  >
                    {entry.is_published ? "Published" : "Hidden"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft({
                        ...entry,
                        author_location: entry.author_location ?? "",
                        transaction_kind: entry.transaction_kind ?? "",
                      })
                    }
                    className="inline-flex h-9 items-center rounded-lg border border-surface-line px-3 text-sm font-semibold text-brand-blue"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(entry)}
                    aria-label={`Delete Testimonial from ${entry.author_name}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-surface-line text-ink-faint hover:text-brand-red"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <p className="mt-3 leading-relaxed text-ink-muted">
                {entry.quote}
              </p>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}
