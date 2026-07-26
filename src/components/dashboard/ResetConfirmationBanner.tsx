import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

interface ResetConfirmationBannerProps {
  reason: string
  onReset: () => void
  onOverrideSpacing?: () => void
}

export function ResetConfirmationBanner({
  reason,
  onReset,
  onOverrideSpacing,
}: ResetConfirmationBannerProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <>
      <div className="flex flex-col gap-3 rounded-2xl border border-red-800 bg-red-950/60 p-4">
        <div className="flex items-start gap-2">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-red-400" />
          <div className="flex-1 flex flex-col gap-1">
            <p className="text-sm text-red-200">{reason}</p>
            {onOverrideSpacing && (
              <p className="text-xs text-red-300/80">
                If your workouts were 3+ hours apart in reality but logged late, you can certify spacing.
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {onOverrideSpacing && (
            <button
              onClick={onOverrideSpacing}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30 text-amber-200 cursor-pointer transition-all duration-200 active:scale-95"
            >
              Yes, Spacing Was Met
            </button>
          )}
          <Button variant="danger" onClick={() => setConfirmOpen(true)} className="flex-1 min-w-[120px]">
            Reset to Day 1
          </Button>
        </div>
      </div>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <h2 className="text-lg font-semibold text-white">Reset to Day 1?</h2>
        <p className="mt-2 text-sm text-gray-400">
          This restarts your day counter at 1. Past logs and photos are kept for your history.
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => {
              onReset()
              setConfirmOpen(false)
            }}
          >
            Confirm Reset
          </Button>
        </div>
      </Modal>
    </>
  )
}
