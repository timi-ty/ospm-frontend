"use client";

import { useState } from "react";
import { useSystemInfo } from "@/lib/api/adminHooks";
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

export default function SystemPage() {
  const { data, error, mutate } = useSystemInfo();
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
