import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase, isConfigured } from "@/lib/supabase";
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

    // getUser puts the stored token to the auth server, so the identity every
    // screen below trusts is one the server has verified rather than what the
    // browser happens to be holding.
    async function bootstrap() {
      const { data, error } = await supabase.auth.getUser();
      if (cancelled) return;
      setVerifiedUser(error ? null : (data.user ?? null));
      setLoading(false);
    }

    bootstrap();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, next) => {
        setSession(next);
        setVerifiedUser(next?.user ?? null);
      },
    );

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
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
    if (isConfigured) await supabase.auth.signOut();
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
