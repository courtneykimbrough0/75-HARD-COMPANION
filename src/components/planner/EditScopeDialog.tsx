import { Button } from '@/components/ui/Button'
import { Sheet } from '@/components/ui/Sheet'

export type EditPropagationScope = 'future' | 'all'

interface EditScopeDialogProps {
  open: boolean
  itemLabel: string
  onChoose: (scope: EditPropagationScope) => void
  onDismiss: () => void
}

/**
 * Shown after saving an edit to a library meal/workout that's already assigned
 * somewhere. Days embed a snapshot at assign-time (see `plannedDaySchema`), so
 * an edit never reaches an existing assignment on its own — this is what decides
 * whether, and how far, it should.
 *
 * There are really three outcomes here, not two: apply to current+future weeks,
 * apply everywhere including the past, or dismiss and leave every existing
 * assignment exactly as it was (only brand-new assignments get the update). The
 * third is expressed by closing the sheet rather than a button, since it's the
 * "do nothing further" case.
 */
export function EditScopeDialog({ open, itemLabel, onChoose, onDismiss }: EditScopeDialogProps) {
  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) onDismiss()
      }}
      title="Update existing plans?"
      description={`"${itemLabel}" is already assigned in your weekly plan.`}
      footer={
        <div className="flex w-full flex-col gap-2">
          <Button className="w-full" onClick={() => onChoose('future')}>
            Apply to this week &amp; future
          </Button>
          <Button variant="secondary" className="w-full" onClick={() => onChoose('all')}>
            Apply to all weeks, including past
          </Button>
          <Button variant="ghost" className="w-full" onClick={onDismiss}>
            Leave existing plans as they are
          </Button>
        </div>
      }
    >
      <p className="text-xs text-gray-400">
        Past weeks record what you actually planned at the time — changing them can be
        confusing to look back on, so it's never automatic. Pick how far this change should
        reach, or leave everything already assigned untouched.
      </p>
    </Sheet>
  )
}
