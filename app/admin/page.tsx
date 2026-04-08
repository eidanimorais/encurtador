import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { CopyShortLinkButton } from "@/components/copy-short-link-button";
import { createLinkAction, updateLinkAction } from "./actions";

async function getDashboardData() {
  const [links, totalClicks, clicksLast7Days, topCountries, topBrowsers] = await Promise.all([
    prisma.link.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { events: true, historyItems: true } },
      },
    }),
    prisma.linkEvent.count(),
    prisma.linkEvent.count({ where: { clickedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
    prisma.linkEvent.groupBy({
      by: ["country"],
      _count: { _all: true },
      where: { country: { not: null } },
      orderBy: { _count: { country: "desc" } },
      take: 5,
    }),
    prisma.linkEvent.groupBy({
      by: ["browser"],
      _count: { _all: true },
      where: { browser: { not: null } },
      orderBy: { _count: { browser: "desc" } },
      take: 5,
    }),
  ]);

  return {
    links,
    totalClicks,
    clicksLast7Days,
    topCountries,
    topBrowsers,
  };
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value);
}

function StatCard({ title, value, accent }: { title: string; value: number; accent: "cyan" | "green" | "orange" | "pink" }) {
  const accentMap = {
    cyan: "border-cyan-400/35 text-cyan-300 shadow-[0_0_45px_-24px_rgba(34,211,238,0.9)]",
    green: "border-emerald-400/35 text-emerald-300 shadow-[0_0_45px_-24px_rgba(16,185,129,0.9)]",
    orange: "border-orange-400/35 text-orange-300 shadow-[0_0_45px_-24px_rgba(251,146,60,0.9)]",
    pink: "border-pink-400/35 text-pink-300 shadow-[0_0_45px_-24px_rgba(244,114,182,0.9)]",
  } as const;

  return (
    <article className={`rounded-2xl border bg-[#0d1826]/70 p-5 backdrop-blur ${accentMap[accent]}`}>
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">{title}</p>
      <p className="mt-3 text-4xl font-semibold leading-none">{value}</p>
    </article>
  );
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const data = await getDashboardData();
  type CountryMetric = { country: string | null; _count: { _all: number } };
  type BrowserMetric = { browser: string | null; _count: { _all: number } };
  type LinkRow = {
    id: string;
    slug: string;
    destinationUrl: string;
    createdAt: Date;
    _count: { events: number; historyItems: number };
  };

  const historyCount = data.links.reduce(
    (acc: number, link: { _count: { historyItems: number } }) => acc + link._count.historyItems,
    0,
  );

  return (
    <main className="min-h-screen bg-[#060d16] bg-[radial-gradient(circle_at_8%_0%,rgba(8,145,178,0.22),transparent_34%),radial-gradient(circle_at_90%_15%,rgba(16,185,129,0.12),transparent_34%)] px-4 py-6 text-zinc-100 sm:px-6 lg:px-10">
      <section className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-cyan-400/15 bg-[#0b1320]/80 p-4 backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/80">Painel Operacional</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-cyan-100">Encurtador de URL</h1>
          </div>
          <div className="flex items-center gap-2">
            <p className="rounded-lg border border-zinc-700 bg-[#111b2b] px-3 py-2 text-xs text-zinc-300">{session.user.email}</p>
            <SignOutButton />
          </div>
        </header>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Links criados" value={data.links.length} accent="cyan" />
          <StatCard title="Cliques totais" value={data.totalClicks} accent="green" />
          <StatCard title="Últimos 7 dias" value={data.clicksLast7Days} accent="orange" />
          <StatCard title="Alterações" value={historyCount} accent="pink" />
        </div>

        <section className="rounded-2xl border border-cyan-400/20 bg-[#0b1320]/85 p-4 backdrop-blur">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto]">
            <input
              type="text"
              placeholder="Buscar por slug, URL ou origem..."
              className="rounded-xl border border-cyan-300/20 bg-[#071120] px-4 py-3 text-sm text-zinc-100 outline-none ring-cyan-300/30 placeholder:text-zinc-500 focus:ring"
            />
            <select className="rounded-xl border border-cyan-300/20 bg-[#071120] px-4 py-3 text-sm text-zinc-200 outline-none ring-cyan-300/30 focus:ring">
              <option>Todos os links</option>
            </select>
            <div className="grid gap-2 sm:grid-cols-2">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl border border-emerald-300/35 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-400/20"
              >
                Ver Home
              </Link>
              <Link
                href="/admin"
                className="inline-flex items-center justify-center rounded-xl border border-cyan-300/35 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/20"
              >
                Atualizar
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-cyan-400/20 bg-[#0b1320]/85 p-5 backdrop-blur">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">Novo link</h2>
          <form action={createLinkAction} className="mt-4 grid gap-3 lg:grid-cols-[1fr_300px_180px]">
            <input
              name="destinationUrl"
              type="url"
              required
              placeholder="https://seu-destino.com/pagina"
              className="rounded-xl border border-cyan-300/20 bg-[#071120] px-4 py-3 text-sm text-zinc-100 outline-none ring-cyan-300/30 placeholder:text-zinc-500 focus:ring"
            />
            <input
              name="customSlug"
              type="text"
              placeholder="slug opcional"
              className="rounded-xl border border-cyan-300/20 bg-[#071120] px-4 py-3 text-sm text-zinc-100 outline-none ring-cyan-300/30 placeholder:text-zinc-500 focus:ring"
            />
            <button
              type="submit"
              className="rounded-xl border border-emerald-300/40 bg-emerald-500/15 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-emerald-100 transition hover:bg-emerald-500/25"
            >
              Criar link
            </button>
          </form>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <article className="rounded-2xl border border-cyan-400/20 bg-[#0b1320]/85 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">Top países</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {data.topCountries.length === 0 ? <li className="text-zinc-500">Nenhum dado ainda.</li> : null}
              {data.topCountries.map((item: CountryMetric) => (
                <li key={item.country} className="flex items-center justify-between rounded-lg border border-cyan-400/10 bg-[#081323] px-3 py-2">
                  <span className="text-zinc-300">{item.country}</span>
                  <strong className="text-cyan-200">{item._count._all}</strong>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-cyan-400/20 bg-[#0b1320]/85 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">Top navegadores</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {data.topBrowsers.length === 0 ? <li className="text-zinc-500">Nenhum dado ainda.</li> : null}
              {data.topBrowsers.map((item: BrowserMetric) => (
                <li key={item.browser} className="flex items-center justify-between rounded-lg border border-cyan-400/10 bg-[#081323] px-3 py-2">
                  <span className="text-zinc-300">{item.browser}</span>
                  <strong className="text-emerald-200">{item._count._all}</strong>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="rounded-2xl border border-cyan-400/20 bg-[#0b1320]/85 p-4 backdrop-blur">
          <h2 className="px-2 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">Tabela de links</h2>

          {data.links.length === 0 ? (
            <p className="px-2 py-6 text-sm text-zinc-500">Nenhum link criado ainda.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[1040px] border-separate border-spacing-0 text-sm">
                <thead>
                  <tr>
                    <th className="rounded-l-lg border-b border-cyan-400/20 bg-[#091627] px-3 py-3 text-left text-[11px] uppercase tracking-[0.18em] text-zinc-400">Slug</th>
                    <th className="border-b border-cyan-400/20 bg-[#091627] px-3 py-3 text-left text-[11px] uppercase tracking-[0.18em] text-zinc-400">Destino</th>
                    <th className="border-b border-cyan-400/20 bg-[#091627] px-3 py-3 text-left text-[11px] uppercase tracking-[0.18em] text-zinc-400">Cliques</th>
                    <th className="border-b border-cyan-400/20 bg-[#091627] px-3 py-3 text-left text-[11px] uppercase tracking-[0.18em] text-zinc-400">Alterações</th>
                    <th className="border-b border-cyan-400/20 bg-[#091627] px-3 py-3 text-left text-[11px] uppercase tracking-[0.18em] text-zinc-400">Criado em</th>
                    <th className="border-b border-cyan-400/20 bg-[#091627] px-3 py-3 text-left text-[11px] uppercase tracking-[0.18em] text-zinc-400">Link curto</th>
                    <th className="rounded-r-lg border-b border-cyan-400/20 bg-[#091627] px-3 py-3 text-left text-[11px] uppercase tracking-[0.18em] text-zinc-400">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {data.links.map((link: LinkRow) => (
                    <tr key={link.id} className="align-top">
                      <td colSpan={7} className="pt-3">
                        <form
                          action={updateLinkAction}
                          className="grid grid-cols-[190px_1fr_90px_110px_130px_260px_120px] gap-2 rounded-xl border border-cyan-400/15 bg-[#071120] p-2"
                        >
                          <input type="hidden" name="linkId" value={link.id} />
                          <input
                            name="slug"
                            defaultValue={link.slug}
                            className="rounded-lg border border-cyan-400/20 bg-[#0b1a2e] px-3 py-2 text-cyan-100 outline-none ring-cyan-300/30 focus:ring"
                          />
                          <input
                            name="destinationUrl"
                            defaultValue={link.destinationUrl}
                            className="rounded-lg border border-cyan-400/20 bg-[#0b1a2e] px-3 py-2 text-zinc-200 outline-none ring-cyan-300/30 focus:ring"
                          />
                          <div className="rounded-lg border border-cyan-400/20 bg-[#0b1a2e] px-3 py-2 font-semibold text-cyan-300">{link._count.events}</div>
                          <div className="rounded-lg border border-cyan-400/20 bg-[#0b1a2e] px-3 py-2 font-semibold text-pink-300">{link._count.historyItems}</div>
                          <div className="rounded-lg border border-cyan-400/20 bg-[#0b1a2e] px-3 py-2 text-zinc-300">{formatDate(link.createdAt)}</div>
                          <div className="flex gap-2">
                            <input
                              readOnly
                              value={`/${link.slug}`}
                              className="w-full rounded-lg border border-cyan-400/20 bg-[#0b1a2e] px-3 py-2 text-cyan-100"
                            />
                            <CopyShortLinkButton slug={link.slug} />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="submit"
                              className="rounded-lg border border-emerald-300/35 bg-emerald-500/15 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-100 transition hover:bg-emerald-500/25"
                            >
                              Salvar
                            </button>
                            <Link
                              href={`/${link.slug}`}
                              className="rounded-lg border border-cyan-300/35 bg-cyan-500/15 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-cyan-100 transition hover:bg-cyan-500/25"
                            >
                              Abrir
                            </Link>
                          </div>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
