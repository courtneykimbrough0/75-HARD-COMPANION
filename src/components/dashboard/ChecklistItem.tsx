import { Check, ChevronRight, CircleDot } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Toggle } from '@/components/ui/Toggle'

interface ChecklistItemProps {
  label: string
  complete: boolean
  onToggle?: (value: boolean) => void
  linkTo?: string
}

export function ChecklistItem({ label, complete, onToggle, linkTo }: ChecklistItemProps) {
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

  const containerClasses = `group flex items-center gap-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:border-white/10 hover:bg-white/[0.05] px-4 py-3.5 transition-all duration-300 ${
    complete ? 'bg-gradient-to-r from-green-500/[0.03] to-transparent border-green-500/10' : ''
  }`

  if (linkTo) {
    return (
      <Link to={linkTo} className={containerClasses}>
        {statusDot}
        <span className={`flex-1 text-sm font-semibold transition-colors duration-300 ${complete ? 'text-gray-400' : 'text-gray-200'}`}>
          {label}
        </span>
        <ChevronRight size={16} className="text-gray-500 transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    )
  }

  return (
    <div className={containerClasses}>
      {statusDot}
      <span className={`flex-1 text-sm font-semibold transition-colors duration-300 ${complete ? 'text-gray-400' : 'text-gray-200'}`}>
        {label}
      </span>
      {onToggle && <Toggle checked={complete} onChange={onToggle} label={label} />}
    </div>
  )
}
