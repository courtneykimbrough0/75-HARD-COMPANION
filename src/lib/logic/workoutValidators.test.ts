import { describe, expect, it } from 'vitest'
import {
  isWorkoutDurationMet,
  validateDayWorkouts,
  validateOutdoorRequirement,
  validateWorkoutSpacing,
} from './workoutValidators'
import type { WorkoutRecord } from '@/types'

describe('workoutValidators', () => {
  it('isWorkoutDurationMet checks 45 minute minimum (2700s)', () => {
    expect(isWorkoutDurationMet(2699)).toBe(false)
    expect(isWorkoutDurationMet(2700)).toBe(true)
    expect(isWorkoutDurationMet(3600)).toBe(true)
  })

  it('validateWorkoutSpacing requires >= 3 hours (10800000 ms) gap', () => {
    const first: WorkoutRecord = {
      date: '2026-07-24',
      sessionNumber: 1,
      startTime: 1000000,
      endTime: 1000000 + 2700 * 1000,
      isOutdoor: false,
      durationSeconds: 2700,
    }
    const secondClose: WorkoutRecord = {
      date: '2026-07-24',
      sessionNumber: 2,
      startTime: first.endTime! + 2 * 60 * 60 * 1000, // 2 hours after
      endTime: first.endTime! + 2.75 * 60 * 60 * 1000,
      isOutdoor: true,
      durationSeconds: 2700,
    }
    const secondSpaced: WorkoutRecord = {
      date: '2026-07-24',
      sessionNumber: 2,
      startTime: first.endTime! + 3 * 60 * 60 * 1000, // 3 hours after
      endTime: first.endTime! + 3.75 * 60 * 60 * 1000,
      isOutdoor: true,
      durationSeconds: 2700,
    }

    expect(validateWorkoutSpacing(first, secondClose)).toBe(false)
    expect(validateWorkoutSpacing(first, secondSpaced)).toBe(true)
  })

  it('validateOutdoorRequirement requires at least one outdoor session', () => {
    const indoor1: WorkoutRecord = {
      date: '2026-07-24',
      sessionNumber: 1,
      startTime: 100,
      endTime: 2800,
      isOutdoor: false,
      durationSeconds: 2700,
    }
    const indoor2: WorkoutRecord = {
      date: '2026-07-24',
      sessionNumber: 2,
      startTime: 20000,
      endTime: 22700,
      isOutdoor: false,
      durationSeconds: 2700,
    }
    const outdoor2: WorkoutRecord = { ...indoor2, isOutdoor: true }

    expect(validateOutdoorRequirement(indoor1, indoor2)).toBe(false)
    expect(validateOutdoorRequirement(indoor1, outdoor2)).toBe(true)
  })

  it('validateDayWorkouts evaluates complete day criteria and narrows spacing override', () => {
    const first: WorkoutRecord = {
      date: '2026-07-24',
      sessionNumber: 1,
      startTime: 1000000,
      endTime: 1000000 + 2700 * 1000,
      isOutdoor: false,
      durationSeconds: 2700,
    }
    const secondCloseOutdoor: WorkoutRecord = {
      date: '2026-07-24',
      sessionNumber: 2,
      startTime: first.endTime! + 1000,
      endTime: first.endTime! + 2701 * 1000,
      isOutdoor: true,
      durationSeconds: 2700,
    }
    const secondCloseIndoor: WorkoutRecord = {
      ...secondCloseOutdoor,
      isOutdoor: false,
    }
    const secondSpacedOutdoor: WorkoutRecord = {
      date: '2026-07-24',
      sessionNumber: 2,
      startTime: first.endTime! + 3.1 * 60 * 60 * 1000,
      endTime: first.endTime! + 4 * 60 * 60 * 1000,
      isOutdoor: true,
      durationSeconds: 2700,
    }
    const firstShort: WorkoutRecord = {
      ...first,
      durationSeconds: 2000, // Under 45 minutes
    }

    // Without override
    expect(validateDayWorkouts([first])).toBe(false)
    expect(validateDayWorkouts([first, secondCloseOutdoor])).toBe(false)
    expect(validateDayWorkouts([first, secondSpacedOutdoor])).toBe(true)

    // With spacing override (bypasses ONLY 3-hour spacing)
    expect(validateDayWorkouts([first, secondCloseOutdoor], true)).toBe(true)
    expect(validateDayWorkouts([first, secondCloseIndoor], true)).toBe(false) // Fails outdoor rule!
    expect(validateDayWorkouts([firstShort, secondSpacedOutdoor], true)).toBe(false) // Fails duration rule!
  })
})
