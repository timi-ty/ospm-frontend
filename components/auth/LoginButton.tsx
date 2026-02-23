"use client";

import { useAuth } from "@/hooks/useAuth";
import Spinner from "@/components/ui/Spinner";

export default function LoginButton() {
  const { login, isReady } = useAuth();

  if (!isReady) {
    return (
      <div className="px-4 py-2 rounded-lg bg-[var(--foreground)]/5">
        <Spinner size="sm" />
      </div>
    );
  }

  return (
    <button
      onClick={login}
      className="btn btn-primary"
    >
      Sign In
    </button>
  );
}
