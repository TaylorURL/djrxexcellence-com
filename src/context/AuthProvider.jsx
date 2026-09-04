import { useCallback, useEffect, useMemo, useState } from "react";
import { getClient, isConfigured } from "@/lib/supabase";
import { AuthContext } from "@/context/AuthContext";
import { fetchProfile } from "@/services/profiles";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [verifiedUser, setVerifiedUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(isConfigured);

  useEffect(() => {
    if (!isConfigured) return undefined;
    let cancelled = false;
    let subscription = null;

    // getUser puts the stored token to the auth server, so the identity every
    // screen below trusts is one the server has verified rather than what the
    // browser happens to be holding. The client arrives a moment after mount
    // now, so the listener is attached first and the verification made against
    // the same instance, leaving no window where a state change goes unheard.
    async function bootstrap() {
      const client = await getClient();
      if (!client) return;
      const { data: listener } = client.auth.onAuthStateChange(
        (_event, next) => {
          setSession(next);
          setVerifiedUser(next?.user ?? null);
        },
      );
      subscription = listener.subscription;
      if (cancelled) {
        subscription.unsubscribe();
        return;
      }
      const { data, error } = await client.auth.getUser();
      if (cancelled) return;
      setVerifiedUser(error ? null : (data.user ?? null));
      setLoading(false);
    }

    bootstrap();

    return () => {
      cancelled = true;
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const userId = verifiedUser?.id ?? null;

  const refreshProfile = useCallback(async () => {
    if (!isConfigured || !userId) {
      setProfile(null);
      return null;
    }
    const next = await fetchProfile(userId).catch(() => null);
    setProfile(next);
    return next;
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    if (!isConfigured || !userId) {
      setProfile(null);
      return undefined;
    }
    fetchProfile(userId)
      .then((next) => {
        if (!cancelled) setProfile(next);
      })
      .catch(() => {
        if (!cancelled) setProfile(null);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const signOut = useCallback(async () => {
    const client = await getClient();
    if (client) await client.auth.signOut();
    setSession(null);
    setVerifiedUser(null);
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: verifiedUser,
      profile,
      role: profile?.role ?? "member",
      isAgent: profile?.role === "agent",
      loading,
      refreshProfile,
      signOut,
    }),
    [session, verifiedUser, profile, loading, refreshProfile, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
