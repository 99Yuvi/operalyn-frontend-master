import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import NotificationBell from '@/components/shared/NotificationBell'

const NAV = [
  { to: '/client',              label: 'Dashboard',    icon: '▦', end: true },
  { to: '/client/projects',     label: 'My Projects',  icon: '📋' },
  { to: '/client/contracts',    label: 'Contracts',    icon: '🤝' },
  { to: '/client/chat',         label: 'Messages',     icon: '💬' },
  { to: '/client/payments',     label: 'Payments',     icon: '💳' },
  { to: '/client/freelancers',  label: 'Find Talent',  icon: '🔍' },
  { to: '/client/profile',      label: 'Profile',      icon: '◉' },
]

export default function ClientLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const isChatPage = location.pathname.startsWith('/client/chat')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 bottom-0 left-0 z-50 w-64 shrink-0 border-r border-slate-200 bg-white flex flex-col',
        'transition-transform duration-200 ease-in-out',
        'md:relative md:z-auto',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}>
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <span className="text-lg font-bold text-slate-800" style={{ fontFamily: 'Georgia, serif' }}>Operalyn</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, label, icon, end }) => (
            <NavLink key={to} to={to} end={end}
              onClick={closeSidebar}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              )}>
              <span className="text-base w-5 text-center leading-none">{icon}</span>{label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-200">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{user?.name}</p>
              <p className="text-xs text-slate-400">Client</p>
            </div>
          </div>
          <button onClick={logout} className="mt-1 w-full text-left px-3 py-1.5 text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-md transition-colors">
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-16 shrink-0 border-b border-slate-200 bg-white flex items-center px-4 md:px-6 gap-3">
          {/* Hamburger — mobile only */}
          <button
            className="md:hidden p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 shrink-0"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <h1 className="text-base md:text-lg font-semibold text-slate-800 flex-1">Client Portal</h1>
          <NotificationBell />
        </header>

        {isChatPage ? (
          <main className="flex-1 overflow-hidden">
            <Outlet />
          </main>
        ) : (
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-6xl mx-auto"><Outlet /></div>
          </main>
        )}
      </div>
    </div>
  )
}
