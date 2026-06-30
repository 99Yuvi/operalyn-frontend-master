import { Link } from 'react-router-dom'
import { useMyProjects } from '@/hooks/useProjects'
import { formatCurrency, formatDate } from '@/lib/utils'

const STATUS_BADGE = {
  draft:       'bg-slate-100 text-slate-500',
  open:        'bg-green-50 text-green-700',
  in_progress: 'bg-blue-50 text-blue-700',
  completed:   'bg-purple-50 text-purple-700',
  cancelled:   'bg-red-50 text-red-600',
}

export default function MyProjects() {
  const { data, isLoading } = useMyProjects()
  const projects = data?.data ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800" style={{ fontFamily: 'Georgia, serif' }}>My Projects</h2>
          <p className="text-sm text-slate-500 mt-0.5">Projects you've posted on the platform.</p>
        </div>
        <Link to="/client/projects/new"
          className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors">
          + Post project
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 p-12 text-center">
          <p className="text-3xl mb-3">📋</p>
          <h3 className="text-base font-semibold text-slate-700 mb-1">No projects yet</h3>
          <p className="text-sm text-slate-500 mb-4">Post your first project to start receiving proposals from freelancers.</p>
          <Link to="/client/projects/new" className="inline-block rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            Post a project
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map(p => (
            <Link key={p.id} to={`/client/projects/${p.id}`}
              className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[p.status] ?? 'bg-slate-100 text-slate-500'}`}>
                      {p.status.replace('_', ' ')}
                    </span>
                    {p.category && <span className="text-xs text-slate-400">{p.category.name}</span>}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800 truncate">{p.title}</h3>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-slate-400">
                      {p.proposals_count ?? 0} proposal{p.proposals_count !== 1 ? 's' : ''}
                    </span>
                    {p.budget_max && (
                      <span className="text-xs text-slate-400">
                        Up to {formatCurrency(p.budget_max)}
                        {p.budget_type === 'hourly' ? '/hr' : ''}
                      </span>
                    )}
                    {p.deadline && <span className="text-xs text-slate-400">Due {formatDate(p.deadline)}</span>}
                  </div>
                </div>
                <span className="text-xs text-slate-300 shrink-0">{formatDate(p.created_at)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
