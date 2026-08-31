import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Mail, Phone, Undo2 } from "lucide-react";
import { fetchLeads, saveLeadNotes, setLeadHandled } from "@/services/leads";
import { relativeDate } from "@/lib/format";
import PageFallback from "@/components/PageFallback";
import AdminShell from "@/components/admin/AdminShell";
import { inputClasses } from "@/components/ui/Field";
import { cn } from "@/lib/cn";

const KIND_LABELS = {
  contact: "Contact Form",
  hero: "Home Page",
  valuation: "Valuation Request",
  showing: "Showing Request",
  area: "Area Question",
};

const scopes = [
  { value: "open", label: "Needs a Reply" },
  { value: "handled", label: "Handled" },
  { value: "all", label: "All" },
];

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState("open");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLeads()
      .then(setLeads)
      .catch((caught) => setError(caught.message))
      .finally(() => setLoading(false));
  }, []);

  const shown = useMemo(() => {
    if (scope === "open") return leads.filter((lead) => !lead.is_handled);
    if (scope === "handled") return leads.filter((lead) => lead.is_handled);
    return leads;
  }, [leads, scope]);

  const openCount = leads.filter((lead) => !lead.is_handled).length;

  async function toggleHandled(lead) {
    setError("");
    try {
      const updated = await setLeadHandled(lead.id, !lead.is_handled);
      setLeads((rows) =>
        rows.map((row) => (row.id === lead.id ? { ...row, ...updated } : row)),
      );
    } catch (caught) {
      setError(caught.message);
    }
  }

  async function onNotesBlur(lead, value) {
    if (value === (lead.agent_notes ?? "")) return;
    try {
      await saveLeadNotes(lead.id, value || null);
      setLeads((rows) =>
        rows.map((row) =>
          row.id === lead.id ? { ...row, agent_notes: value || null } : row,
        ),
      );
    } catch (caught) {
      setError(caught.message);
    }
  }

  if (loading) return <PageFallback />;

  return (
    <AdminShell title="Leads" counts={{ Leads: openCount }}>
      {error ? (
        <p className="mb-4 rounded-xl border border-brand-red/30 bg-brand-red/5 p-3 text-sm font-medium text-brand-red">
          {error}
        </p>
      ) : null}

      <div
        role="group"
        aria-label="Lead Scope"
        className="mb-6 inline-flex rounded-xl border border-surface-line bg-surface p-1"
      >
        {scopes.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setScope(option.value)}
            aria-pressed={scope === option.value}
            className={cn(
              "h-9 rounded-lg px-3.5 text-sm font-semibold transition-colors duration-fast ease-out",
              scope === option.value
                ? "bg-brand-blue text-white"
                : "text-ink-muted hover:text-ink",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="rounded-2xl border border-surface-line bg-surface-raised p-8 text-ink-muted">
          {scope === "open"
            ? "Nothing waiting on a reply."
            : "No leads in this view."}
        </p>
      ) : (
        <ul className="space-y-4">
          {shown.map((lead) => (
            <li
              key={lead.id}
              className={cn(
                "arrive rounded-2xl border p-5",
                lead.is_handled
                  ? "border-surface-line bg-surface-raised"
                  : "border-brand-red/30 bg-surface",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-display text-lg font-semibold">
                    {lead.full_name}
                  </p>
                  <p className="mt-0.5 text-sm text-ink-muted">
                    {KIND_LABELS[lead.kind] ?? lead.kind} ·{" "}
                    {relativeDate(lead.created_at)}
                    {lead.source_path ? ` · ${lead.source_path}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleHandled(lead)}
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition-colors duration-fast ease-out",
                    lead.is_handled
                      ? "border border-surface-line text-ink-muted hover:text-ink"
                      : "bg-brand-red text-white hover:bg-brand-red-deep",
                  )}
                >
                  {lead.is_handled ? (
                    <>
                      <Undo2 className="h-4 w-4" aria-hidden="true" />
                      Reopen
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" aria-hidden="true" />
                      Mark Handled
                    </>
                  )}
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <a
                  className="inline-flex items-center gap-1.5 font-semibold text-brand-blue"
                  href={`mailto:${lead.email}`}
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  {lead.email}
                </a>
                {lead.phone ? (
                  <a
                    className="inline-flex items-center gap-1.5 font-semibold text-brand-blue"
                    href={`tel:${lead.phone}`}
                  >
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    {lead.phone}
                  </a>
                ) : null}
                {lead.listings ? (
                  <Link
                    className="font-semibold text-ink-muted hover:text-ink"
                    to={`/listings/${lead.listings.slug}`}
                  >
                    {lead.listings.street_address ?? lead.listings.title}
                  </Link>
                ) : null}
              </div>

              {lead.message ? (
                <p className="mt-3 whitespace-pre-line rounded-xl bg-surface-sunken p-3 text-sm leading-relaxed text-ink-muted">
                  {lead.message}
                </p>
              ) : null}

              <label className="mt-3 block">
                <span className="sr-only">Notes</span>
                <input
                  defaultValue={lead.agent_notes ?? ""}
                  onBlur={(event) =>
                    onNotesBlur(lead, event.target.value.trim())
                  }
                  placeholder="Notes for yourself"
                  className={cn(inputClasses, "h-9 text-sm")}
                />
              </label>

              {lead.handled_at ? (
                <p className="mt-2 text-xs text-ink-faint">
                  Handled {relativeDate(lead.handled_at)}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}
