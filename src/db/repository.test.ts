import { beforeEach, describe, expect, it } from 'vitest'
import 'fake-indexeddb/auto'
import { db } from './db'
import {
  catchUpEvaluation,
  deleteWorkoutSession,
  getOrCreateDailyLog,
  getWorkoutsForDate,
  overridePastDaySpacing,
  quickCompleteWorkoutSession,
  startWorkoutSession,
} from './repository'
import type { WorkoutRecord } from '@/types'

describe('repository IndexedDB integration tests', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
  })

  it('catchUpEvaluation honors workoutsSpacingOverridden on past dates', async () => {
    const pastDate = '2026-07-24'
    await db.appMeta.put({ key: 'cycleStartDate', value: pastDate })
    await db.appMeta.put({ key: 'lastEvaluatedDate', value: '2026-07-23' })
    await db.appMeta.put({ key: 'currentDayCounter', value: 1 })
    await db.appMeta.put({ key: 'pendingResetReason', value: null })

    await getOrCreateDailyLog(pastDate)
    await db.dailyLogs.update(pastDate, {
      workout1Complete: true,
      workout2Complete: true,
      waterTargetComplete: true,
      readingTargetComplete: true,
      dietCompliant: true,
      photoCaptured: true,
      workoutsSpacingOverridden: true,
    })

    // Seed 2 workouts < 3h apart
    const now = Date.now()
    const w1: WorkoutRecord = {
      date: pastDate,
      sessionNumber: 1,
      startTime: now - 100000,
      endTime: now - 90000,
      isOutdoor: false,
      durationSeconds: 2700,
    }
    const w2: WorkoutRecord = {
      date: pastDate,
      sessionNumber: 2,
      startTime: now - 80000,
      endTime: now - 70000,
      isOutdoor: true,
      durationSeconds: 2700,
    }
    await db.workoutRecords.bulkAdd([w1, w2])

    await catchUpEvaluation()

    const updatedLog = await db.dailyLogs.get(pastDate)
    expect(updatedLog?.status).toBe('pass')
    const pendingReason = await db.appMeta.get('pendingResetReason')
    expect(pendingReason?.value).toBeNull()
    const counter = await db.appMeta.get('currentDayCounter')
    expect(counter?.value).toBe(2)
  })

  it('overridePastDaySpacing resolves a pending reset for a failed date', async () => {
    const pastDate = '2026-07-24'
    await db.appMeta.put({ key: 'cycleStartDate', value: pastDate })
    await db.appMeta.put({ key: 'lastEvaluatedDate', value: '2026-07-23' })
    await db.appMeta.put({ key: 'currentDayCounter', value: 1 })
    await db.appMeta.put({ key: 'pendingResetReason', value: null })

    await getOrCreateDailyLog(pastDate)
    await db.dailyLogs.update(pastDate, {
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
      date: pastDate,
      sessionNumber: 1,
      startTime: now - 100000,
      endTime: now - 90000,
      isOutdoor: false,
      durationSeconds: 2700,
    }
    const w2: WorkoutRecord = {
      date: pastDate,
      sessionNumber: 2,
      startTime: now - 80000,
      endTime: now - 70000,
      isOutdoor: true,
      durationSeconds: 2700,
    }
    await db.workoutRecords.bulkAdd([w1, w2])

    // First catch-up: fails
    await catchUpEvaluation()
    let updatedLog = await db.dailyLogs.get(pastDate)
    expect(updatedLog?.status).toBe('fail')
    let pendingReason = await db.appMeta.get('pendingResetReason')
    expect(pendingReason?.value).toContain(pastDate)

    // Apply retroactive override
    await overridePastDaySpacing(pastDate)

    updatedLog = await db.dailyLogs.get(pastDate)
    expect(updatedLog?.status).toBe('pass')
    pendingReason = await db.appMeta.get('pendingResetReason')
    expect(pendingReason?.value).toBeNull()
    const counter = await db.appMeta.get('currentDayCounter')
    expect(counter?.value).toBe(2)
  })

  it('deleteWorkoutSession renumbers surviving sessions and prevents duplicates', async () => {
    const today = '2026-07-25'
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
})
