"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useState, useEffect } from "react";

export function useAdminToken(): string | null {
  const { authenticated, getAccessToken } = usePrivy();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (!authenticated) {
      setToken(null);
      return;
    }
    getAccessToken().then(setToken);
  }, [authenticated, getAccessToken]);

  return token;
}
