"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, List, Settings, Mail, ArrowLeft, type LucideIcon } from "lucide-react";

const NAV_ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/markets", label: "Markets", icon: List },
  { href: "/admin/email", label: "Email", icon: Mail },
  { href: "/admin/system", label: "System", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-[var(--border-color)] bg-[var(--background-secondary)] min-h-screen p-4 flex flex-col gap-1">
      <Link href="/" className="flex items-center gap-1.5 text-xs text-muted hover:text-[var(--accent)] mb-6">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Site
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
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
}
