import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useMyProjects } from '@/hooks/useProjects'
import { useContracts } from '@/hooks/useContracts'
import { formatCurrency } from '@/lib/utils'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function MilestoneBar({ milestones = [] }) {
  if (!milestones.length) return null
  const done = milestones.filter(m => ['approved', 'paid'].includes(m.status)).length
  const pct  = Math.round((done / milestones.length) * 100)
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-400">{done}/{milestones.length} milestones</span>
        <span className="text-xs font-medium text-slate-600">{pct}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: pct === 100 ? '#10B981' : '#334155' }}
        />
      </div>
    </div>
  )
}

export default function ClientDashboard() {
  const { user }            = useAuth()
  const { data: projData }  = useMyProjects({ status: 'open' })
  const { data: contData }  = useContracts({ status: 'active' })

  const openProjects    = projData?.data ?? []
  const activeContracts = contData?.data ?? []
  const totalActive     = activeContracts.reduce((s, c) => s + Number(c.total_amount), 0)

  const isEmpty = activeContracts.length === 0 && openProjects.length === 0

  const STATS = [
    {
      label: 'Open projects',
      value: openProjects.length,
      icon: '📋',
      iconBg: 'bg-blue-50',
      valueCls: 'text-blue-700',
      link: '/client/projects',
      sub: 'awaiting proposals',
    },
    {
      label: 'Active contracts',
      value: activeContracts.length,
      icon: '🤝',
      iconBg: 'bg-green-50',
      valueCls: 'text-green-700',
      link: '/client/contracts',
      sub: 'in progress',
    },
    {
      label: 'In contract value',
      value: formatCurrency(totalActive),
      icon: '💰',
      iconBg: 'bg-amber-50',
      valueCls: 'text-amber-700',
      link: '/client/contracts',
      sub: 'across active contracts',
    },
  ]

  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
            {getGreeting()}
          </p>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
            {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-sm text-slate-500 mt-1">Here's what's happening on your projects today.</p>
        </div>
        <Link
          to="/client/projects/new"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-900 transition-colors shrink-0"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}
        >
          + Post a project
        </Link>
      </div>

      {/* ── Metric Strip ────────────────────────────────── */}
      <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
        <div className="flex flex-wrap sm:flex-nowrap divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {STATS.map((s) => (
            <Link
              key={s.label}
              to={s.link}
              className="flex items-center gap-3 px-5 py-4 flex-1 min-w-[50%] sm:min-w-0 hover:bg-slate-50 transition-colors group"
            >
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 text-lg ${s.iconBg}`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 mb-0.5">{s.label}</p>
                <p className={`text-2xl font-bold tabular-nums leading-tight ${s.valueCls}`}>{s.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Empty state ─────────────────────────────────── */}
      {isEmpty && (
        <div className="rounded-xl border-2 border-dashed border-slate-200 py-14 px-6 text-center">
          <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚀</span>
          </div>
          <h3 className="text-base font-semibold text-slate-800 mb-1">Ready to get started?</h3>
          <p className="text-sm text-slate-500 mb-5 max-w-xs mx-auto">
            Post your first project and receive proposals from skilled, verified freelancers.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/client/projects/new"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-900 transition-colors">
              Post a project
            </Link>
            <Link to="/client/freelancers"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors">
              Browse freelancers
            </Link>
          </div>
        </div>
      )}

      {/* ── Two-column grid ─────────────────────────────── */}
      {!isEmpty && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Active contracts */}
          {activeContracts.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-base">🤝</span>
                  <h3 className="text-sm font-semibold text-slate-800">Active contracts</h3>
                  <span className="text-xs font-semibold bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                    {activeContracts.length}
                  </span>
                </div>
                <Link to="/client/contracts" className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors">
                  View all →
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {activeContracts.slice(0, 4).map(c => {
                  const ms      = c.milestones ?? []
                  const pending = ms.filter(m => m.status === 'submitted').length
                  return (
                    <Link key={c.id} to={`/client/contracts/${c.id}`}
                      className="block px-5 py-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <p className="text-sm font-semibold text-slate-800 truncate leading-tight">{c.project?.title}</p>
                        {pending > 0 && (
                          <span className="text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                            {pending} to review
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-slate-400">{c.freelancer?.name}</p>
                        <p className="text-xs font-semibold text-slate-600">{formatCurrency(c.total_amount)}</p>
                      </div>
                      <MilestoneBar milestones={ms} />
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Open projects */}
          {openProjects.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-base">📋</span>
                  <h3 className="text-sm font-semibold text-slate-800">Open projects</h3>
                  <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                    {openProjects.length}
                  </span>
                </div>
                <Link to="/client/projects" className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors">
                  View all →
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {openProjects.slice(0, 4).map(p => (
                  <Link key={p.id} to={`/client/projects/${p.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{p.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {p.budget_min && p.budget_max
                          ? `${formatCurrency(p.budget_min)} – ${formatCurrency(p.budget_max)}`
                          : 'Budget TBD'}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-slate-700">{p.proposals_count ?? 0}</p>
                      <p className="text-xs text-slate-400">proposals</p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Quick action */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
                <Link to="/client/projects/new"
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                  + Post another project
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Quick links ─────────────────────────────────── */}
      {!isEmpty && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: '🔍', label: 'Find talent',     to: '/client/freelancers' },
            { icon: '💬', label: 'Messages',         to: '/client/chat' },
            { icon: '💳', label: 'Payments',         to: '/client/payments' },
            { icon: '◉',  label: 'My profile',      to: '/client/profile' },
          ].map(({ icon, label, to }) => (
            <Link key={label} to={to}
              className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3.5 hover:border-slate-300 hover:bg-slate-50 transition-colors">
              <span className="text-lg">{icon}</span>
              <span className="text-sm font-medium text-slate-700">{label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
