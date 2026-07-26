import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { ChecklistItem } from '@/components/dashboard/ChecklistItem'
import { DayCounter } from '@/components/dashboard/DayCounter'
import { ResetConfirmationBanner } from '@/components/dashboard/ResetConfirmationBanner'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { IncrementButtonGroup } from '@/components/water/IncrementButtonGroup'
import { useAppMeta, useTodayLog, useTodayPlan, useWorkoutsForDate, useTodayWater } from '@/db/hooks'
import {
  getOrCreateDailyLog,
  resetToDayOne,
  setChecklistFlag,
  addWaterIncrement,
  overridePastDaySpacing,
} from '@/db/repository'
import { READING_TARGET_PAGES, WATER_TARGET_OZ, WORKOUT_MIN_MINUTES } from '@/lib/logic/constants'
import { MEAL_SLOT_LABELS } from '@/lib/schemas/planner'
import { todayLocalDateString } from '@/lib/logic/dateUtils'
import { validateDayWorkouts } from '@/lib/logic/workoutValidators'
import { isDayFullyCompliant } from '@/lib/logic/dayEvaluation'
import type { DateString, WorkoutRecord } from '@/types'

const today = todayLocalDateString()

/**
 * Short state line for a workout row: what happened, or — before anything is
 * logged — what the planner says you intended to do.
 */
function workoutDetail(
  record: WorkoutRecord | undefined,
  planned?: { name: string; isOutdoor: boolean },
  plannedTime?: string,
): string {
  if (!record) {
    if (!planned) return 'Not started'
    const time = plannedTime ? ` · ${plannedTime}` : ''
    return `Planned: ${planned.name}${planned.isOutdoor ? ' · outdoor' : ''}${time}`
  }
  if (record.endTime === null) return 'In progress…'
  const minutes = Math.round(record.durationSeconds / 60)
  return `${minutes} min · ${record.isOutdoor ? 'Outdoor' : 'Indoor'}`
}

export default function Dashboard() {
  const appMeta = useAppMeta()
  const log = useTodayLog(today)
  const workouts = useWorkoutsForDate(today)
  const water = useTodayWater(today)
  const todayPlan = useTodayPlan(today)

  const failedDateMatch = appMeta?.pendingResetReason?.match(/\((20\d{2}-\d{2}-\d{2})\)/)
  const pendingFailedDate = failedDateMatch ? (failedDateMatch[1] as DateString) : undefined
  const pendingFailedLog = useTodayLog(pendingFailedDate ?? '')
  const pendingFailedWorkouts = useWorkoutsForDate(pendingFailedDate ?? '')

  useEffect(() => {
    void getOrCreateDailyLog(today)
  }, [])

  if (!log || !appMeta) {
    return <p className="py-10 text-center font-medium text-gray-500">Loading…</p>
  }

  const workoutsValid = workouts
    ? validateDayWorkouts(workouts, !!log.workoutsSpacingOverridden)
    : false
  const bothWorkoutsLogged = log.workout1Complete && log.workout2Complete
  const workoutsMeetAllExceptSpacing = workouts ? validateDayWorkouts(workouts, true) : false
  const workoutsValidWithoutOverride = workouts ? validateDayWorkouts(workouts, false) : false
  const completedToday = isDayFullyCompliant(log, workoutsValid)
  const waterVolume = water?.volumeOz ?? 0

  const session1 = workouts?.find((r) => r.sessionNumber === 1)
  const session2 = workouts?.find((r) => r.sessionNumber === 2)
  const plannedMeals = todayPlan?.meals ?? []

  const rules = [
    log.workout1Complete,
    log.workout2Complete,
    log.waterTargetComplete,
    log.readingTargetComplete,
    log.dietCompliant,
    log.photoCaptured,
  ]
  const rulesComplete = rules.filter(Boolean).length

  const pendingFailedWorkoutsValidWithOverride = pendingFailedWorkouts
    ? validateDayWorkouts(pendingFailedWorkouts, true)
    : false
  const pendingFailedWorkoutsValidWithoutOverride = pendingFailedWorkouts
    ? validateDayWorkouts(pendingFailedWorkouts, false)
    : false

  const canOverridePendingResetSpacing =
    !!pendingFailedDate &&
    !!pendingFailedLog &&
    pendingFailedLog.workout1Complete &&
    pendingFailedLog.workout2Complete &&
    pendingFailedLog.waterTargetComplete &&
    pendingFailedLog.readingTargetComplete &&
    pendingFailedLog.dietCompliant &&
    pendingFailedLog.photoCaptured &&
    pendingFailedWorkoutsValidWithOverride &&
    !pendingFailedWorkoutsValidWithoutOverride

  return (
    <div className="animate-page-enter flex flex-col gap-4">
      <DayCounter
        dayNumber={appMeta.currentDayCounter}
        date={today}
        rulesComplete={rulesComplete}
        rulesTotal={rules.length}
        completed={completedToday}
      />

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

      {bothWorkoutsLogged &&
        workoutsMeetAllExceptSpacing &&
        !workoutsValidWithoutOverride &&
        !log.workoutsSpacingOverridden && (
          <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-200">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="mt-0.5 shrink-0 animate-pulse text-amber-500" size={16} />
              <div className="flex flex-1 flex-col gap-2">
                <span className="font-semibold text-amber-400">3-Hour Spacing Conflict</span>
                <span>
                  Your workouts are logged close together. Did you complete them 3+ hours apart in
                  reality?
                </span>
                <button
                  onClick={() => void setChecklistFlag(today, 'workoutsSpacingOverridden', true)}
                  className="cursor-pointer self-start rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-200 transition-all duration-200 hover:border-amber-500/30 hover:bg-amber-500/20 active:scale-95"
                >
                  Yes, Spacing Was Met
                </button>
              </div>
            </div>
          </div>
        )}

      <div className="flex flex-col gap-2.5">
        <ChecklistItem
          label={`Workout 1 (${WORKOUT_MIN_MINUTES} min)`}
          complete={log.workout1Complete}
          detail={workoutDetail(
            session1,
            todayPlan?.workout1,
            todayPlan?.day.workout1TargetTime,
          )}
          linkTo="/workouts"
        />
        <ChecklistItem
          label={`Workout 2 (${WORKOUT_MIN_MINUTES} min)`}
          complete={log.workout2Complete}
          detail={workoutDetail(
            session2,
            todayPlan?.workout2,
            todayPlan?.day.workout2TargetTime,
          )}
          linkTo="/workouts"
        />
        <ChecklistItem
          label="Water"
          complete={log.waterTargetComplete}
          detail={`${waterVolume} / ${WATER_TARGET_OZ} oz`}
          expandedContent={
            <>
              <ProgressBar
                value={waterVolume}
                max={WATER_TARGET_OZ}
                colorClassName={waterVolume >= WATER_TARGET_OZ ? 'bg-green-500' : 'bg-blue-500'}
              />
              <IncrementButtonGroup onAdd={(amount) => void addWaterIncrement(today, amount)} />
            </>
          }
        />
        <ChecklistItem
          label="Reading"
          complete={log.readingTargetComplete}
          detail={`${READING_TARGET_PAGES} pages`}
          onToggle={(value) => void setChecklistFlag(today, 'readingTargetComplete', value)}
        />
        <ChecklistItem
          label="Diet"
          complete={log.dietCompliant}
          detail={
            plannedMeals.length > 0
              ? `${plannedMeals.length} meal${plannedMeals.length === 1 ? '' : 's'} planned`
              : 'No cheat meals, no alcohol'
          }
          onToggle={(value) => void setChecklistFlag(today, 'dietCompliant', value)}
          expandedContent={
            plannedMeals.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {plannedMeals.map((meal) => (
                  <div key={meal.id} className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-gray-300">
                      {meal.name}
                      <span className="ml-1.5 font-medium text-gray-500">
                        {MEAL_SLOT_LABELS[meal.slot]}
                      </span>
                    </span>
                    <ul className="flex flex-col gap-0.5 pl-3">
                      {meal.dishes.map((dish) => (
                        <li key={dish.id} className="text-[11px] text-gray-400">
                          {dish.name}
                          {dish.amount && <span className="text-gray-600"> · {dish.amount}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : undefined
          }
        />
        <ChecklistItem
          label="Progress Photo"
          complete={log.photoCaptured}
          detail={log.photoCaptured ? 'Captured' : 'Not taken yet'}
          linkTo="/photo"
        />
      </div>
    </div>
  )
}
