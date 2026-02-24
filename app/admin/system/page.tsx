"use client";

import { useState } from "react";
import { useSystemInfo, useDetailedHealth } from "@/lib/api/adminHooks";
import type { DetailedHealth } from "@/lib/api/adminHooks";
import { triggerGeneration, triggerDeployment, updateAdminWallet } from "@/lib/api/admin";
import { useAdminToken } from "@/lib/api/useAdminToken";
import { useToast } from "@/components/ui/Toast";
import Spinner from "@/components/ui/Spinner";

function HealthDot({ ok }: { ok: boolean }) {
  return (
    <span className={`inline-block h-3 w-3 rounded-full ${ok ? "bg-[var(--yes-color)]" : "bg-[var(--no-color)]"}`} />
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5 mb-6">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mb-4">{title}</h2>
      {children}
    </div>
  );
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[var(--border-color)]/50 last:border-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function WalletConfig({ currentAddress, onUpdated }: { currentAddress: string; onUpdated: () => void }) {
  const token = useAdminToken();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [privateKey, setPrivateKey] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  const handleSubmit = async () => {
    if (!token || !privateKey || !password) return;
    setPending(true);
    try {
      const result = await updateAdminWallet(privateKey, password, token);
      toast(`Wallet updated: ${result.address}`, "success");
      setOpen(false);
      setPrivateKey("");
      setPassword("");
      onUpdated();
    } catch (err: any) {
      toast(err.message || "Failed to update wallet", "error");
    } finally {
      setPending(false);
    }
  };

  if (!open) {
    return (
      <div className="mt-4 pt-4 border-t border-[var(--border-color)]/50">
        <button onClick={() => setOpen(true)} className="btn btn-outline text-sm">
          Change Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-[var(--border-color)]/50 space-y-3">
      <div>
        <label className="text-xs text-muted block mb-1">New Private Key</label>
        <input
          type="password"
          value={privateKey}
          onChange={(e) => setPrivateKey(e.target.value)}
          placeholder="0x..."
          className="w-full"
        />
      </div>
      <div>
        <label className="text-xs text-muted block mb-1">Admin Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter admin password"
          className="w-full"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={pending || !privateKey || !password}
          className="btn btn-primary text-sm"
        >
          {pending ? "Updating..." : "Confirm"}
        </button>
        <button onClick={() => { setOpen(false); setPrivateKey(""); setPassword(""); }} className="btn btn-outline text-sm">
          Cancel
        </button>
      </div>
    </div>
  );
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

function StatusBadgeSmall({ status }: { status: string }) {
  const color = status === "healthy"
    ? "bg-[var(--yes-color)]/15 text-[var(--yes-color)]"
    : status === "degraded"
      ? "bg-[var(--no-color)]/15 text-[var(--no-color)]"
      : "bg-[var(--foreground)]/10 text-muted";
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>
      {status}
    </span>
  );
}

function HealthMetrics({ health }: { health: DetailedHealth }) {
  const [expandedTick, setExpandedTick] = useState<number | null>(null);

  return (
    <>
      {/* Uptime Banner */}
      <Section title="Health Metrics">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <div className="text-xs text-muted">Status</div>
            <StatusBadgeSmall status={health.status} />
          </div>
          <div>
            <div className="text-xs text-muted">Uptime</div>
            <div className="text-sm font-bold font-mono">{formatUptime(health.uptimeSeconds)}</div>
          </div>
          <div>
            <div className="text-xs text-muted">Last Tick</div>
            <div className="text-sm font-bold font-mono">
              {health.lastTickAt ? timeAgo(health.lastTickAt) : "never"}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted">Total Ticks</div>
            <div className="text-sm font-bold font-mono">{health.tickCount}</div>
          </div>
        </div>

        {/* Handler Status */}
        {health.handlers.length > 0 && (
          <div className="mb-4">
            <div className="text-xs text-muted uppercase tracking-wider mb-2">Handlers</div>
            <div className="space-y-1">
              {health.handlers.map((h) => {
                const latestDetails = health.recentHealth[0]?.details;
                const handlerStatus = latestDetails?.[h.name] || "unknown";
                return (
                  <div key={h.name} className="flex items-center justify-between py-1.5 px-2 rounded bg-[var(--foreground)]/[0.02]">
                    <div className="flex items-center gap-2">
                      <HealthDot ok={handlerStatus === "ok"} />
                      <span className="font-mono text-xs">{h.name}</span>
                    </div>
                    <span className="text-xs text-muted">
                      {h.lastRunAt ? timeAgo(h.lastRunAt) : "never"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Health Log */}
        {health.recentHealth.length > 0 && (
          <div>
            <div className="text-xs text-muted uppercase tracking-wider mb-2">Recent Ticks</div>
            <div className="space-y-1">
              {health.recentHealth.map((entry) => (
                <div key={entry.tickCount}>
                  <button
                    onClick={() => setExpandedTick(expandedTick === entry.tickCount ? null : entry.tickCount)}
                    className={`w-full flex items-center justify-between py-2 px-2 rounded text-left transition-colors ${
                      entry.status === "degraded" ? "bg-[var(--no-color)]/5" : "hover:bg-[var(--foreground)]/[0.02]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-muted w-10">#{entry.tickCount}</span>
                      <StatusBadgeSmall status={entry.status} />
                    </div>
                    <span className="text-xs text-muted">{timeAgo(entry.createdAt)}</span>
                  </button>
                  {expandedTick === entry.tickCount && entry.details && (
                    <div className="ml-14 mb-2 p-2 rounded bg-[var(--foreground)]/[0.03] text-xs space-y-1">
                      {Object.entries(entry.details).map(([handler, status]) => (
                        <div key={handler} className="flex items-center gap-2">
                          <HealthDot ok={status === "ok"} />
                          <span className="font-mono">{handler}</span>
                          <span className="text-muted">— {status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>
    </>
  );
}

export default function SystemPage() {
  const { data, error, mutate } = useSystemInfo();
  const { data: health } = useDetailedHealth();
  const token = useAdminToken();
  const [actionMsg, setActionMsg] = useState("");

  if (error) return <div className="py-10 text-[var(--no-color)]">Cannot reach Oracle.</div>;
  if (!data) return <Spinner />;

  const handleAction = async (label: string, fn: (token: string) => Promise<any>) => {
    if (!token) return;
    setActionMsg(`${label}...`);
    try {
      const result = await fn(token);
      setActionMsg(`${label}: ${JSON.stringify(result)}`);
      mutate();
    } catch (err: any) {
      setActionMsg(`${label} failed: ${err.message}`);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">System</h1>

      {/* Service Health */}
      <Section title="Service Health">
        <div className="space-y-1">
          <KV label="Oracle" value={<span className="flex items-center gap-2"><HealthDot ok /> Running on port {data.oracle.port}</span>} />
          <KV label="Data Service" value={<span className="flex items-center gap-2"><HealthDot ok={data.dataService.healthy} /> {data.dataService.url}</span>} />
          <KV label="Blockchain" value={<span className="flex items-center gap-2"><HealthDot ok={data.blockchain.connected} /> Chain {data.blockchain.chainId || "N/A"}</span>} />
        </div>
      </Section>

      {/* Health Metrics */}
      {health && <HealthMetrics health={health} />}

      {/* Orchestrator */}
      <Section title="Orchestrator">
        <div className="space-y-1">
          <KV label="Tick Count" value={<span className="font-mono">{data.orchestrator.tickCount}</span>} />
          <KV label="Interval" value={`${data.orchestrator.intervalMs / 1000}s`} />
          <KV label="Started" value={data.orchestrator.startedAt ? new Date(data.orchestrator.startedAt).toLocaleString() : "—"} />
          <KV label="Last Tick" value={data.orchestrator.lastTickAt ? new Date(data.orchestrator.lastTickAt).toLocaleString() : "—"} />
        </div>
        {data.orchestrator.handlers.length > 0 && (
          <div className="mt-4">
            <div className="text-xs text-muted mb-2">Handlers</div>
            {data.orchestrator.handlers.map((h: any) => (
              <div key={h.name} className="flex items-center justify-between py-1.5 text-sm">
                <span className="font-mono text-xs">{h.name}</span>
                <span className="text-xs text-muted">{h.lastRunAt ? new Date(h.lastRunAt).toLocaleTimeString() : "never"}</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Blockchain + Wallet Config */}
      {data.blockchain.connected && (
        <Section title="Blockchain">
          <div className="space-y-1">
            <KV label="Oracle Address" value={
              <a href={`https://sepolia.basescan.org/address/${data.blockchain.oracleAddress}`} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] font-mono text-xs hover:underline">
                {data.blockchain.oracleAddress}
              </a>
            } />
            <KV label="ETH Balance" value={<span className="font-mono">{parseFloat(data.blockchain.oracleBalance).toFixed(6)} ETH</span>} />
            <KV label="MarketFactory" value={
              <a href={`https://sepolia.basescan.org/address/${data.blockchain.marketFactoryAddress}`} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] font-mono text-xs hover:underline">
                {data.blockchain.marketFactoryAddress?.slice(0, 20)}...
              </a>
            } />
            <KV label="On-Chain Markets" value={<span className="font-mono">{data.blockchain.factoryMarketCount}</span>} />
            <KV label="PlayToken" value={
              <a href={`https://sepolia.basescan.org/address/${data.blockchain.playTokenAddress}`} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] font-mono text-xs hover:underline">
                {data.blockchain.playTokenAddress?.slice(0, 20)}...
              </a>
            } />
          </div>
          <WalletConfig currentAddress={data.blockchain.oracleAddress} onUpdated={() => mutate()} />
        </Section>
      )}

      {/* Manual Triggers */}
      <Section title="Manual Triggers">
        <div className="flex gap-3 mb-3">
          <button
            onClick={() => handleAction("Generate", triggerGeneration)}
            className="btn btn-outline text-sm"
          >
            Generate Markets Now
          </button>
          <button
            onClick={() => handleAction("Deploy", triggerDeployment)}
            className="btn btn-outline text-sm"
          >
            Deploy Pending Now
          </button>
        </div>
        {actionMsg && (
          <p className={`text-xs font-mono p-2 rounded bg-[var(--foreground)]/5 ${actionMsg.includes("failed") ? "text-[var(--no-color)]" : "text-muted"}`}>
            {actionMsg}
          </p>
        )}
      </Section>
    </div>
  );
}
