import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect } from 'react'
import { db, ensureAppMetaSeeded } from '@/db/db'
import { catchUpEvaluation, ensureWaterRowForToday, getWorkoutsForDate } from '@/db/repository'
import { todayLocalDateString } from '@/lib/logic/dateUtils'
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
  return useLiveQuery(() => db.weeklyPlans.get(weekStartDate), [weekStartDate])
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
