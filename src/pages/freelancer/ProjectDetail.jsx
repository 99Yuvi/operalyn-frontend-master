import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useProject } from '@/hooks/useProjects'
import { useMyProposals, useSubmitProposal, useWithdrawProposal } from '@/hooks/useProposals'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function FreelancerProjectDetail() {
  const { id } = useParams()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]   = useState({ cover_letter: '', bid_amount: '', duration_days: '' })
  const [errors, setErrors] = useState({})

  const { data: projData, isLoading } = useProject(id)
  const { data: myPropsData }         = useMyProposals()
  const submitMutation   = useSubmitProposal(id)
  const withdrawMutation = useWithdrawProposal()

  const project  = projData?.data
  const myProps  = myPropsData?.data ?? []
  const existing = myProps.find(p => String(p.project_id) === String(id))

  const err = (f) => errors[f]?.[0]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    try {
      await submitMutation.mutateAsync({
        cover_letter:  form.cover_letter,
        bid_amount:    Number(form.bid_amount),
        duration_days: form.duration_days ? Number(form.duration_days) : undefined,
      })
      setShowForm(false)
    } catch (err) {
      if (err?.errors) setErrors(err.errors)
    }
  }

  if (isLoading) return <div className="text-sm text-slate-400 py-10 text-center">Loading…</div>
  if (!project)  return <div className="text-sm text-red-500 py-10 text-center">Project not found.</div>

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 mb-5">
        <Link to="/freelancer/projects" className="text-slate-400 hover:text-slate-600 text-sm">← Browse</Link>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-slate-600 font-medium truncate">{project.title}</span>
      </div>

      {/* Project card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h1 className="text-lg font-bold text-slate-800" style={{ fontFamily: 'Georgia, serif' }}>{project.title}</h1>
          <div className="text-right shrink-0">
            {project.budget_max && (
              <p className="text-base font-bold text-slate-800">
                {project.budget_min ? `${formatCurrency(project.budget_min)} – ` : ''}{formatCurrency(project.budget_max)}
                {project.budget_type === 'hourly' ? '/hr' : ''}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-slate-500 mb-3">
          {project.category && <span className="bg-slate-100 px-2 py-0.5 rounded-full">{project.category.name}</span>}
          {project.deadline && <span>Due {formatDate(project.deadline)}</span>}
          <span>{project.proposals_count ?? 0} proposals so far</span>
        </div>

        {project.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {project.skills.map(s => (
              <span key={s.id} className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">{s.name}</span>
            ))}
          </div>
        )}

        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{project.description}</p>

        {project.client && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center shrink-0">
              {project.client.name?.[0]}
            </div>
            <p className="text-xs text-slate-500">Posted by <strong className="text-slate-700">{project.client.name}</strong></p>
          </div>
        )}
      </div>

      {/* Proposal section */}
      {existing ? (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-800">Your proposal</h2>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              existing.status === 'pending'     ? 'bg-yellow-50 text-yellow-700' :
              existing.status === 'shortlisted' ? 'bg-blue-50 text-blue-700' :
              existing.status === 'accepted'    ? 'bg-green-50 text-green-700' :
              existing.status === 'rejected'    ? 'bg-red-50 text-red-600' :
              'bg-slate-100 text-slate-500'
            }`}>{existing.status}</span>
          </div>
          <p className="text-sm text-slate-700 mb-2">{existing.cover_letter}</p>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>Bid: {formatCurrency(existing.bid_amount)}</span>
            {existing.duration_days && <span>Duration: {existing.duration_days} days</span>}
          </div>
          {(existing.status === 'pending' || existing.status === 'shortlisted') && (
            <button
              onClick={() => withdrawMutation.mutate(existing.id)}
              disabled={withdrawMutation.isPending}
              className="mt-3 text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50">
              Withdraw proposal
            </button>
          )}
        </div>
      ) : project.status === 'open' ? (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          {!showForm ? (
            <div className="text-center py-2">
              <p className="text-sm text-slate-500 mb-3">Interested? Submit a proposal and let the client know why you're the right fit.</p>
              <button onClick={() => setShowForm(true)}
                className="rounded-lg bg-slate-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
                Submit a proposal
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-800">Submit your proposal</h2>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Cover letter * <span className="text-slate-400 font-normal">(min 50 chars)</span></label>
                <textarea
                  value={form.cover_letter} onChange={e => setForm(f => ({ ...f, cover_letter: e.target.value }))}
                  rows={6} placeholder="Introduce yourself, describe your relevant experience, and explain how you'd approach this project…"
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 ${err('cover_letter') ? 'border-red-400 focus:ring-red-300' : 'border-slate-300 focus:ring-slate-400'}`}
                />
                {err('cover_letter') && <p className="text-xs text-red-600">{err('cover_letter')}</p>}
                <p className="text-xs text-slate-400">{form.cover_letter.length} chars</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    Your bid (₹){project.budget_type === 'hourly' ? '/hr' : ''}  *
                  </label>
                  <input type="number" min="1" value={form.bid_amount}
                    onChange={e => setForm(f => ({ ...f, bid_amount: e.target.value }))}
                    placeholder="5000"
                    className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${err('bid_amount') ? 'border-red-400 focus:ring-red-300' : 'border-slate-300 focus:ring-slate-400'}`} />
                  {err('bid_amount') && <p className="text-xs text-red-600">{err('bid_amount')}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Est. duration (days)</label>
                  <input type="number" min="1" value={form.duration_days}
                    onChange={e => setForm(f => ({ ...f, duration_days: e.target.value }))}
                    placeholder="14"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-1">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 border border-slate-300 rounded-lg">
                  Cancel
                </button>
                <button type="submit" disabled={submitMutation.isPending || form.bid_amount === '' || form.cover_letter.length < 50}
                  className="rounded-lg bg-slate-700 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
                  {submitMutation.isPending ? 'Submitting…' : 'Submit proposal'}
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center">
          <p className="text-sm text-slate-500">This project is no longer accepting proposals.</p>
        </div>
      )}
    </div>
  )
}
