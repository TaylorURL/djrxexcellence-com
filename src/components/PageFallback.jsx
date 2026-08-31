export default function PageFallback() {
  return (
    <div className="page-shell py-24" role="status" aria-busy="true">
      <span className="sr-only">Loading</span>
      <div aria-hidden="true" className="space-y-4">
        <div className="h-3 w-24 animate-pulse rounded-full bg-surface-sunken" />
        <div className="h-10 w-2/3 animate-pulse rounded-xl bg-surface-sunken" />
        <div className="h-4 w-1/2 animate-pulse rounded-full bg-surface-sunken" />
      </div>
      <div
        aria-hidden="true"
        className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {[0, 1, 2].map((key) => (
          <div
            key={key}
            className="h-72 animate-pulse rounded-2xl bg-surface-sunken"
          />
        ))}
      </div>
    </div>
  );
}
