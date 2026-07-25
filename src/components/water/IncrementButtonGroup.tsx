import { WATER_INCREMENTS_OZ } from '@/lib/logic/constants'

interface IncrementButtonGroupProps {
  onAdd: (amountOz: number) => void
}

export function IncrementButtonGroup({ onAdd }: IncrementButtonGroupProps) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {WATER_INCREMENTS_OZ.map((amount) => (
        <button
          key={amount}
          type="button"
          onClick={() => onAdd(amount)}
          className="flex flex-col items-center gap-1 rounded-xl bg-gray-900 py-4 text-white hover:bg-gray-800 active:bg-gray-700"
        >
          <span className="text-lg font-semibold">+{amount}</span>
          <span className="text-xs text-gray-500">oz</span>
        </button>
      ))}
    </div>
  )
}
