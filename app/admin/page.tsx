import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";
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

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const data = await getDashboardData();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_5%_5%,#fef3c7_0,#fff7ed_35%,#f8fafc_100%)] p-6 text-zinc-900 lg:p-10">
      <section className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Painel do Encurtador</h1>
            <p className="mt-1 text-sm text-zinc-600">Crie, edite e acompanhe seus links em tempo real.</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="rounded-xl bg-white px-3 py-2 text-sm text-zinc-600">{session.user.email}</p>
            <SignOutButton />
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm text-zinc-600">Links criados</h2>
            <p className="mt-2 text-3xl font-semibold">{data.links.length}</p>
          </article>
          <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm text-zinc-600">Total de cliques</h2>
            <p className="mt-2 text-3xl font-semibold">{data.totalClicks}</p>
          </article>
          <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm text-zinc-600">Cliques (7 dias)</h2>
            <p className="mt-2 text-3xl font-semibold">{data.clicksLast7Days}</p>
          </article>
        </div>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Criar novo link</h2>
          <form action={createLinkAction} className="mt-4 grid gap-3 sm:grid-cols-3">
            <input
              name="destinationUrl"
              type="url"
              required
              placeholder="https://seu-destino.com/pagina"
              className="rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none ring-amber-200 focus:ring"
            />
            <input
              name="customSlug"
              type="text"
              placeholder="slug opcional (se vazio: auto 6 chars)"
              className="rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none ring-amber-200 focus:ring"
            />
            <button
              type="submit"
              className="rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700"
            >
              Criar link
            </button>
          </form>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Top países</h2>
            <ul className="mt-4 space-y-2 text-sm text-zinc-700">
              {data.topCountries.length === 0 ? <li>Nenhum dado ainda.</li> : null}
              {data.topCountries.map((item) => (
                <li key={item.country} className="flex items-center justify-between">
                  <span>{item.country}</span>
                  <strong>{item._count._all}</strong>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Top navegadores</h2>
            <ul className="mt-4 space-y-2 text-sm text-zinc-700">
              {data.topBrowsers.length === 0 ? <li>Nenhum dado ainda.</li> : null}
              {data.topBrowsers.map((item) => (
                <li key={item.browser} className="flex items-center justify-between">
                  <span>{item.browser}</span>
                  <strong>{item._count._all}</strong>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Seus links</h2>

          <div className="mt-4 space-y-4">
            {data.links.length === 0 ? (
              <p className="text-sm text-zinc-600">Nenhum link criado ainda.</p>
            ) : (
              data.links.map((link) => (
                <form
                  key={link.id}
                  action={updateLinkAction}
                  className="grid gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-12"
                >
                  <input type="hidden" name="linkId" value={link.id} />

                  <label className="space-y-1 sm:col-span-2">
                    <span className="text-xs font-medium text-zinc-600">Slug</span>
                    <input
                      name="slug"
                      defaultValue={link.slug}
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                    />
                  </label>

                  <label className="space-y-1 sm:col-span-7">
                    <span className="text-xs font-medium text-zinc-600">Destino</span>
                    <input
                      name="destinationUrl"
                      defaultValue={link.destinationUrl}
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                    />
                  </label>

                  <div className="sm:col-span-2">
                    <p className="text-xs text-zinc-500">Cliques</p>
                    <p className="text-sm font-semibold">{link._count.events}</p>
                    <p className="mt-1 text-xs text-zinc-500">Alterações: {link._count.historyItems}</p>
                  </div>

                  <button
                    type="submit"
                    className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 sm:col-span-1"
                  >
                    Salvar
                  </button>

                  <p className="text-xs text-zinc-500 sm:col-span-12">
                    Curto: <Link href={`/${link.slug}`}>{`/${link.slug}`}</Link>
                  </p>
                </form>
              ))
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
