import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

interface ResetConfirmationBannerProps {
  reason: string
  onReset: () => void
}

export function ResetConfirmationBanner({ reason, onReset }: ResetConfirmationBannerProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <>
      <div className="flex flex-col gap-3 rounded-2xl border border-red-800 bg-red-950/60 p-4">
        <div className="flex items-start gap-2">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-red-400" />
          <p className="text-sm text-red-200">{reason}</p>
        </div>
        <Button variant="danger" onClick={() => setConfirmOpen(true)}>
          Reset to Day 1
        </Button>
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
