"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useRef } from "react";

const ORACLE_URL = process.env.NEXT_PUBLIC_ORACLE_URL || "http://localhost:3001";

export default function AuthVerifier() {
  const { authenticated, user, ready, getAccessToken } = usePrivy();
  const lastVerifiedId = useRef<string | null>(null);

  useEffect(() => {
    if (!ready || !authenticated || !user?.id) return;
    if (lastVerifiedId.current === user.id) return;
    lastVerifiedId.current = user.id;

    getAccessToken().then((token) => {
      if (!token) return;
      fetch(`${ORACLE_URL}/api/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      }).catch(() => {});
    });
  }, [ready, authenticated, user?.id, getAccessToken]);

  useEffect(() => {
    if (!authenticated) lastVerifiedId.current = null;
  }, [authenticated]);

  return null;
}
