"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LoginButton from "@/components/auth/LoginButton";
import UserMenu from "@/components/auth/UserMenu";
import WalletBalance from "@/components/wallet/WalletBalance";
import GasWarning from "@/components/wallet/GasWarning";
import { useAuth } from "@/hooks/useAuth";

const NAV_LINKS = [
  { href: "/", label: "Markets" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/how-it-works", label: "How It Works" },
];

export default function NavBar() {
  const { isAuthenticated, isReady } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--background)]/80 border-b border-[var(--border-color)]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          {/* Left: Logo + Desktop Links */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="OSPM"
                width={40}
                height={40}
                className="rounded-md"
                priority
              />
              <span className="font-bold tracking-tight text-lg hidden sm:block">
                OSPM
              </span>
            </Link>
            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                      : "text-muted hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && (
                <Link
                  href="/dashboard"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === "/dashboard"
                      ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                      : "text-muted hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
                  }`}
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* Right: Status, Wallet, Auth, Hamburger */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--yes-color)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--yes-color)]"></span>
              </span>
              <span className="text-xs font-medium text-muted uppercase tracking-wider">
                Live
              </span>
            </div>
            <WalletBalance />
            <div className="hidden lg:block">
              {isReady && (isAuthenticated ? <UserMenu /> : <LoginButton />)}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-[var(--foreground)]/5 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle menu"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                {mobileOpen ? (
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile nav panel */}
      {mobileOpen && (
        <>
          <div className="mobile-nav-overlay lg:hidden" onClick={() => setMobileOpen(false)} />
          <div className="mobile-nav-panel lg:hidden">
            <div className="flex flex-col gap-2 mb-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                      : "text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    pathname === "/dashboard"
                      ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                      : "text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
                  }`}
                >
                  Dashboard
                </Link>
              )}
            </div>
            <div className="pt-4 border-t border-[var(--border-color)]">
              {isReady && (isAuthenticated ? <UserMenu /> : <LoginButton />)}
            </div>
          </div>
        </>
      )}

      <GasWarning />
    </>
  );
}
