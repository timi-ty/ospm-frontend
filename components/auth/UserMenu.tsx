"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function UserMenu() {
  const { logout, address, displayName, email, avatarUrl } = useAuth();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [open]);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--foreground)]/5 border border-[var(--border-color)] hover:border-[var(--border-hover)] transition-colors text-sm"
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            width={24}
            height={24}
            className="w-6 h-6 rounded-full object-cover"
          />
        ) : (
          <span className="w-6 h-6 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-xs font-bold text-[var(--accent)]">
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="hidden sm:block font-medium max-w-[150px] truncate">
          {displayName}
        </span>
      </button>

      {open && createPortal(
        <>
          <div className="fixed inset-0 z-[200]" onClick={() => setOpen(false)} />
          <div
            className="fixed z-[210] w-64 card p-2 shadow-lg"
            style={{ top: dropdownPos.top, right: dropdownPos.right }}
          >
            <div className="px-3 py-2 border-b border-[var(--border-color)] mb-1">
              <div className="text-sm font-medium truncate">{displayName}</div>
              {email && email !== displayName && (
                <div className="text-xs text-muted truncate">{email}</div>
              )}
            </div>
            {address && (
              <button
                onClick={copyAddress}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-mono text-muted hover:bg-[var(--foreground)]/5 transition-colors"
              >
                {copied ? "Copied!" : truncateAddress(address)}
              </button>
            )}
            <button
              onClick={() => { setOpen(false); logout(); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-[var(--no-color)] hover:bg-[var(--no-color)]/10 transition-colors font-medium"
            >
              Sign Out
            </button>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
