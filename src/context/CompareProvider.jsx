import { useCallback, useEffect, useMemo, useState } from "react";
import { CompareContext } from "@/context/CompareContext";

const STORAGE_KEY = "dj-compare";
export const COMPARE_LIMIT = 4;

function read() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.slice(0, COMPARE_LIMIT) : [];
  } catch {
    return [];
  }
}

export function CompareProvider({ children }) {
  const [ids, setIds] = useState(read);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      /* storage is unavailable in private windows; comparison stays in memory */
    }
  }, [ids]);

  const toggle = useCallback((id) => {
    setIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= COMPARE_LIMIT) return current;
      return [...current, id];
    });
  }, []);

  const remove = useCallback((id) => {
    setIds((current) => current.filter((item) => item !== id));
  }, []);

  const clear = useCallback(() => setIds([]), []);

  const value = useMemo(
    () => ({
      ids,
      count: ids.length,
      isFull: ids.length >= COMPARE_LIMIT,
      has: (id) => ids.includes(id),
      toggle,
      remove,
      clear,
    }),
    [ids, toggle, remove, clear],
  );

  return (
    <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
  );
}
