import { TOTAL_PROGRAM_DAYS } from '@/lib/logic/constants'
import { formatDisplayDate } from '@/lib/logic/dateUtils'
import type { DateString } from '@/types'

interface DayCounterProps {
  dayNumber: number
  date: DateString
  /** Daily rules met so far, for the at-a-glance count. */
  rulesComplete: number
  rulesTotal: number
  completed?: boolean
}

/**
 * Compact header strip: which day it is, today's date, how many rules are done,
 * and overall program progress. Deliberately short so the checklist below it
 * stays above the fold.
 */
export function DayCounter({
  dayNumber,
  date,
  rulesComplete,
  rulesTotal,
  completed = false,
}: DayCounterProps) {
  const percent = Math.min(100, Math.max(0, (dayNumber / TOTAL_PROGRAM_DAYS) * 100))

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border px-4 py-3 transition-all duration-500 ${
        completed
          ? 'border-green-500/30 bg-gradient-to-r from-green-500/[0.08] to-transparent shadow-[0_8px_28px_rgba(34,197,94,0.12)]'
          : 'border-white/10 bg-gradient-to-r from-white/[0.06] to-transparent'
      }`}
    >
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl ${
          completed ? 'bg-green-500/25' : 'bg-purple-500/20'
        }`}
      />

      <div className="relative flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span
            className={`text-4xl font-extrabold leading-none text-transparent bg-clip-text ${
              completed
                ? 'bg-gradient-to-r from-green-400 to-emerald-400'
                : 'bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400'
            }`}
          >
            {dayNumber}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
            / {TOTAL_PROGRAM_DAYS}
          </span>
        </div>

        <div className="flex flex-col items-end">
          <span
            className={`text-[11px] font-bold uppercase tracking-wider ${
              completed ? 'text-green-400' : 'text-purple-400'
            }`}
          >
            {completed ? 'Day complete 🎉' : `${rulesComplete} of ${rulesTotal} done`}
          </span>
          <span className="text-[11px] font-medium text-gray-500">{formatDisplayDate(date)}</span>
        </div>
      </div>

      <div className="relative mt-3 h-1 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full transition-all duration-1000 ease-out ${
            completed
              ? 'bg-gradient-to-r from-green-500 to-emerald-400'
              : 'bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
