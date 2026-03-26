import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-8xl font-bold text-[#C8A84E]">404</p>
      <h1 className="mt-4 text-3xl font-bold text-[#F5F5F5]">
        Page Not Found
      </h1>
      <p className="mt-3 max-w-md text-[#A3A3A3]">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center rounded-lg bg-[#C8A84E] px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#B8983E]"
      >
        Back to Home
      </Link>
    </div>
  );
}
