"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      className="rounded-lg border border-cyan-400/30 bg-[#111b2b] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-cyan-200 transition hover:border-cyan-300 hover:text-cyan-100"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Sair
    </button>
  );
}
