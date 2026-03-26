export default function AccountLoading() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Heading placeholder */}
        <div className="animate-pulse">
          <div className="h-8 w-48 rounded bg-[#1A1A1A]" />
        </div>

        {/* Card with rows */}
        <div className="mt-8 animate-pulse rounded-xl border border-[#262626] bg-[#141414] p-6 space-y-5">
          <div className="h-4 w-3/4 rounded bg-[#1A1A1A]" />
          <div className="h-4 w-1/2 rounded bg-[#1A1A1A]" />
          <div className="h-4 w-2/3 rounded bg-[#1A1A1A]" />
          <div className="h-4 w-1/3 rounded bg-[#1A1A1A]" />
        </div>
      </div>
    </section>
  );
}
