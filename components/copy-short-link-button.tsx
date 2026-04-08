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
      className="rounded-lg border border-cyan-300/35 bg-cyan-500/15 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-cyan-100 transition hover:bg-cyan-500/25"
    >
      {copied ? "Copiado" : "Copiar"}
    </button>
  );
}
