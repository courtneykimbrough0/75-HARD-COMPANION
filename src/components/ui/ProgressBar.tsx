interface ProgressBarProps {
  value: number
  max: number
  colorClassName?: string
}

export function ProgressBar({ value, max, colorClassName = 'bg-purple-500' }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-gray-800">
      <div
        className={`h-full rounded-full transition-all ${colorClassName}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
