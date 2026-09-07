import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { requireClient, isConfigured } from "@/lib/supabase";
import Button from "@/components/ui/Button";
import Field, { inputClasses } from "@/components/ui/Field";
import Seo from "@/components/app/Seo";

export default function SignUp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    if (!isConfigured) {
      setError("Accounts are not connected yet.");
      setBusy(false);
      return;
    }
    const supabase = await requireClient();
    const { error: caught } = await supabase.auth.signUp({
      email: form.get("email"),
      password: form.get("password"),
      options: {
        data: { full_name: form.get("full_name") },
      },
    });
    setBusy(false);
    if (caught) setError(caught.message);
    else navigate(location.state?.from ?? "/", { replace: true });
  }

  return (
    <div className="page-shell max-w-md py-20">
      <Seo
        title="Create an Account"
        description="Create an account to save homes, save searches, and ask questions on any listing."
        noindex
      />
      <h1 className="font-display text-4xl font-semibold">Create an Account</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Save homes you like and ask questions on any listing.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <Field label="Full Name">
          <input
            name="full_name"
            required
            autoComplete="name"
            className={inputClasses}
          />
        </Field>
        <Field label="Email">
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className={inputClasses}
          />
        </Field>
        <Field label="Password" hint="At least 8 characters.">
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className={inputClasses}
          />
        </Field>
        {error ? (
          <p className="text-sm font-medium text-brand-red">{error}</p>
        ) : null}
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? "Creating Account" : "Create Account"}
        </Button>
      </form>
      <p className="mt-6 text-sm text-ink-muted">
        Already have one?{" "}
        <Link
          className="font-semibold text-brand-blue"
          to="/sign-in"
          state={location.state}
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
