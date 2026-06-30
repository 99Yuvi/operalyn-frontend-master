import { useQuery } from '@tanstack/react-query'
import { getAdminDashboard } from '@/api/admin'
import { formatCurrency } from '@/lib/utils'
import { Link } from 'react-router-dom'

const CARDS = (d) => [
  { label: 'Total users',            value: d.total_users,           color: 'text-blue-600',   link: '/admin/users' },
  { label: 'Pending verifications',  value: d.pending_verifications, color: 'text-amber-600',  link: '/admin/verifications' },
  { label: 'Active projects',        value: d.active_projects,       color: 'text-slate-800',  link: '/admin/projects' },
  { label: 'Active contracts',       value: d.active_contracts,      color: 'text-green-600',  link: '/admin/contracts' },
  { label: 'Platform GMV',           value: formatCurrency(d.gmv_total), color: 'text-indigo-600', link: '/admin/payments' },
  { label: 'Commission earned',      value: formatCurrency(d.commission_total), color: 'text-green-700', link: '/admin/payments' },
  { label: 'This month GMV',         value: formatCurrency(d.gmv_this_month),   color: 'text-slate-800', link: '/admin/reports' },
  { label: 'New users this month',   value: d.new_users_this_month,  color: 'text-blue-500',   link: '/admin/users' },
]

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['admin','dashboard'], queryFn: getAdminDashboard })
  const d = data?.data ?? {}

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 mb-1" style={{ fontFamily: 'Georgia, serif' }}>Admin Dashboard</h2>
      <p className="text-sm text-slate-500 mb-6">Platform-wide overview.</p>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(8)].map((_,i) => <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CARDS(d).map(c => (
            <Link key={c.label} to={c.link}
              className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors">
              <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{c.label}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
