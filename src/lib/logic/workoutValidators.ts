import { WORKOUT_MIN_MINUTES, WORKOUT_MIN_SPACING_HOURS } from '@/lib/logic/constants'
import type { WorkoutRecord } from '@/types'

export function isWorkoutDurationMet(durationSeconds: number): boolean {
  return durationSeconds >= WORKOUT_MIN_MINUTES * 60
}

/** True once both sessions have finished and are spaced at least 3 hours apart. */
export function validateWorkoutSpacing(
  first: WorkoutRecord,
  second: WorkoutRecord,
): boolean {
  if (first.endTime == null || second.startTime == null) return false
  const gapMs = second.startTime - first.endTime
  return gapMs >= WORKOUT_MIN_SPACING_HOURS * 60 * 60 * 1000
}

export function validateOutdoorRequirement(
  first: WorkoutRecord,
  second: WorkoutRecord,
): boolean {
  return first.isOutdoor || second.isOutdoor
}

/**
 * Full day-level workout validation: both sessions logged, each meeting the duration
 * minimum, spaced >=3hrs apart (or spacingOverridden), and at least one outdoor.
 */
export function validateDayWorkouts(
  records: WorkoutRecord[],
  spacingOverridden = false,
): boolean {
  const session1 = records.find((r) => r.sessionNumber === 1)
  const session2 = records.find((r) => r.sessionNumber === 2)
  if (!session1 || !session2) return false
  if (!isWorkoutDurationMet(session1.durationSeconds)) return false
  if (!isWorkoutDurationMet(session2.durationSeconds)) return false

  const [earlier, later] =
    session1.startTime <= session2.startTime ? [session1, session2] : [session2, session1]

  const spacingValid = spacingOverridden || validateWorkoutSpacing(earlier, later)
  const outdoorValid = validateOutdoorRequirement(session1, session2)

  return spacingValid && outdoorValid
}
