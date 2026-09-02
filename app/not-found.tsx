import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4EFFB] px-4">
      <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-[0_20px_60px_-15px_rgba(130,90,200,0.09)]">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-purple-600">404</p>
        <h1 className="font-serif text-3xl font-black text-slate-900">Page not found</h1>
        <p className="mt-3 text-sm text-slate-600">
          The page you are looking for does not exist or may have moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-95"
        >
          Back to home
        </Link>
      </div>
    </main>
  )
}
