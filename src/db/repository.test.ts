import { beforeEach, describe, expect, it } from 'vitest'
import 'fake-indexeddb/auto'
import { db, resetSeedCacheForTests } from './db'
import {
  addWaterIncrement,
  catchUpEvaluation,
  deleteWorkoutSession,
  getOrCreateDailyLog,
  getWorkoutsForDate,
  overridePastDaySpacing,
  quickCompleteWorkoutSession,
  startWorkoutSession,
} from './repository'
import { addDays, todayLocalDateString } from '@/lib/logic/dateUtils'
import type { WorkoutRecord } from '@/types'

describe('repository IndexedDB integration tests', () => {
  beforeEach(async () => {
    resetSeedCacheForTests()
    await db.delete()
    await db.open()
  })

  it('catchUpEvaluation honors workoutsSpacingOverridden on past dates', async () => {
    const today = todayLocalDateString()
    const yesterday = addDays(today, -1)
    const dayBeforeYesterday = addDays(today, -2)

    await db.appMeta.put({ key: 'cycleStartDate', value: yesterday })
    await db.appMeta.put({ key: 'lastEvaluatedDate', value: dayBeforeYesterday })
    await db.appMeta.put({ key: 'currentDayCounter', value: 1 })
    await db.appMeta.put({ key: 'pendingResetReason', value: null })

    await getOrCreateDailyLog(yesterday)
    await db.dailyLogs.update(yesterday, {
      workout1Complete: true,
      workout2Complete: true,
      waterTargetComplete: true,
      readingTargetComplete: true,
      dietCompliant: true,
      photoCaptured: true,
      workoutsSpacingOverridden: true,
    })

    // Seed 2 workouts < 3h apart (1 outdoor)
    const now = Date.now()
    const w1: WorkoutRecord = {
      date: yesterday,
      sessionNumber: 1,
      startTime: now - 100000,
      endTime: now - 90000,
      isOutdoor: false,
      durationSeconds: 2700,
    }
    const w2: WorkoutRecord = {
      date: yesterday,
      sessionNumber: 2,
      startTime: now - 80000,
      endTime: now - 70000,
      isOutdoor: true,
      durationSeconds: 2700,
    }
    await db.workoutRecords.bulkAdd([w1, w2])

    await catchUpEvaluation()

    const updatedLog = await db.dailyLogs.get(yesterday)
    expect(updatedLog?.status).toBe('pass')
    const pendingReason = await db.appMeta.get('pendingResetReason')
    expect(pendingReason?.value).toBeNull()
    const counter = await db.appMeta.get('currentDayCounter')
    expect(counter?.value).toBe(2)
  })

  it('overridePastDaySpacing resolves a pending reset for a failed date', async () => {
    const today = todayLocalDateString()
    const yesterday = addDays(today, -1)
    const dayBeforeYesterday = addDays(today, -2)

    await db.appMeta.put({ key: 'cycleStartDate', value: yesterday })
    await db.appMeta.put({ key: 'lastEvaluatedDate', value: dayBeforeYesterday })
    await db.appMeta.put({ key: 'currentDayCounter', value: 1 })
    await db.appMeta.put({ key: 'pendingResetReason', value: null })

    await getOrCreateDailyLog(yesterday)
    await db.dailyLogs.update(yesterday, {
      workout1Complete: true,
      workout2Complete: true,
      waterTargetComplete: true,
      readingTargetComplete: true,
      dietCompliant: true,
      photoCaptured: true,
    })

    // Seed 2 workouts < 3h apart without override
    const now = Date.now()
    const w1: WorkoutRecord = {
      date: yesterday,
      sessionNumber: 1,
      startTime: now - 100000,
      endTime: now - 90000,
      isOutdoor: false,
      durationSeconds: 2700,
    }
    const w2: WorkoutRecord = {
      date: yesterday,
      sessionNumber: 2,
      startTime: now - 80000,
      endTime: now - 70000,
      isOutdoor: true,
      durationSeconds: 2700,
    }
    await db.workoutRecords.bulkAdd([w1, w2])

    // First catch-up: fails due to spacing
    await catchUpEvaluation()
    let updatedLog = await db.dailyLogs.get(yesterday)
    expect(updatedLog?.status).toBe('fail')
    let pendingReason = await db.appMeta.get('pendingResetReason')
    expect(pendingReason?.value).toContain(yesterday)

    // Apply retroactive override
    await overridePastDaySpacing(yesterday)

    updatedLog = await db.dailyLogs.get(yesterday)
    expect(updatedLog?.status).toBe('pass')
    pendingReason = await db.appMeta.get('pendingResetReason')
    expect(pendingReason?.value).toBeNull()
    const counter = await db.appMeta.get('currentDayCounter')
    expect(counter?.value).toBe(2)
  })

  it('deleteWorkoutSession renumbers surviving sessions and prevents duplicates', async () => {
    const today = todayLocalDateString()
    const s1 = await quickCompleteWorkoutSession(today, false)
    await quickCompleteWorkoutSession(today, true)

    let records = await getWorkoutsForDate(today)
    expect(records.map((r) => r.sessionNumber)).toEqual([1, 2])

    // Delete session 1
    await deleteWorkoutSession(s1.id!)

    records = await getWorkoutsForDate(today)
    expect(records.length).toBe(1)
    expect(records[0].sessionNumber).toBe(1) // Renumbered from 2 to 1!

    // Start a new session
    await startWorkoutSession(today, true)
    records = await getWorkoutsForDate(today)
    expect(records.length).toBe(2)
    expect(records.map((r) => r.sessionNumber)).toEqual([1, 2]) // No duplicate session numbers!
  })

  it('addWaterIncrement adds and subtracts water volume, clamping at 0', async () => {
    const today = todayLocalDateString()
    await addWaterIncrement(today, 24)
    let waterRow = await db.waterLogs.get(today)
    expect(waterRow?.volumeOz).toBe(24)

    await addWaterIncrement(today, -8)
    waterRow = await db.waterLogs.get(today)
    expect(waterRow?.volumeOz).toBe(16)

    await addWaterIncrement(today, -30)
    waterRow = await db.waterLogs.get(today)
    expect(waterRow?.volumeOz).toBe(0)
  })
})
