import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { useContract, useDeliverMilestone, useReleaseMilestone } from '@/hooks/useContracts'
import { contractKeys } from '@/lib/queryKeys'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { usePayForMilestone } from '@/hooks/usePayForMilestone'
import { API_ORIGIN } from '@/api/client'

const PREVIEWABLE = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp']

function getExt(filename) {
  return (filename || '').split('.').pop().toLowerCase()
}

function FilePreviewModal({ file, onClose }) {
  if (!file) return null
  const ext = getExt(file.name)
  const mimeType = file.type || ''
  const isImage = mimeType.startsWith('image/') || ['png','jpg','jpeg','gif','webp'].includes(ext)
  const isPdf   = mimeType.includes('pdf') || ext === 'pdf'
  const isPreviewable = isImage || isPdf

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 16, width: '100%', maxWidth: 900,
        maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid #E2E8F0' }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>
            📎 {file.name}
          </p>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <a href={file.url} download={file.name} style={{
              fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 8,
              border: '1px solid #E2E8F0', color: '#334155', textDecoration: 'none',
            }}>
              ⬇ Download
            </a>
            <button onClick={onClose} style={{
              fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 8,
              border: '1px solid #E2E8F0', background: 'none', cursor: 'pointer', color: '#64748B',
            }}>
              ✕ Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
          {isImage ? (
            <img src={file.url} alt={file.name} style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain' }} />
          ) : isPdf ? (
            <iframe src={file.url} style={{ width: '100%', height: '75vh', border: 'none' }} title={file.name} />
          ) : (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <p style={{ fontSize: 36, marginBottom: 12 }}>📄</p>
              <p style={{ fontSize: 15, color: '#334155', fontWeight: 600, marginBottom: 8 }}>{file.name}</p>
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}>Preview not available for this file type.</p>
              <a href={file.url} download={file.name} style={{
                padding: '10px 24px', fontSize: 14, fontWeight: 600, borderRadius: 10,
                background: '#334155', color: '#fff', textDecoration: 'none',
              }}>
                ⬇ Download file
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Milestone status styles ── */
const MS = {
  pending:             { dot: 'bg-slate-400',  badge: 'bg-slate-100 text-slate-500',     label: 'Awaiting payment' },
  in_progress:         { dot: 'bg-blue-400',   badge: 'bg-blue-50 text-blue-700',        label: 'Paid — work in progress' },
  submitted:           { dot: 'bg-yellow-400', badge: 'bg-yellow-50 text-yellow-700',    label: 'Work submitted' },
  revision_requested:  { dot: 'bg-orange-400', badge: 'bg-orange-50 text-orange-700',    label: 'Revision requested' },
  approved:            { dot: 'bg-green-400',  badge: 'bg-green-50 text-green-700',      label: 'Released' },
  paid:                { dot: 'bg-emerald-500',badge: 'bg-emerald-50 text-emerald-700',  label: 'Released' },
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
  const deliver               = useDeliverMilestone(id)
  const release               = useReleaseMilestone(id)
  const { pay: payFor, pickerEl } = usePayForMilestone()

  /* ── Local UI state ── */
  const [previewFile, setPreviewFile]       = useState(null)  // { url, name }

  const openFilePreview = async (deliveryId, fileId, filename) => {
    try {
      const res = await fetch(`${API_ORIGIN}/api/v1/deliveries/${deliveryId}/files/${fileId}`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed')
      const contentType = res.headers.get('content-type') || 'application/octet-stream'
      const blob = await res.blob()
      const url  = URL.createObjectURL(new Blob([blob], { type: contentType }))
      setPreviewFile({ url, name: filename || 'file', type: contentType })
    } catch { /* silently ignore */ }
  }

  const closePreview = () => {
    if (previewFile?.url) URL.revokeObjectURL(previewFile.url)
    setPreviewFile(null)
  }

  const [deliveryForm, setDeliveryForm]     = useState(null)   // milestoneId | null
  const [busyId, setBusyId]                 = useState(null)   // milestone being paid
  const [delivNote, setDelivNote]           = useState('')
  const [delivFiles, setDelivFiles]         = useState([])
  const [apiError, setApiError]             = useState('')

  if (isLoading) return <div className="text-sm text-slate-400 py-10 text-center">Loading contract…</div>

  const contract   = data?.data
  if (!contract)   return <div className="text-sm text-red-500 py-10 text-center">Contract not found.</div>

  const milestones   = contract.milestones ?? []
  const paidCount    = milestones.filter(m => m.status === 'paid' || m.status === 'approved').length
  const progress     = milestones.length ? Math.round((paidCount / milestones.length) * 100) : 0

  const backPath = isClient ? '/client/contracts' : '/freelancer/contracts'

  /* ── Handlers ── */
  const handleDeliver = async (milestoneId) => {
    if (!delivNote.trim()) return
    setApiError('')
    try {
      await deliver.mutateAsync({ id: milestoneId, note: delivNote, files: delivFiles })
      setDeliveryForm(null); setDelivNote(''); setDelivFiles([])
    } catch (err) { setApiError(err?.message ?? 'Delivery failed.') }
  }

  const handlePay = async (milestoneId, milestoneTitle) => {
    setApiError(''); setBusyId(milestoneId)
    try {
      await payFor(milestoneId, milestoneTitle)
    } catch (err) {
      setApiError(err?.message ?? 'Payment failed.')
    } finally {
      setBusyId(null)
      qc.invalidateQueries({ queryKey: contractKeys.detail(id) })
    }
  }

  const handleRelease = async (milestoneId) => {
    if (!window.confirm('Release the payment to the freelancer? This cannot be undone.')) return
    setApiError('')
    try {
      await release.mutateAsync(milestoneId)
    } catch (err) { setApiError(err?.message ?? 'Could not release the payment.') }
  }

  return (
    <div className="max-w-3xl">
      <FilePreviewModal file={previewFile} onClose={closePreview} />
      {pickerEl}
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
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Payment</h2>
        </div>

        {milestones.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">Nothing to pay for yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {milestones.map((m, idx) => (
              <MilestoneRow
                key={m.id} milestone={m} index={idx}
                isClient={isClient} isFreelancer={isFreelancer}
                contractActive={contract.status === 'active'}
                onDeliver={() => { setDeliveryForm(m.id); setDelivNote(''); setDelivFiles([]) }}
                onPay={() => handlePay(m.id, m.title)}
                onRelease={() => handleRelease(m.id)}
                paying={busyId === m.id}
                onFilePreview={openFilePreview}
                deliveryForm={deliveryForm}
                delivNote={delivNote} setDelivNote={setDelivNote}
                delivFiles={delivFiles} setDelivFiles={setDelivFiles}
                handleDeliver={handleDeliver}
                delivering={deliver.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Milestone row ── */
function MilestoneRow({
  milestone: m, index, isClient, isFreelancer, contractActive,
  onDeliver, onPay, onRelease, paying, onFilePreview,
  deliveryForm,
  delivNote, setDelivNote, delivFiles, setDelivFiles,
  handleDeliver,
  delivering,
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
                    <button key={f.id}
                      onClick={() => onFilePreview(lastDel.id, f.id, f.original_name)}
                      className="text-xs text-blue-600 hover:underline bg-blue-50 px-2 py-0.5 rounded cursor-pointer">
                      📎 {f.original_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          {contractActive && (
            <div className="mt-2 flex flex-wrap gap-2">
              {/* Client: pay (money is held until released) */}
              {isClient && m.status === 'pending' && (
                <button onClick={onPay} disabled={paying}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-700 text-white hover:bg-slate-800 disabled:opacity-50">
                  {paying ? 'Opening payment…' : `Pay ${formatCurrency(m.amount)}`}
                </button>
              )}
              {/* Freelancer: waiting for the client's payment */}
              {isFreelancer && m.status === 'pending' && (
                <span className="text-xs text-slate-500">Waiting for the client to pay. You can start once it is paid.</span>
              )}
              {/* Freelancer: deliver (only after payment) */}
              {isFreelancer && ['in_progress', 'revision_requested'].includes(m.status) && (
                <button onClick={onDeliver}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-700 text-white hover:bg-slate-800">
                  Mark as done
                </button>
              )}
              {/* Client: release the held payment */}
              {isClient && m.status === 'submitted' && (
                <button onClick={onRelease}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700">
                  Release payment
                </button>
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
                <button type="button" onClick={() => { setDeliveryForm(null); setDelivNote(''); setDelivFiles([]) }}
                  className="px-3 py-1.5 text-xs text-slate-500 border border-slate-300 rounded-lg hover:bg-white">Cancel</button>
                <button onClick={() => handleDeliver(m.id)}
                  disabled={delivering || delivNote.trim().length < 20}
                  className="px-4 py-1.5 text-xs font-semibold bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50">
                  {delivering ? 'Submitting…' : 'Submit delivery'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
