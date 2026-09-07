import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { requireClient, isConfigured } from "@/lib/supabase";
import Button from "@/components/ui/Button";
import Field, { inputClasses } from "@/components/ui/Field";
import Seo from "@/components/app/Seo";

export default function SignIn() {
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
    const { error: caught } = await supabase.auth.signInWithPassword({
      email: form.get("email"),
      password: form.get("password"),
    });
    setBusy(false);
    if (caught) setError(caught.message);
    else navigate(location.state?.from ?? "/", { replace: true });
  }

  return (
    <div className="page-shell max-w-md py-20">
      <Seo
        title="Sign In"
        description="Sign in to reach your saved homes, saved searches and the questions you have asked on a listing."
        noindex
      />
      <h1 className="font-display text-4xl font-semibold">Sign In</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Saved homes and your questions on listings live in your account.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <Field label="Email">
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className={inputClasses}
          />
        </Field>
        <Field label="Password">
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className={inputClasses}
          />
        </Field>
        {error ? (
          <p className="text-sm font-medium text-brand-red">{error}</p>
        ) : null}
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? "Signing In" : "Sign In"}
        </Button>
      </form>
      <p className="mt-6 text-sm text-ink-muted">
        No account yet?{" "}
        <Link
          className="font-semibold text-brand-blue"
          to="/sign-up"
          state={location.state}
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
