"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useRef } from "react";

const ORACLE_URL = process.env.NEXT_PUBLIC_ORACLE_URL || "http://localhost:3001";
const SESSION_KEY = "ospm_verified_user";

export default function AuthVerifier() {
  const { authenticated, user, ready, getAccessToken } = usePrivy();
  const wasAuthenticated = useRef(false);

  useEffect(() => {
    if (!ready) return;

    if (authenticated && user?.id) {
      wasAuthenticated.current = true;

      const verified = sessionStorage.getItem(SESSION_KEY);
      if (verified === user.id) return;
      sessionStorage.setItem(SESSION_KEY, user.id);

      getAccessToken().then((token) => {
        if (!token) return;
        fetch(`${ORACLE_URL}/api/auth/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        }).catch(() => {});
      });
    } else if (!authenticated && wasAuthenticated.current) {
      // Only clear on actual logout, not on initial mount before Privy restores session
      wasAuthenticated.current = false;
      sessionStorage.removeItem(SESSION_KEY);
    }
  }, [ready, authenticated, user?.id, getAccessToken]);

  return null;
}
