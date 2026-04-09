import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { CopyShortLinkButton } from "@/components/copy-short-link-button";
import { createLinkAction, updateLinkAction } from "./actions";
import {
  ClicksAreaChart,
  BrowserBars,
  DeviceBars,
  OsBars,
  CountryBars,
  type DailyClick,
  type MetricItem,
} from "@/components/dashboard-charts";

// ── Data ──────────────────────────────────────────────────────────────────────
async function getDashboardData() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo  = new Date(Date.now() -  7 * 24 * 60 * 60 * 1000);
  const todayStart    = new Date(); todayStart.setHours(0, 0, 0, 0);

  const [links, totalClicks, recentEvents] = await Promise.all([
    prisma.link.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { events: true, historyItems: true } } },
    }),
    prisma.linkEvent.count(),
    prisma.linkEvent.findMany({
      where: { clickedAt: { gte: thirtyDaysAgo } },
      select: { clickedAt: true, browser: true, device: true, os: true, country: true },
      orderBy: { clickedAt: "asc" },
    }),
  ]);

  // ── Daily clicks (last 30 days) ──────────────────────────────────────────
  const eventsByDay = new Map<string, number>();
  for (const e of recentEvents) {
    const key = e.clickedAt.toISOString().slice(0, 10);
    eventsByDay.set(key, (eventsByDay.get(key) ?? 0) + 1);
  }
  const dailyClicks: DailyClick[] = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const iso = d.toISOString().slice(0, 10);
    return {
      date: new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(
        new Date(iso + "T12:00:00"),
      ),
      count: eventsByDay.get(iso) ?? 0,
    };
  });

  // ── Derived counts ────────────────────────────────────────────────────────
  function toRanked(map: Map<string, number>, top = 5): MetricItem[] {
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, top);
  }

  const browserMap  = new Map<string, number>();
  const deviceMap   = new Map<string, number>();
  const osMap       = new Map<string, number>();
  const countryMap  = new Map<string, number>();

  for (const e of recentEvents) {
    if (e.browser) browserMap.set(e.browser,  (browserMap.get(e.browser)   ?? 0) + 1);
    const dev = e.device || "Desktop";
    deviceMap.set(dev, (deviceMap.get(dev) ?? 0) + 1);
    if (e.os)      osMap.set(e.os,           (osMap.get(e.os)             ?? 0) + 1);
    if (e.country) countryMap.set(e.country, (countryMap.get(e.country)   ?? 0) + 1);
  }

  const clicksLast7  = recentEvents.filter((e) => e.clickedAt >= sevenDaysAgo).length;
  const clicksToday  = recentEvents.filter((e) => e.clickedAt >= todayStart).length;
  const historyCount = links.reduce((acc, l) => acc + l._count.historyItems, 0);

  return {
    links,
    totalClicks,
    clicksLast7,
    clicksToday,
    historyCount,
    dailyClicks,
    topBrowsers:  toRanked(browserMap),
    topDevices:   toRanked(deviceMap),
    topOs:        toRanked(osMap),
    topCountries: toRanked(countryMap),
  };
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(value);
}

// ── Logo ──────────────────────────────────────────────────────────────────────
function EloLogo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path d="M11 14a5 5 0 0 1 5-5h2.5a5 5 0 0 1 0 10H16" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M17 14a5 5 0 0 1-5 5H9.5a5 5 0 0 1 0-10H12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
type AccentKey = "cyan" | "green" | "orange" | "pink";
const accents: Record<AccentKey, { icon: string; val: string; border: string; sub: string }> = {
  cyan:   { icon: "bg-cyan-400/15   text-cyan-300",    val: "text-cyan-300",    border: "border-cyan-400/20",   sub: "text-cyan-400/60"   },
  green:  { icon: "bg-emerald-400/15 text-emerald-300", val: "text-emerald-300", border: "border-emerald-400/20", sub: "text-emerald-400/60" },
  orange: { icon: "bg-orange-400/15  text-orange-300",  val: "text-orange-300",  border: "border-orange-400/20",  sub: "text-orange-400/60"  },
  pink:   { icon: "bg-pink-400/15    text-pink-300",    val: "text-pink-300",    border: "border-pink-400/20",    sub: "text-pink-400/60"    },
};

function StatCard({
  title, value, sub, accent, icon,
}: {
  title: string; value: number; sub?: string; accent: AccentKey; icon: React.ReactNode;
}) {
  const s = accents[accent];
  return (
    <article className={`flex items-center gap-4 rounded-2xl border ${s.border} bg-[#0d1826]/70 p-5 backdrop-blur`}>
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${s.icon}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-medium tracking-wider text-zinc-500">{title}</p>
        <p className={`mt-1 text-3xl font-bold leading-none ${s.val}`}>{value}</p>
        {sub && <p className={`mt-1 text-[11px] ${s.sub}`}>{sub}</p>}
      </div>
    </article>
  );
}

// ── Section card ──────────────────────────────────────────────────────────────
function Card({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <article className={`rounded-2xl border border-cyan-400/15 bg-[#0b1320]/85 p-5 backdrop-blur ${className}`}>
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">{title}</p>
      {children}
    </article>
  );
}

// ── Inline SVG icons ──────────────────────────────────────────────────────────
const IcoLink     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
const IcoClick    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51z"/><path d="M13 13l6 6"/></svg>;
const IcoCalendar = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
const IcoEdit     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>;
const IcoRefresh  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>;
const IcoHome     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21V12h6v9"/></svg>;
const IcoPlus     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>;

// ── Links table grid ──────────────────────────────────────────────────────────
const COL = "grid-cols-[minmax(0,150px)_1fr_72px_80px_110px_minmax(0,176px)_192px]";

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const d = await getDashboardData();

  type LinkRow = {
    id: string; slug: string; destinationUrl: string; createdAt: Date;
    _count: { events: number; historyItems: number };
  };

  return (
    <main className="min-h-screen bg-[#060d16] bg-[radial-gradient(circle_at_8%_0%,rgba(8,145,178,0.2),transparent_34%),radial-gradient(circle_at_90%_15%,rgba(16,185,129,0.1),transparent_34%)] px-4 py-5 text-zinc-100 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-5">

        {/* ── Header ────────────────────────────────────────────────── */}
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-cyan-400/15 bg-[#0b1320]/80 px-5 py-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
              <EloLogo />
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight text-white">ELO</p>
              <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                Encurtador de URL&nbsp;•&nbsp;Painel Admin
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-1.5 rounded-xl border border-zinc-700/60 bg-zinc-800/50 px-3.5 py-2 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-700/50">
              <IcoHome /> Home
            </Link>
            <span className="text-sm text-zinc-500">{session.user.email}</span>
            <SignOutButton />
          </div>
        </header>

        {/* ── Stats ──────────────────────────────────────────────────── */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total de links"  value={d.links.length}  accent="cyan"   icon={<IcoLink />}     sub={`${d.links.length === 1 ? "1 link ativo" : `${d.links.length} links ativos`}`} />
          <StatCard title="Cliques totais"  value={d.totalClicks}   accent="green"  icon={<IcoClick />}    sub={`${d.clicksToday} hoje`} />
          <StatCard title="Últimos 7 dias"  value={d.clicksLast7}   accent="orange" icon={<IcoCalendar />} sub="cliques nos últimos 7 dias" />
          <StatCard title="Alterações"      value={d.historyCount}  accent="pink"   icon={<IcoEdit />}     sub="edições de destino" />
        </div>

        {/* ── Area chart ─────────────────────────────────────────────── */}
        <Card title="Cliques por dia — últimos 30 dias">
          <ClicksAreaChart data={d.dailyClicks} />
        </Card>

        {/* ── Distribution row ───────────────────────────────────────── */}
        <div className="grid gap-4 lg:grid-cols-4">
          <Card title="Países">
            <CountryBars data={d.topCountries} />
          </Card>
          <Card title="Navegadores">
            <BrowserBars data={d.topBrowsers} />
          </Card>
          <Card title="Dispositivos">
            <DeviceBars data={d.topDevices} />
          </Card>
          <Card title="Sistemas">
            <OsBars data={d.topOs} />
          </Card>
        </div>

        {/* ── New link ────────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-cyan-400/15 bg-[#0b1320]/85 p-5 backdrop-blur">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Novo link</p>
          <form action={createLinkAction} className="grid gap-3 lg:grid-cols-[1fr_260px_148px]">
            <input
              name="destinationUrl" type="url" required
              placeholder="https://destino.com/pagina"
              className="rounded-xl border border-cyan-300/15 bg-[#071120] px-4 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 transition focus:border-cyan-400/40"
            />
            <input
              name="customSlug" type="text"
              placeholder="slug personalizado (opcional)"
              className="rounded-xl border border-cyan-300/15 bg-[#071120] px-4 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 transition focus:border-cyan-400/40"
            />
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-2.5 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/25"
            >
              <IcoPlus /> Criar link
            </button>
          </form>
        </section>

        {/* ── Links table ─────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-cyan-400/15 bg-[#0b1320]/85 backdrop-blur">
          <div className="flex items-center justify-between border-b border-cyan-400/10 px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
              Links&nbsp;
              <span className="ml-1 rounded-md border border-cyan-400/20 bg-cyan-400/10 px-1.5 py-0.5 text-[10px] text-cyan-400">
                {d.links.length}
              </span>
            </p>
            <Link href="/admin" className="flex items-center gap-1.5 rounded-xl border border-zinc-700/50 bg-zinc-800/40 px-3 py-1.5 text-xs font-semibold text-zinc-400 transition hover:bg-zinc-700/40">
              <IcoRefresh /> Atualizar
            </Link>
          </div>

          <div className="p-4">
            {d.links.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-600">Nenhum link criado ainda.</p>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[900px] space-y-1.5">
                  {/* Column headers */}
                  <div className={`grid ${COL} gap-2 px-3 py-1.5`}>
                    {["Slug", "Destino", "Cliques", "Alts.", "Criado em", "Link curto", "Ações"].map((h) => (
                      <span key={h} className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">{h}</span>
                    ))}
                  </div>
                  {/* Rows */}
                  {d.links.map((link: LinkRow) => (
                    <form
                      key={link.id}
                      action={updateLinkAction}
                      className={`grid ${COL} items-center gap-2 rounded-xl border border-cyan-400/10 bg-[#071120] p-2 transition hover:border-cyan-400/20 hover:bg-[#081525]`}
                    >
                      <input type="hidden" name="linkId" value={link.id} />
                      <input
                        name="slug" defaultValue={link.slug}
                        className="rounded-lg border border-cyan-400/15 bg-[#0b1a2e] px-3 py-2 text-sm text-cyan-100 outline-none transition focus:border-cyan-400/40"
                      />
                      <input
                        name="destinationUrl" defaultValue={link.destinationUrl}
                        className="rounded-lg border border-cyan-400/15 bg-[#0b1a2e] px-3 py-2 text-sm text-zinc-300 outline-none transition focus:border-cyan-400/40"
                      />
                      <div className="rounded-lg border border-cyan-400/10 bg-[#0b1a2e] px-3 py-2 text-center text-sm font-bold text-cyan-300">
                        {link._count.events}
                      </div>
                      <div className="rounded-lg border border-pink-400/10 bg-[#0b1a2e] px-3 py-2 text-center text-sm font-bold text-pink-300">
                        {link._count.historyItems}
                      </div>
                      <div className="rounded-lg border border-cyan-400/10 bg-[#0b1a2e] px-3 py-2 text-sm text-zinc-500">
                        {formatDate(link.createdAt)}
                      </div>
                      <CopyShortLinkButton slug={link.slug} />
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="submit"
                          className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                        >
                          Salvar
                        </button>
                        <Link
                          href={`/${link.slug}`} target="_blank"
                          className="rounded-lg border border-zinc-600/40 bg-zinc-700/20 px-3 py-2 text-center text-xs font-semibold text-zinc-400 transition hover:bg-zinc-600/30"
                        >
                          Abrir
                        </Link>
                      </div>
                    </form>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

      </div>
    </main>
  );
}
