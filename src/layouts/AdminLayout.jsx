import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, ShieldCheck, Tag,
  CreditCard, Star, BarChart2, ScrollText, Settings, LogOut, Menu,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import NotificationBell from '@/components/shared/NotificationBell'

const NAV = [
  { to: '/admin',               label: 'Dashboard',     Icon: LayoutDashboard, end: true },
  { to: '/admin/users',         label: 'Users',         Icon: Users },
  { to: '/admin/verifications', label: 'Verifications', Icon: ShieldCheck },
  { to: '/admin/categories',    label: 'Categories',    Icon: Tag },
  { to: '/admin/payments',      label: 'Payments',      Icon: CreditCard },
  { to: '/admin/reviews',       label: 'Reviews',       Icon: Star },
  { to: '/admin/reports',       label: 'Reports',       Icon: BarChart2 },
  { to: '/admin/audit-logs',    label: 'Audit Logs',    Icon: ScrollText },
  { to: '/admin/settings',      label: 'Settings',      Icon: Settings },
]

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function AdminLayout() {
  const { user, logout }  = useAuth()
  const location          = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const closeSidebar = () => setSidebarOpen(false)

  const currentNav = NAV.find(n =>
    n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)
  )
  const pageTitle = currentNav?.label ?? 'Admin Panel'

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={closeSidebar} />
      )}

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className={cn(
        'fixed top-0 bottom-0 left-0 z-50 w-64 shrink-0 flex flex-col',
        'bg-white border-r border-slate-200',
        'transition-transform duration-200 ease-in-out',
        'md:relative md:z-auto',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}>

        {/* Brand */}
        <div className="h-16 flex items-center px-5 border-b border-slate-200 gap-2.5">
          <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #0F172A 0%, #334155 100%)' }}>
            <span style={{ color: '#fff', fontSize: 12, fontWeight: 800, fontFamily: 'Georgia, serif' }}>O</span>
          </div>
          <span className="text-base font-bold text-slate-800 tracking-tight">Operalyn</span>
          <span className="text-xs font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded-md ml-auto">
            Admin
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, label, Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={closeSidebar}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              )}>
              {({ isActive }) => (
                <>
                  <Icon className={cn('h-5 w-5 shrink-0', isActive ? 'text-slate-700' : 'text-slate-400')} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-slate-200">
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            <div className="h-8 w-8 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
              {getInitials(user?.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate leading-tight">{user?.name}</p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
          </div>
          <button onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Topbar */}
        <header className="h-16 shrink-0 border-b border-slate-200 bg-white flex items-center px-4 md:px-6 gap-3">
          <button
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 shrink-0 transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-base md:text-lg font-semibold text-slate-800 flex-1 tracking-tight">{pageTitle}</h1>
          <NotificationBell />
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-6xl mx-auto"><Outlet /></div>
        </main>
      </div>
    </div>
  )
}
