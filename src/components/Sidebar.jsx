import { Activity, BellRing, BriefcaseBusiness, ChevronDown, Gauge, LayoutDashboard, LogOut, Menu, Settings, Users } from 'lucide-react'
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
  const [isHovered, setIsHovered] = useState(false)
  const [isFocusWithin, setIsFocusWithin] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const [isCollapsedByClick, setIsCollapsedByClick] = useState(false)
  const [customersOpen, setCustomersOpen] = useState(location.pathname.startsWith('/customers'))
  const [schedulesOpen, setSchedulesOpen] = useState(location.pathname.startsWith('/calibration-schedules'))
  const isExpanded = isPinned || ((isHovered || isFocusWithin) && !isCollapsedByClick)

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setIsCollapsedByClick(false)
      }}
      onFocusCapture={() => setIsFocusWithin(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsFocusWithin(false)
          setIsCollapsedByClick(false)
        }
      }}
      className={`flex h-full shrink-0 flex-col justify-between overflow-hidden border-r border-slate-800 bg-slate-950 text-slate-100 transition-[width] duration-200 ease-out ${isExpanded ? 'w-65' : 'w-18'}`}
    >
      <div>
        <div className={`border-b border-slate-800 py-3 ${isExpanded ? 'px-4' : 'px-3'}`}>
          <button
            type="button"
            onClick={() => {
              if (isPinned) {
                setIsPinned(false)
                setIsHovered(false)
                setIsFocusWithin(false)
                setIsCollapsedByClick(true)
              } else {
                setIsPinned(true)
                setIsCollapsedByClick(false)
              }
            }}
            aria-label={isPinned ? 'Collapse navigation' : 'Pin navigation expanded'}
            aria-pressed={isPinned}
            title={isPinned ? 'Collapse navigation' : 'Keep navigation expanded'}
            className={`flex h-10 w-full items-center rounded-lg text-slate-300 transition hover:bg-slate-800 hover:text-white ${isExpanded ? 'gap-3 px-3' : 'justify-center'}`}
          >
            <Menu className="h-5 w-5 shrink-0" />
            {isExpanded ? <span className="text-sm font-medium">Navigation</span> : null}
          </button>
          <div className={`mt-3 flex h-10 items-center ${isExpanded ? 'gap-3 px-3' : 'justify-center'}`}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300">
              <Activity className="h-5 w-5" />
            </div>
            {isExpanded ? (
              <div className="min-w-0">
                <div className="truncate text-lg font-semibold">Calibra</div>
                <div className="truncate text-xs text-slate-400">Calibration Desk</div>
              </div>
            ) : null}
          </div>
        </div>

        <nav className={`space-y-1 py-3 ${isExpanded ? 'px-3' : 'px-2'}`}>
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
                  title={!isExpanded ? label : undefined}
                  className={`flex h-10 w-full items-center rounded-xl text-sm font-medium transition ${isExpanded ? 'gap-3 px-3 text-left' : 'justify-center px-0'} ${
                    location.pathname.startsWith(to)
                      ? 'bg-cyan-500/10 text-cyan-200 ring-1 ring-cyan-500/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {isExpanded ? <span className="flex-1 truncate text-left">{label}</span> : null}
                  {isExpanded ? <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${(to === '/customers' ? customersOpen : schedulesOpen) ? 'rotate-180' : ''}`} /> : null}
                </button>
                {isExpanded && (to === '/customers' ? customersOpen : schedulesOpen) ? (
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
                title={!isExpanded ? label : undefined}
                className={({ isActive }) =>
                  `flex h-10 items-center rounded-xl text-sm font-medium transition ${isExpanded ? 'gap-3 px-3' : 'justify-center px-0'} ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-200 ring-1 ring-cyan-500/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {isExpanded ? <span className="truncate">{label}</span> : null}
              </NavLink>
            ),
          )}
        </nav>
      </div>

      <div className={`p-3 ${isExpanded ? 'px-4' : 'px-3'}`}>
        <button
          type="button"
          onClick={onSignOut}
          title={!isExpanded ? 'Sign out' : undefined}
          aria-label="Sign out"
          className={`flex h-10 w-full items-center rounded-xl border border-slate-700 bg-slate-800 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-700 ${isExpanded ? 'gap-3 px-3' : 'justify-center px-0'}`}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {isExpanded ? <span>Sign out</span> : null}
        </button>
      </div>
    </aside>
  )
}
