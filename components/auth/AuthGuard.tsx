"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isReady, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.push("/");
    }
  }, [isReady, isAuthenticated, router]);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-muted animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
