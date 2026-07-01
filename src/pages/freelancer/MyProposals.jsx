import { Link } from 'react-router-dom'
import { useMyProposals, useWithdrawProposal } from '@/hooks/useProposals'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Send, Clock, DollarSign, Calendar, ArrowUpRight, CheckCircle, XCircle } from 'lucide-react'

const STATUS_META = {
  pending:     { label: 'Pending',     bg: 'bg-yellow-50',  text: 'text-yellow-700', border: 'border-yellow-200' },
  shortlisted: { label: 'Shortlisted', bg: 'bg-blue-50',    text: 'text-blue-700',   border: 'border-blue-200'   },
  accepted:    { label: 'Accepted',    bg: 'bg-green-50',   text: 'text-green-700',  border: 'border-green-200'  },
  rejected:    { label: 'Rejected',    bg: 'bg-red-50',     text: 'text-red-700',    border: 'border-red-200'    },
  withdrawn:   { label: 'Withdrawn',   bg: 'bg-slate-100',  text: 'text-slate-500',  border: 'border-slate-200'  },
}

export default function MyProposals() {
  const { data, isLoading }   = useMyProposals()
  const withdrawMutation      = useWithdrawProposal()
  const proposals             = data?.data ?? []

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h2
          className="text-2xl font-bold text-slate-900 tracking-tight"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          My Bids
        </h2>
        <p className="text-sm text-slate-500 mt-1">All proposals you've submitted.</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : proposals.length === 0 ? (
        /* Empty state — proper icon circle */
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <div className="h-14 w-14 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4">
            <Send className="h-7 w-7 text-purple-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-700 mb-1">No proposals yet</h3>
          <p className="text-sm text-slate-500 mb-5 max-w-xs mx-auto">
            Browse open projects and submit your first proposal.
          </p>
          <Link
            to="/freelancer/projects"
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            Browse projects
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {proposals.map(p => {
            const meta = STATUS_META[p.status] ?? STATUS_META.pending
            const canWithdraw = p.status === 'pending' || p.status === 'shortlisted'

            return (
              <div
                key={p.id}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left — project info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/freelancer/projects/${p.project?.id}`}
                      className="text-sm font-semibold text-slate-800 hover:underline line-clamp-1"
                    >
                      {p.project?.title ?? 'Project'}
                    </Link>

                    {p.cover_letter && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {p.cover_letter}
                      </p>
                    )}

                    {/* Meta chips */}
                    <div className="flex flex-wrap items-center gap-3 mt-2.5">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                        <strong className="text-slate-700 font-semibold">{formatCurrency(p.bid_amount)}</strong>
                      </span>
                      {p.duration_days && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {p.duration_days} days
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(p.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Right — status + actions */}
                  <div className="flex flex-col items-end gap-2.5 shrink-0">
                    {/* Status badge — outline style */}
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${meta.bg} ${meta.text} ${meta.border}`}
                    >
                      {meta.label}
                    </span>

                    {/* Withdraw */}
                    {canWithdraw && (
                      <button
                        onClick={() =>
                          window.confirm('Withdraw this proposal?') &&
                          withdrawMutation.mutate(p.id)
                        }
                        disabled={withdrawMutation.isPending}
                        className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors"
                      >
                        Withdraw
                      </button>
                    )}

                    {/* View contract */}
                    {p.status === 'accepted' && (
                      <Link
                        to="/freelancer/contracts"
                        className="flex items-center gap-1 text-xs text-green-600 hover:underline font-semibold"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        View contract
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
