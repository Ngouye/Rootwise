export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="flex flex-col gap-1">
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progression"}
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        <div className="h-full rounded-full bg-gradient-to-r from-primary to-[oklch(0.7_0.12_205)] transition-[width] duration-700" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-muted-foreground">{pct} % terminé</span>
    </div>
  );
}
