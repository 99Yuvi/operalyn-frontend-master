import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useContracts } from '@/hooks/useContracts'
import { useMyProposals } from '@/hooks/useProposals'
import { formatCurrency, cn } from '@/lib/utils'

export default function FreelancerDashboard() {
  const { user, profile }  = useAuth()
  const { data: contData } = useContracts({ status: 'active' })
  const { data: propData } = useMyProposals({ status: 'pending' })

  const activeContracts = contData?.data ?? []
  const pendingProposals = propData?.data ?? []
  const totalEarnings   = profile?.total_earnings ?? 0

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-1" style={{ fontFamily: 'Georgia, serif' }}>
        Welcome, {user?.name?.split(' ')[0]}
      </h2>
      <p className="text-sm text-slate-500 mb-6">Your active work and pending proposals.</p>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Active contracts',   value: activeContracts.length,  color: 'text-blue-600',  link: '/freelancer/contracts' },
          { label: 'Pending proposals',  value: pendingProposals.length, color: 'text-amber-600', link: '/freelancer/proposals' },
          { label: 'Total earnings',     value: formatCurrency(totalEarnings), color: 'text-green-600', link: '/freelancer/earnings' },
        ].map(s => (
          <Link key={s.label} to={s.link}
            className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors">
            <p className={cn('text-xl font-bold', s.color)}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Active contracts */}
      {activeContracts.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700">Active contracts</h3>
            <Link to="/freelancer/contracts" className="text-xs text-blue-600 hover:underline">View all →</Link>
          </div>
          <div className="space-y-2">
            {activeContracts.slice(0, 4).map(c => {
              const ms       = c.milestones ?? []
              const nextMs   = ms.find(m => !['approved','paid'].includes(m.status))
              const needsWork = nextMs && ['pending','revision_requested'].includes(nextMs?.status)
              return (
                <Link key={c.id} to={`/freelancer/contracts/${c.id}`}
                  className="flex items-center justify-between gap-4 bg-white border border-slate-200 rounded-lg px-4 py-3 hover:border-slate-300 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{c.project?.title}</p>
                    <p className="text-xs text-slate-400">{c.client?.name}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {needsWork && (
                      <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        Action needed
                      </span>
                    )}
                    <span className="text-sm font-bold text-slate-700">{formatCurrency(c.total_amount)}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Pending proposals */}
      {pendingProposals.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700">Pending proposals</h3>
            <Link to="/freelancer/proposals" className="text-xs text-blue-600 hover:underline">View all →</Link>
          </div>
          <div className="space-y-2">
            {pendingProposals.slice(0, 3).map(p => (
              <Link key={p.id} to={`/freelancer/projects/${p.project?.id}`}
                className="flex items-center justify-between gap-4 bg-white border border-slate-200 rounded-lg px-4 py-3 hover:border-slate-300 transition-colors">
                <p className="text-sm font-medium text-slate-800 truncate">{p.project?.title}</p>
                <span className="text-sm font-bold text-slate-700 shrink-0">{formatCurrency(p.bid_amount)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {activeContracts.length === 0 && pendingProposals.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-slate-200 p-10 text-center">
          <p className="text-3xl mb-2">💼</p>
          <p className="text-base font-semibold text-slate-700 mb-1">Find your next project</p>
          <p className="text-sm text-slate-500 mb-4">Browse open projects and submit proposals to get hired.</p>
          <Link to="/freelancer/projects" className="inline-block rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            Browse projects
          </Link>
        </div>
      )}
    </div>
  )
}
