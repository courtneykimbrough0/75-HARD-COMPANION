import { db, ensureAppMetaSeeded } from '@/db/db'
import { WORKOUT_MIN_MINUTES } from '@/lib/logic/constants'
import { emptyChecklistDefaults, isDayFullyCompliant } from '@/lib/logic/dayEvaluation'
import { addDays, isDateBefore, todayLocalDateString } from '@/lib/logic/dateUtils'
import { clampWaterVolume, isWaterTargetMet } from '@/lib/logic/waterLogic'
import { validateDayWorkouts } from '@/lib/logic/workoutValidators'
import type {
  AppMeta,
  ChecklistFlag,
  DailyLog,
  DateString,
  WeeklyPlan,
  WorkoutRecord,
} from '@/types'

async function getAppMetaValue<K extends keyof AppMeta>(key: K): Promise<AppMeta[K]> {
  await ensureAppMetaSeeded()
  const row = await db.appMeta.get(key)
  return row!.value as AppMeta[K]
}

async function setAppMetaValue<K extends keyof AppMeta>(
  key: K,
  value: AppMeta[K],
): Promise<void> {
  await db.appMeta.put({ key, value })
}

export async function getOrCreateDailyLog(date: DateString): Promise<DailyLog> {
  const existing = await db.dailyLogs.get(date)
  if (existing) return existing

  const dayNumber = await getAppMetaValue('currentDayCounter')
  const now = Date.now()
  const log: DailyLog = {
    date,
    dayNumber,
    ...emptyChecklistDefaults(),
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  }
  await db.dailyLogs.put(log)
  return log
}

export async function setChecklistFlag(
  date: DateString,
  flag: ChecklistFlag,
  value: boolean,
): Promise<void> {
  await getOrCreateDailyLog(date)
  await db.dailyLogs.update(date, { [flag]: value, updatedAt: Date.now() })
}

// ---------- Water ----------

export async function ensureWaterRowForToday(date: DateString): Promise<void> {
  const existing = await db.waterLogs.get(date)
  if (!existing) {
    await db.waterLogs.put({ date, volumeOz: 0, lastUpdated: Date.now() })
  }
}

export async function addWaterIncrement(date: DateString, amountOz: number): Promise<void> {
  await ensureWaterRowForToday(date)
  const row = await db.waterLogs.get(date)
  const nextVolume = clampWaterVolume((row?.volumeOz ?? 0) + amountOz)
  await db.waterLogs.put({ date, volumeOz: nextVolume, lastUpdated: Date.now() })
  await setChecklistFlag(date, 'waterTargetComplete', isWaterTargetMet(nextVolume))
}

// ---------- Workouts ----------

export async function getWorkoutsForDate(date: DateString): Promise<WorkoutRecord[]> {
  return db.workoutRecords.where('date').equals(date).sortBy('startTime')
}

/**
 * Synchronizes workout1Complete and workout2Complete flags in the DailyLog
 * based on all completed workout records for the specified calendar date.
 */
export async function syncWorkoutFlags(date: DateString): Promise<void> {
  const workouts = await getWorkoutsForDate(date)
  const session1 = workouts.find((r) => r.sessionNumber === 1)
  const session2 = workouts.find((r) => r.sessionNumber === 2)
  const workout1Complete =
    !!session1 && session1.endTime !== null && session1.durationSeconds >= WORKOUT_MIN_MINUTES * 60
  const workout2Complete =
    !!session2 && session2.endTime !== null && session2.durationSeconds >= WORKOUT_MIN_MINUTES * 60

  await getOrCreateDailyLog(date)
  await db.dailyLogs.update(date, {
    workout1Complete,
    workout2Complete,
    updatedAt: Date.now(),
  })
}

export async function startWorkoutSession(
  date: DateString,
  isOutdoor: boolean,
): Promise<WorkoutRecord> {
  const existing = await getWorkoutsForDate(date)
  if (existing.length >= 2) {
    throw new Error('Both workout sessions are already logged for this day')
  }
  const usedNumbers = new Set(existing.map((r) => r.sessionNumber))
  const sessionNumber = ([1, 2].find((n) => !usedNumbers.has(n as 1 | 2)) ?? 1) as 1 | 2
  const record: WorkoutRecord = {
    date,
    sessionNumber,
    startTime: Date.now(),
    endTime: null,
    isOutdoor,
    durationSeconds: 0,
  }
  const id = await db.workoutRecords.add(record)
  await syncWorkoutFlags(date)
  return { ...record, id }
}

/**
 * Stops a session. `activeDurationSeconds`, when provided, is used as the credited duration
 * (e.g. wall-clock time minus any paused time); otherwise it's derived from endTime-startTime.
 */
export async function stopWorkoutSession(
  id: number,
  activeDurationSeconds?: number,
): Promise<WorkoutRecord> {
  const record = await db.workoutRecords.get(id)
  if (!record) throw new Error('Workout record not found')

  const endTime = Date.now()
  const durationSeconds =
    activeDurationSeconds ?? Math.round((endTime - record.startTime) / 1000)
  const updated: WorkoutRecord = { ...record, endTime, durationSeconds }
  await db.workoutRecords.put(updated)

  await syncWorkoutFlags(record.date)

  return updated
}

/**
 * Deletes a recorded workout session by ID, re-indexes remaining sessions,
 * and synchronizes daily log workout flags.
 */
export async function deleteWorkoutSession(id: number): Promise<void> {
  const record = await db.workoutRecords.get(id)
  if (!record) return

  await db.workoutRecords.delete(id)
  const remaining = await getWorkoutsForDate(record.date)
  for (let i = 0; i < remaining.length; i++) {
    const expectedSession = (i + 1) as 1 | 2
    if (remaining[i].sessionNumber !== expectedSession && remaining[i].id != null) {
      await db.workoutRecords.update(remaining[i].id!, { sessionNumber: expectedSession })
    }
  }
  await syncWorkoutFlags(record.date)
}

/**
 * Creates and immediately logs a completed 45-minute workout session
 * without requiring the user to run an active timer.
 */
export async function quickCompleteWorkoutSession(
  date: DateString,
  isOutdoor: boolean,
): Promise<WorkoutRecord> {
  const existing = await getWorkoutsForDate(date)
  if (existing.length >= 2) {
    throw new Error('Both workout sessions are already logged for this day')
  }
  const usedNumbers = new Set(existing.map((r) => r.sessionNumber))
  const sessionNumber = ([1, 2].find((n) => !usedNumbers.has(n as 1 | 2)) ?? 1) as 1 | 2
  const now = Date.now()
  const record: WorkoutRecord = {
    date,
    sessionNumber,
    startTime: now - (WORKOUT_MIN_MINUTES * 60 * 1000),
    endTime: now,
    isOutdoor,
    durationSeconds: WORKOUT_MIN_MINUTES * 60,
  }
  const id = await db.workoutRecords.add(record)
  await syncWorkoutFlags(date)
  return { ...record, id }
}

// ---------- Photos ----------

export async function savePhotoBlob(date: DateString, blob: Blob): Promise<void> {
  await db.photos.put({ date, blob, capturedAt: Date.now(), mimeType: blob.type })
  await setChecklistFlag(date, 'photoCaptured', true)
}

export async function getAllPhotos() {
  return db.photos.orderBy('date').toArray()
}

// ---------- Planner ----------

export async function savePlannerWeek(plan: WeeklyPlan): Promise<void> {
  await db.weeklyPlans.put(plan)
}

export async function getPlanForWeek(weekStartDate: DateString) {
  return db.weeklyPlans.get(weekStartDate)
}

// ---------- Day evaluation & reset ----------

/**
 * Certifies/overrides workout spacing for a specific date (current or past day).
 * If a pending reset was active for that date, clears the pending reset, rolls back
 * lastEvaluatedDate to the day before, and re-runs catchUpEvaluation.
 */
export async function overridePastDaySpacing(date: DateString): Promise<void> {
  await getOrCreateDailyLog(date)
  await db.dailyLogs.update(date, { workoutsSpacingOverridden: true, updatedAt: Date.now() })

  const pendingReason = await getAppMetaValue('pendingResetReason')
  if (pendingReason && pendingReason.includes(date)) {
    await setAppMetaValue('pendingResetReason', null)
    await setAppMetaValue('lastEvaluatedDate', addDays(date, -1))
    await catchUpEvaluation()
  }
}

/**
 * Walks forward from the day after `lastEvaluatedDate` through yesterday, scoring each day
 * pass/fail. Auto-increments the counter on passes. Stops (without resetting) at the first
 * failure and surfaces `pendingResetReason` for the dashboard to confirm before resetting.
 * A day with no logged data (app not opened) counts as an automatic fail.
 */
export async function catchUpEvaluation(): Promise<void> {
  await ensureAppMetaSeeded()

  const pendingReason = await getAppMetaValue('pendingResetReason')
  if (pendingReason) return // awaiting user confirmation; don't evaluate further

  const today = todayLocalDateString()
  let lastEvaluated = await getAppMetaValue('lastEvaluatedDate')
  const cycleStart = await getAppMetaValue('cycleStartDate')
  let cursor = lastEvaluated ? addDays(lastEvaluated, 1) : cycleStart

  while (isDateBefore(cursor, today)) {
    const log = await getOrCreateDailyLog(cursor)
    const workouts = await getWorkoutsForDate(cursor)
    const workoutsValid = validateDayWorkouts(workouts) || !!log.workoutsSpacingOverridden
    const passed = isDayFullyCompliant(log, workoutsValid)

    if (passed) {
      const counter = await getAppMetaValue('currentDayCounter')
      await db.dailyLogs.update(cursor, { status: 'pass', updatedAt: Date.now() })
      await setAppMetaValue('currentDayCounter', counter + 1)
      await setAppMetaValue('lastEvaluatedDate', cursor)
      lastEvaluated = cursor
      cursor = addDays(cursor, 1)
    } else {
      await db.dailyLogs.update(cursor, { status: 'fail', updatedAt: Date.now() })
      await setAppMetaValue('lastEvaluatedDate', cursor)
      await setAppMetaValue(
        'pendingResetReason',
        `Day ${log.dayNumber} (${cursor}) did not meet all 6 requirements.`,
      )
      return
    }
  }
}

export async function resetToDayOne(): Promise<void> {
  const today = todayLocalDateString()
  const now = Date.now()

  await db.transaction('rw', db.appMeta, db.dailyLogs, async () => {
    await setAppMetaValue('currentDayCounter', 1)
    await setAppMetaValue('cycleStartDate', today)
    await setAppMetaValue('lastEvaluatedDate', addDays(today, -1))
    await setAppMetaValue('pendingResetReason', null)

    await db.dailyLogs.put({
      date: today,
      dayNumber: 1,
      ...emptyChecklistDefaults(),
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    })
  })
}
