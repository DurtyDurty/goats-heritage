export default function EventsLoading() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-[#262626] bg-[#141414] overflow-hidden"
            >
              <div className="aspect-video bg-[#1A1A1A]" />
              <div className="p-4 space-y-3">
                <div className="h-3 w-1/3 rounded bg-[#1A1A1A]" />
                <div className="h-4 w-3/4 rounded bg-[#1A1A1A]" />
                <div className="h-3 w-1/2 rounded bg-[#1A1A1A]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
