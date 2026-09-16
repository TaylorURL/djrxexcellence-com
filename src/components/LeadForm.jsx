import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { isConfigured } from "@/lib/supabase";
import { submitLead } from "@/services/leads";
import { contactPhone } from "@/config/site";
import Button from "@/components/ui/Button";
import Field, { inputClasses, textareaClasses } from "@/components/ui/Field";
import { cn } from "@/lib/cn";

export default function LeadForm({
  kind = "contact",
  listingId,
  submitLabel = "Send Message",
  addressField = false,
  messagePlaceholder = "What are you looking to do?",
  className,
}) {
  const { user, profile } = useAuth();
  const location = useLocation();
  const [state, setState] = useState("idle");
  const [error, setError] = useState("");
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
          "rounded-xl border border-surface-line bg-surface-raised p-5 text-sm leading-relaxed text-ink",
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
      <Field label="Full Name">
        <input
          name="full_name"
          required
          autoComplete="name"
          aria-invalid={invalid}
          defaultValue={profile?.full_name ?? ""}
          className={inputClasses}
        />
      </Field>

      <Field label="Email">
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          aria-invalid={invalid}
          defaultValue={profile?.email ?? ""}
          className={inputClasses}
        />
      </Field>

      <Field label="Phone">
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          aria-invalid={invalid}
          defaultValue={profile?.phone ?? ""}
          className={inputClasses}
        />
      </Field>

      {addressField ? (
        <Field label="Property Address">
          <input
            name="property_address"
            autoComplete="street-address"
            aria-invalid={invalid}
            className={inputClasses}
          />
        </Field>
      ) : null}

      <Field label="Message">
        <textarea
          name="message"
          rows={3}
          aria-invalid={invalid}
          placeholder={messagePlaceholder}
          className={textareaClasses}
        />
      </Field>

      {error ? (
        <p role="alert" className="text-sm font-medium text-brand-red">
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
