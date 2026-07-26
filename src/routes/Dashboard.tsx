import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { ChecklistItem } from '@/components/dashboard/ChecklistItem'
import { DayCounter } from '@/components/dashboard/DayCounter'
import { ResetConfirmationBanner } from '@/components/dashboard/ResetConfirmationBanner'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useAppMeta, useTodayLog, useWorkoutsForDate, useTodayWater } from '@/db/hooks'
import {
  getOrCreateDailyLog,
  resetToDayOne,
  setChecklistFlag,
  addWaterIncrement,
  overridePastDaySpacing,
} from '@/db/repository'
import { todayLocalDateString } from '@/lib/logic/dateUtils'
import { validateDayWorkouts } from '@/lib/logic/workoutValidators'
import { isDayFullyCompliant } from '@/lib/logic/dayEvaluation'
import type { DateString } from '@/types'

const today = todayLocalDateString()

export default function Dashboard() {
  const appMeta = useAppMeta()
  const log = useTodayLog(today)
  const workouts = useWorkoutsForDate(today)
  const water = useTodayWater(today)

  const failedDateMatch = appMeta?.pendingResetReason?.match(/\((20\d{2}-\d{2}-\d{2})\)/)
  const pendingFailedDate = failedDateMatch ? (failedDateMatch[1] as DateString) : undefined
  const pendingFailedLog = useTodayLog(pendingFailedDate ?? '')
  const pendingFailedWorkouts = useWorkoutsForDate(pendingFailedDate ?? '')

  useEffect(() => {
    void getOrCreateDailyLog(today)
  }, [])

  if (!log || !appMeta) {
    return <p className="text-center text-gray-500 font-medium py-10">Loading…</p>
  }

  const workoutsValid = (workouts ? validateDayWorkouts(workouts) : false) || !!log.workoutsSpacingOverridden
  const bothWorkoutsLogged = log.workout1Complete && log.workout2Complete
  const completedToday = isDayFullyCompliant(log, workoutsValid)
  const waterVolume = water?.volumeOz ?? 0

  const canOverridePendingResetSpacing =
    !!pendingFailedDate &&
    !!pendingFailedLog &&
    !!pendingFailedWorkouts &&
    pendingFailedLog.workout1Complete &&
    pendingFailedLog.workout2Complete &&
    pendingFailedLog.waterTargetComplete &&
    pendingFailedLog.readingTargetComplete &&
    pendingFailedLog.dietCompliant &&
    pendingFailedLog.photoCaptured &&
    !validateDayWorkouts(pendingFailedWorkouts)

  return (
    <div className="flex flex-col gap-6 animate-page-enter">
      <DayCounter dayNumber={appMeta.currentDayCounter} completed={completedToday} />

      {appMeta.pendingResetReason && (
        <ResetConfirmationBanner
          reason={appMeta.pendingResetReason}
          onReset={() => void resetToDayOne()}
          onOverrideSpacing={
            canOverridePendingResetSpacing
              ? () => void overridePastDaySpacing(pendingFailedDate!)
              : undefined
          }
        />
      )}

      {bothWorkoutsLogged && !workoutsValid && !log.workoutsSpacingOverridden && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-200">
          <div className="flex gap-2.5 items-start">
            <AlertTriangle className="shrink-0 text-amber-500 mt-0.5 animate-pulse" size={16} />
            <div className="flex-1 flex flex-col gap-2">
              <span className="font-semibold text-amber-400">3-Hour Spacing Conflict</span>
              <span>Your workouts are logged close together. Did you complete them 3+ hours apart in reality?</span>
              <button
                onClick={() => void setChecklistFlag(today, 'workoutsSpacingOverridden', true)}
                className="self-start px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/30 text-amber-200 cursor-pointer transition-all duration-200 active:scale-95"
              >
                Yes, Spacing Was Met
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Water Tracker Card */}
      <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-300">Water Intake</span>
          <span className="text-sm font-bold text-blue-400">{waterVolume} / 128 oz</span>
        </div>
        <div className="w-full">
          <ProgressBar
            value={waterVolume}
            max={128}
            colorClassName={waterVolume >= 128 ? 'bg-green-500' : 'bg-blue-500'}
          />
        </div>
        <div className="flex gap-2">
          {[8, 16, 24, 32].map((oz) => (
            <button
              key={oz}
              onClick={() => void addWaterIncrement(today, oz)}
              className="flex-1 py-1.5 text-xs font-bold rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-gray-300 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              +{oz} oz
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <ChecklistItem label="Workout 1 (45 min)" complete={log.workout1Complete} linkTo="/workouts" />
        <ChecklistItem label="Workout 2 (45 min)" complete={log.workout2Complete} linkTo="/workouts" />
        <ChecklistItem label="Water (128 oz)" complete={log.waterTargetComplete} />
        <ChecklistItem
          label="Reading (10 pages)"
          complete={log.readingTargetComplete}
          onToggle={(value) => void setChecklistFlag(today, 'readingTargetComplete', value)}
        />
        <ChecklistItem
          label="Diet (no cheats, no alcohol)"
          complete={log.dietCompliant}
          onToggle={(value) => void setChecklistFlag(today, 'dietCompliant', value)}
        />
        <ChecklistItem label="Progress Photo" complete={log.photoCaptured} linkTo="/photo" />
      </div>
    </div>
  )
}
