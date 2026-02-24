"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { sendBroadcastEmail } from "@/lib/api/admin";
import { useBroadcastStatus, useEmailableUserCount } from "@/lib/api/adminHooks";
import { useAdminToken } from "@/lib/api/useAdminToken";
import { useToast } from "@/components/ui/Toast";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5 mb-6">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mb-4">{title}</h2>
      {children}
    </div>
  );
}

export default function AdminEmailPage() {
  const token = useAdminToken();
  const { toast } = useToast();
  const { data: userCount } = useEmailableUserCount();
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [sending, setSending] = useState(false);
  const [polling, setPolling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { data: broadcastStatus } = useBroadcastStatus(polling);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [purify, setPurify] = useState<typeof import("dompurify").default | null>(null);

  useEffect(() => {
    import("dompurify").then((mod) => setPurify(() => mod.default));
  }, []);

  const sanitizedHtml = useMemo(() => {
    if (!purify || !html) return "";
    return purify.sanitize(html, {
      ADD_TAGS: ["style"],
      ADD_ATTR: ["target"],
    });
  }, [purify, html]);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(sanitizedHtml);
        doc.close();
      }
    }
  }, [sanitizedHtml]);

  useEffect(() => {
    if (broadcastStatus?.status === "done") {
      setPolling(false);
      setSending(false);
    }
  }, [broadcastStatus?.status]);

  const handleSend = async () => {
    if (!token || !subject.trim() || !html.trim()) return;
    setShowConfirm(false);
    setSending(true);
    setPolling(true);
    try {
      await sendBroadcastEmail(subject, html, token);
      toast("Broadcast started", "success");
    } catch (err: any) {
      toast(err.message || "Failed to start broadcast", "error");
      setSending(false);
      setPolling(false);
    }
  };

  const count = userCount?.count ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Email Broadcast</h1>
        <span className="text-xs text-muted">
          {count} user{count !== 1 ? "s" : ""} with email
        </span>
      </div>

      {/* Subject */}
      <Section title="Subject">
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Email subject line..."
          className="w-full"
        />
      </Section>

      {/* Editor + Preview side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Section title="HTML Editor">
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            placeholder="Paste or write your HTML email content here..."
            className="w-full font-mono text-sm bg-[var(--background)] border border-[var(--border-color)] rounded-lg p-3 resize-y"
            style={{ minHeight: 400 }}
            spellCheck={false}
          />
        </Section>

        <Section title="Preview">
          <div
            className="border border-[var(--border-color)] rounded-lg overflow-hidden bg-white"
            style={{ minHeight: 400 }}
          >
            {html.trim() ? (
              <iframe
                ref={iframeRef}
                title="Email Preview"
                className="w-full border-0"
                style={{ height: 400 }}
                sandbox="allow-same-origin"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-muted py-20">
                HTML preview will appear here
              </div>
            )}
          </div>
        </Section>
      </div>

      {/* Broadcast Status */}
      {broadcastStatus && broadcastStatus.status !== "idle" && (
        <Section title="Broadcast Status">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-muted">Status</div>
              <div className={`text-sm font-bold ${broadcastStatus.status === "sending" ? "text-[var(--accent)]" : "text-[var(--yes-color)]"}`}>
                {broadcastStatus.status === "sending" ? "Sending..." : "Complete"}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted">Sent</div>
              <div className="text-sm font-bold font-mono">{broadcastStatus.sent} / {broadcastStatus.total}</div>
            </div>
            <div>
              <div className="text-xs text-muted">Failed</div>
              <div className={`text-sm font-bold font-mono ${broadcastStatus.failed > 0 ? "text-[var(--no-color)]" : ""}`}>
                {broadcastStatus.failed}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted">Progress</div>
              <div className="mt-1.5 h-2 rounded-full bg-[var(--foreground)]/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
                  style={{ width: broadcastStatus.total > 0 ? `${(broadcastStatus.sent / broadcastStatus.total) * 100}%` : "0%" }}
                />
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* Send Button */}
      <div className="flex items-center gap-3">
        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            disabled={sending || !subject.trim() || !html.trim()}
            className="btn btn-primary"
          >
            {sending ? "Sending..." : `Send to All Users (${count})`}
          </button>
        ) : (
          <div className="flex items-center gap-3 p-4 rounded-lg border border-[var(--no-color)]/30 bg-[var(--no-color)]/5">
            <span className="text-sm font-medium">
              Send &ldquo;{subject}&rdquo; to {count} user{count !== 1 ? "s" : ""}?
            </span>
            <button onClick={handleSend} className="btn btn-primary text-sm">
              Confirm Send
            </button>
            <button onClick={() => setShowConfirm(false)} className="btn btn-outline text-sm">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
