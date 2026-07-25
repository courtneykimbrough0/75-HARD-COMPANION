import { Check, ChevronRight, X } from 'lucide-react'
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
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
        complete ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-600'
      }`}
    >
      {complete ? <Check size={14} /> : <X size={14} />}
    </span>
  )

  if (linkTo) {
    return (
      <Link
        to={linkTo}
        className="flex items-center gap-3 rounded-xl bg-gray-900 px-4 py-3 hover:bg-gray-800"
      >
        {statusDot}
        <span className="flex-1 text-sm text-gray-200">{label}</span>
        <ChevronRight size={16} className="text-gray-600" />
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-3 rounded-xl bg-gray-900 px-4 py-3">
      {statusDot}
      <span className="flex-1 text-sm text-gray-200">{label}</span>
      {onToggle && <Toggle checked={complete} onChange={onToggle} label={label} />}
    </div>
  )
}
