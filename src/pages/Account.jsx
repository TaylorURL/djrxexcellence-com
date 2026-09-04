import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/useAuth";
import { requireClient } from "@/lib/supabase";
import { updateProfile } from "@/services/profiles";
import AccountShell from "@/components/account/AccountShell";
import Button from "@/components/ui/Button";
import Field, { inputClasses } from "@/components/ui/Field";

export default function Account() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState("");

  async function onSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setStatus("");
    setError("");
    try {
      await updateProfile(user.id, {
        full_name: form.get("full_name").trim(),
        phone: form.get("phone").trim() || null,
      });
      await refreshProfile();
      setStatus("Saved");
    } catch (caught) {
      setError(caught.message);
    } finally {
      setBusy(false);
    }
  }

  async function onPasswordSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = form.get("password");
    setPasswordStatus("");
    const supabase = await requireClient();
    const { error: caught } = await supabase.auth.updateUser({ password });
    setPasswordStatus(caught ? caught.message : "Password updated");
    if (!caught) event.currentTarget.reset();
  }

  async function onSignOut() {
    await signOut();
    navigate("/", { replace: true });
  }

  return (
    <AccountShell title="Profile">
      <div className="grid max-w-3xl gap-10 lg:grid-cols-2">
        <form onSubmit={onSubmit} className="space-y-4">
          <h2 className="font-display text-xl font-semibold">Your Details</h2>
          <Field
            label="Full Name"
            hint="This shows next to questions you post."
          >
            <input
              name="full_name"
              defaultValue={profile?.full_name ?? ""}
              autoComplete="name"
              className={inputClasses}
            />
          </Field>
          <Field label="Phone">
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              defaultValue={profile?.phone ?? ""}
              className={inputClasses}
            />
          </Field>
          <Field label="Email" hint="Contact the office to change your email.">
            <input
              value={user.email}
              readOnly
              className={`${inputClasses} bg-surface-sunken`}
            />
          </Field>
          {error ? (
            <p className="text-sm font-medium text-brand-red">{error}</p>
          ) : null}
          {status ? (
            <p className="text-sm font-semibold text-brand-blue">{status}</p>
          ) : null}
          <Button type="submit" disabled={busy}>
            {busy ? "Saving" : "Save Changes"}
          </Button>
        </form>

        <div className="space-y-10">
          <form onSubmit={onPasswordSubmit} className="space-y-4">
            <h2 className="font-display text-xl font-semibold">Password</h2>
            <Field label="New Password" hint="At least 8 characters.">
              <input
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className={inputClasses}
              />
            </Field>
            {passwordStatus ? (
              <p className="text-sm font-semibold text-ink-muted">
                {passwordStatus}
              </p>
            ) : null}
            <Button type="submit" variant="outline">
              Update Password
            </Button>
          </form>

          <div className="space-y-3 border-t border-surface-line pt-6">
            <h2 className="font-display text-xl font-semibold">Session</h2>
            <p className="text-sm text-ink-muted">
              Signing out clears this browser. Your saved homes and searches
              stay on the account.
            </p>
            <Button variant="outline" onClick={onSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </AccountShell>
  );
}
