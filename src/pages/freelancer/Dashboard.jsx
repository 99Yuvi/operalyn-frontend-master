import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useContracts } from '@/hooks/useContracts'
import { useMyProposals } from '@/hooks/useProposals'
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

export default function FreelancerDashboard() {
  const { user, profile }   = useAuth()
  const { data: contData }  = useContracts({ status: 'active' })
  const { data: propData }  = useMyProposals({ status: 'pending' })

  const activeContracts  = contData?.data ?? []
  const pendingProposals = propData?.data ?? []
  const totalEarnings    = profile?.total_earnings ?? 0
  const isEmpty          = activeContracts.length === 0 && pendingProposals.length === 0

  const STATS = [
    {
      label: 'Active contracts',
      value: activeContracts.length,
      icon: '🤝',
      iconBg: 'bg-blue-50',
      valueCls: 'text-blue-700',
      link: '/freelancer/contracts',
      sub: 'in progress',
    },
    {
      label: 'Pending proposals',
      value: pendingProposals.length,
      icon: '📤',
      iconBg: 'bg-amber-50',
      valueCls: 'text-amber-700',
      link: '/freelancer/proposals',
      sub: 'awaiting response',
    },
    {
      label: 'Total earnings',
      value: formatCurrency(totalEarnings),
      icon: '💰',
      iconBg: 'bg-green-50',
      valueCls: 'text-green-700',
      link: '/freelancer/earnings',
      sub: 'all time',
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
          <p className="text-sm text-slate-500 mt-1">Your active work and pending proposals.</p>
        </div>
        <Link
          to="/freelancer/projects"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-900 transition-colors shrink-0"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}
        >
          🔍 Browse projects
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

      {/* ── Profile completion nudge ─────────────────────── */}
      {profile && !profile.bio && (
        <div className="flex items-center gap-4 bg-indigo-50 border border-indigo-200 rounded-xl px-5 py-4">
          <span className="text-xl shrink-0">✨</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-indigo-900">Complete your profile to get more clients</p>
            <p className="text-xs text-indigo-700 mt-0.5">Add a bio, skills, and portfolio samples to stand out.</p>
          </div>
          <Link to="/freelancer/profile"
            className="shrink-0 text-xs font-semibold text-indigo-700 hover:text-indigo-900 transition-colors whitespace-nowrap">
            Complete profile →
          </Link>
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────── */}
      {isEmpty && (
        <div className="rounded-xl border-2 border-dashed border-slate-200 py-14 px-6 text-center">
          <div className="h-14 w-14 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💼</span>
          </div>
          <h3 className="text-base font-semibold text-slate-800 mb-1">Find your next project</h3>
          <p className="text-sm text-slate-500 mb-5 max-w-xs mx-auto">
            Browse open projects and submit proposals to start earning.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/freelancer/projects"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-900 transition-colors">
              Browse projects
            </Link>
            <Link to="/freelancer/profile"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors">
              Update profile
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
                  <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                    {activeContracts.length}
                  </span>
                </div>
                <Link to="/freelancer/contracts" className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors">
                  View all →
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {activeContracts.slice(0, 4).map(c => {
                  const ms        = c.milestones ?? []
                  const nextMs    = ms.find(m => !['approved', 'paid'].includes(m.status))
                  const actionNeeded = nextMs && ['pending', 'revision_requested'].includes(nextMs?.status)
                  return (
                    <Link key={c.id} to={`/freelancer/contracts/${c.id}`}
                      className="block px-5 py-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <p className="text-sm font-semibold text-slate-800 truncate leading-tight">{c.project?.title}</p>
                        {actionNeeded && (
                          <span className="text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                            Action needed
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-slate-400">{c.client?.name}</p>
                        <p className="text-xs font-semibold text-slate-700">{formatCurrency(c.total_amount)}</p>
                      </div>
                      <MilestoneBar milestones={ms} />
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Pending proposals */}
          {pendingProposals.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-base">📤</span>
                  <h3 className="text-sm font-semibold text-slate-800">Pending proposals</h3>
                  <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                    {pendingProposals.length}
                  </span>
                </div>
                <Link to="/freelancer/proposals" className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors">
                  View all →
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {pendingProposals.slice(0, 4).map(p => (
                  <Link key={p.id} to={`/freelancer/projects/${p.project?.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{p.project?.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Budget: {p.project?.budget_min && p.project?.budget_max
                          ? `${formatCurrency(p.project.budget_min)} – ${formatCurrency(p.project.budget_max)}`
                          : 'Flexible'}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-slate-800">{formatCurrency(p.bid_amount)}</p>
                      <p className="text-xs text-slate-400">your bid</p>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
                <Link to="/freelancer/projects"
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                  + Submit another proposal
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
            { icon: '📋', label: 'My proposals',  to: '/freelancer/proposals' },
            { icon: '💬', label: 'Messages',       to: '/freelancer/chat' },
            { icon: '💰', label: 'Earnings',       to: '/freelancer/earnings' },
            { icon: '◉',  label: 'My profile',    to: '/freelancer/profile' },
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
