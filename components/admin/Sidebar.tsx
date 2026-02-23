"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: "📊" },
  { href: "/admin/markets", label: "Markets", icon: "📋" },
  { href: "/admin/system", label: "System", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-[var(--border-color)] bg-[var(--background-secondary)] min-h-screen p-4 flex flex-col gap-1">
      <Link href="/" className="text-xs text-muted hover:text-[var(--accent)] mb-6 block">
        ← Back to Site
      </Link>
      <h2 className="text-sm font-bold uppercase tracking-widest text-muted mb-4 px-3">
        Admin
      </h2>
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              active
                ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                : "text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
}
