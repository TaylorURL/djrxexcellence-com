import Seo from "@/components/app/Seo";
import AdminNav from "@/components/admin/AdminNav";

export default function AdminShell({ title, headerAction, counts, children }) {
  return (
    <div className="page-shell py-14">
      <Seo title={`${title} | Dashboard`} noindex />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-4xl font-semibold">{title}</h1>
        {headerAction}
      </div>
      <div className="mt-8">
        <AdminNav counts={counts} />
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
