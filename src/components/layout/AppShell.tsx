import { Outlet } from 'react-router-dom'
import { BottomNav } from '@/components/layout/BottomNav'
import { useDayRollover } from '@/db/hooks'

export function AppShell() {
  useDayRollover()

  return (
    <div className="mx-auto flex min-h-svh max-w-lg flex-col bg-gray-950">
      <main className="flex-1 px-4 pb-24 pt-6">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
