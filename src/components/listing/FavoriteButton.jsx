import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/lib/cn";

export default function FavoriteButton({
  listingId,
  className,
  showLabel = false,
}) {
  const { user } = useAuth();
  const { isSaved, toggle } = useFavorites();
  const navigate = useNavigate();
  const location = useLocation();
  const [busy, setBusy] = useState(false);
  const saved = isSaved(listingId);

  async function onClick(event) {
    event.preventDefault();
    event.stopPropagation();
    if (!user) {
      navigate("/sign-in", { state: { from: location.pathname } });
      return;
    }
    setBusy(true);
    try {
      await toggle(listingId);
    } catch {
      /* the provider rolls the optimistic change back */
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-pressed={saved}
      aria-label={saved ? "Remove from Saved Homes" : "Save This Home"}
      className={cn(
        "relative z-10 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-surface/90 text-ink shadow-card backdrop-blur transition-colors duration-fast ease-out hover:text-brand-red disabled:opacity-60",
        showLabel ? "px-3 text-sm font-semibold" : "w-9",
        className,
      )}
    >
      <Heart
        className={cn("h-4 w-4", saved && "fill-brand-red text-brand-red")}
        aria-hidden="true"
      />
      {showLabel ? (saved ? "Saved" : "Save Home") : null}
    </button>
  );
}
