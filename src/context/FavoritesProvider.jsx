import { useCallback, useEffect, useMemo, useState } from "react";
import { isConfigured } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";
import {
  addFavorite,
  fetchFavoriteIds,
  removeFavorite,
} from "@/services/favorites";
import { FavoritesContext } from "@/context/FavoritesContext";

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [ids, setIds] = useState(() => new Set());
  const userId = user?.id ?? null;

  useEffect(() => {
    let cancelled = false;
    if (!isConfigured || !userId) {
      setIds(new Set());
      return undefined;
    }
    fetchFavoriteIds(userId)
      .then((next) => {
        if (!cancelled) setIds(next);
      })
      .catch(() => {
        if (!cancelled) setIds(new Set());
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const isSaved = useCallback((listingId) => ids.has(listingId), [ids]);

  const toggle = useCallback(
    async (listingId) => {
      if (!userId) return false;
      const saved = ids.has(listingId);
      setIds((current) => {
        const next = new Set(current);
        if (saved) next.delete(listingId);
        else next.add(listingId);
        return next;
      });
      try {
        if (saved) await removeFavorite(userId, listingId);
        else await addFavorite(userId, listingId);
        return !saved;
      } catch (error) {
        setIds((current) => {
          const next = new Set(current);
          if (saved) next.add(listingId);
          else next.delete(listingId);
          return next;
        });
        throw error;
      }
    },
    [ids, userId],
  );

  const value = useMemo(
    () => ({ ids, count: ids.size, isSaved, toggle }),
    [ids, isSaved, toggle],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}
