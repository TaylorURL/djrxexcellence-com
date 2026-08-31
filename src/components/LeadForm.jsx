import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/lib/useAuth";
import { isConfigured } from "@/lib/supabase";
import { submitLead } from "@/services/leads";
import { contactPhone } from "@/config/site";
import Button from "@/components/ui/Button";
import { inputClasses, inputClassesDark } from "@/components/ui/Field";
import { cn } from "@/lib/cn";

const dark = inputClassesDark;
const light = inputClasses;

/**
 * One field, with its name on screen above it.
 *
 * A placeholder disappears the moment the field has content, which is exactly
 * when a person checking their own answers wants to know which box holds what.
 * The label carries that instead, and the tone follows the ground the form is
 * sitting on.
 */
function LabelledField({ label, tone, className, children }) {
  return (
    <label className={cn("block space-y-2", className)}>
      <span
        className={cn(
          "block text-sm font-semibold leading-tight",
          tone === "dark" ? "text-white/80" : "text-ink",
        )}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

export default function LeadForm({
  kind = "contact",
  listingId,
  theme = "light",
  submitLabel = "Send Message",
  addressField = false,
  messagePlaceholder = "What are you looking to do?",
  className,
}) {
  const { user, profile } = useAuth();
  const location = useLocation();
  const [state, setState] = useState("idle");
  const [error, setError] = useState("");
  const inputClass = theme === "dark" ? dark : light;
  const invalid = error ? "true" : undefined;

  async function onSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setState("sending");
    setError("");
    try {
      if (!isConfigured) {
        throw new Error(
          `This form is not connected yet. Call ${contactPhone} in the meantime.`,
        );
      }
      const parts = [];
      const address = form.get("property_address");
      if (address) parts.push(`Property: ${address}`);
      const note = form.get("message");
      if (note) parts.push(note);
      const message = parts.join("\n\n");

      await submitLead({
        kind,
        listing_id: listingId ?? null,
        user_id: user?.id ?? null,
        full_name: form.get("full_name"),
        email: form.get("email"),
        phone: form.get("phone") || null,
        message: message || null,
        source_path: location.pathname,
      });
      setState("sent");
    } catch (caught) {
      setError(caught.message);
      setState("idle");
    }
  }

  if (state === "sent") {
    return (
      <p
        className={cn(
          "rounded-xl border p-5 text-sm leading-relaxed",
          theme === "dark"
            ? "border-white/20 bg-white/10 text-white"
            : "border-surface-line bg-surface-raised text-ink",
          className,
        )}
      >
        Message sent. Dylan replies to everything that comes through here,
        usually the same day.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className={cn("space-y-3", className)}>
      <LabelledField label="Full Name" tone={theme}>
        <input
          name="full_name"
          required
          autoComplete="name"
          aria-invalid={invalid}
          defaultValue={profile?.full_name ?? ""}
          className={inputClass}
        />
      </LabelledField>

      <LabelledField label="Email" tone={theme}>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          aria-invalid={invalid}
          defaultValue={profile?.email ?? ""}
          className={inputClass}
        />
      </LabelledField>

      <LabelledField label="Phone" tone={theme}>
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          aria-invalid={invalid}
          defaultValue={profile?.phone ?? ""}
          className={inputClass}
        />
      </LabelledField>

      {addressField ? (
        <LabelledField label="Property Address" tone={theme}>
          <input
            name="property_address"
            autoComplete="street-address"
            aria-invalid={invalid}
            className={inputClass}
          />
        </LabelledField>
      ) : null}

      <LabelledField label="Message" tone={theme}>
        <textarea
          name="message"
          rows={3}
          aria-invalid={invalid}
          placeholder={messagePlaceholder}
          className={cn(inputClass, "h-auto py-3")}
        />
      </LabelledField>

      {error ? (
        <p
          role="alert"
          className={cn(
            "text-sm font-medium",
            theme === "dark" ? "text-white" : "text-brand-red",
          )}
        >
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={state === "sending"}
      >
        {state === "sending" ? "Sending" : submitLabel}
      </Button>
    </form>
  );
}
