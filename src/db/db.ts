import { SeventyFiveHardDB } from '@/db/schema'
import { todayLocalDateString } from '@/lib/logic/dateUtils'
import type { AppMeta } from '@/types'

export const db = new SeventyFiveHardDB()

const DEFAULT_APP_META: AppMeta = {
  currentDayCounter: 1,
  cycleStartDate: todayLocalDateString(),
  lastEvaluatedDate: null,
  pendingResetReason: null,
}

let seedPromise: Promise<void> | null = null

export function ensureAppMetaSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = db.transaction('rw', db.appMeta, async () => {
      const existingKeys = new Set(await db.appMeta.toCollection().primaryKeys())
      const missing = (Object.keys(DEFAULT_APP_META) as (keyof AppMeta)[]).filter(
        (key) => !existingKeys.has(key),
      )
      if (missing.length > 0) {
        await db.appMeta.bulkPut(
          missing.map((key) => ({ key, value: DEFAULT_APP_META[key] })),
        )
      }
    })
  }
  return seedPromise
}
