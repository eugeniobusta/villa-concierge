"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Area, AreaChart,
} from "recharts";

export interface DayRevenue {
  label: string;
  date: string;
  revenue: number;
  bookings: number;
}

interface StatusCount {
  status: string;
  count: number;
  color: string;
}

interface Props {
  dailyData: DayRevenue[];
  statusCounts: StatusCount[];
  totalRevenue: number;
  monthRevenue: number;
}

// Custom tooltip styled with CSS variables
function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-warm text-xs">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="font-semibold text-foreground">
          {p.name === "revenue" ? `€${Number(p.value).toFixed(2)}` : `${p.value} booking(s)`}
        </p>
      ))}
    </div>
  );
}

export function RevenueChart({ dailyData, statusCounts, totalRevenue, monthRevenue }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-52 rounded-2xl bg-muted animate-pulse" />
        <div className="h-52 rounded-2xl bg-muted animate-pulse" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Daily revenue area chart */}
      <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-5 shadow-warm-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Platform Revenue — Last 14 Days</p>
            <p className="text-2xl font-semibold text-foreground mt-0.5">
              €{monthRevenue.toFixed(2)}
              <span className="text-sm font-normal text-muted-foreground ml-1.5">this month</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">All time</p>
            <p className="text-sm font-semibold text-foreground">€{totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={dailyData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `€${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--primary)"
              strokeWidth={2}
              fill="url(#revenueGradient)"
              dot={false}
              activeDot={{ r: 4, fill: "var(--primary)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Booking status breakdown */}
      <div className="bg-card rounded-2xl border border-border p-5 shadow-warm-sm">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Bookings by Status</p>
        <div className="space-y-3">
          {statusCounts.map(({ status, count, color }) => {
            const total = statusCounts.reduce((s, x) => s + x.count, 0) || 1;
            const pct = Math.round((count / total) * 100);
            return (
              <div key={status}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground capitalize">{status.replace("_", " ")}</span>
                  <span className="text-xs font-semibold text-foreground">{count}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">Total bookings</p>
          <p className="text-2xl font-semibold text-foreground mt-0.5">
            {statusCounts.reduce((s, x) => s + x.count, 0)}
          </p>
        </div>
      </div>
    </div>
  );
}
