import { Moon, Sun, SunMedium } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/cn";

const faces = {
  light: { Icon: Sun, next: "Gray" },
  gray: { Icon: SunMedium, next: "Dark" },
  dark: { Icon: Moon, next: "Light" },
};

/**
 * The one control that moves the page between its three grounds.
 *
 * It is a cycle rather than a group of three, because the choice is worth one
 * hit target in a footer and never worth three. The label names where the next
 * press lands, so a screen reader is told the outcome instead of the state it
 * can already read off the page.
 */
export default function ThemeControl({ className }) {
  const { theme, cycle } = useTheme();
  const { Icon, next } = faces[theme] ?? faces.light;

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Switch To ${next}`}
      className={cn(
        "inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-xl border border-surface-line px-3 text-sm font-semibold text-ink transition-colors duration-fast ease-out hover:bg-surface-raised",
        className,
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {next}
    </button>
  );
}
