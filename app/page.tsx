import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_10%_10%,#fef3c7_0,#fff7ed_32%,#f8fafc_100%)] p-6 text-zinc-900">
      <section className="w-full max-w-2xl rounded-3xl border border-zinc-200 bg-white/80 p-10 text-center shadow-xl backdrop-blur">
        <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">Encurtador Privado</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">Seu redirecionador está no ar</h1>
        <p className="mt-4 text-zinc-600">
          Essa página fica vazia para slugs inexistentes. A gestão dos links fica no painel administrativo.
        </p>
        <Link
          className="mt-8 inline-flex rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700"
          href="/admin"
        >
          Abrir painel
        </Link>
      </section>
    </main>
  );
}
