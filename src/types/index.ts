export type DateString = string // YYYY-MM-DD, local calendar date
export type DayStatus = 'pending' | 'pass' | 'fail'

export interface DailyLog {
  date: DateString
  dayNumber: number
  workout1Complete: boolean
  workout2Complete: boolean
  waterTargetComplete: boolean
  readingTargetComplete: boolean
  dietCompliant: boolean
  photoCaptured: boolean
  status: DayStatus
  workoutsSpacingOverridden?: boolean
  createdAt: number
  updatedAt: number
}

export type ChecklistFlag =
  | 'workout1Complete'
  | 'workout2Complete'
  | 'waterTargetComplete'
  | 'readingTargetComplete'
  | 'dietCompliant'
  | 'photoCaptured'
  | 'workoutsSpacingOverridden'

export interface WorkoutRecord {
  id?: number
  date: DateString
  sessionNumber: 1 | 2
  startTime: number // epoch ms
  endTime: number | null // null while the timer is running
  isOutdoor: boolean
  durationSeconds: number
  /** Planner template this session was started from, when it was pre-filled. */
  templateId?: string
}

export interface WaterLog {
  date: DateString
  volumeOz: number
  lastUpdated: number
}

export interface PhotoRecord {
  date: DateString
  blob: Blob
  capturedAt: number
  mimeType: string
}

/**
 * Planner entities live in `@/lib/schemas/planner`, where the Zod schema is the
 * source of truth for both the type and runtime validation. Re-exported here so
 * the rest of the app keeps importing types from one place.
 */
export type {
  Dish,
  Exercise,
  Meal,
  MealSlot,
  PlannedDay,
  WeeklyPlan,
  WorkoutKind,
  WorkoutTemplate,
} from '@/lib/schemas/planner'

export interface AppMeta {
  currentDayCounter: number
  cycleStartDate: DateString
  lastEvaluatedDate: DateString | null
  pendingResetReason: string | null
}

export interface AppMetaRow<K extends keyof AppMeta = keyof AppMeta> {
  key: K
  value: AppMeta[K]
}
