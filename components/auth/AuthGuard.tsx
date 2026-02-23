"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Spinner from "@/components/ui/Spinner";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isReady, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.push("/");
    }
  }, [isReady, isAuthenticated, router]);

  if (!isReady) {
    return <Spinner />;
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
