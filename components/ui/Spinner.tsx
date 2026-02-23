interface SpinnerProps {
  size?: "sm" | "default";
  label?: string;
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className ?? "w-10 h-10"} text-[var(--accent)]`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

export default function Spinner({ size = "default", label }: SpinnerProps) {
  if (size === "sm") {
    return <SpinnerIcon className="w-4 h-4" />;
  }

  return (
    <div className="text-center py-20">
      <div className="animate-pulse-glow inline-block p-4 rounded-2xl bg-white/80 mb-4 shadow-sm">
        <SpinnerIcon />
      </div>
      {label && <h2 className="text-xl font-semibold">{label}</h2>}
    </div>
  );
}
