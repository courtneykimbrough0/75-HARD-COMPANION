import { useEffect } from 'react'
import { ChecklistItem } from '@/components/dashboard/ChecklistItem'
import { DayCounter } from '@/components/dashboard/DayCounter'
import { ResetConfirmationBanner } from '@/components/dashboard/ResetConfirmationBanner'
import { useAppMeta, useTodayLog, useWorkoutsForDate } from '@/db/hooks'
import { getOrCreateDailyLog, resetToDayOne, setChecklistFlag } from '@/db/repository'
import { todayLocalDateString } from '@/lib/logic/dateUtils'
import { validateDayWorkouts } from '@/lib/logic/workoutValidators'
import { isDayFullyCompliant } from '@/lib/logic/dayEvaluation'

const today = todayLocalDateString()

export default function Dashboard() {
  const appMeta = useAppMeta()
  const log = useTodayLog(today)
  const workouts = useWorkoutsForDate(today)

  useEffect(() => {
    void getOrCreateDailyLog(today)
  }, [])

  if (!log || !appMeta) {
    return <p className="text-center text-gray-500 font-medium py-10">Loading…</p>
  }

  const workoutsValid = workouts ? validateDayWorkouts(workouts) : false
  const bothWorkoutsLogged = log.workout1Complete && log.workout2Complete
  const completedToday = isDayFullyCompliant(log, workoutsValid)

  return (
    <div className="flex flex-col gap-6 animate-page-enter">
      <DayCounter dayNumber={appMeta.currentDayCounter} completed={completedToday} />

      {appMeta.pendingResetReason && (
        <ResetConfirmationBanner
          reason={appMeta.pendingResetReason}
          onReset={() => void resetToDayOne()}
        />
      )}

      <div className="flex flex-col gap-3">
        <ChecklistItem label="Workout 1 (45 min)" complete={log.workout1Complete} linkTo="/workouts" />
        <ChecklistItem label="Workout 2 (45 min)" complete={log.workout2Complete} linkTo="/workouts" />
        {bothWorkoutsLogged && !workoutsValid && (
          <p className="-mt-2 pl-1 text-xs text-amber-400 font-semibold animate-pulse">
            Both workouts logged, but the 3-hour spacing / outdoor requirement isn't met yet.
          </p>
        )}
        <ChecklistItem label="Water (128 oz)" complete={log.waterTargetComplete} linkTo="/water" />
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
