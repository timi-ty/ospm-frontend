export default function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-5 w-16 bg-[var(--border-color)] rounded" />
        <div className="h-5 w-12 bg-[var(--border-color)] rounded-full" />
      </div>
      <div className="h-5 bg-[var(--border-color)] rounded w-full mb-2" />
      <div className="h-4 bg-[var(--border-color)] rounded w-3/4 mb-3" />
      <div className="h-3 bg-[var(--border-color)] rounded w-full mb-3" />
      <div className="probability-bar mb-3">
        <div className="probability-bar-fill bg-[var(--border-color)]" style={{ width: "50%" }} />
      </div>
      <div className="flex justify-between pt-3 border-t border-[var(--border-color)]">
        <div className="h-3 w-20 bg-[var(--border-color)] rounded" />
        <div className="h-3 w-24 bg-[var(--border-color)] rounded" />
      </div>
    </div>
  );
}
