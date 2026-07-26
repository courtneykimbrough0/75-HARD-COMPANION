import { useState } from 'react'
import { WATER_INCREMENTS_OZ } from '@/lib/logic/constants'

interface IncrementButtonGroupProps {
  onAdd: (amountOz: number) => void
}

export function IncrementButtonGroup({ onAdd }: IncrementButtonGroupProps) {
  const [mode, setMode] = useState<'add' | 'subtract'>('add')

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-gray-400">Quick Log</span>
        <div className="flex rounded-lg border border-white/5 bg-white/5 p-0.5">
          <button
            type="button"
            onClick={() => setMode('add')}
            className={`cursor-pointer rounded-md px-2.5 py-0.5 text-[10px] font-bold transition-all ${
              mode === 'add'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setMode('subtract')}
            className={`cursor-pointer rounded-md px-2.5 py-0.5 text-[10px] font-bold transition-all ${
              mode === 'subtract'
                ? 'border border-red-500/20 bg-red-500/20 text-red-300 shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Remove
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {WATER_INCREMENTS_OZ.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => onAdd(mode === 'add' ? amount : -amount)}
            className={`cursor-pointer rounded-xl border py-2 text-xs font-bold transition-all duration-200 active:scale-95 ${
              mode === 'add'
                ? 'border-white/5 bg-white/5 text-gray-300 hover:border-white/10 hover:bg-white/10'
                : 'border-red-900/30 bg-red-950/20 text-red-300 hover:border-red-800/40 hover:bg-red-950/30'
            }`}
          >
            {mode === 'add' ? `+${amount}` : `-${amount}`} oz
          </button>
        ))}
      </div>
    </div>
  )
}
