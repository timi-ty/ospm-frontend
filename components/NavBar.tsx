"use client";

import Image from "next/image";
import LoginButton from "@/components/auth/LoginButton";
import UserMenu from "@/components/auth/UserMenu";
import WalletBalance from "@/components/wallet/WalletBalance";
import GasWarning from "@/components/wallet/GasWarning";
import { useAuth } from "@/hooks/useAuth";

export default function NavBar() {
  const { isAuthenticated, isReady } = useAuth();

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--background)]/80 border-b border-[var(--border-color)]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
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
          </a>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--foreground)]/5 border border-[var(--foreground)]/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--yes-color)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--yes-color)]"></span>
              </span>
              <span className="text-xs font-medium text-muted uppercase tracking-wider">
                Live
              </span>
            </div>
            <WalletBalance />
            {isReady && (isAuthenticated ? <UserMenu /> : <LoginButton />)}
          </div>
        </div>
      </nav>
      <GasWarning />
    </>
  );
}
