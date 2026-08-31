import animate from "tailwindcss-animate";

/** Resolves a colour token from src/index.css, keeping the opacity modifier. */
const channel = (name) => `rgb(var(${name}) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          red: channel("--brand-red"),
          "red-deep": channel("--brand-red-deep"),
          "red-light": channel("--brand-red-light"),
          blue: channel("--brand-blue"),
          "blue-deep": channel("--brand-blue-deep"),
        },
        "on-accent": channel("--on-accent"),
        ink: {
          DEFAULT: channel("--ink"),
          muted: channel("--ink-muted"),
          faint: channel("--ink-faint"),
        },
        cost: {
          loan: channel("--cost-loan"),
          taxes: channel("--cost-taxes"),
          insurance: channel("--cost-insurance"),
          districts: channel("--cost-districts"),
        },
        surface: {
          DEFAULT: channel("--surface"),
          raised: channel("--surface-raised"),
          sunken: channel("--surface-sunken"),
          line: "var(--hairline)",
          "line-strong": "var(--hairline-strong)",
        },
      },
      fontFamily: {
        display: ["National Park", "Georgia", "serif"],
        sans: [
          "Work Sans",
          "Work Sans Fallback",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "var(--shadow-card)",
        lift: "var(--shadow-lift)",
      },
      transitionTimingFunction: {
        out: "var(--ease-out)",
        smooth: "var(--ease-in-out)",
        exit: "var(--ease-exit)",
      },
      transitionDuration: {
        instant: "var(--dur-instant)",
        fast: "var(--dur-fast)",
        base: "var(--dur-base)",
        slow: "var(--dur-slow)",
      },
      zIndex: {
        rail: "var(--z-rail)",
        chrome: "var(--z-chrome)",
        panel: "var(--z-panel)",
        effect: "var(--z-effect)",
      },
      height: {
        header: "var(--header-height)",
        banner: "var(--banner-height)",
      },
      spacing: {
        header: "var(--header-height)",
        banner: "var(--banner-height)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      maxWidth: {
        page: "76rem",
        measure: "var(--measure)",
      },
    },
  },
  plugins: [animate],
};
