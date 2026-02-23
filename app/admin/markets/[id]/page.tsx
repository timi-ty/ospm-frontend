"use client";

import { use, useState } from "react";
import { useAdminMarket } from "@/lib/api/adminHooks";
import { resolveMarket } from "@/lib/api/admin";
import StatusBadge from "@/components/admin/StatusBadge";
import Spinner from "@/components/ui/Spinner";
import Link from "next/link";

function formatDateTime(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString();
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wider text-muted mb-1">{label}</div>
      <div className="text-sm">{children}</div>
    </div>
  );
}

export default function MarketDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: market, error, mutate } = useAdminMarket(id);
  const [resolving, setResolving] = useState(false);
  const [message, setMessage] = useState("");

  if (error) return <div className="py-10 text-[var(--no-color)]">Failed to load market.</div>;
  if (!market) return <Spinner />;

  const handleResolve = async (outcome: boolean) => {
    setResolving(true);
    setMessage("");
    try {
      await resolveMarket(market.id, outcome);
      setMessage(`Resolution proposed: ${outcome ? "YES" : "NO"}`);
      mutate();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setResolving(false);
    }
  };

  return (
    <div>
      <Link href="/admin/markets" className="text-xs text-muted hover:text-[var(--accent)] mb-4 block">
        ← Back to Markets
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <h1 className="text-xl font-bold leading-tight">{market.question}</h1>
        <StatusBadge status={market.status} />
      </div>

      {market.description && (
        <p className="text-sm text-muted mb-6">{market.description}</p>
      )}

      {/* Fields Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <Field label="Category">{market.category}</Field>
        <Field label="Status">{market.status}</Field>
        <Field label="Resolved Outcome">
          {market.resolvedOutcome === null ? "—" : market.resolvedOutcome ? "YES" : "NO"}
        </Field>
        <Field label="Contract">
          {market.contractAddress ? (
            <a
              href={`https://sepolia.basescan.org/address/${market.contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline font-mono text-xs break-all"
            >
              {market.contractAddress}
            </a>
          ) : (
            <span className="text-muted">Not deployed</span>
          )}
        </Field>
        <Field label="Source">
          <a href={market.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline text-xs break-all">
            {market.sourceUrl}
          </a>
        </Field>
        <Field label="LMSR (b)">
          <span className="font-mono">{market.b}</span>
        </Field>
      </div>

      {/* LMSR State */}
      <div className="card p-5 mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">LMSR State</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-muted">b (liquidity)</div>
            <div className="font-mono text-lg">{market.b}</div>
          </div>
          <div>
            <div className="text-xs text-muted">qYes</div>
            <div className="font-mono text-lg text-[var(--yes-color)]">{market.qYes?.toFixed(2) ?? 0}</div>
          </div>
          <div>
            <div className="text-xs text-muted">qNo</div>
            <div className="font-mono text-lg text-[var(--no-color)]">{market.qNo?.toFixed(2) ?? 0}</div>
          </div>
        </div>
      </div>

      {/* Timestamps */}
      <div className="card p-5 mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Timestamps</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <Field label="Created">{formatDateTime(market.createdAt)}</Field>
          <Field label="Betting Closes">{formatDateTime(market.bettingClosesAt)}</Field>
          <Field label="Resolves At">{formatDateTime(market.resolvesAt)}</Field>
          <Field label="Deployed">{formatDateTime(market.deployedAt)}</Field>
          <Field label="Proposed">{formatDateTime(market.proposedAt)}</Field>
          <Field label="Resolved">{formatDateTime(market.resolvedAt)}</Field>
        </div>
      </div>

      {/* Resolution Context */}
      {market.resolutionContext && (
        <div className="card p-5 mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Resolution Context</h2>
          <p className="text-sm">{market.resolutionContext}</p>
        </div>
      )}

      {/* Admin Actions */}
      {(market.status === "pending_resolution" || market.status === "open" || market.status === "closed") && market.contractAddress && (
        <div className="card p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Admin Actions</h2>
          <div className="flex gap-3">
            <button
              onClick={() => handleResolve(true)}
              disabled={resolving}
              className="btn btn-yes text-sm"
            >
              {resolving ? "..." : "Resolve YES"}
            </button>
            <button
              onClick={() => handleResolve(false)}
              disabled={resolving}
              className="btn btn-no text-sm"
            >
              {resolving ? "..." : "Resolve NO"}
            </button>
          </div>
          {message && (
            <p className={`text-sm mt-3 ${message.startsWith("Error") ? "text-[var(--no-color)]" : "text-[var(--yes-color)]"}`}>
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
