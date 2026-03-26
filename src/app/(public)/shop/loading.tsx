export default function ShopLoading() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-[#262626] bg-[#141414] overflow-hidden"
            >
              <div className="aspect-square bg-[#1A1A1A]" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-2/3 rounded bg-[#1A1A1A]" />
                <div className="h-4 w-1/4 rounded bg-[#1A1A1A]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
