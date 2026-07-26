import { Calendar, History, ListChecks } from 'lucide-react'
import { NavLink } from 'react-router-dom'

/**
 * Three destinations, matching the three questions the app answers:
 * what do I do now, what have I done, what will I do. Everything else
 * (workouts, camera) is reached by drilling into a rule on Today.
 */
const NAV_ITEMS = [
  { to: '/dashboard', label: 'Today', icon: ListChecks },
  { to: '/history', label: 'History', icon: History },
  { to: '/planner', label: 'Plan', icon: Calendar },
]

export function BottomNav() {
  return (
    <nav
      className="absolute inset-x-4 z-40 rounded-2xl border border-white/10 bg-gray-950/75 backdrop-blur-md shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]"
      style={{ bottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <ul className="flex justify-between px-1.5 py-1.5">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1.5 py-1.5 text-[10px] font-semibold transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'text-purple-400 scale-105 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]'
                    : 'text-gray-500 hover:text-gray-300'
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
