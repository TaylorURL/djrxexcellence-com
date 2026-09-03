import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";

const variants = {
  primary: "bg-brand-red text-on-accent shadow-card hover:bg-brand-red-deep",
  navy: "bg-brand-blue text-on-accent shadow-card hover:bg-brand-blue-deep",
  outline:
    "border border-surface-line bg-surface text-ink hover:border-ink/30 hover:bg-surface-raised",
  ghost: "text-ink hover:bg-surface-sunken",
};

const sizes = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export default function Button({
  as,
  to,
  href,
  variant = "primary",
  size = "md",
  className,
  ...props
}) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors duration-fast ease-out disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );

  if (to) return <Link to={to} className={classes} {...props} />;
  if (href) return <a href={href} className={classes} {...props} />;

  const Component = as ?? "button";
  return <Component className={classes} {...props} />;
}
