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
      setError("Credenciais inválidas.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_25%_20%,#facc15_0,#fef9c3_30%,#f8fafc_100%)] p-6 text-zinc-900">
      <section className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white/80 p-8 shadow-xl backdrop-blur">
        <h1 className="text-3xl font-semibold tracking-tight">Acessar Painel</h1>
        <p className="mt-2 text-sm text-zinc-600">Entre com seu usuário para gerenciar os links.</p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-2 text-sm font-medium">
            <span>E-mail</span>
            <input
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none ring-amber-200 transition focus:ring"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="block space-y-2 text-sm font-medium">
            <span>Senha</span>
            <input
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none ring-amber-200 transition focus:ring"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
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
