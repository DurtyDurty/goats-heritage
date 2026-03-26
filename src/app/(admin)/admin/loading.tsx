export default function AdminLoading() {
  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-[#262626] bg-[#141414] p-6 space-y-3"
          >
            <div className="h-3 w-1/2 rounded bg-[#1A1A1A]" />
            <div className="h-8 w-2/3 rounded bg-[#1A1A1A]" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="animate-pulse rounded-xl border border-[#262626] bg-[#141414] p-6 space-y-4">
        <div className="h-5 w-40 rounded bg-[#1A1A1A]" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-4 w-1/4 rounded bg-[#1A1A1A]" />
            <div className="h-4 w-1/3 rounded bg-[#1A1A1A]" />
            <div className="h-4 w-1/6 rounded bg-[#1A1A1A]" />
            <div className="h-4 w-1/6 rounded bg-[#1A1A1A]" />
          </div>
        ))}
      </div>
    </div>
  );
}
