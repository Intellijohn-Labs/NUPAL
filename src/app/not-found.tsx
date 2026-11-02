import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-4xl">Page not found</h1>
      <p className="text-muted">The page you’re looking for has moved or no longer exists.</p>
      <Link href="/" className="btn-primary">Go to the homepage</Link>
    </div>
  );
}
