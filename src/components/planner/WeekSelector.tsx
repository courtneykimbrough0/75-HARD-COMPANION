import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDisplayDate, getWeekEndDate } from '@/lib/logic/dateUtils'
import type { DateString } from '@/types'

interface WeekSelectorProps {
  weekStartDate: DateString
  onPrev: () => void
  onNext: () => void
}

export function WeekSelector({ weekStartDate, onPrev, onNext }: WeekSelectorProps) {
  const weekEndDate = getWeekEndDate(weekStartDate)
  return (
    <div className="flex items-center justify-between rounded-xl bg-gray-900 px-4 py-3">
      <button type="button" onClick={onPrev} className="text-gray-400 hover:text-white">
        <ChevronLeft size={20} />
      </button>
      <span className="text-sm text-gray-200">
        {formatDisplayDate(weekStartDate)} – {formatDisplayDate(weekEndDate)}
      </span>
      <button type="button" onClick={onNext} className="text-gray-400 hover:text-white">
        <ChevronRight size={20} />
      </button>
    </div>
  )
}
