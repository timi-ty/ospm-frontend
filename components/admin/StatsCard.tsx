interface StatsCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}

export default function StatsCard({ label, value, sub, accent }: StatsCardProps) {
  return (
    <div className="card p-4">
      <div className="text-xs font-medium uppercase tracking-wider text-muted mb-1">
        {label}
      </div>
      <div
        className={`text-2xl font-bold font-mono ${accent ? "text-[var(--accent)]" : ""}`}
      >
        {value}
      </div>
      {sub && <div className="text-xs text-muted mt-1">{sub}</div>}
    </div>
  );
}
