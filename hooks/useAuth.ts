"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useEffect } from "react";

const ORACLE_URL = process.env.NEXT_PUBLIC_ORACLE_URL || "http://localhost:3001";

let verifyPromise: Promise<void> | null = null;
let verifiedUserId: string | null = null;

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function useAuth() {
  const { login, logout, authenticated, user, ready, getAccessToken } = usePrivy();
  const { wallets } = useWallets();

  useEffect(() => {
    const userId = user?.id ?? null;
    if (!ready || !authenticated || !userId) return;
    if (verifiedUserId === userId) return;

    if (!verifyPromise) {
      verifiedUserId = userId;
      verifyPromise = getAccessToken()
        .then((token) => {
          if (!token) return;
          return fetch(`${ORACLE_URL}/api/auth/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          }).then(() => {});
        })
        .catch(() => {})
        .finally(() => { verifyPromise = null; });
    }
  }, [ready, authenticated, user?.id, getAccessToken]);

  useEffect(() => {
    if (!authenticated) {
      verifiedUserId = null;
      verifyPromise = null;
    }
  }, [authenticated]);

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
    getAccessToken,
  };
}
