import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useMyProjects } from '@/hooks/useProjects'
import { useContracts } from '@/hooks/useContracts'
import { formatCurrency, cn } from '@/lib/utils'

export default function ClientDashboard() {
  const { user }    = useAuth()
  const { data: projData } = useMyProjects({ status: 'open' })
  const { data: contData } = useContracts({ status: 'active' })

  const openProjects    = projData?.data ?? []
  const activeContracts = contData?.data ?? []

  const totalActive = activeContracts.reduce((s, c) => s + Number(c.total_amount), 0)

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-1" style={{ fontFamily: 'Georgia, serif' }}>
        Welcome back, {user?.name?.split(' ')[0]}
      </h2>
      <p className="text-sm text-slate-500 mb-6">Here's what's happening on your projects.</p>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Open projects',     value: openProjects.length,    color: 'text-blue-600',  link: '/client/projects' },
          { label: 'Active contracts',  value: activeContracts.length, color: 'text-green-600', link: '/client/contracts' },
          { label: 'In contract value', value: formatCurrency(totalActive), color: 'text-amber-600', link: '/client/contracts' },
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
            <Link to="/client/contracts" className="text-xs text-blue-600 hover:underline">View all →</Link>
          </div>
          <div className="space-y-2">
            {activeContracts.slice(0, 3).map(c => {
              const ms        = c.milestones ?? []
              const paidCount = ms.filter(m => ['approved','paid'].includes(m.status)).length
              const pending   = ms.filter(m => m.status === 'submitted').length
              return (
                <Link key={c.id} to={`/client/contracts/${c.id}`}
                  className="flex items-center justify-between gap-4 bg-white border border-slate-200 rounded-lg px-4 py-3 hover:border-slate-300 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{c.project?.title}</p>
                    <p className="text-xs text-slate-400">{c.freelancer?.name}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {pending > 0 && (
                      <span className="text-xs font-semibold bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full">
                        {pending} awaiting review
                      </span>
                    )}
                    <span className="text-xs text-slate-400">{paidCount}/{ms.length} done</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Open projects */}
      {openProjects.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700">Open projects</h3>
            <Link to="/client/projects" className="text-xs text-blue-600 hover:underline">View all →</Link>
          </div>
          <div className="space-y-2">
            {openProjects.slice(0, 3).map(p => (
              <Link key={p.id} to={`/client/projects/${p.id}`}
                className="flex items-center justify-between gap-4 bg-white border border-slate-200 rounded-lg px-4 py-3 hover:border-slate-300 transition-colors">
                <p className="text-sm font-medium text-slate-800 truncate">{p.title}</p>
                <span className="text-xs text-slate-400 shrink-0">{p.proposals_count ?? 0} proposals</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {activeContracts.length === 0 && openProjects.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-slate-200 p-10 text-center">
          <p className="text-3xl mb-2">🚀</p>
          <p className="text-base font-semibold text-slate-700 mb-1">Ready to get started?</p>
          <p className="text-sm text-slate-500 mb-4">Post your first project and receive proposals from skilled freelancers.</p>
          <Link to="/client/projects/new" className="inline-block rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            Post a project
          </Link>
        </div>
      )}
    </div>
  )
}
