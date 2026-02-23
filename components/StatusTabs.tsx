"use client";

interface StatusTabsProps {
  value: string;
  onChange: (value: string) => void;
  tabs: { key: string; label: string }[];
}

export default function StatusTabs({ value, onChange, tabs }: StatusTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
            value === tab.key
              ? "bg-[var(--accent)] text-white"
              : "bg-[var(--foreground)]/5 text-muted hover:bg-[var(--foreground)]/10"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
