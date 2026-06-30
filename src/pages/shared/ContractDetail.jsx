import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { useContract, useAddMilestone, useDeleteMilestone, useDeliverMilestone, useApproveMilestone, useRequestRevision } from '@/hooks/useContracts'
import { contractKeys } from '@/lib/queryKeys'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { getDeliveryFileUrl, approveMilestone as apiApprove } from '@/api/contracts'

/** Dynamically load Razorpay checkout.js */
function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return }
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload  = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

/* ── Milestone status styles ── */
const MS = {
  pending:             { dot: 'bg-slate-400',  badge: 'bg-slate-100 text-slate-500',     label: 'Pending' },
  in_progress:         { dot: 'bg-blue-400',   badge: 'bg-blue-50 text-blue-700',        label: 'In progress' },
  submitted:           { dot: 'bg-yellow-400', badge: 'bg-yellow-50 text-yellow-700',    label: 'Awaiting review' },
  revision_requested:  { dot: 'bg-orange-400', badge: 'bg-orange-50 text-orange-700',    label: 'Revision requested' },
  approved:            { dot: 'bg-green-400',  badge: 'bg-green-50 text-green-700',      label: 'Approved' },
  paid:                { dot: 'bg-emerald-500',badge: 'bg-emerald-50 text-emerald-700',  label: 'Paid' },
}

/* ── Contract status badge ── */
const CS = {
  active:    'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
}

export default function ContractDetail() {
  const { id }        = useParams()
  const { user }      = useAuth()
  const isClient      = user?.role === 'client'
  const isFreelancer  = user?.role === 'freelancer'

  const qc                    = useQueryClient()
  const { data, isLoading }   = useContract(id)
  const addMilestone          = useAddMilestone(id)
  const deleteMilestone       = useDeleteMilestone(id)
  const deliver               = useDeliverMilestone(id)
  const approve               = useApproveMilestone(id)
  const requestRevision       = useRequestRevision(id)

  /* ── Local UI state ── */
  const [showAddForm, setShowAddForm]       = useState(false)
  const [deliveryForm, setDeliveryForm]     = useState(null)   // milestoneId | null
  const [revisionForm, setRevisionForm]     = useState(null)   // milestoneId | null
  const [newMs, setNewMs]                   = useState({ title: '', amount: '', due_date: '', description: '' })
  const [delivNote, setDelivNote]           = useState('')
  const [delivFiles, setDelivFiles]         = useState([])
  const [revNotes, setRevNotes]             = useState('')
  const [apiError, setApiError]             = useState('')

  if (isLoading) return <div className="text-sm text-slate-400 py-10 text-center">Loading contract…</div>

  const contract   = data?.data
  if (!contract)   return <div className="text-sm text-red-500 py-10 text-center">Contract not found.</div>

  const milestones   = contract.milestones ?? []
  const paidCount    = milestones.filter(m => m.status === 'paid' || m.status === 'approved').length
  const progress     = milestones.length ? Math.round((paidCount / milestones.length) * 100) : 0
  const totalAlloc   = milestones.reduce((s, m) => s + Number(m.amount), 0)
  const remaining    = Number(contract.total_amount) - totalAlloc

  const backPath = isClient ? '/client/contracts' : '/freelancer/contracts'

  /* ── Handlers ── */
  const handleAddMilestone = async (e) => {
    e.preventDefault(); setApiError('')
    try {
      await addMilestone.mutateAsync({ ...newMs, amount: Number(newMs.amount) })
      setNewMs({ title: '', amount: '', due_date: '', description: '' })
      setShowAddForm(false)
    } catch (err) { setApiError(err?.message ?? 'Failed to add milestone.') }
  }

  const handleDeliver = async (milestoneId) => {
    if (!delivNote.trim()) return
    setApiError('')
    try {
      await deliver.mutateAsync({ id: milestoneId, note: delivNote, files: delivFiles })
      setDeliveryForm(null); setDelivNote(''); setDelivFiles([])
    } catch (err) { setApiError(err?.message ?? 'Delivery failed.') }
  }

  const handleApprove = async (milestoneId, milestoneTitle) => {
    if (!window.confirm('Approve and pay for this milestone?')) return
    setApiError('')

    try {
      // Step 1 — create Razorpay order via Laravel
      const res = await apiApprove(milestoneId)
      const orderData = res?.data

      // Step 2 — if order is a stub (Razorpay not configured in dev), milestone is
      // already approved by the backend — just refresh the cache, don't call approve again
      if (orderData?.stub) {
        qc.invalidateQueries({ queryKey: contractKeys.detail(id) })
        return
      }

      // Step 3 — load Razorpay checkout.js
      const loaded = await loadRazorpay()
      if (!loaded) { setApiError('Payment service unavailable. Try again.'); return }

      // Step 4 — open Razorpay modal
      const rzp = new window.Razorpay({
        key:         orderData.key_id,
        amount:      orderData.amount_paise,
        currency:    orderData.currency ?? 'INR',
        order_id:    orderData.razorpay_order_id,
        name:        'Operalyn',
        description: milestoneTitle,
        handler: () => {
          // Payment success — webhook handles DB update; just refresh UI
          setTimeout(() => approve.mutate(milestoneId), 2000)
        },
        modal: {
          ondismiss: () => setApiError('Payment cancelled.'),
        },
        theme: { color: '#334155' },
      })
      rzp.open()
    } catch (err) {
      setApiError(err?.message ?? 'Approval failed.')
    }
  }

  const handleRevision = async (milestoneId) => {
    if (!revNotes.trim()) return
    setApiError('')
    try {
      await requestRevision.mutateAsync({ id: milestoneId, notes: revNotes })
      setRevisionForm(null); setRevNotes('')
    } catch (err) { setApiError(err?.message ?? 'Request failed.') }
  }

  return (
    <div className="max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5">
        <Link to={backPath} className="text-slate-400 hover:text-slate-600 text-sm">← Contracts</Link>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-slate-600 font-medium truncate">{contract.project?.title}</span>
      </div>

      {/* Contract header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-slate-800 mb-1" style={{ fontFamily: 'Georgia, serif' }}>
              {contract.project?.title}
            </h1>
            <div className="flex items-center gap-2 flex-wrap text-sm">
              <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full border', CS[contract.status] ?? '')}>
                {contract.status}
              </span>
              <span className="text-slate-500">
                {isClient ? `Freelancer: ${contract.freelancer?.name}` : `Client: ${contract.client?.name}`}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-slate-800">{formatCurrency(contract.total_amount)}</p>
            <p className="text-xs text-slate-400">{contract.commission_rate}% commission</p>
          </div>
        </div>

        {/* Progress bar */}
        {milestones.length > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>{paidCount}/{milestones.length} milestones complete</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Links */}
        <div className="flex gap-3 mt-3 pt-3 border-t border-slate-100 flex-wrap">
          {contract.conversation && (
            <Link
              to={isClient ? `/client/chat/${contract.conversation.id}` : `/freelancer/chat/${contract.conversation.id}`}
              className="text-sm text-blue-600 hover:underline">
              💬 Open chat
            </Link>
          )}
          {contract.status === 'completed' && (
            <Link
              to={isClient ? `/client/contracts/${id}/review` : `/freelancer/contracts/${id}/review`}
              className="text-sm text-amber-600 hover:underline">
              ⭐ Leave a review
            </Link>
          )}
          <span className="text-xs text-slate-400 ml-auto">Started {formatDate(contract.started_at ?? contract.created_at)}</span>
        </div>
      </div>

      {apiError && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{apiError}</div>
      )}

      {/* Milestones */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Milestones</h2>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>Allocated: {formatCurrency(totalAlloc)} / {formatCurrency(contract.total_amount)}</span>
            {remaining > 0 && <span className="text-amber-600">₹{remaining.toFixed(0)} unallocated</span>}
          </div>
        </div>

        {milestones.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">
            {isClient ? 'No milestones yet. Add one to get started.' : 'Waiting for the client to create milestones.'}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {milestones.map((m, idx) => (
              <MilestoneRow
                key={m.id} milestone={m} index={idx}
                isClient={isClient} isFreelancer={isFreelancer}
                contractActive={contract.status === 'active'}
                onDeliver={() => { setDeliveryForm(m.id); setDelivNote(''); setDelivFiles([]) }}
                onApprove={() => handleApprove(m.id, m.title)}
                onRevision={() => { setRevisionForm(m.id); setRevNotes('') }}
                onDelete={() => window.confirm('Remove this milestone?') && deleteMilestone.mutate(m.id)}
                deliveryForm={deliveryForm} revisionForm={revisionForm}
                delivNote={delivNote} setDelivNote={setDelivNote}
                delivFiles={delivFiles} setDelivFiles={setDelivFiles}
                revNotes={revNotes} setRevNotes={setRevNotes}
                handleDeliver={handleDeliver} handleRevision={handleRevision}
                delivering={deliver.isPending} revisioning={requestRevision.isPending}
              />
            ))}
          </div>
        )}

        {/* Add milestone form */}
        {isClient && contract.status === 'active' && (
          <div className="border-t border-slate-100">
            {!showAddForm ? (
              <button onClick={() => setShowAddForm(true)}
                className="w-full py-3 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5">
                <span className="text-lg leading-none">+</span> Add milestone
              </button>
            ) : (
              <form onSubmit={handleAddMilestone} className="p-5 bg-slate-50 space-y-3">
                <h3 className="text-sm font-medium text-slate-700">New milestone</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <input value={newMs.title} onChange={e => setNewMs(f => ({ ...f, title: e.target.value }))}
                      placeholder="Milestone title *"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" required />
                  </div>
                  <div>
                    <input type="number" min="1" value={newMs.amount}
                      onChange={e => setNewMs(f => ({ ...f, amount: e.target.value }))}
                      placeholder={`Amount ₹ (max ${formatCurrency(remaining)})`}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" required />
                  </div>
                  <div>
                    <input type="date" value={newMs.due_date}
                      onChange={e => setNewMs(f => ({ ...f, due_date: e.target.value }))}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
                  </div>
                  <div className="col-span-2">
                    <textarea value={newMs.description}
                      onChange={e => setNewMs(f => ({ ...f, description: e.target.value }))}
                      placeholder="Description (optional)"
                      rows={2}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-400" />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 text-sm text-slate-500 border border-slate-300 rounded-lg hover:bg-white">Cancel</button>
                  <button type="submit" disabled={addMilestone.isPending}
                    className="px-4 py-1.5 text-sm font-semibold bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50">
                    {addMilestone.isPending ? 'Adding…' : 'Add milestone'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Milestone row ── */
function MilestoneRow({
  milestone: m, index, isClient, isFreelancer, contractActive,
  onDeliver, onApprove, onRevision, onDelete,
  deliveryForm, revisionForm,
  delivNote, setDelivNote, delivFiles, setDelivFiles,
  revNotes, setRevNotes,
  handleDeliver, handleRevision,
  delivering, revisioning,
}) {
  const style   = MS[m.status] ?? MS.pending
  const lastDel = m.deliveries?.[m.deliveries.length - 1]

  return (
    <div className="px-5 py-4">
      <div className="flex items-start gap-3">
        {/* Status dot + number */}
        <div className="flex flex-col items-center gap-1 pt-0.5">
          <div className={cn('h-3 w-3 rounded-full shrink-0', style.dot)} />
          <span className="text-xs text-slate-300">{String(index + 1).padStart(2, '0')}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-slate-800">{m.title}</p>
              {m.description && <p className="text-xs text-slate-500 mt-0.5">{m.description}</p>}
              <div className="flex items-center gap-2 mt-1">
                <span className={cn('text-xs font-medium px-1.5 py-0.5 rounded', style.badge)}>{style.label}</span>
                {m.due_date && <span className="text-xs text-slate-400">Due {formatDate(m.due_date)}</span>}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold text-slate-800">{formatCurrency(m.amount)}</p>
            </div>
          </div>

          {/* Latest delivery */}
          {lastDel && (
            <div className="mt-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-xs text-slate-600 font-medium mb-1">Last delivery</p>
              <p className="text-xs text-slate-500">{lastDel.note}</p>
              {lastDel.files?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {lastDel.files.map(f => (
                    <a key={f.id}
                      href={getDeliveryFileUrl(lastDel.id, f.id)}
                      target="_blank" rel="noreferrer"
                      className="text-xs text-blue-600 hover:underline bg-blue-50 px-2 py-0.5 rounded">
                      📎 {f.original_name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          {contractActive && (
            <div className="mt-2 flex flex-wrap gap-2">
              {/* Freelancer: deliver */}
              {isFreelancer && ['pending', 'revision_requested'].includes(m.status) && (
                <button onClick={onDeliver}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-700 text-white hover:bg-slate-800">
                  Submit work
                </button>
              )}
              {/* Client: approve + request revision */}
              {isClient && m.status === 'submitted' && (
                <>
                  <button onClick={onApprove}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700">
                    Approve
                  </button>
                  <button onClick={onRevision}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg border border-orange-300 text-orange-700 hover:bg-orange-50">
                    Request revision
                  </button>
                </>
              )}
              {/* Client: delete pending milestone */}
              {isClient && m.status === 'pending' && (
                <button onClick={onDelete}
                  className="text-xs text-red-500 hover:text-red-700">Remove</button>
              )}
            </div>
          )}

          {/* Delivery form */}
          {deliveryForm === m.id && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg space-y-2">
              <p className="text-xs font-medium text-slate-700">Describe what you're delivering</p>
              <textarea value={delivNote} onChange={e => setDelivNote(e.target.value)}
                rows={3} placeholder="Explain what you completed (min 20 chars)…"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-400" />
              <div>
                <label className="text-xs text-slate-500 cursor-pointer hover:text-slate-700">
                  📎 Attach files (max 5 · 10MB each)
                  <input type="file" multiple accept=".pdf,.zip,.png,.jpg,.jpeg,.doc,.docx,.mp4"
                    className="hidden"
                    onChange={e => setDelivFiles(Array.from(e.target.files).slice(0, 5))} />
                </label>
                {delivFiles.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {delivFiles.map((f, i) => (
                      <span key={i} className="text-xs bg-white border border-slate-200 px-2 py-0.5 rounded">{f.name}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setDelivNote(''); setDelivFiles([]) }}
                  className="px-3 py-1.5 text-xs text-slate-500 border border-slate-300 rounded-lg hover:bg-white">Cancel</button>
                <button onClick={() => handleDeliver(m.id)}
                  disabled={delivering || delivNote.trim().length < 20}
                  className="px-4 py-1.5 text-xs font-semibold bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50">
                  {delivering ? 'Submitting…' : 'Submit delivery'}
                </button>
              </div>
            </div>
          )}

          {/* Revision form */}
          {revisionForm === m.id && (
            <div className="mt-3 p-3 bg-orange-50 border border-orange-100 rounded-lg space-y-2">
              <p className="text-xs font-medium text-slate-700">What needs to change?</p>
              <textarea value={revNotes} onChange={e => setRevNotes(e.target.value)}
                rows={3} placeholder="Describe the changes needed (min 10 chars)…"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-400" />
              <div className="flex gap-2">
                <button type="button" onClick={() => setRevNotes('')}
                  className="px-3 py-1.5 text-xs text-slate-500 border border-slate-300 rounded-lg hover:bg-white">Cancel</button>
                <button onClick={() => handleRevision(m.id)}
                  disabled={revisioning || revNotes.trim().length < 10}
                  className="px-4 py-1.5 text-xs font-semibold bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50">
                  {revisioning ? 'Sending…' : 'Request revision'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
