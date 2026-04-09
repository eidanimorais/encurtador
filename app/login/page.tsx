"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const callbackUrl = "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setIsLoading(false);

    if (!result || result.error) {
      setError("E-mail ou senha inválidos.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#060d16] bg-[radial-gradient(circle_at_30%_15%,rgba(8,145,178,0.2),transparent_40%),radial-gradient(circle_at_75%_80%,rgba(16,185,129,0.1),transparent_40%)] p-6 text-zinc-100">
      <section className="w-full max-w-sm rounded-2xl border border-cyan-400/20 bg-[#0b1320]/90 p-8 shadow-2xl backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
              <path d="M11 14a5 5 0 0 1 5-5h2.5a5 5 0 0 1 0 10H16" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/>
              <path d="M17 14a5 5 0 0 1-5 5H9.5a5 5 0 0 1 0-10H12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p className="text-xl font-bold tracking-tight text-white">ELO</p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">Encurtador de URL</p>
          </div>
        </div>
        <h2 className="mt-6 text-lg font-semibold text-zinc-100">Acessar painel</h2>
        <p className="mt-1 text-sm text-zinc-400">Entre com suas credenciais para continuar.</p>

        <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-400">E-mail</label>
            <input
              className="w-full rounded-xl border border-cyan-300/20 bg-[#071120] px-4 py-3 text-sm text-zinc-100 outline-none ring-cyan-300/30 placeholder:text-zinc-600 transition focus:ring"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-400">Senha</label>
            <input
              className="w-full rounded-xl border border-cyan-300/20 bg-[#071120] px-4 py-3 text-sm text-zinc-100 outline-none ring-cyan-300/30 placeholder:text-zinc-600 transition focus:ring"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error ? <p className="rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}

          <button
            className="w-full rounded-xl border border-emerald-300/40 bg-emerald-500/15 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-50"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}
