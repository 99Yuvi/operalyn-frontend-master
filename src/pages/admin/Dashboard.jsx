import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Users, ShieldCheck, FolderOpen, Handshake,
  TrendingUp, DollarSign, BarChart2, UserPlus,
} from 'lucide-react'
import { getAdminDashboard } from '@/api/admin'
import { formatCurrency } from '@/lib/utils'

const CARDS = (d) => [
  {
    label: 'Total users',
    value: d.total_users ?? '—',
    Icon: Users,
    iconBg: 'bg-blue-50', iconColor: 'text-blue-600',
    valueCls: 'text-blue-700',
    link: '/admin/users',
    sub: 'registered accounts',
  },
  {
    label: 'Pending verifications',
    value: d.pending_verifications ?? '—',
    Icon: ShieldCheck,
    iconBg: 'bg-amber-50', iconColor: 'text-amber-600',
    valueCls: 'text-amber-700',
    link: '/admin/verifications',
    sub: 'awaiting review',
    alert: d.pending_verifications > 0,
  },
  {
    label: 'Active projects',
    value: d.active_projects ?? '—',
    Icon: FolderOpen,
    iconBg: 'bg-slate-100', iconColor: 'text-slate-600',
    valueCls: 'text-slate-800',
    link: '/admin/users',
    sub: 'open for proposals',
  },
  {
    label: 'Active contracts',
    value: d.active_contracts ?? '—',
    Icon: Handshake,
    iconBg: 'bg-green-50', iconColor: 'text-green-600',
    valueCls: 'text-green-700',
    link: '/admin/payments',
    sub: 'in progress',
  },
  {
    label: 'Platform GMV',
    value: formatCurrency(d.gmv_total),
    Icon: TrendingUp,
    iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600',
    valueCls: 'text-indigo-700',
    link: '/admin/payments',
    sub: 'all time',
  },
  {
    label: 'Commission earned',
    value: formatCurrency(d.commission_total),
    Icon: DollarSign,
    iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600',
    valueCls: 'text-emerald-700',
    link: '/admin/payments',
    sub: 'platform revenue',
  },
  {
    label: 'This month GMV',
    value: formatCurrency(d.gmv_this_month),
    Icon: BarChart2,
    iconBg: 'bg-violet-50', iconColor: 'text-violet-600',
    valueCls: 'text-violet-700',
    link: '/admin/reports',
    sub: 'current month',
  },
  {
    label: 'New users this month',
    value: d.new_users_this_month ?? '—',
    Icon: UserPlus,
    iconBg: 'bg-sky-50', iconColor: 'text-sky-600',
    valueCls: 'text-sky-700',
    link: '/admin/users',
    sub: 'joined this month',
  },
]

function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 rounded-xl bg-slate-100" />
        <div className="h-3 w-24 bg-slate-100 rounded" />
      </div>
      <div className="h-7 w-20 bg-slate-100 rounded mb-1" />
      <div className="h-3 w-16 bg-slate-100 rounded" />
    </div>
  )
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn:  getAdminDashboard,
  })
  const d = data?.data ?? {}

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
          Admin Dashboard
        </h2>
        <p className="text-sm text-slate-500 mt-1">Platform-wide overview and key metrics.</p>
      </div>

      {/* Metric grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          {/* Top row — 4 key metrics */}
          <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
            <div className="flex flex-wrap sm:flex-nowrap divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
              {CARDS(d).slice(0, 4).map((c) => (
                <Link key={c.label} to={c.link}
                  className="flex items-center gap-3 px-5 py-4 flex-1 min-w-[50%] sm:min-w-0 hover:bg-slate-50 transition-colors relative">
                  {c.alert && (
                    <span className="absolute top-3 end-3 h-2 w-2 rounded-full bg-amber-500" />
                  )}
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${c.iconBg}`}>
                    <c.Icon className={`h-5 w-5 ${c.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-400 mb-0.5">{c.label}</p>
                    <p className={`text-2xl font-bold tabular-nums leading-tight ${c.valueCls}`}>{c.value}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{c.sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Bottom row — 4 financial metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CARDS(d).slice(4).map((c) => (
              <Link key={c.label} to={c.link}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:bg-slate-50 transition-colors">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${c.iconBg}`}>
                  <c.Icon className={`h-5 w-5 ${c.iconColor}`} />
                </div>
                <p className={`text-xl font-bold tabular-nums ${c.valueCls}`}>{c.value}</p>
                <p className="text-xs text-slate-500 mt-1">{c.label}</p>
                <p className="text-xs text-slate-400">{c.sub}</p>
              </Link>
            ))}
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Manage users',       to: '/admin/users',         Icon: Users },
              { label: 'Verify freelancers', to: '/admin/verifications', Icon: ShieldCheck },
              { label: 'View reports',       to: '/admin/reports',       Icon: BarChart2 },
              { label: 'Settings',           to: '/admin/settings',      Icon: TrendingUp },
            ].map(({ label, to, Icon }) => (
              <Link key={label} to={to}
                className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3.5 hover:border-slate-300 hover:bg-slate-50 transition-colors">
                <Icon className="h-5 w-5 text-slate-400 shrink-0" />
                <span className="text-sm font-medium text-slate-700">{label}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
