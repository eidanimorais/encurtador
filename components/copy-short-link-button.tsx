"use client";

import { useState } from "react";

export function CopyShortLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const shortUrl = `${window.location.origin}/${slug}`;
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copiar link curto"
      className="flex w-full items-center gap-2 rounded-lg border border-cyan-400/20 bg-[#0b1a2e] px-3 py-2 text-left transition hover:border-cyan-400/40 hover:bg-cyan-400/5"
    >
      <span className="flex-1 truncate font-mono text-xs text-cyan-300">/{slug}</span>
      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
        {copied ? "✓" : "Copiar"}
      </span>
    </button>
  );
}
