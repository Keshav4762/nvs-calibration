import { Activity, BellRing, BriefcaseBusiness, ChevronDown, Gauge, LayoutDashboard, Settings, Users } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/calibration-schedules', label: 'Calibration Schedules', icon: BriefcaseBusiness },
  { to: '/due-date-alerts', label: 'Due Date Alerts', icon: BellRing },
  { to: '/reports', label: 'Reports', icon: Gauge },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ onSignOut }) {
  const location = useLocation()
  const [customersOpen, setCustomersOpen] = useState(location.pathname.startsWith('/customers'))
  const [schedulesOpen, setSchedulesOpen] = useState(location.pathname.startsWith('/calibration-schedules'))

  return (
    <aside className="flex w-full max-w-[260px] flex-col justify-between border-r border-slate-200 bg-slate-950 text-slate-100">
      <div>
        <div className="flex items-center gap-3 border-b border-slate-800 px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-semibold">Calibra</div>
            <div className="text-xs text-slate-400">Calibration Desk</div>
          </div>
        </div>

        <nav className="space-y-1 p-4">
          {navItems.map(({ to, label, icon: Icon }) =>
            to === '/customers' || to === '/calibration-schedules' ? (
              <div key={to}>
                <button
                  type="button"
                  aria-expanded={to === '/customers' ? customersOpen : schedulesOpen}
                  onClick={() => {
                    if (to === '/customers') setCustomersOpen((open) => !open)
                    else setSchedulesOpen((open) => !open)
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                    location.pathname.startsWith(to)
                      ? 'bg-cyan-500/10 text-cyan-200 ring-1 ring-cyan-500/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{label}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${(to === '/customers' ? customersOpen : schedulesOpen) ? 'rotate-180' : ''}`} />
                </button>
                {(to === '/customers' ? customersOpen : schedulesOpen) ? (
                  <div className="ml-4 mt-1 space-y-1 border-l border-slate-700 pl-3">
                    <NavLink
                      to={to === '/customers' ? '/customers/add' : '/calibration-schedules/add'}
                      className={({ isActive }) =>
                        `block rounded-lg px-3 py-2 text-sm transition ${
                          isActive ? 'text-cyan-200' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`
                      }
                    >
                      {to === '/customers' ? 'Add Customer' : 'Add Schedule'}
                    </NavLink>
                    <NavLink
                      to={to === '/customers' ? '/customers/directory' : '/calibration-schedules/directory'}
                      className={({ isActive }) =>
                        `block rounded-lg px-3 py-2 text-sm transition ${
                          isActive ? 'text-cyan-200' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`
                      }
                    >
                      {to === '/customers' ? 'Customer Directory' : 'Schedule Directory'}
                    </NavLink>
                  </div>
                ) : null}
              </div>
            ) : (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-200 ring-1 ring-cyan-500/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ),
          )}
        </nav>
      </div>

      <button
        type="button"
        onClick={onSignOut}
        className="m-4 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-700"
      >
        Sign out
      </button>
    </aside>
  )
}
