"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

// ── Types ─────────────────────────────────────────────────────────────────────
export type DailyClick = { date: string; count: number };
export type MetricItem = { name: string; value: number };

// ── Shared theme ──────────────────────────────────────────────────────────────
const GRID_COLOR  = "rgba(34,211,238,0.07)";
const AXIS_COLOR  = "#52525b"; // zinc-600
const TT_STYLE   = {
  backgroundColor: "#0b1320",
  border: "1px solid rgba(34,211,238,0.2)",
  borderRadius: 10,
  fontSize: 12,
  color: "#e4e4e7",
  padding: "6px 12px",
};

// ── Clicks per day AreaChart ──────────────────────────────────────────────────
export function ClicksAreaChart({ data }: { data: DailyClick[] }) {
  const maxVal = Math.max(...data.map((d) => d.count), 1);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="clicksGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#22d3ee" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}    />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID_COLOR} vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: AXIS_COLOR, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: AXIS_COLOR, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
          domain={[0, maxVal + 1]}
        />
        <Tooltip
          contentStyle={TT_STYLE}
          cursor={{ stroke: "rgba(34,211,238,0.2)", strokeWidth: 1 }}
          formatter={(v: number) => [v, "Cliques"]}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#22d3ee"
          strokeWidth={2}
          fill="url(#clicksGrad)"
          dot={false}
          activeDot={{ r: 4, fill: "#22d3ee", stroke: "#0b1320", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Horizontal bar ────────────────────────────────────────────────────────────
function HorizontalBars({
  data,
  color,
}: {
  data: MetricItem[];
  color: string;
}) {
  if (data.length === 0) {
    return <p className="py-4 text-center text-sm text-zinc-600">Sem dados.</p>;
  }

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <ul className="space-y-2.5">
      {data.map((item) => (
        <li key={item.name}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="truncate text-zinc-300">{item.name}</span>
            <span className="ml-2 shrink-0 font-semibold" style={{ color }}>
              {item.value}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${(item.value / max) * 100}%`, backgroundColor: color }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function BrowserBars({ data }: { data: MetricItem[] }) {
  return <HorizontalBars data={data} color="#22d3ee" />;
}

export function DeviceBars({ data }: { data: MetricItem[] }) {
  return <HorizontalBars data={data} color="#10b981" />;
}

export function OsBars({ data }: { data: MetricItem[] }) {
  return <HorizontalBars data={data} color="#a78bfa" />;
}

export function CountryBars({ data }: { data: MetricItem[] }) {
  return <HorizontalBars data={data} color="#fb923c" />;
}

// ── Mini BarChart for per-link sparkline feel ─────────────────────────────────
export function LinkClicksBar({ data }: { data: DailyClick[] }) {
  return (
    <ResponsiveContainer width="100%" height={32}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barSize={3}>
        <Bar dataKey="count" fill="#22d3ee" opacity={0.7} radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
