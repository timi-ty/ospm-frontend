"use client";

import { useState } from "react";
import { useSystemInfo } from "@/lib/api/adminHooks";
import { triggerGeneration, triggerDeployment } from "@/lib/api/admin";
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

export default function SystemPage() {
  const { data, error, mutate } = useSystemInfo();
  const [actionMsg, setActionMsg] = useState("");

  if (error) return <div className="py-10 text-[var(--no-color)]">Cannot reach Oracle.</div>;
  if (!data) return <Spinner />;

  const handleAction = async (label: string, fn: () => Promise<any>) => {
    setActionMsg(`${label}...`);
    try {
      const result = await fn();
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

      {/* Blockchain */}
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
