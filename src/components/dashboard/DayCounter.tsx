import { TOTAL_PROGRAM_DAYS } from '@/lib/logic/constants'

interface DayCounterProps {
  dayNumber: number
  completed?: boolean
}

export function DayCounter({ dayNumber, completed = false }: DayCounterProps) {
  const percent = Math.min(100, Math.max(0, (dayNumber / TOTAL_PROGRAM_DAYS) * 100))

  return (
    <div
      className={`relative flex flex-col items-center gap-1 rounded-3xl border transition-all duration-500 overflow-hidden px-6 py-8 ${
        completed
          ? 'border-green-500/30 bg-gradient-to-b from-green-500/[0.08] to-transparent shadow-[0_12px_40px_rgba(34,197,94,0.15)] scale-[1.02]'
          : 'border-white/10 bg-gradient-to-b from-white/[0.07] to-transparent shadow-2xl'
      }`}
    >
      {/* Background spotlights */}
      {completed ? (
        <>
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-green-500/25 blur-2xl pointer-events-none animate-pulse" />
          <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-emerald-500/15 blur-2xl pointer-events-none animate-pulse" />
        </>
      ) : (
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-purple-500/20 blur-2xl pointer-events-none" />
      )}

      {/* Title */}
      <span
        className={`text-xs uppercase tracking-widest font-bold transition-colors duration-300 ${
          completed ? 'text-green-400' : 'text-purple-400'
        }`}
      >
        {completed ? 'Day Complete! 🎉' : 'Challenge Progress'}
      </span>

      {/* Day Count */}
      <span
        className={`text-7xl font-extrabold py-2 transition-all duration-300 ${
          completed
            ? 'text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 scale-105 drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]'
            : 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400'
        }`}
      >
        {dayNumber}
      </span>

      {/* Description text */}
      <span className={`text-xs font-semibold transition-colors duration-300 ${completed ? 'text-green-300' : 'text-gray-400'}`}>
        {completed ? 'All 6 goals checked off! Keep it up!' : `of ${TOTAL_PROGRAM_DAYS} days completed`}
      </span>

      {/* Progress Bar */}
      <div className="mt-4 h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
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
