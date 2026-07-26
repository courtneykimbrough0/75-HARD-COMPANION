import { describe, expect, it } from 'vitest'
import { isDayFullyCompliant } from './dayEvaluation'
import type { DailyLog } from '@/types'

describe('dayEvaluation', () => {
  it('isDayFullyCompliant returns true only when all 6 checklist items AND workoutsValid are true', () => {
    const fullLog: DailyLog = {
      date: '2026-07-24',
      dayNumber: 1,
      workout1Complete: true,
      workout2Complete: true,
      waterTargetComplete: true,
      readingTargetComplete: true,
      dietCompliant: true,
      photoCaptured: true,
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    expect(isDayFullyCompliant(fullLog, true)).toBe(true)
    expect(isDayFullyCompliant(fullLog, false)).toBe(false)
    expect(isDayFullyCompliant({ ...fullLog, waterTargetComplete: false }, true)).toBe(false)
    expect(isDayFullyCompliant({ ...fullLog, dietCompliant: false }, true)).toBe(false)
  })
})
