import Link from 'next/link'

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f7fb] px-6 text-[#18234b]">
      <section className="max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#243e9e]">
          Bluehouse Hub
        </p>
        <h1 className="mt-4 font-serif text-3xl font-bold">You’re offline</h1>
        <p className="mt-3 leading-7 text-slate-600">
          Check your internet connection and try again. Check-ins and other live
          attendance actions need a connection.
        </p>
        <Link
          className="mt-6 inline-flex rounded-full bg-[#243e9e] px-6 py-3 font-semibold text-white"
          href="/"
        >
          Try again
        </Link>
      </section>
    </main>
  )
}
