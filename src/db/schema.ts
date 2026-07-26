import Dexie, { type EntityTable } from 'dexie'
import type {
  AppMetaRow,
  DailyLog,
  Meal,
  PhotoRecord,
  WaterLog,
  WeeklyPlan,
  WorkoutRecord,
  WorkoutTemplate,
} from '@/types'

const V1_STORES = {
  dailyLogs: 'date, dayNumber, status',
  workoutRecords: '++id, date, [date+sessionNumber]',
  waterLogs: 'date',
  photos: 'date',
  weeklyPlans: 'weekStartDate',
  appMeta: 'key',
}

export class SeventyFiveHardDB extends Dexie {
  dailyLogs!: EntityTable<DailyLog, 'date'>
  workoutRecords!: EntityTable<WorkoutRecord, 'id'>
  waterLogs!: EntityTable<WaterLog, 'date'>
  photos!: EntityTable<PhotoRecord, 'date'>
  weeklyPlans!: EntityTable<WeeklyPlan, 'weekStartDate'>
  appMeta!: EntityTable<AppMetaRow, 'key'>
  meals!: EntityTable<Meal, 'id'>
  workoutTemplates!: EntityTable<WorkoutTemplate, 'id'>

  constructor() {
    super('75HardCompanion')
    this.version(1).stores(V1_STORES)

    // v2 only adds stores for the reusable planner library. Dexie preserves
    // existing rows for unchanged stores, so no upgrade function is needed —
    // and legacy `weeklyPlans` rows are left as-is rather than being parsed
    // into structured meals, which would be guesswork.
    this.version(2).stores({
      ...V1_STORES,
      meals: 'id, name, slot',
      workoutTemplates: 'id, name, kind',
    })
  }
}
