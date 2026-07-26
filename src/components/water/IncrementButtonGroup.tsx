import { WATER_INCREMENTS_OZ } from '@/lib/logic/constants'

interface IncrementButtonGroupProps {
  onAdd: (amountOz: number) => void
}

export function IncrementButtonGroup({ onAdd }: IncrementButtonGroupProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {WATER_INCREMENTS_OZ.map((amount) => (
        <button
          key={amount}
          type="button"
          onClick={() => onAdd(amount)}
          className="cursor-pointer rounded-xl border border-white/5 bg-white/5 py-2 text-xs font-bold text-gray-300 transition-all duration-200 hover:border-white/10 hover:bg-white/10 active:scale-95"
        >
          +{amount} oz
        </button>
      ))}
    </div>
  )
}
