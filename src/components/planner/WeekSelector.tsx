import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDisplayDate } from '@/lib/logic/dateUtils'
import type { DateString } from '@/types'

interface WeekSelectorProps {
  actualStartDate: DateString
  actualEndDate: DateString
  onPrev: () => void
  onNext: () => void
  prevDisabled?: boolean
  nextDisabled?: boolean
}

export function WeekSelector({
  actualStartDate,
  actualEndDate,
  onPrev,
  onNext,
  prevDisabled,
  nextDisabled,
}: WeekSelectorProps) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-gray-900 px-4 py-3">
      <button
        type="button"
        onClick={onPrev}
        disabled={prevDisabled}
        className="text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 disabled:cursor-not-allowed cursor-pointer"
      >
        <ChevronLeft size={20} />
      </button>
      <span className="text-sm text-gray-200">
        {formatDisplayDate(actualStartDate)} – {formatDisplayDate(actualEndDate)}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 disabled:cursor-not-allowed cursor-pointer"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  )
}
