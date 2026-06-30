import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMyProject } from '@/hooks/useProjects'
import { useProjectProposals, useShortlistProposal, useRejectProposal, useAcceptProposal } from '@/hooks/useProposals'
import { formatCurrency, formatDate, getInitials, getAvatarColor } from '@/lib/utils'

const STATUS_COLOR = {
  pending:     'bg-yellow-50 text-yellow-700',
  shortlisted: 'bg-blue-50 text-blue-700',
  accepted:    'bg-green-50 text-green-700',
  rejected:    'bg-red-50 text-red-600',
  withdrawn:   'bg-slate-100 text-slate-400',
}

export default function ClientProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState('proposals')
  const [hireError, setHireError] = useState(null)

  const { data: projData, isLoading: projLoading } = useMyProject(id)
  const { data: propData, isLoading: propLoading } = useProjectProposals(id)

  const shortlist = useShortlistProposal(id)
  const reject    = useRejectProposal(id)
  const accept    = useAcceptProposal(id)

  const project   = projData?.data
  const proposals = propData?.data ?? []

  if (projLoading) return <div className="text-sm text-slate-400 py-10 text-center">Loading…</div>
  if (!project)    return <div className="text-sm text-red-500 py-10 text-center">Project not found.</div>

  const handleAccept = async (proposalId) => {
    if (!window.confirm('Hire this freelancer? All other proposals will be closed.')) return
    setHireError(null)
    try {
      const res = await accept.mutateAsync(proposalId)
      navigate(`/client/contracts/${res.data?.contract_id ?? ''}`)
    } catch (err) {
      setHireError(err?.response?.data?.message ?? 'Something went wrong. Please try again.')
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <Link to="/client/projects" className="text-slate-400 hover:text-slate-600 text-sm">← Projects</Link>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-slate-600 font-medium truncate">{project.title}</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-slate-800 mb-1">{project.title}</h1>
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              {project.category && <span className="bg-slate-100 px-2 py-0.5 rounded-full">{project.category.name}</span>}
              <span className="capitalize bg-slate-100 px-2 py-0.5 rounded-full">{project.status.replace('_', ' ')}</span>
              {project.budget_max && <span>{formatCurrency(project.budget_min)} – {formatCurrency(project.budget_max)}{project.budget_type === 'hourly' ? '/hr' : ''}</span>}
              {project.deadline && <span>Due {formatDate(project.deadline)}</span>}
            </div>
          </div>
          <Link to={`/client/projects/${id}/edit`} className="text-xs text-slate-400 hover:text-slate-600 shrink-0">Edit</Link>
        </div>

        {project.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {project.skills.map(s => (
              <span key={s.id} className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">{s.name}</span>
            ))}
          </div>
        )}

        <p className="mt-3 text-sm text-slate-600 whitespace-pre-wrap">{project.description}</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-4">
        {['proposals', 'details'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${tab === t ? 'border-slate-700 text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
            {t}{t === 'proposals' && ` (${proposals.length})`}
          </button>
        ))}
      </div>

      {hireError && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {hireError}
        </div>
      )}

      {/* Proposals tab */}
      {tab === 'proposals' && (
        propLoading ? (
          <div className="text-sm text-slate-400 py-6 text-center">Loading proposals…</div>
        ) : proposals.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-3xl mb-2">📥</p>
            <p className="text-sm text-slate-500">No proposals yet. Check back soon.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {proposals.map(p => {
              const fp = p.freelancer?.freelancer_profile
              const colors = getAvatarColor(p.freelancer?.name ?? '')
              return (
                <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className={`h-10 w-10 rounded-full ${colors.bg} ${colors.text} text-sm font-semibold flex items-center justify-center shrink-0`}>
                      {getInitials(p.freelancer?.name ?? '')}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div>
                          <Link to={`/client/freelancers/${p.freelancer?.id}`} className="text-sm font-semibold text-slate-800 hover:underline">
                            {p.freelancer?.name}
                          </Link>
                          {fp?.headline && <p className="text-xs text-slate-500 mt-0.5">{fp.headline}</p>}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[p.status] ?? ''}`}>
                            {p.status}
                          </span>
                          <span className="text-sm font-bold text-slate-800">{formatCurrency(p.bid_amount)}</span>
                          {p.duration_days && <span className="text-xs text-slate-400">{p.duration_days}d</span>}
                        </div>
                      </div>

                      {fp?.rating_avg && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-yellow-400 text-xs">★</span>
                          <span className="text-xs text-slate-600">{fp.rating_avg}</span>
                          <span className="text-xs text-slate-400">({fp.rating_count})</span>
                          {fp.verification_status === 'approved' && (
                            <span className="text-xs text-green-600 ml-1">✓ Verified</span>
                          )}
                        </div>
                      )}

                      <p className="text-sm text-slate-600 mt-2 line-clamp-3">{p.cover_letter}</p>

                      {/* Actions */}
                      {p.status === 'pending' && (
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => shortlist.mutate(p.id)}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50">
                            Shortlist
                          </button>
                          <button onClick={() => reject.mutate({ id: p.id })}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50">
                            Reject
                          </button>
                          <button onClick={() => handleAccept(p.id)}
                            disabled={accept.isPending}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-700 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed">
                            {accept.isPending ? 'Hiring…' : 'Hire'}
                          </button>
                        </div>
                      )}
                      {p.status === 'shortlisted' && (
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => reject.mutate({ id: p.id })}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50">
                            Reject
                          </button>
                          <button onClick={() => handleAccept(p.id)}
                            disabled={accept.isPending}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-700 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed">
                            {accept.isPending ? 'Hiring…' : 'Hire'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}
    </div>
  )
}
