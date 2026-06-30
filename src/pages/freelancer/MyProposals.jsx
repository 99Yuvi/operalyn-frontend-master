import { Link } from 'react-router-dom'
import { useMyProposals, useWithdrawProposal } from '@/hooks/useProposals'
import { formatCurrency, formatDate } from '@/lib/utils'

const STATUS_STYLE = {
  pending:     'bg-yellow-50 text-yellow-700 border-yellow-200',
  shortlisted: 'bg-blue-50 text-blue-700 border-blue-200',
  accepted:    'bg-green-50 text-green-700 border-green-200',
  rejected:    'bg-red-50 text-red-600 border-red-200',
  withdrawn:   'bg-slate-100 text-slate-500 border-slate-200',
}

export default function MyProposals() {
  const { data, isLoading }   = useMyProposals()
  const withdrawMutation      = useWithdrawProposal()
  const proposals             = data?.data ?? []

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 mb-1" style={{ fontFamily: 'Georgia, serif' }}>My Bids</h2>
      <p className="text-sm text-slate-500 mb-6">All proposals you've submitted.</p>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 rounded-xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : proposals.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 p-12 text-center">
          <p className="text-3xl mb-2">📤</p>
          <h3 className="text-base font-semibold text-slate-700 mb-1">No proposals yet</h3>
          <p className="text-sm text-slate-500 mb-4">Browse open projects and submit your first proposal.</p>
          <Link to="/freelancer/projects" className="inline-block rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            Browse projects
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {proposals.map(p => (
            <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Link to={`/freelancer/projects/${p.project?.id}`}
                    className="text-sm font-semibold text-slate-800 hover:underline line-clamp-1">
                    {p.project?.title ?? 'Project'}
                  </Link>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{p.cover_letter}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span>Bid: <strong className="text-slate-600">{formatCurrency(p.bid_amount)}</strong></span>
                    {p.duration_days && <span>{p.duration_days} days</span>}
                    <span>{formatDate(p.created_at)}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[p.status] ?? ''}`}>
                    {p.status}
                  </span>
                  {(p.status === 'pending' || p.status === 'shortlisted') && (
                    <button
                      onClick={() => window.confirm('Withdraw this proposal?') && withdrawMutation.mutate(p.id)}
                      disabled={withdrawMutation.isPending}
                      className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50">
                      Withdraw
                    </button>
                  )}
                  {p.status === 'accepted' && (
                    <Link to={`/freelancer/contracts`} className="text-xs text-green-600 hover:underline font-medium">
                      View contract →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
