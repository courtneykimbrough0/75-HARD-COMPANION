import { IncrementButtonGroup } from '@/components/water/IncrementButtonGroup'
import { WaterProgressRing } from '@/components/water/WaterProgressRing'
import { useTodayWater } from '@/db/hooks'
import { addWaterIncrement } from '@/db/repository'
import { todayLocalDateString } from '@/lib/logic/dateUtils'

const today = todayLocalDateString()

export default function Water() {
  const water = useTodayWater(today)
  const volumeOz = water?.volumeOz ?? 0

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold text-white">Water</h1>
      <WaterProgressRing volumeOz={volumeOz} />
      <IncrementButtonGroup onAdd={(amount) => void addWaterIncrement(today, amount)} />
    </div>
  )
}
