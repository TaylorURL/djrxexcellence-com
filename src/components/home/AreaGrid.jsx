import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { areas } from "@/data/areas";

export default function AreaGrid({ limit }) {
  const shown = limit ? areas.slice(0, limit) : areas;

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {shown.map((area) => (
        <li key={area.slug}>
          <Link
            to={`/areas/${area.slug}`}
            className="group flex h-full flex-col gap-3 rounded-2xl border border-surface-line bg-surface p-5 transition-colors duration-fast ease-out hover:border-brand-red/40 hover:bg-surface-raised"
          >
            <div>
              <p className="font-display text-xl font-semibold">{area.name}</p>
              <p className="mt-1 text-sm text-ink-muted">
                {area.schoolDistrict}
              </p>
            </div>
            <p className="flex-1 text-sm leading-relaxed text-ink-muted">
              {area.county} · {area.zips.join(", ")}
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-red">
              Homes in {area.name}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-fast ease-out group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
