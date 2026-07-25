import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import { BottomNav } from '@/components/layout/BottomNav'
import { QuickLogWizard } from '@/components/ui/QuickLogWizard'
import { useDayRollover } from '@/db/hooks'

export function AppShell() {
  useDayRollover()
  const [isWizardOpen, setIsWizardOpen] = useState(false)

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-0 sm:p-6 bg-transparent">
      <div className="relative flex h-full min-h-svh sm:min-h-[850px] w-full max-w-md flex-col overflow-hidden border-0 sm:border border-white/10 bg-gray-950/80 backdrop-blur-xl shadow-none sm:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] sm:rounded-[36px]">
        {/* Ambient Glows */}
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-purple-600/10 blur-[100px] pointer-events-none" />
        <div className="absolute top-80 -right-40 h-80 w-80 rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />

        <main className="relative z-10 flex-1 px-5 pb-28 pt-8 overflow-y-auto">
          <Outlet />
        </main>

        {/* Floating Action Button (FAB) */}
        <button
          type="button"
          aria-label="Quick Log"
          onClick={() => setIsWizardOpen(true)}
          className="absolute bottom-20 right-5 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-purple-600 text-white shadow-[0_4px_20px_rgba(168,85,247,0.5)] hover:bg-purple-500 active:scale-90 transition-all cursor-pointer border border-purple-400/30"
        >
          <Plus size={24} />
        </button>

        <QuickLogWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
        <BottomNav />
      </div>
    </div>
  )
}
