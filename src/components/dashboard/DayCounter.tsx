import { TOTAL_PROGRAM_DAYS } from '@/lib/logic/constants'

interface DayCounterProps {
  dayNumber: number
}

export function DayCounter({ dayNumber }: DayCounterProps) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl bg-gray-900 py-8">
      <span className="text-sm uppercase tracking-wide text-gray-500">Day</span>
      <span className="text-6xl font-bold text-white">{dayNumber}</span>
      <span className="text-sm text-gray-500">of {TOTAL_PROGRAM_DAYS}</span>
    </div>
  )
}
