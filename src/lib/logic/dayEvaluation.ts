import type { DailyLog } from '@/types'

/** True when all 6 checklist flags are met and the day's logged workouts satisfy the spacing/outdoor rules. */
export function isDayFullyCompliant(log: DailyLog, workoutsValid: boolean): boolean {
  return (
    log.workout1Complete &&
    log.workout2Complete &&
    log.waterTargetComplete &&
    log.readingTargetComplete &&
    log.dietCompliant &&
    log.photoCaptured &&
    workoutsValid
  )
}

export function emptyChecklistDefaults(): Pick<
  DailyLog,
  | 'workout1Complete'
  | 'workout2Complete'
  | 'waterTargetComplete'
  | 'readingTargetComplete'
  | 'dietCompliant'
  | 'photoCaptured'
> {
  return {
    workout1Complete: false,
    workout2Complete: false,
    waterTargetComplete: false,
    readingTargetComplete: false,
    dietCompliant: false,
    photoCaptured: false,
  }
}
