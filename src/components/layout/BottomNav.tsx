import { Camera, Calendar, Dumbbell, History, LayoutGrid, Droplet } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Today', icon: LayoutGrid },
  { to: '/workouts', label: 'Workouts', icon: Dumbbell },
  { to: '/water', label: 'Water', icon: Droplet },
  { to: '/photo', label: 'Photo', icon: Camera },
  { to: '/history', label: 'History', icon: History },
  { to: '/planner', label: 'Planner', icon: Calendar },
]

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-800 bg-gray-950/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex max-w-lg justify-between px-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2 text-xs ${
                  isActive ? 'text-purple-400' : 'text-gray-500'
                }`
              }
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
