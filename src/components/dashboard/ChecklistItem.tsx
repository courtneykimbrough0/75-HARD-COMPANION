import { useState, type ReactNode } from 'react'
import { Check, ChevronDown, ChevronRight, CircleDot } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Toggle } from '@/components/ui/Toggle'

interface ChecklistItemProps {
  label: string
  complete: boolean
  /** Short line under the label describing current state, e.g. "64 / 128 oz". */
  detail?: string
  onToggle?: (value: boolean) => void
  linkTo?: string
  /** Revealed in place when the row is expanded. Renders an expand affordance. */
  expandedContent?: ReactNode
}

/**
 * A single daily rule. The row is both the status readout and the way in:
 * it either toggles in place, expands to reveal controls, or links to a
 * dedicated screen — exactly one of those, never several.
 */
export function ChecklistItem({
  label,
  complete,
  detail,
  onToggle,
  linkTo,
  expandedContent,
}: ChecklistItemProps) {
  const [expanded, setExpanded] = useState(false)

  const statusDot = (
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
        complete
          ? 'bg-green-500/20 text-green-400 border border-green-500/30 shadow-[0_0_8px_rgba(34,197,94,0.2)]'
          : 'bg-white/[0.03] text-gray-600 border border-white/5'
      }`}
    >
      {complete ? <Check size={14} /> : <CircleDot size={14} />}
    </span>
  )

  const body = (
    <div className="flex min-w-0 flex-1 flex-col">
      <span
        className={`truncate text-sm font-semibold transition-colors duration-300 ${
          complete ? 'text-gray-400' : 'text-gray-200'
        }`}
      >
        {label}
      </span>
      {detail && <span className="truncate text-xs font-medium text-gray-500">{detail}</span>}
    </div>
  )

  const shellClasses = `rounded-2xl border transition-all duration-300 ${
    complete
      ? 'border-green-500/10 bg-gradient-to-r from-green-500/[0.03] to-transparent'
      : 'border-white/[0.05] bg-white/[0.03]'
  }`
  const rowClasses = 'group flex w-full items-center gap-3 px-4 py-3.5 text-left'

  if (linkTo) {
    return (
      <Link to={linkTo} className={`${shellClasses} ${rowClasses} hover:border-white/10 hover:bg-white/[0.05]`}>
        {statusDot}
        {body}
        <ChevronRight
          size={16}
          className="shrink-0 text-gray-500 transition-transform duration-300 group-hover:translate-x-1"
        />
      </Link>
    )
  }

  if (expandedContent) {
    return (
      <div className={shellClasses}>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className={`${rowClasses} cursor-pointer rounded-2xl transition-colors hover:bg-white/[0.02]`}
        >
          {statusDot}
          {body}
          <ChevronDown
            size={16}
            className={`shrink-0 text-gray-500 transition-transform duration-300 ${
              expanded ? 'rotate-180' : ''
            }`}
          />
        </button>
        {expanded && <div className="flex flex-col gap-3 px-4 pb-4">{expandedContent}</div>}
      </div>
    )
  }

  return (
    <div className={`${shellClasses} ${rowClasses}`}>
      {statusDot}
      {body}
      {onToggle && <Toggle checked={complete} onChange={onToggle} label={label} />}
    </div>
  )
}
