import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
}

/**
 * Bottom sheet on mobile, centred dialog on desktop. Backed by Radix so focus
 * trapping, focus restore, Escape handling, scroll locking and `aria-modal`
 * come for free — all things the hand-rolled Modal was missing.
 */
export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: SheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed inset-x-0 bottom-0 z-50 flex max-h-[90svh] flex-col rounded-t-3xl border border-white/10 bg-gray-950 shadow-[0_-16px_48px_rgba(0,0,0,0.6)] sm:inset-0 sm:m-auto sm:h-fit sm:max-w-md sm:rounded-3xl"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="flex items-start justify-between gap-3 border-b border-white/5 px-5 py-4">
            <div className="min-w-0">
              <Dialog.Title className="text-base font-bold text-white">{title}</Dialog.Title>
              {description && (
                <Dialog.Description className="mt-0.5 text-xs text-gray-400">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close
              className="shrink-0 cursor-pointer rounded-full p-1.5 text-gray-400 transition-all hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none active:scale-95"
              aria-label="Close"
            >
              <X size={18} />
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

          {footer && (
            <div className="flex gap-2.5 border-t border-white/5 px-5 py-4">{footer}</div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
