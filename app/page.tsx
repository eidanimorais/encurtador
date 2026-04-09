import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#060d16] bg-[radial-gradient(circle_at_10%_10%,rgba(8,145,178,0.18),transparent_38%),radial-gradient(circle_at_85%_80%,rgba(16,185,129,0.1),transparent_38%)] p-6 text-zinc-100">
      <section className="w-full max-w-lg rounded-2xl border border-cyan-400/20 bg-[#0b1320]/90 p-10 text-center shadow-2xl backdrop-blur">
        {/* Logo */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M11 14a5 5 0 0 1 5-5h2.5a5 5 0 0 1 0 10H16" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/>
            <path d="M17 14a5 5 0 0 1-5 5H9.5a5 5 0 0 1 0-10H12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/>
          </svg>
        </div>

        <h1 className="mt-5 text-3xl font-bold tracking-tight text-white">ELO</h1>
        <p className="mt-1 text-sm font-medium uppercase tracking-widest text-cyan-400/60">Encurtador de URL</p>
        <p className="mt-4 text-sm leading-relaxed text-zinc-400">
          Plataforma privada de encurtamento de links. A gestão fica no painel administrativo.
        </p>

        <Link
          className="mt-8 inline-flex items-center gap-2 rounded-xl border border-cyan-300/35 bg-cyan-500/15 px-6 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/25"
          href="/admin"
        >
          Abrir painel
        </Link>
      </section>
    </main>
  );
}
