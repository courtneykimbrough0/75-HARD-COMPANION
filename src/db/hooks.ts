import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect } from 'react'
import { db, ensureAppMetaSeeded } from '@/db/db'
import {
  catchUpEvaluation,
  ensureWaterRowForToday,
  getAllMeals,
  getAllWorkoutTemplates,
  getPlanForWeek,
  getWorkoutsForDate,
} from '@/db/repository'
import {
  getWeekStartDate,
  parseLocalDateString,
  todayLocalDateString,
} from '@/lib/logic/dateUtils'
import type { AppMeta, DateString } from '@/types'

export function useAppMeta(): AppMeta | undefined {
  return useLiveQuery(async () => {
    await ensureAppMetaSeeded()
    const rows = await db.appMeta.toArray()
    return Object.fromEntries(rows.map((r) => [r.key, r.value])) as unknown as AppMeta
  }, [])
}

export function useTodayLog(date: DateString = todayLocalDateString()) {
  return useLiveQuery(() => db.dailyLogs.get(date), [date])
}

export function useTodayWater(date: DateString = todayLocalDateString()) {
  return useLiveQuery(() => db.waterLogs.get(date), [date])
}

export function useWorkoutsForDate(date: DateString = todayLocalDateString()) {
  return useLiveQuery(() => getWorkoutsForDate(date), [date])
}

export function useWeekPlan(weekStartDate: DateString) {
  return useLiveQuery(() => getPlanForWeek(weekStartDate), [weekStartDate])
}

export function useAllMeals() {
  return useLiveQuery(() => getAllMeals(), [])
}

export function useAllWorkoutTemplates() {
  return useLiveQuery(() => getAllWorkoutTemplates(), [])
}

/**
 * Today's slice of the weekly plan. Days embed their own copy of whatever was
 * assigned — see `plannedDaySchema` — so this just locates today's entry, no
 * hydration against the live library needed.
 */
export function useTodayPlan(date: DateString = todayLocalDateString()) {
  return useLiveQuery(async () => {
    const plan = await getPlanForWeek(getWeekStartDate(date))
    const dayOfWeek = parseLocalDateString(date).getDay()
    const day = plan?.days.find((d) => d.dayOfWeek === dayOfWeek)
    if (!day) return undefined
    return { day, workout1: day.workout1, workout2: day.workout2, meals: day.meals }
  }, [date])
}

export function useAllDailyLogs() {
  return useLiveQuery(() => db.dailyLogs.orderBy('date').toArray(), [])
}

export function useAllPhotos() {
  return useLiveQuery(() => db.photos.orderBy('date').toArray(), [])
}

export function useTodayPhoto(date: DateString = todayLocalDateString()) {
  return useLiveQuery(() => db.photos.get(date), [date])
}

/** Runs day-rollover housekeeping (catch-up evaluation + water row init) on mount and foreground. */
export function useDayRollover(): void {
  useEffect(() => {
    const runRollover = () => {
      void ensureWaterRowForToday(todayLocalDateString())
      void catchUpEvaluation()
    }

    runRollover()

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') runRollover()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])
}
