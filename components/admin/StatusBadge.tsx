const STATUS_STYLES: Record<string, string> = {
  open: "bg-[var(--yes-color)]/15 text-[var(--yes-color)]",
  pending: "bg-[var(--accent)]/15 text-[var(--accent)]",
  proposed: "bg-blue-100 text-blue-700",
  resolved: "bg-gray-100 text-gray-600",
  expired: "bg-[var(--no-color)]/15 text-[var(--no-color)]",
  pending_resolution: "bg-orange-100 text-orange-700",
  disputed: "bg-red-100 text-red-700",
  closed: "bg-gray-200 text-gray-700",
};

export default function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || "bg-gray-100 text-gray-500";
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${style}`}>
      {status.replace("_", " ")}
    </span>
  );
}
