"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  Users,
  ShoppingBag,
  Mail,
  Package,
  TrendingUp,
  UserPlus,
  MessageSquare,
  Newspaper,
} from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ---------- types ---------- */
interface AnalyticsData {
  revenue: { date: string; revenue: number }[];
  customerGrowth: { date: string; count: number }[];
  newsletterGrowth: { date: string; count: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
  funnel: { signups: number; verified: number; customers: number };
  emailStats: { sent: number; received: number };
  recentActivity: { type: string; description: string; timestamp: string }[];
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalSubscribers: number;
    activeProducts: number;
    avgOrderValue: number;
  };
}

/* ---------- helpers ---------- */
function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
}

function formatCurrency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ---------- custom tooltip ---------- */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg border border-[#262626] bg-[#141414] px-3 py-2 shadow-xl">
      <p className="text-xs text-[#A3A3A3]">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-medium" style={{ color: p.color }}>
          {p.name}: {typeof p.value === "number" && p.name?.toLowerCase().includes("revenue") ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

/* ---------- activity badges ---------- */
const activityBadge: Record<string, string> = {
  signup: "bg-[#22C55E]/10 text-[#22C55E]",
  order: "bg-[#C8A84E]/10 text-[#C8A84E]",
  message: "bg-[#3B82F6]/10 text-[#3B82F6]",
  newsletter: "bg-[#A855F7]/10 text-[#A855F7]",
};
const activityIcon: Record<string, React.ReactNode> = {
  signup: <UserPlus className="h-3.5 w-3.5" />,
  order: <ShoppingBag className="h-3.5 w-3.5" />,
  message: <MessageSquare className="h-3.5 w-3.5" />,
  newsletter: <Newspaper className="h-3.5 w-3.5" />,
};

/* ================================================================ */
/*  DASHBOARD                                                        */
/* ================================================================ */
export default function AdminDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load analytics");
        return res.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  /* ---------- loading skeleton ---------- */
  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#F5F5F5]">Dashboard</h1>
          <p className="text-sm text-[#A3A3A3]">{today}</p>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl border border-[#262626] bg-[#141414]"
            />
          ))}
        </div>
        <div className="mt-6 h-72 animate-pulse rounded-xl border border-[#262626] bg-[#141414]" />
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="h-72 animate-pulse rounded-xl border border-[#262626] bg-[#141414]" />
          <div className="h-72 animate-pulse rounded-xl border border-[#262626] bg-[#141414]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const {
    revenue,
    customerGrowth,
    newsletterGrowth,
    topProducts,
    funnel,
    emailStats,
    recentActivity,
    summary,
  } = data;

  /* merge growth data for the dual-line chart */
  const growthData = customerGrowth.map((c, i) => ({
    date: formatShortDate(c.date),
    Customers: c.count,
    Newsletter: newsletterGrowth[i]?.count ?? 0,
  }));

  /* revenue chart with formatted dates */
  const revenueData = revenue.map((r) => ({
    date: formatShortDate(r.date),
    Revenue: r.revenue,
  }));

  const stats = [
    {
      label: "Total Revenue",
      value: formatCurrency(summary.totalRevenue),
      icon: DollarSign,
    },
    {
      label: "Total Orders",
      value: summary.totalOrders.toLocaleString(),
      icon: ShoppingBag,
    },
    {
      label: "Total Customers",
      value: summary.totalCustomers.toLocaleString(),
      icon: Users,
    },
    {
      label: "Subscribers",
      value: summary.totalSubscribers.toLocaleString(),
      icon: Mail,
    },
    {
      label: "Active Products",
      value: summary.activeProducts.toLocaleString(),
      icon: Package,
    },
    {
      label: "Avg Order Value",
      value: formatCurrency(summary.avgOrderValue),
      icon: TrendingUp,
    },
  ];

  /* funnel percentages */
  const funnelSteps = [
    { label: "Signups", count: funnel.signups, pct: 100, color: "#C8A84E" },
    {
      label: "Age Verified",
      count: funnel.verified,
      pct: funnel.signups > 0 ? Math.round((funnel.verified / funnel.signups) * 100) : 0,
      color: "#3B82F6",
    },
    {
      label: "Purchased",
      count: funnel.customers,
      pct: funnel.signups > 0 ? Math.round((funnel.customers / funnel.signups) * 100) : 0,
      color: "#22C55E",
    },
  ];

  const emailMax = Math.max(emailStats.sent, emailStats.received, 1);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#F5F5F5]">Dashboard</h1>
        <p className="text-sm text-[#A3A3A3]">{today}</p>
      </div>

      {/* ---- ROW 1: Stat cards ---- */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[#262626] bg-[#141414] p-6"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#A3A3A3]">{stat.label}</p>
              <stat.icon className="h-5 w-5 text-[#C8A84E]" />
            </div>
            <p className="mt-2 text-2xl font-bold text-[#F5F5F5]">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* ---- ROW 2: Revenue chart ---- */}
      <div className="mt-6 rounded-xl border border-[#262626] bg-[#141414] p-6">
        <h2 className="mb-4 text-lg font-semibold text-[#F5F5F5]">
          Revenue (30 days)
        </h2>
        {revenue.every((r) => r.revenue === 0) ? (
          <p className="py-16 text-center text-[#A3A3A3]">No data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C8A84E" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#C8A84E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#262626" strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                stroke="#A3A3A3"
                fontSize={12}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#A3A3A3"
                fontSize={12}
                tickLine={false}
                tickFormatter={(v: number) => `$${v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="Revenue"
                stroke="#C8A84E"
                strokeWidth={2}
                fill="url(#goldGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ---- ROW 3: Growth + Top Products ---- */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Customer & Newsletter Growth */}
        <div className="rounded-xl border border-[#262626] bg-[#141414] p-6">
          <h2 className="mb-4 text-lg font-semibold text-[#F5F5F5]">
            Customer &amp; Newsletter Growth
          </h2>
          {customerGrowth.every((c) => c.count === 0) &&
          newsletterGrowth.every((n) => n.count === 0) ? (
            <p className="py-16 text-center text-[#A3A3A3]">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={growthData}>
                <CartesianGrid stroke="#262626" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  stroke="#A3A3A3"
                  fontSize={12}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis stroke="#A3A3A3" fontSize={12} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="Customers"
                  stroke="#C8A84E"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="Newsletter"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Products */}
        <div className="rounded-xl border border-[#262626] bg-[#141414] p-6">
          <h2 className="mb-4 text-lg font-semibold text-[#F5F5F5]">
            Top Products
          </h2>
          {topProducts.length === 0 ? (
            <p className="py-16 text-center text-[#A3A3A3]">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid stroke="#262626" strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  stroke="#A3A3A3"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#A3A3A3"
                  fontSize={12}
                  tickLine={false}
                  width={120}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="quantity" name="Qty Sold" fill="#C8A84E" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ---- ROW 4: Funnel + Email Stats ---- */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Conversion Funnel */}
        <div className="rounded-xl border border-[#262626] bg-[#141414] p-6">
          <h2 className="mb-6 text-lg font-semibold text-[#F5F5F5]">
            Conversion Funnel
          </h2>
          {funnel.signups === 0 ? (
            <p className="py-16 text-center text-[#A3A3A3]">No data yet</p>
          ) : (
            <div className="space-y-4">
              {funnelSteps.map((step, i) => (
                <div key={step.label}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium text-[#F5F5F5]">
                      {step.label}
                    </span>
                    <span className="text-sm text-[#A3A3A3]">
                      {step.count.toLocaleString()} ({step.pct}%)
                    </span>
                  </div>
                  <div className="h-8 w-full overflow-hidden rounded-md bg-[#1A1A1A]">
                    <div
                      className="flex h-full items-center justify-center rounded-md text-xs font-semibold text-[#0A0A0A] transition-all"
                      style={{
                        width: `${step.pct}%`,
                        backgroundColor: step.color,
                        minWidth: step.pct > 0 ? "2rem" : "0",
                      }}
                    >
                      {step.pct > 10 ? `${step.pct}%` : ""}
                    </div>
                  </div>
                  {i < funnelSteps.length - 1 && (
                    <div className="mt-1 text-center text-xs text-[#A3A3A3]">
                      {funnelSteps[i + 1].pct < step.pct
                        ? `${step.pct - funnelSteps[i + 1].pct}% drop-off`
                        : ""}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Email Stats */}
        <div className="rounded-xl border border-[#262626] bg-[#141414] p-6">
          <h2 className="mb-6 text-lg font-semibold text-[#F5F5F5]">
            Email Stats
          </h2>
          {emailStats.sent === 0 && emailStats.received === 0 ? (
            <p className="py-16 text-center text-[#A3A3A3]">No data yet</p>
          ) : (
            <div className="space-y-6">
              {/* Sent */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-[#F5F5F5]">
                    Emails Sent
                  </span>
                  <span className="text-sm text-[#A3A3A3]">
                    {emailStats.sent.toLocaleString()}
                  </span>
                </div>
                <div className="h-6 w-full overflow-hidden rounded-md bg-[#1A1A1A]">
                  <div
                    className="h-full rounded-md bg-[#C8A84E] transition-all"
                    style={{
                      width: `${(emailStats.sent / emailMax) * 100}%`,
                      minWidth: emailStats.sent > 0 ? "0.5rem" : "0",
                    }}
                  />
                </div>
              </div>
              {/* Received */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-[#F5F5F5]">
                    Messages Received
                  </span>
                  <span className="text-sm text-[#A3A3A3]">
                    {emailStats.received.toLocaleString()}
                  </span>
                </div>
                <div className="h-6 w-full overflow-hidden rounded-md bg-[#1A1A1A]">
                  <div
                    className="h-full rounded-md bg-[#3B82F6] transition-all"
                    style={{
                      width: `${(emailStats.received / emailMax) * 100}%`,
                      minWidth: emailStats.received > 0 ? "0.5rem" : "0",
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---- ROW 5: Recent Activity ---- */}
      <div className="mt-6 rounded-xl border border-[#262626] bg-[#141414] p-6">
        <h2 className="mb-4 text-lg font-semibold text-[#F5F5F5]">
          Recent Activity
        </h2>
        {recentActivity.length === 0 ? (
          <p className="py-8 text-center text-[#A3A3A3]">No activity yet</p>
        ) : (
          <div className="divide-y divide-[#262626]">
            {recentActivity.map((event, i) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${activityBadge[event.type] || "bg-[#262626] text-[#A3A3A3]"}`}
                >
                  {activityIcon[event.type]}
                  {event.type}
                </span>
                <span className="flex-1 text-sm text-[#F5F5F5]">
                  {event.description}
                </span>
                <span className="shrink-0 text-xs text-[#A3A3A3]">
                  {timeAgo(event.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
