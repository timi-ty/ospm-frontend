"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  date: string;
  created: number;
  deployed: number;
  proposed: number;
  resolved: number;
}

export default function TimeSeriesChart({ data }: { data: DataPoint[] }) {
  const formatted = data.map((d) => ({
    ...d,
    date: d.date.slice(5), // "02-23" format
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={formatted} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--foreground-muted)" />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="var(--foreground-muted)" />
        <Tooltip
          contentStyle={{
            background: "var(--background-secondary)",
            border: "1px solid var(--border-color)",
            borderRadius: 8,
            fontSize: 13,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="created" fill="var(--accent)" name="Created" radius={[2, 2, 0, 0]} />
        <Bar dataKey="deployed" fill="var(--yes-color)" name="Deployed" radius={[2, 2, 0, 0]} />
        <Bar dataKey="proposed" fill="#6366f1" name="Proposed" radius={[2, 2, 0, 0]} />
        <Bar dataKey="resolved" fill="var(--foreground-muted)" name="Resolved" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
