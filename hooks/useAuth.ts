"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function useAuth() {
  const { login, logout, authenticated, user, ready } = usePrivy();
  const { wallets } = useWallets();

  const embeddedWallet = wallets.find(
    (wallet) => wallet.walletClientType === "privy"
  );

  const google = user?.google;
  const googleLinked = user?.linkedAccounts?.find(
    (a: any) => a.type === "google_oauth"
  ) as any;
  const displayName =
    google?.name ||
    user?.email?.address ||
    user?.phone?.number ||
    (embeddedWallet?.address ? truncateAddress(embeddedWallet.address) : "User");
  const email = google?.email || user?.email?.address || null;
  const avatarUrl = googleLinked?.profilePictureUrl || null;

  return {
    login,
    logout,
    isAuthenticated: authenticated,
    isReady: ready,
    user,
    address: embeddedWallet?.address,
    wallet: embeddedWallet,
    displayName,
    email,
    avatarUrl,
  };
}
