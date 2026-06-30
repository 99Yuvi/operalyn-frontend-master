import { Link } from 'react-router-dom'
import { useContracts } from '@/hooks/useContracts'
import { formatCurrency, formatDate, cn } from '@/lib/utils'

const CS = {
  active:    'bg-blue-50 text-blue-700',
  completed: 'bg-green-50 text-green-700',
  cancelled: 'bg-slate-100 text-slate-500',
}

export default function FreelancerContractsList() {
  const { data, isLoading } = useContracts()
  const contracts = data?.data ?? []

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 mb-1" style={{ fontFamily: 'Georgia, serif' }}>Contracts</h2>
      <p className="text-sm text-slate-500 mb-6">Your active and past client engagements.</p>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 rounded-xl bg-slate-100 animate-pulse" />)}</div>
      ) : contracts.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 p-12 text-center">
          <p className="text-3xl mb-2">🤝</p>
          <p className="text-base font-semibold text-slate-700 mb-1">No contracts yet</p>
          <p className="text-sm text-slate-500 mb-4">Submit proposals on projects to get hired.</p>
          <Link to="/freelancer/projects" className="inline-block rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            Browse projects
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {contracts.map(c => {
            const ms         = c.milestones ?? []
            const nextMs     = ms.find(m => !['approved','paid'].includes(m.status))
            const paidCount  = ms.filter(m => ['approved','paid'].includes(m.status)).length
            const progress   = ms.length ? Math.round((paidCount / ms.length) * 100) : 0
            return (
              <Link key={c.id} to={`/freelancer/contracts/${c.id}`}
                className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', CS[c.status] ?? '')}>{c.status}</span>
                      {nextMs && (
                        <span className="text-xs text-slate-500">
                          Next: <strong>{nextMs.title}</strong>
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-slate-800 truncate">{c.project?.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Client: <strong>{c.client?.name}</strong></p>
                    {ms.length > 0 && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-slate-400 mb-0.5">
                          <span>{paidCount}/{ms.length} milestones complete</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-400 rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-slate-800">{formatCurrency(c.total_amount)}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatDate(c.started_at ?? c.created_at)}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
