"use client";

import { createContext, useCallback, useContext, useState, useRef } from "react";
import { Check, X, Info, type LucideIcon } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = `toast-${++counterRef.current}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            onClick={() => dismiss(t.id)}
            className={`pointer-events-auto cursor-pointer animate-fade-in-up rounded-xl px-4 py-3 text-sm font-medium shadow-lg border max-w-sm ${
              t.type === "success"
                ? "bg-[var(--yes-color)] text-white border-[var(--yes-color)]"
                : t.type === "error"
                  ? "bg-[var(--no-color)] text-white border-[var(--no-color)]"
                  : "bg-[var(--background-secondary)] text-[var(--foreground)] border-[var(--border-color)]"
            }`}
          >
            <div className="flex items-center gap-2">
              {(() => {
                const icons: Record<ToastType, LucideIcon> = { success: Check, error: X, info: Info };
                const Icon = icons[t.type];
                return <Icon className="w-4 h-4 shrink-0" />;
              })()}
              <span>{t.message}</span>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
